'use client';

import React from 'react';
import { Button, Tooltip } from 'antd';
import {
  CloseOutlined,
  FullscreenOutlined,
  CompressOutlined,
} from '@ant-design/icons';

interface CopilotHeaderProps {
  onClose: () => void;
  onFullScreenToggle?: () => void;
  isFullScreen?: boolean;
}

/**
 * Drawer / compact Copilot header — matches Workspace V2 toolbar styling.
 */
const CopilotHeader: React.FC<CopilotHeaderProps> = ({
  onClose,
  onFullScreenToggle,
  isFullScreen = false,
}) => {
  return (
    <div
      className="flex items-center justify-between border-b border-slate-200 pb-3"
      id="copilot-header"
      data-cy="copilot-header"
    >
      <div
        className="flex flex-col gap-0.5"
        id="copilot-header-content"
        data-cy="copilot-header-content"
      >
        <span
          className="text-sm font-semibold text-slate-900"
          id="copilot-header-title"
          data-cy="copilot-header-title"
        >
          Copilot
        </span>
        <span
          className="text-xs text-slate-500"
          id="copilot-header-subtitle"
          data-cy="copilot-header-subtitle"
        >
          Ask your copilot or use available reports in the full workspace view.
        </span>
      </div>
      <div
        className="flex items-center gap-0.5 rounded-lg border border-slate-200/80 bg-slate-50/80 px-0.5 py-0.5"
        id="copilot-header-actions"
        data-cy="copilot-header-actions"
      >
        {onFullScreenToggle && (
          <Tooltip title={isFullScreen ? 'Exit full screen' : 'Full screen'}>
            <Button
              type="text"
              size="small"
              icon={
                isFullScreen ? <CompressOutlined /> : <FullscreenOutlined />
              }
              onClick={onFullScreenToggle}
              className="text-slate-500 hover:!text-primary"
              aria-label={isFullScreen ? 'Exit full screen' : 'Full screen'}
              id="copilot-header-fullscreen-button"
              data-cy="copilot-header-fullscreen-button"
            />
          </Tooltip>
        )}
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          className="text-slate-500 hover:!text-slate-800"
          id="copilot-header-close-button"
          data-cy="copilot-close-button"
        />
      </div>
    </div>
  );
};

export default CopilotHeader;
