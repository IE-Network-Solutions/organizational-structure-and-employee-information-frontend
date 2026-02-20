'use client';

import React from 'react';
import { Input, Button, Tooltip } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import SelamnewHandIcon from './SelamnewHandIcon';

interface CopilotInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
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
 * - Input stays active while loading (user can type).
 * - Send disabled until response finishes or user stops; optional Stop button.
 */
const CopilotInput: React.FC<CopilotInputProps> = ({
  value,
  onChange,
  onSend,
  onStop,
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

  const showStop = isLoading && onStop;

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
        className="flex-1"
        id="copilot-input"
        data-cy="copilot-input"
      />
      {showStop ? (
        <Tooltip title="Stop response">
          <button
            type="button"
            onClick={onStop}
            className="flex items-center justify-center w-10 h-10 min-w-[40px] rounded-full border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
            id="copilot-stop-button"
            data-cy="copilot-stop-button"
            aria-label="Stop response"
          >
            <span
              className="copilot-hand-cooking inline-flex items-center justify-center flex-shrink-0"
              aria-hidden
            >
              <SelamnewHandIcon className="w-5 h-5" />
            </span>
          </button>
        </Tooltip>
      ) : (
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={onSend}
          disabled={!value.trim()}
          className="flex items-center justify-center"
          id="copilot-send-button"
          data-cy="copilot-send-button"
        >
          Send
        </Button>
      )}
    </div>
  );
};

export default CopilotInput;
