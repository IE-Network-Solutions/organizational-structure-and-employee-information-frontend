'use client';

import React from 'react';
import CopilotCircleTrigger from './CopilotCircleTrigger';

export interface CopilotReportsPanelToggleProps {
  expanded: boolean;
  onToggle: () => void;
  id?: string;
  className?: string;
}

/**
 * Circular control to show/hide Saved & Available reports beside the chat column.
 */
const CopilotReportsPanelToggle: React.FC<CopilotReportsPanelToggleProps> = ({
  expanded,
  onToggle,
  id = 'copilot-reports-panel-toggle',
  className = '',
}) => {
  const label = expanded
    ? 'Hide saved and available reports'
    : 'Show saved and available reports';

  return (
    <CopilotCircleTrigger
      id={id}
      data-cy={id}
      onClick={onToggle}
      isActive={expanded}
      aria-expanded={expanded}
      aria-label={label}
      title={label}
      className={className}
    />
  );
};

export default CopilotReportsPanelToggle;

'use client';

import React from 'react';
import CopilotCircleTrigger from './CopilotCircleTrigger';

export interface CopilotReportsPanelToggleProps {
  expanded: boolean;
  onToggle: () => void;
  id?: string;
  className?: string;
}

/**
 * Circular control to show/hide Saved & Available reports beside the chat column.
 */
const CopilotReportsPanelToggle: React.FC<CopilotReportsPanelToggleProps> = ({
  expanded,
  onToggle,
  id = 'copilot-reports-panel-toggle',
  className = '',
}) => {
  const label = expanded
    ? 'Hide saved and available reports'
    : 'Show saved and available reports';

  return (
    <CopilotCircleTrigger
      id={id}
      data-cy={id}
      onClick={onToggle}
      isActive={expanded}
      aria-expanded={expanded}
      aria-label={label}
      title={label}
      className={className}
    />
  );
};

export default CopilotReportsPanelToggle;
