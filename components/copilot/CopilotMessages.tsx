'use client';

import React, { useRef, useEffect } from 'react';
import { Avatar, Typography, Spin, Tag } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'copilot';
  timestamp: Date;
  metadata?: {
    source?: string;
    confidence?: string;
  };
}

interface CopilotMessagesProps {
  messages: Message[];
  isLoading: boolean;
  userInitials?: string;
}

/**
 * CopilotMessages - Displays conversation messages
 * 
 * Features:
 * - User messages (right-aligned, blue accent)
 * - Copilot messages (left-aligned, neutral)
 * - Support for metadata (source, confidence cues)
 * - Auto-scroll to bottom
 * - Loading indicator
 * 
 * Future-ready for:
 * - Structured insights (bullets, highlights)
 * - Action suggestions
 * - Charts and tables
 */
const CopilotMessages: React.FC<CopilotMessagesProps> = ({
  messages,
  isLoading,
  userInitials = 'U',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isLoading]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessageContent = (message: Message) => {
    // Simple text rendering for now
    // Future: Parse structured content, highlights, actions, etc.
    const text = message.text;
    
    // Check for simple patterns that indicate insights
    const hasAtRisk = /at risk|⚠️|risk/i.test(text);
    const hasOnTrack = /on track|✅|complete/i.test(text);
    
    return (
      <div>
        <Text className="text-sm leading-relaxed whitespace-pre-wrap">
          {text}
        </Text>
        {message.metadata?.source && (
          <div className="mt-2">
            <Tag color="default" className="text-xs">
              {message.metadata.source}
            </Tag>
          </div>
        )}
        {message.metadata?.confidence && (
          <div className="mt-1">
            <Text type="secondary" className="text-xs italic">
              {message.metadata.confidence}
            </Text>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((message) => {
        const isUser = message.sender === 'user';
        return (
          <div
            key={message.id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3`}
            data-cy={`copilot-message-${message.id}`}
          >
            {!isUser && (
              <Avatar
                size={32}
                icon={<RobotOutlined />}
                className="bg-gray-100 text-gray-600 flex-shrink-0"
              />
            )}
            <div
              className={`max-w-[75%] rounded-lg px-4 py-2.5 ${
                isUser
                  ? 'bg-blue-50 border border-blue-100'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              {renderMessageContent(message)}
              <div className="mt-1.5">
                <Text type="secondary" className="text-xs">
                  {formatTime(message.timestamp)}
                </Text>
              </div>
            </div>
            {isUser && (
              <Avatar
                size={32}
                icon={<UserOutlined />}
                className="bg-blue-100 text-blue-600 flex-shrink-0"
              >
                {userInitials}
              </Avatar>
            )}
          </div>
        );
      })}
      {isLoading && (
        <div className="flex justify-start gap-3" data-cy="copilot-loading">
          <Avatar
            size={32}
            icon={<RobotOutlined />}
            className="bg-gray-100 text-gray-600"
          />
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm">
            <Spin size="small" />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default CopilotMessages;
