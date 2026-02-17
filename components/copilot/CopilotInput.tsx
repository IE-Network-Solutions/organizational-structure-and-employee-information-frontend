'use client';

import React from 'react';
import { Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';

interface CopilotInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  placeholder?: string;
}

/**
 * CopilotInput - Input area for user messages
 *
 * Features:
 * - Text input with placeholder examples
 * - Send button
 * - Enter key support
 * - Disabled state while loading
 * - Auto-focus capability
 */
const CopilotInput: React.FC<CopilotInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  placeholder = 'Ask about attendance, employees, OKRs…',
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSend();
      }
    }
  };

  return (
    <div
      className="flex gap-2 p-4 border-t border-gray-200 bg-white"
      id="copilot-input-wrapper"
      data-cy="copilot-input-wrapper"
    >
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1"
        id="copilot-input"
        data-cy="copilot-input"
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={onSend}
        disabled={!value.trim() || isLoading}
        className="flex items-center justify-center"
        id="copilot-send-button"
        data-cy="copilot-send-button"
      >
        Send
      </Button>
    </div>
  );
};

export default CopilotInput;
