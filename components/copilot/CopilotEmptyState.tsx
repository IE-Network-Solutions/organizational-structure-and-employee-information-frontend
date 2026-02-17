'use client';

import React from 'react';
import { Button, Typography, Divider } from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface CopilotEmptyStateProps {
  onPromptSelect: (prompt: string) => void;
}

/**
 * CopilotEmptyState - First-time experience with grouped example prompts
 *
 * Displays example prompts organized by module:
 * - Time & Attendance
 * - Employees & Organization
 * - OKR
 *
 * Each prompt can be clicked to auto-fill the input.
 */
const CopilotEmptyState: React.FC<CopilotEmptyStateProps> = ({
  onPromptSelect,
}) => {
  const examplePrompts = {
    'Time & Attendance': [
      'Who was late today?',
      'Show my attendance summary for this week',
      'Any pending leave approvals?',
      "What is my team's attendance rate?",
    ],
    'Employees & Organization': [
      'Who reports to me?',
      'Show employees in the Engineering department',
      'What is the organizational structure?',
      'Find employees with upcoming birthdays',
    ],
    OKR: [
      "Show my team's OKR progress",
      'What are the current quarter objectives?',
      'Which OKRs are at risk?',
      'Display OKR completion status',
    ],
  };

  const iconMap = {
    'Time & Attendance': <ClockCircleOutlined className="text-blue-500" />,
    'Employees & Organization': <UserOutlined className="text-green-500" />,
    OKR: <CheckCircleOutlined className="text-purple-500" />,
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-full py-8 px-4"
      id="copilot-empty-state"
      data-cy="copilot-empty-state"
    >
      <div
        className="text-center mb-8 max-w-md"
        data-cy="copilot-empty-state-content"
      >
        <div className="mb-4" data-cy="copilot-empty-state-icon-wrapper">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4"
            data-cy="copilot-empty-state-icon-circle"
          >
            <MessageOutlined className="text-2xl text-gray-400" />
          </div>
        </div>
        <Text className="text-base text-gray-600 block mb-2">
          Welcome to SelamNew Copilot
        </Text>
        <Text type="secondary" className="text-sm block">
          Ask questions about your HR data, get insights, and manage your work
          more efficiently.
        </Text>
      </div>

      <div
        className="w-full max-w-lg space-y-6"
        data-cy="copilot-empty-state-prompts"
      >
        {Object.entries(examplePrompts).map(([category, prompts], index) => (
          <div
            key={category}
            data-cy={`copilot-empty-state-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div
              className="flex items-center gap-2 mb-3"
              data-cy={`copilot-empty-state-category-header-${category.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {iconMap[category as keyof typeof iconMap]}
              <Text strong className="text-sm text-gray-700">
                {category}
              </Text>
            </div>
            <div
              className="flex flex-wrap gap-2"
              data-cy={`copilot-empty-state-prompts-list-${category.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {prompts.map((prompt) => (
                <Button
                  key={prompt}
                  size="small"
                  type="default"
                  onClick={() => onPromptSelect(prompt)}
                  className="text-xs rounded-md border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 bg-white"
                  data-cy={`copilot-example-prompt-${category.toLowerCase().replace(/\s+/g, '-')}-${prompt.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {prompt}
                </Button>
              ))}
            </div>
            {index < Object.keys(examplePrompts).length - 1 && (
              <Divider className="my-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CopilotEmptyState;
