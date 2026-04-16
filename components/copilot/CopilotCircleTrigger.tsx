'use client';

import React from 'react';
import CopilotAiEditIcon from './CopilotAiEditIcon';

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

/** Matches Figma control: 40x40 circular button, subtle bottom shadow, dark 18px icon. */
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
      className={`relative z-20 box-border inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center p-0 pointer-events-auto transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 focus-visible:ring-offset-2 ${className}`}
      style={{
        borderRadius: '9999px',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#D9D9D9',
        boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.02)',
        color: 'rgba(0, 0, 0, 0.7)',
      }}
    >
      <CopilotAiEditIcon size={18} aria-hidden />
    </button>
  );
};

export default CopilotCircleTrigger;
