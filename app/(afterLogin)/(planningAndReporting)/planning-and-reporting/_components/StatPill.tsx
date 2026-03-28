import React from 'react';

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

/** Light gray neutrals + soft green highlights; no heavy borders (Figma-style). */
const variantStyles: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  milestone: { bg: '#F3F4F6', text: '#374151', label: '#6B7280' },
  metric: { bg: '#F3F4F6', text: '#374151', label: '#6B7280' },
  target: { bg: '#F3F4F6', text: '#374151', label: '#6B7280' },
  achieved: { bg: '#DCFCE7', text: '#166534', label: '#15803D' },
  progress: { bg: '#DCFCE7', text: '#166534', label: '#15803D' },
  default: { bg: '#F3F4F6', text: '#374151', label: '#6B7280' },
};

export default function StatPill({
  label,
  value,
  variant = 'default',
}: StatPillProps) {
  const styles = variantStyles[variant] || variantStyles.default;
  const labelDisplay = label === 'krProgress' ? 'Key Result Progress' : label;

  return (
    <span
      data-cy="-planningandreporting-planning-and-reporting-components-statpill-tsx-statpill-span-35"
      className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold shadow-none"
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
      }}
    >
      <span
        className="font-medium"
        style={{ color: styles.label }}
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
