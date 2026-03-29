'use client';

import React from 'react';
import { Button, Typography, Divider } from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface CopilotEmptyStateProps {
  onPromptSelect: (prompt: string) => void;
  userName?: string;
}

/**
 * Drawer empty state — same headline as main Copilot + optional starter chips.
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
    'Time & Attendance': <ClockCircleOutlined className="text-primary" />,
    'Employees & Organization': <UserOutlined className="text-primary" />,
    OKR: <CheckCircleOutlined className="text-primary" />,
  };

  return (
    <div
      className="flex min-h-full flex-col items-center px-3 py-8"
      id="copilot-empty-state"
      data-cy="copilot-empty-state"
    >
      <div
        className="mb-8 max-w-md text-center"
        id="copilot-empty-state-content"
        data-cy="copilot-empty-state-content"
      >
        <p
          className="text-[15px] font-medium leading-7 text-black md:text-[16px] md:leading-8"
          id="copilot-empty-state-title"
          data-cy="copilot-empty-state-title"
        >
          {userName
            ? `Hi ${userName} — ask your copilot to get started, Use the available Reports.`
            : 'Ask your copilot to get started, Use the available Reports.'}
        </p>
      </div>

      <div
        className="w-full max-w-lg space-y-5"
        id="copilot-empty-state-prompts"
        data-cy="copilot-empty-state-prompts"
      >
        {Object.entries(examplePrompts).map(([category, prompts], index) => {
          const catSlug = category.toLowerCase().replace(/\s+/g, '-');
          return (
            <div
              key={category}
              id={`copilot-empty-state-category-${catSlug}`}
              data-cy={`copilot-empty-state-category-${catSlug}`}
            >
              <div
                className="mb-2 flex items-center gap-2"
                id={`copilot-empty-state-category-header-${catSlug}`}
                data-cy={`copilot-empty-state-category-header-${catSlug}`}
              >
                {iconMap[category as keyof typeof iconMap]}
                <Text strong className="text-sm text-slate-800">
                  {category}
                </Text>
              </div>
              <div
                className="flex flex-wrap gap-2"
                id={`copilot-empty-state-prompts-list-${catSlug}`}
                data-cy={`copilot-empty-state-prompts-list-${catSlug}`}
              >
                {prompts.map((prompt) => {
                  const promptSlug = prompt.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Button
                      key={prompt}
                      size="small"
                      type="default"
                      onClick={() => onPromptSelect(prompt)}
                      className="rounded-lg border-slate-200 bg-white text-xs text-slate-700 hover:!border-primary/40 hover:!text-primary"
                      id={`copilot-example-prompt-${catSlug}-${promptSlug}`}
                      data-cy={`copilot-example-prompt-${catSlug}-${promptSlug}`}
                    >
                      {prompt}
                    </Button>
                  );
                })}
              </div>
              {index < Object.keys(examplePrompts).length - 1 && (
                <Divider className="my-4 border-slate-100" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CopilotEmptyState;
