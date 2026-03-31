import React from 'react';
import {
  PR_METRIC_TAG_BG_GREEN,
  PR_METRIC_TAG_BG_NEUTRAL,
  PR_METRIC_TAG_BORDER,
  PR_METRIC_TAG_BORDER_GREEN,
  PR_METRIC_TAG_TEXT,
  PR_METRIC_TAG_TEXT_GREEN,
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

/** Figma Frame 1000004213 — Tag / Basic & Tag / Colorful (22px row, 1px 8px padding, 4px radius) */
export default function StatPill({
  label,
  value,
  variant = 'default',
}: StatPillProps) {
  const labelDisplay = label;
  const green = variant === 'achieved' || variant === 'progress';

  const baseClass =
    'inline-flex h-[22px] shrink-0 items-center gap-1 rounded-[4px] border border-solid px-2 py-px text-xs font-normal leading-5 shadow-none';

  if (green) {
    return (
      <span
        data-cy="-planningandreporting-planning-and-reporting-components-statpill-tsx-statpill-span-35"
        className={baseClass}
        style={{
          backgroundColor: PR_METRIC_TAG_BG_GREEN,
          borderColor: PR_METRIC_TAG_BORDER_GREEN,
          color: PR_METRIC_TAG_TEXT_GREEN,
        }}
      >
        <span
          className="font-normal"
          data-cy="planningandreporting-planning-and-reporting-components-statpill-tsx-span-40"
        >
          {labelDisplay}
          {': '}
        </span>
        <span
          className="font-normal"
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
      className={baseClass}
      style={{
        backgroundColor: PR_METRIC_TAG_BG_NEUTRAL,
        borderColor: PR_METRIC_TAG_BORDER,
        color: PR_METRIC_TAG_TEXT,
      }}
    >
      <span
        className="font-normal"
        data-cy="planningandreporting-planning-and-reporting-components-statpill-tsx-span-40"
      >
        {labelDisplay}
        {': '}
      </span>
      <span
        className="font-normal"
        data-cy="planningandreporting-planning-and-reporting-components-statpill-tsx-span-58"
      >
        {value}
      </span>
    </span>
  );
}
