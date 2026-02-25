'use client';

import React from 'react';
import { Typography, Button, Tooltip } from 'antd';
import {
  CloseOutlined,
  FullscreenOutlined,
  CompressOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface CopilotHeaderProps {
  onClose: () => void;
  onFullScreenToggle?: () => void;
  isFullScreen?: boolean;
}

/**
 * CopilotHeader - Header section of the Copilot panel
 *
 * Displays the title, subtitle, full-screen toggle (optional), and close button.
 * Azure-style: full-screen expands panel to entire viewport.
 */
const CopilotHeader: React.FC<CopilotHeaderProps> = ({
  onClose,
  onFullScreenToggle,
  isFullScreen = false,
}) => {
  return (
    <div
      className="flex items-center justify-between pb-4 border-b border-gray-200"
      id="copilot-header"
      data-cy="copilot-header"
    >
      <div className="flex flex-col" data-cy="copilot-header-content">
        <Title
          level={5}
          className="!mb-1 !text-gray-900"
          data-cy="copilot-header-title"
        >
          SelamNew Copilot
        </Title>
        <Text
          type="secondary"
          className="text-xs"
          data-cy="copilot-header-subtitle"
        >
          Ask about attendance, employees, OKRs…
        </Text>
      </div>
      <div className="flex items-center gap-1" data-cy="copilot-header-actions">
        {onFullScreenToggle && (
          <Tooltip title={isFullScreen ? 'Exit full screen' : 'Full screen'}>
            <Button
              type="text"
              size="small"
              icon={
                isFullScreen ? <CompressOutlined /> : <FullscreenOutlined />
              }
              onClick={onFullScreenToggle}
              className="text-gray-500 hover:text-blue-600"
              aria-label={isFullScreen ? 'Exit full screen' : 'Full screen'}
              data-cy="copilot-header-fullscreen-button"
            />
          </Tooltip>
        )}
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          id="copilot-header-close-button"
          data-cy="copilot-close-button"
        />
      </div>
    </div>
  );
};

export default CopilotHeader;
