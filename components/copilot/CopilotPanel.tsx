'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Drawer } from 'antd';
import CopilotHeader from './CopilotHeader';
import CopilotMessages, { Message } from './CopilotMessages';
import CopilotInput from './CopilotInput';
import CopilotEmptyState from './CopilotEmptyState';
import {
  sendCopilotChatRequest,
  normalizeCopilotError,
  normalizeCopilotResponse,
  parseCopilotResponse,
  COPILOT_ERROR_MESSAGES,
} from '@/utils/copilotApiService';
import axios from 'axios';

interface CopilotPanelProps {
  open: boolean;
  onClose: () => void;
  userInitials?: string;
}

/**
 * CopilotPanel - Main Copilot UI component
 *
 * Architecture:
 * - Uses Ant Design Drawer for right-side panel
 * - Width: ~400px (responsive)
 * - Full height (minus header)
 * - Non-blocking overlay (allows dashboard context)
 *
 * State Management:
 * - Messages stored locally (can be moved to global store later)
 * - Loading state for async operations
 *
 * Extension Points:
 * - handleSend: Replace with actual AI API call
 * - Mock responses: Replace with real AI responses
 * - Message metadata: Add source tracking, confidence cues
 */
const CopilotPanel: React.FC<CopilotPanelProps> = ({
  open,
  onClose,
  userInitials,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(400);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) setIsFullScreen(false);
  }, [open]);

  // Responsive width handling
  useEffect(() => {
    const updateWidth = () => {
      if (typeof window === 'undefined') return;
      const { innerWidth } = window;
      if (innerWidth < 480) {
        setDrawerWidth(innerWidth);
      } else if (innerWidth < 768) {
        setDrawerWidth(380);
      } else {
        setDrawerWidth(400);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setIsLoading(true);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const responseText = await sendCopilotChatRequest(
        query,
        undefined,
        signal,
      );
      const { parsed, parseError } = parseCopilotResponse(responseText);
      if (parseError) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-error`,
            text: COPILOT_ERROR_MESSAGES.UNEXPECTED,
            sender: 'copilot',
            timestamp: new Date(),
            messageType: 'error',
          },
        ]);
        return;
      }

      const normalized = normalizeCopilotResponse(parsed);

      if (!normalized.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-error`,
            text: normalized.displayText,
            sender: 'copilot',
            timestamp: new Date(),
            ...(normalized.messageType && {
              messageType: normalized.messageType,
            }),
            ...(normalized.backend_errors?.length && {
              backend_errors: normalized.backend_errors,
            }),
          },
        ]);
        return;
      }

      const answer =
        normalized.displayText || normalized.answerForMetadata || '';
      const metadata: Message['metadata'] = {};
      if (
        answer.includes('attendance records') ||
        answer.includes('Time & Attendance')
      ) {
        metadata.source = 'Time & Attendance';
        metadata.confidence = 'Based on attendance records';
      } else if (answer.includes('OKR data') || answer.includes('OKR System')) {
        metadata.source = 'OKR System';
        metadata.confidence = 'From OKR data';
      } else if (
        answer.includes('organizational structure') ||
        answer.includes('Employee & Organization')
      ) {
        metadata.source = 'Employee & Organization';
        metadata.confidence = 'Based on organizational structure data';
      } else if (answer.includes('Authentication successful')) {
        metadata.source = 'Copilot Service';
        metadata.confidence = 'Authenticated with backend';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-copilot`,
          text: answer,
          sender: 'copilot',
          timestamp: new Date(),
          metadata,
        },
      ]);
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          text: normalizeCopilotError(error),
          sender: 'copilot',
          timestamp: new Date(),
          messageType: 'error',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading]);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const handlePromptSelect = useCallback((prompt: string) => {
    setInputValue(prompt);
  }, []);

  const panelContent = (
    <div
      className="flex flex-col h-full min-h-0"
      data-cy="copilot-panel-content"
    >
      <div
        className="px-4 pt-4 bg-white border-b border-gray-200 flex-shrink-0"
        data-cy="copilot-panel-header"
      >
        <CopilotHeader
          onClose={onClose}
          onFullScreenToggle={() => setIsFullScreen((prev) => !prev)}
          isFullScreen={isFullScreen}
        />
      </div>
      <div
        className="flex-1 min-h-0 overflow-y-auto bg-gray-50"
        data-cy="copilot-panel-messages"
      >
        {messages.length === 0 ? (
          <CopilotEmptyState onPromptSelect={handlePromptSelect} />
        ) : (
          <CopilotMessages
            messages={messages}
            isLoading={isLoading}
            userInitials={userInitials}
          />
        )}
      </div>
      <div
        className="bg-white border-t border-gray-200 flex-shrink-0"
        data-cy="copilot-panel-input"
      >
        <CopilotInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          onStop={handleStop}
          isLoading={isLoading}
        />
      </div>
      <div
        className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex-shrink-0"
        data-cy="copilot-panel-footer"
      >
        <p
          className="text-xs text-gray-500 text-center"
          data-cy="copilot-panel-footer-text"
        >
          Responses are role-aware and based on system data.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {open && isFullScreen && (
        <div
          className="fixed inset-0 z-[9999] w-screen h-screen bg-white flex flex-col overflow-hidden"
          data-cy="copilot-panel-fullscreen-wrapper"
        >
          {panelContent}
        </div>
      )}
      <Drawer
        title={null}
        placement="right"
        onClose={onClose}
        open={open && !isFullScreen}
        width={drawerWidth}
        closable={false}
        mask={false}
        className="copilot-drawer"
        style={{ zIndex: 1001 }}
        styles={{
          body: {
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 64px)',
            overflow: 'hidden',
          },
        }}
        id="copilot-panel"
        data-cy="copilot-panel"
      >
        {panelContent}
      </Drawer>
    </>
  );
};

export default CopilotPanel;
