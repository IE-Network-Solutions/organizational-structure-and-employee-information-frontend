import React from 'react';
import {
  PR_BORDER,
  PR_METRIC_PILL_BG,
  PR_METRIC_PILL_LABEL,
  PR_METRIC_PILL_VALUE,
  PR_PROGRESS_BORDER,
  PR_SURFACE,
  PR_TEXT,
} from './planningUiTokens';

interface StatPillProps {
  /** Left caption, e.g. "Metric" */
  label: string;
  value: string | number;
  variant?:
    | 'default'
    | 'metric'
    | 'milestone'
    | 'target'
    | 'achieved'
    | 'progress';
}

export default function StatPill({
  label,
  value,
  variant = 'default',
}: StatPillProps) {
  const labelDisplay = label;

  if (variant === 'achieved' || variant === 'progress') {
    return (
      <span
        data-cy="-planningandreporting-planning-and-reporting-components-statpill-tsx-statpill-span-35"
        className="inline-flex items-center rounded-md border px-3 py-1 text-xs font-semibold shadow-none"
        style={{
          backgroundColor: PR_METRIC_PILL_BG,
          borderColor: PR_BORDER,
          color: PR_METRIC_PILL_VALUE,
        }}
      >
        <span
          className="font-medium"
          style={{ color: PR_METRIC_PILL_LABEL }}
          data-cy="planningandreporting-planning-and-reporting-components-statpill-tsx-span-40"
        >
          {labelDisplay}
          {': '}
        </span>
        <span
          className="ml-0.5 font-bold"
          data-cy="planningandreporting-planning-and-reporting-components-statpill-tsx-span-58"
        >
          {value}
        </span>
      </span>
    );
  }

  return (
    <span
      data-cy="-planningandreporting-planning-and-reporting-components-statpill-tsx-statpill-span-35"
      className="inline-flex items-center rounded-md border px-3 py-1 text-xs font-semibold shadow-none"
      style={{
        backgroundColor: PR_SURFACE,
        borderColor: PR_BORDER,
        color: PR_TEXT,
      }}
    >
      <span
        className="font-medium text-[#6B7280]"
        data-cy="planningandreporting-planning-and-reporting-components-statpill-tsx-span-40"
      >
        {labelDisplay}
        {': '}
      </span>
      <span
        className="ml-0.5 font-bold"
        data-cy="planningandreporting-planning-and-reporting-components-statpill-tsx-span-58"
      >
        {value}
      </span>
    </span>
  );
}
