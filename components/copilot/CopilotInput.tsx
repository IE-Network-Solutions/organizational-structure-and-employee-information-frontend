'use client';

import React from 'react';
import { Input, Tooltip } from 'antd';
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
 * Workspace V2 composer — wide rounded field, circular primary send (paper plane).
 */
const CopilotInput: React.FC<CopilotInputProps> = ({
  value,
  onChange,
  onSend,
  onStop,
  isLoading,
  placeholder = 'Ask Your Copilot',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSend();
      }
    }
  };

  const showStop = isLoading && onStop;
  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div
      className="border-t border-slate-200 bg-white px-4 pb-4 pt-3"
      id="copilot-input-wrapper"
      data-cy="copilot-input-wrapper"
    >
      <div
        id="copilot-input-composer"
        data-cy="copilot-input-composer"
        className="mx-auto flex max-w-4xl items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus-within:border-primary/30 focus-within:shadow-[0_0_0_3px_rgba(54,54,240,0.1)]"
      >
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          bordered={false}
          className="!bg-transparent text-[15px] text-slate-800 placeholder:text-slate-400"
          id="copilot-input"
          data-cy="copilot-input"
        />
        {showStop ? (
          <Tooltip title="Stop">
            <button
              type="button"
              onClick={onStop}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-primary/40 hover:bg-light_purple hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              id="copilot-stop-button"
              data-cy="copilot-stop-button"
              aria-label="Stop response"
            >
              <SelamnewHandIcon className="h-5 w-5" />
            </button>
          </Tooltip>
        ) : (
          <Tooltip title={canSend ? 'Send' : 'Type a message'}>
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
                canSend
                  ? 'bg-primary text-white shadow-sm hover:brightness-105 active:scale-[0.97]'
                  : 'cursor-not-allowed bg-slate-200 text-slate-400'
              }`}
              id="copilot-send-button"
              data-cy="copilot-send-button"
              aria-label="Send message"
            >
              <SendOutlined />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default CopilotInput;
