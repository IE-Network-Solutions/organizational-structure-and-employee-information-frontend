'use client';

import React from 'react';
import { Input, Tooltip } from 'antd';
import { SendOutlined, EllipsisOutlined } from '@ant-design/icons';
import CopilotAiIcon from './CopilotAiIcon';
import { COPILOT_THEME } from './copilotTheme';

interface CopilotInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  isLoading: boolean;
  placeholder?: string;
  /**
   * `workspace` — field + send/stop only (generating indicator lives in the message thread).
   * `default` — drawer composer: AI chip + more inline with field.
   */
  variant?: 'default' | 'workspace';
}

const SEND_SIZE = COPILOT_THEME.sendButtonPx;

const CopilotInput: React.FC<CopilotInputProps> = ({
  value,
  onChange,
  onSend,
  onStop,
  isLoading,
  placeholder = 'Ask Your Copilot',
  variant = 'default',
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
  const isWorkspace = variant === 'workspace';
  const sendBg = isWorkspace
    ? COPILOT_THEME.workspaceSendBlue
    : COPILOT_THEME.actionBlue;
  const radius = isWorkspace
    ? COPILOT_THEME.composerRadiusWorkspace
    : COPILOT_THEME.composerRadius;
  const composerW = COPILOT_THEME.composerMaxWidth;
  const composerH = COPILOT_THEME.composerHeightPx;
  const chromeBorder = COPILOT_THEME.composerChromeBorder;

  return (
    <div
      className={`bg-white ${isWorkspace ? 'px-2 pb-5 pt-3' : 'px-4 pb-5 pt-4'}`}
      id="copilot-input-wrapper"
      data-cy="copilot-input-wrapper"
    >
      <div
        className="mx-auto w-full"
        style={{ maxWidth: composerW }}
        id="copilot-input-inner"
        data-cy="copilot-input-inner"
      >
        <div
          id="copilot-input-composer"
          data-cy="copilot-input-composer"
          className={`box-border flex w-full items-center border bg-white shadow-none ${
            isWorkspace
              ? 'gap-3 border-[#E5E7EB] px-4 py-0 focus-within:border-[#E5E7EB]'
              : 'gap-2 border-[#E5E7EB] px-2 py-0 pl-3 transition-[box-shadow,border-color] focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_2px_rgba(37,99,235,0.12)] sm:px-3 sm:pl-4'
          }`}
          style={{
            borderRadius: radius,
            height: composerH,
            borderColor: chromeBorder,
          }}
        >
          {!isWorkspace && (
            <div
              className="flex shrink-0 items-center gap-1.5"
              style={{ height: composerH }}
              aria-hidden={false}
              data-cy="copilot-input-leading"
            >
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white"
                style={{ borderColor: chromeBorder }}
                title="Copilot"
                data-cy="copilot-input-avatar-wrap"
              >
                <CopilotAiIcon
                  size={18}
                  color={COPILOT_THEME.assistantAvatarGlyph}
                  aria-hidden
                />
              </span>
              <Tooltip title="More options">
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-[8px] border bg-white text-[#6B7280] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A48B1]/25"
                  style={{ borderColor: chromeBorder }}
                  aria-label="More composer options"
                  id="copilot-input-more"
                  data-cy="copilot-input-more"
                >
                  <EllipsisOutlined className="text-[14px]" />
                </button>
              </Tooltip>
            </div>
          )}
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            bordered={false}
            className={`min-w-0 flex-1 !bg-transparent text-[15px] font-medium leading-normal ${
              isWorkspace
                ? 'text-[#374151] placeholder:text-[#9CA3AF]'
                : 'text-[#333333] placeholder:text-[#9CA3AF]'
            }`}
            id="copilot-input"
            data-cy="copilot-input"
          />
          {showStop ? (
            <Tooltip title="Stop">
              <button
                type="button"
                onClick={onStop}
                className="flex shrink-0 items-center justify-center rounded-full border border-[#d9d9d9] bg-white text-[#595959] transition-colors hover:border-primary/40 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                style={{ width: SEND_SIZE, height: SEND_SIZE }}
                id="copilot-stop-button"
                data-cy="copilot-stop-button"
                aria-label="Stop response"
              >
                <span
                  className="text-xs font-semibold"
                  data-cy="copilot-stop-button-label"
                >
                  Stop
                </span>
              </button>
            </Tooltip>
          ) : (
            <Tooltip title={canSend ? 'Send' : 'Type a message'}>
              <button
                type="button"
                onClick={onSend}
                disabled={!canSend}
                className={`flex shrink-0 items-center justify-center rounded-full text-base transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  canSend
                    ? isWorkspace
                      ? 'text-white shadow-sm active:scale-[0.97] focus-visible:ring-[#1D4ED8]/40'
                      : 'text-white shadow-sm hover:brightness-105 active:scale-[0.97] focus-visible:ring-[#2563EB]/40'
                    : 'cursor-not-allowed bg-[#F3F4F6] text-[#9CA3AF]'
                }`}
                style={{
                  width: SEND_SIZE,
                  height: SEND_SIZE,
                  ...(canSend ? { backgroundColor: sendBg } : {}),
                }}
                id="copilot-send-button"
                data-cy="copilot-send-button"
                aria-label="Send message"
              >
                <SendOutlined
                  className={`text-[15px] ${canSend ? 'text-white' : '!text-[#9CA3AF]'}`}
                />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default CopilotInput;
