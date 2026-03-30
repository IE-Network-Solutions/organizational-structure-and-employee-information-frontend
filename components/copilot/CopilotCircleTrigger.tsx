'use client';

import React from 'react';
import CopilotAiEditIcon, { COPILOT_FLOAT_INDIGO } from './CopilotAiEditIcon';
import { COPILOT_THEME } from './copilotTheme';

export interface CopilotCircleTriggerProps {
  onClick: () => void;
  isActive?: boolean;
  'aria-label'?: string;
  'aria-expanded'?: boolean;
  title?: string;
  id?: string;
  'data-cy'?: string;
  className?: string;
}

/** Matches Copilot float: white, 1px blue border, ~6px radius, blue pencil + sparkle icon. */
const CopilotCircleTrigger: React.FC<CopilotCircleTriggerProps> = ({
  onClick,
  isActive = false,
  'aria-label': ariaLabel = 'Open SelamNew Copilot',
  'aria-expanded': ariaExpanded,
  title: titleProp,
  id = 'copilot-circle-trigger',
  'data-cy': dataCy = 'copilot-circle-trigger',
  className = '',
}) => {
  const title =
    titleProp ??
    (isActive ? 'Close SelamNew Copilot' : 'Open SelamNew Copilot');

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-current={isActive ? 'page' : undefined}
      data-cy={dataCy}
      className={`box-border inline-flex h-11 w-11 shrink-0 items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35 focus-visible:ring-offset-2 ${className}`}
      style={{
        borderRadius: COPILOT_THEME.floatFabRadius,
        backgroundColor: COPILOT_THEME.floatFabBg,
        borderWidth: COPILOT_THEME.floatFabBorderWidth,
        borderStyle: 'solid',
        borderColor: COPILOT_THEME.floatFabBorder,
        boxShadow: isActive
          ? '0 2px 10px rgba(0, 0, 0, 0.1)'
          : COPILOT_THEME.floatFabShadow,
        color: COPILOT_FLOAT_INDIGO,
      }}
    >
      <CopilotAiEditIcon size={22} aria-hidden />
    </button>
  );
};

export default CopilotCircleTrigger;
