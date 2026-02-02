'use client';

import React, { useState, useCallback } from 'react';
import { Typography, Button } from 'antd';
import {
  MessageOutlined,
  CloseOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import CopilotMessages, { Message } from './CopilotMessages';
import CopilotInput from './CopilotInput';
import CopilotIntentPanel from './CopilotIntentPanel';
import { sendCopilotChatRequest } from '@/utils/copilotApiService';

const { Title, Text } = Typography;

interface CopilotModuleProps {
  onClose: () => void;
}

/**
 * CopilotModule - Full-width overlay that replaces main content when opened
 *
 * Triggered by the Copilot button (no route). Layout: Header | [Chat | Intents].
 * Intents are collapsible by default so chat area is visible without scrolling.
 */
const CopilotModule: React.FC<CopilotModuleProps> = ({ onClose }) => {
  const { userId } = useAuthenticationStore();
  const { data: employeeData } = useGetEmployee(userId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIntentPanelVisible, setIsIntentPanelVisible] = useState(true);
  const userInitials =
    employeeData?.firstName?.[0]?.toUpperCase() ||
    employeeData?.lastName?.[0]?.toUpperCase() ||
    'U';

  const addMetadata = useCallback((responseText: string): Message['metadata'] => {
    const metadata: Message['metadata'] = {};
    if (
      responseText.includes('attendance records') ||
      responseText.includes('Time & Attendance')
    ) {
      metadata.source = 'Time & Attendance';
      metadata.confidence = 'Based on attendance records';
    } else if (
      responseText.includes('OKR data') ||
      responseText.includes('OKR System')
    ) {
      metadata.source = 'OKR System';
      metadata.confidence = 'From OKR data';
    } else if (
      responseText.includes('organizational structure') ||
      responseText.includes('Employee & Organization')
    ) {
      metadata.source = 'Employee & Organization';
      metadata.confidence = 'Based on organizational structure data';
    } else if (responseText.includes('Authentication successful')) {
      metadata.source = 'Copilot Service';
      metadata.confidence = 'Authenticated with backend';
    }
    return metadata;
  }, []);

  const sendQuery = useCallback(
    async (query: string) => {
      if (!query.trim() || isLoading) return;

      const userMessage: Message = {
        id: `msg-${Date.now()}-user`,
        text: query,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);

      try {
        const responseText = await sendCopilotChatRequest(query);
        const copilotMessage: Message = {
          id: `msg-${Date.now()}-copilot`,
          text: responseText,
          sender: 'copilot',
          timestamp: new Date(),
          metadata: addMetadata(responseText),
        };
        setMessages((prev) => [...prev, copilotMessage]);
      } catch (error) {
        const errorMessage: Message = {
          id: `msg-${Date.now()}-error`,
          text:
            error instanceof Error
              ? error.message
              : 'Sorry, I encountered an error. Please try again.',
          sender: 'copilot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, addMetadata]
  );

  const handleSend = useCallback(() => {
    if (inputValue.trim()) sendQuery(inputValue);
  }, [inputValue, sendQuery]);

  const handleIntentSelect = useCallback((intent: string) => {
    setInputValue(intent);
  }, []);

  return (
    <div
      className="flex flex-col h-[calc(100vh-130px)] overflow-hidden bg-gray-50 p-4"
      data-cy="copilot-module"
    >
      {/* Header with close */}
      <div className="flex-shrink-0 flex items-start justify-between pb-3">
        <div>
          <Title level={4} className="!mb-0 !text-gray-900">
            SelamNew Copilot
          </Title>
          <Text type="secondary" className="text-xs">
            Ask questions and generate insights from your HR data
          </Text>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          data-cy="copilot-close-button"
          aria-label="Close Copilot"
        />
      </div>

      {/* Body: fills all remaining space; both panels scroll independently */}
      <div className="flex flex-1 min-h-0 gap-4 overflow-hidden">
        {/* Chat - full width when intents hidden, scrolls internally */}
        <div className="flex-1 flex flex-col min-w-0 h-full border border-gray-200 rounded-lg bg-white overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50/50 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <MessageOutlined className="text-3xl text-gray-400" />
                </div>
                <Text className="text-base text-gray-600 block mb-2">
                  Welcome to SelamNew Copilot
                </Text>
                <Text
                  type="secondary"
                  className="text-sm block text-center max-w-md"
                >
                  Ask questions about your HR data, get insights, and manage your
                  work more efficiently. Click an intent on the right to copy it
                  to the input, edit if needed, then send. Or type your question
                  below.
                </Text>
              </div>
            ) : (
              <CopilotMessages
                messages={messages}
                isLoading={isLoading}
                userInitials={userInitials}
              />
            )}
          </div>
          <div className="flex-shrink-0 border-t border-gray-200 bg-white">
            <CopilotInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSend}
              isLoading={isLoading}
              placeholder="Ask for a report... e.g. Monthly attendance, Who's on leave today"
            />
          </div>
        </div>

        {/* Show intents button when panel is hidden - vertical tab outside chat */}
        {!isIntentPanelVisible && (
          <div className="flex-shrink-0 hidden md:flex flex-col justify-start">
            <Button
              type="primary"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setIsIntentPanelVisible(true)}
              className="shadow-lg flex items-center gap-2 h-auto py-3 px-4"
              title="Show available reports"
              data-cy="copilot-show-intents-button"
            >
              Reports
            </Button>
          </div>
        )}

        {/* Right: Intent Panel - toggleable, fixed height, own scroll */}
        {isIntentPanelVisible && (
          <div className="w-[300px] flex-shrink-0 h-full hidden md:flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden">
            <CopilotIntentPanel
              onIntentSelect={handleIntentSelect}
              onHide={() => setIsIntentPanelVisible(false)}
            />
          </div>
        )}
      </div>

      {/* Mobile: Show reports button when hidden */}
      {!isIntentPanelVisible && (
        <div className="md:hidden mt-2 flex-shrink-0">
          <Button
            type="primary"
            icon={<MenuUnfoldOutlined />}
            onClick={() => setIsIntentPanelVisible(true)}
            className="w-full shadow-lg flex items-center justify-center gap-2"
            data-cy="copilot-show-intents-button-mobile"
          >
            Show Available Reports
          </Button>
        </div>
      )}

      {/* Mobile: Intent panel below chat, toggleable */}
      {isIntentPanelVisible && (
        <div className="md:hidden mt-2 flex-shrink-0 flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden h-[35vh]">
          <CopilotIntentPanel
            onIntentSelect={handleIntentSelect}
            onHide={() => setIsIntentPanelVisible(false)}
          />
        </div>
      )}
    </div>
  );
};

export default CopilotModule;
