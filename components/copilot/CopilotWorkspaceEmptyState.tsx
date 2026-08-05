'use client';

import React, { useMemo } from 'react';
import { Skeleton } from 'antd';
import { COPILOT_THEME } from './copilotTheme';
import { useGetCopilotPrompts } from '@/store/server/features/copilot/prompts/queries';
import {
  getGlobalCopilotPrompts,
  mapCopilotPromptsToChips,
} from '@/store/server/features/copilot/prompts/interface';

interface CopilotWorkspaceEmptyStateProps {
  onPromptSelect: (prompt: string) => void;
  activePrompt?: string | null;
}

/**
 * Selamnew Copilot workspace landing — title, subtitle, and starter prompt chips.
 * Chips are global/default prompts only (tenantId + userId null from GET /copilot-prompts).
 */
const CopilotWorkspaceEmptyState: React.FC<CopilotWorkspaceEmptyStateProps> = ({
  onPromptSelect,
  activePrompt,
}) => {
  const { data: apiPrompts, isLoading, isError } = useGetCopilotPrompts();

  const chips = useMemo(() => {
    const globalPrompts = getGlobalCopilotPrompts(apiPrompts);
    return mapCopilotPromptsToChips(globalPrompts);
  }, [apiPrompts]);

  const promptRows = useMemo(() => {
    const mid = Math.ceil(chips.length / 2);
    if (chips.length <= 3) return [chips];
    return [chips.slice(0, mid), chips.slice(mid)];
  }, [chips]);

  const isActive = (label: string) =>
    activePrompt != null &&
    activePrompt.trim().toLowerCase() === label.trim().toLowerCase();

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center md:px-10"
      id="copilot-workspace-empty-state"
      data-cy="copilot-workspace-empty-state"
    >
      <h1
        className="mb-2 text-[22px] font-semibold leading-tight md:text-[24px]"
        style={{ color: COPILOT_THEME.workspaceAccentBlue }}
        id="copilot-workspace-empty-state-title"
        data-cy="copilot-workspace-empty-state-title"
      >
        Selamnew Copilot
      </h1>
      <p
        className="mb-10 max-w-xl text-[14px] leading-6 md:text-[15px]"
        style={{ color: COPILOT_THEME.workspaceSubtitle }}
        id="copilot-workspace-empty-state-subtitle"
        data-cy="copilot-workspace-empty-state-subtitle"
      >
        Ask your copilot any questions about the system, or start here
      </p>

      <div
        className="flex w-full max-w-[820px] flex-col items-center gap-2.5"
        id="copilot-workspace-empty-state-prompts"
        data-cy="copilot-workspace-empty-state-prompts"
      >
        {isLoading && !apiPrompts ? (
          <div
            className="flex flex-wrap items-center justify-center gap-2.5"
            data-cy="copilot-workspace-starter-prompt-loading"
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton.Button
                key={i}
                active
                size="small"
                style={{ width: 140, height: 36, borderRadius: 8 }}
                data-cy={`copilot-workspace-starter-prompt-skeleton-${i}`}
              />
            ))}
          </div>
        ) : chips.length > 0 ? (
          promptRows.map((row, rowIndex) => (
            <div
              key={`prompt-row-${rowIndex}`}
              className="flex flex-wrap items-center justify-center gap-2.5"
              data-cy={`copilot-workspace-starter-prompt-row-${rowIndex}`}
            >
              {row.map((chip) => {
                const slug = chip.label.toLowerCase().replace(/\s+/g, '-');
                const active = isActive(chip.text) || isActive(chip.label);
                return (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => onPromptSelect(chip.text)}
                    className="rounded-lg border px-4 py-2.5 text-[13px] font-normal leading-snug transition-colors hover:brightness-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A48B1]/25 md:text-[14px]"
                    style={{
                      backgroundColor: active
                        ? '#EFF6FF'
                        : COPILOT_THEME.workspaceChipBg,
                      borderColor: active
                        ? COPILOT_THEME.workspaceAccentBlue
                        : COPILOT_THEME.workspaceChipBorder,
                      color: active
                        ? COPILOT_THEME.workspaceAccentBlue
                        : COPILOT_THEME.workspaceChipText,
                    }}
                    id={`copilot-workspace-starter-prompt-${slug}`}
                    data-cy={`copilot-workspace-starter-prompt-${slug}`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          ))
        ) : isError ? (
          <p
            className="text-sm text-slate-400"
            data-cy="copilot-workspace-prompts-error"
          >
            Could not load starter prompts. Try again later.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default CopilotWorkspaceEmptyState;
