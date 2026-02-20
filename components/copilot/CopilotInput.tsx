'use client';

import React from 'react';
import { Input, Button, Tooltip } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const STROKE_COLOR = '#3636F0';

const SelamnewHandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 60 58"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className ?? 'w-5 h-5'}
    style={{ display: 'block', flexShrink: 0 }}
    aria-hidden
  >
    <path
      d="M22.41 49.1694C22.41 49.1694 15.9718 41.8025 13.7429 34.3114C12.1004 28.7921 15.2288 26.0773 18.6952 31.8967C22.1617 37.7162 21.9759 37.2832 21.9759 37.2832L21.4392 15.1295C21.4176 14.2505 21.7059 13.3801 22.2912 12.7235C22.6476 12.324 23.1314 11.9698 23.7718 11.8369C25.5676 11.4655 27.1766 13.5701 27.1766 13.5701L27.4865 30.7812"
      stroke={STROKE_COLOR}
      strokeWidth="1.94378"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M27.1758 13.5724C27.1758 13.5724 27.1758 9.67188 29.7761 9.67188C31.5169 9.67188 32.2868 11.0044 32.6054 11.8845C32.7447 12.269 32.8095 12.675 32.8095 13.0832V28.6777"
      stroke={STROKE_COLOR}
      strokeWidth="1.94378"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M32.8086 13.7892C32.8086 13.7892 33.1336 11.3746 35.7804 11.4675C36.7199 11.5009 37.3095 12.0063 37.6702 12.5333C38.019 13.043 38.1929 13.652 38.2026 14.2697L38.4423 29.05"
      stroke={STROKE_COLOR}
      strokeWidth="1.94378"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M38.4453 18.57C38.4453 18.57 38.5933 16.5117 41.3631 16.5117C43.1892 16.5117 43.7691 17.976 43.8361 18.7471C44.1903 22.7977 45.6341 42.8327 40.3027 49.664"
      stroke={STROKE_COLOR}
      strokeWidth="1.94378"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M26.9258 36.293C26.9258 36.293 32.931 42.2366 31.5066 49.1705"
      stroke={STROKE_COLOR}
      strokeWidth="1.94378"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M9.65581 25.7695C9.65581 25.7695 6.62243 28.1226 7.11702 32.6419"
      stroke={STROKE_COLOR}
      strokeWidth="1.94378"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M6.74635 21.0625C6.74635 21.0625 1.48411 26.0148 2.04132 34.8687"
      stroke={STROKE_COLOR}
      strokeWidth="1.94378"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M47.418 13.1406C47.418 13.1406 50.6371 14.7507 50.6986 19.5173"
      stroke={STROKE_COLOR}
      strokeWidth="1.94378"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
    <path
      d="M49.7734 8C49.7734 8 55.2214 12.272 56.1501 20.7534"
      stroke={STROKE_COLOR}
      strokeWidth="1.94378"
      strokeMiterlimit="10"
      strokeLinecap="round"
    />
  </svg>
);

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
