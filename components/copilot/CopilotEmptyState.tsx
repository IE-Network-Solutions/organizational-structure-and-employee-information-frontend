'use client';

import React from 'react';
import { Button, Typography, Divider } from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import SelamnewHandIcon from './SelamnewHandIcon';

const { Text } = Typography;

interface CopilotEmptyStateProps {
  onPromptSelect: (prompt: string) => void;
  /** User's first name (or display name) for personalized greeting e.g. "Hello Muluken!" */
  userName?: string;
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
  userName,
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
        className="flex items-start gap-4 mb-8 max-w-md mx-auto text-left w-full"
        data-cy="copilot-empty-state-content"
      >
        <span
          className="copilot-hand-cooking inline-flex items-center justify-center flex-shrink-0 w-14 h-14 rounded-full bg-white border border-gray-200 shadow-sm"
          aria-hidden
          data-cy="copilot-stop-icon-wrapper"
        >
          <SelamnewHandIcon className="w-8 h-8" />
        </span>
        <div
          className="flex-1 min-w-0 pt-0.5"
          data-cy="copilot-empty-state-greeting"
        >
          <Text
            className="text-xl font-semibold text-gray-800 block mb-2"
            data-cy="copilot-empty-state-title"
          >
            {userName ? `Hello ${userName}!` : 'Welcome to SelamNew Copilot'}
          </Text>
          <Text
            type="secondary"
            className="text-sm block text-gray-600"
            data-cy="copilot-empty-state-subtitle"
          >
            SelamNew Copilot can help you answer questions, complete tasks, and
            discover insights from your HR data. Ready to explore? Select one of
            the suggestions below to get started.
          </Text>
        </div>
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
