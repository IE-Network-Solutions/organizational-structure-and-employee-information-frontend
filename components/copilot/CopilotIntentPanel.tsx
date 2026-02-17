'use client';

import React, { useState } from 'react';
import { Collapse, Typography, Button } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import type { IntentCategory } from './intents';
import { COPILOT_INTENTS } from './intents';

const { Text } = Typography;

const iconMap: Record<string, React.ReactNode> = {
  UserOutlined: <UserOutlined className="text-blue-500" />,
  ClockCircleOutlined: <ClockCircleOutlined className="text-amber-500" />,
  RiseOutlined: <RiseOutlined className="text-green-500" />,
};

interface CopilotIntentPanelProps {
  onIntentSelect: (intent: string) => void;
  onHide?: () => void;
}

/**
 * CopilotIntentPanel - Frequently used intents / report shortcuts
 *
 * Displays collapsible categories with clickable intent items.
 * Designed as "report shortcuts" - enterprise-grade, not chat suggestions.
 */
const CopilotIntentPanel: React.FC<CopilotIntentPanelProps> = ({
  onIntentSelect,
  onHide,
}) => {
  // Start with all categories collapsed so chat area is visible without scrolling
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const handleExpand = (keys: string | string[]) => {
    setExpandedKeys(Array.isArray(keys) ? keys : [keys]);
  };

  return (
    <div
      className="h-full min-h-0 flex flex-col bg-white overflow-hidden"
      id="copilot-intent-panel"
      data-cy="copilot-intent-panel"
    >
      <div
        className="px-4 py-3 border-b border-gray-200 flex-shrink-0"
        data-cy="copilot-intent-panel-header"
      >
        <div
          className="flex items-center justify-between gap-2"
          data-cy="copilot-intent-panel-header-content"
        >
          <Text strong className="text-gray-900">
            Available reports
          </Text>
          {onHide && (
            <Button
              type="default"
              size="small"
              icon={<MenuFoldOutlined />}
              onClick={onHide}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 hover:border-blue-400"
              title="Hide reports panel"
              data-cy="copilot-hide-intents-button"
            >
              Hide
            </Button>
          )}
        </div>
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto py-2"
        data-cy="copilot-intent-panel-content"
      >
        <Collapse
          activeKey={expandedKeys}
          onChange={handleExpand}
          expandIconPosition="end"
          bordered={false}
          className="copilot-intent-collapse bg-transparent [&_.ant-collapse-item]:border-b [&_.ant-collapse-item]:border-gray-100"
          data-cy="copilot-intent-collapse"
        >
          {COPILOT_INTENTS.map((category: IntentCategory) => (
            <Collapse.Panel
              key={category.id}
              header={
                <span
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  data-cy={`copilot-intent-category-header-${category.id}`}
                >
                  {iconMap[category.icon] || null}
                  {category.label}
                </span>
              }
              className="!border-0"
            >
              <div
                className="space-y-1 pl-6"
                data-cy={`copilot-intent-category-content-${category.id}`}
              >
                {category.intents.map((intent) => (
                  <button
                    key={intent}
                    type="button"
                    onClick={() => onIntentSelect(intent)}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-transparent hover:border-blue-100"
                    data-cy={`copilot-intent-${category.id}-${intent.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {intent}
                  </button>
                ))}
              </div>
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
    </div>
  );
};

export default CopilotIntentPanel;
