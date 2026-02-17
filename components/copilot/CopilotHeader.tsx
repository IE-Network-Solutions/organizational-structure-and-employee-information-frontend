'use client';

import React from 'react';
import { Typography, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface CopilotHeaderProps {
  onClose: () => void;
}

/**
 * CopilotHeader - Header section of the Copilot panel
 *
 * Displays the title, subtitle, and close button.
 * Maintains enterprise-grade, professional styling.
 */
const CopilotHeader: React.FC<CopilotHeaderProps> = ({ onClose }) => {
  return (
    <div
      className="flex items-center justify-between pb-4 border-b border-gray-200"
      id="copilot-header"
      data-cy="copilot-header"
    >
      <div className="flex flex-col" data-cy="copilot-header-content">
        <Title level={5} className="!mb-1 !text-gray-900">
          SelamNew Copilot
        </Title>
        <Text type="secondary" className="text-xs">
          Ask about attendance, employees, OKRs…
        </Text>
      </div>
      <Button
        type="text"
        icon={<CloseOutlined />}
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700"
        id="copilot-header-close-button"
        data-cy="copilot-close-button"
      />
    </div>
  );
};

export default CopilotHeader;
