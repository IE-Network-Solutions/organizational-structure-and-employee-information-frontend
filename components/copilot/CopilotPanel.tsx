'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Drawer } from 'antd';
import CopilotHeader from './CopilotHeader';
import CopilotMessages, { Message } from './CopilotMessages';
import CopilotInput from './CopilotInput';
import CopilotEmptyState from './CopilotEmptyState';
import { sendCopilotChatRequest } from '@/utils/copilotApiService';

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

    try {
      // Call Azure App Service backend
      const responseText = await sendCopilotChatRequest(query);

      // Determine metadata based on response content
      const metadata: Message['metadata'] = {};
      if (responseText.includes('attendance records') || responseText.includes('Time & Attendance')) {
        metadata.source = 'Time & Attendance';
        metadata.confidence = 'Based on attendance records';
      } else if (responseText.includes('OKR data') || responseText.includes('OKR System')) {
        metadata.source = 'OKR System';
        metadata.confidence = 'From OKR data';
      } else if (responseText.includes('organizational structure') || responseText.includes('Employee & Organization')) {
        metadata.source = 'Employee & Organization';
        metadata.confidence = 'Based on organizational structure data';
      } else if (responseText.includes('Authentication successful')) {
        metadata.source = 'Copilot Service';
        metadata.confidence = 'Authenticated with backend';
      }

      const copilotMessage: Message = {
        id: `msg-${Date.now()}-copilot`,
        text: responseText,
        sender: 'copilot',
        timestamp: new Date(),
        metadata,
      };

      setMessages((prev) => [...prev, copilotMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        text: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
        sender: 'copilot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading]);

  const handlePromptSelect = useCallback((prompt: string) => {
    setInputValue(prompt);
    // Auto-focus input (handled by browser)
  }, []);

  return (
    <Drawer
      title={null}
      placement="right"
      onClose={onClose}
      open={open}
      width={drawerWidth}
      closable={false}
      mask={false}
      className="copilot-drawer"
      style={{
        zIndex: 1001,
      }}
      styles={{
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)', // Full height minus header (typical header height)
          overflow: 'hidden', // Prevent body from scrolling
        },
      }}
      data-cy="copilot-panel"
    >
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="px-4 pt-4 bg-white border-b border-gray-200 flex-shrink-0">
          <CopilotHeader onClose={onClose} />
        </div>

        {/* Messages Area - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50">
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

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 flex-shrink-0">
          <CopilotInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            isLoading={isLoading}
          />
        </div>

        {/* Footer Note */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">
            Responses are role-aware and based on system data.
          </p>
        </div>
      </div>
    </Drawer>
  );
};

export default CopilotPanel;
