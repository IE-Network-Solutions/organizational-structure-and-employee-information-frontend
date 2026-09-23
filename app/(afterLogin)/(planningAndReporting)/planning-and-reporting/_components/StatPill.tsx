import React from 'react';

interface StatPillProps {
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

const variantStyles: Record<string, { bg: string; text: string }> = {
  metric: { bg: '#DEDEFA', text: '#3636F0' },
  milestone: { bg: '#DEDEFA', text: '#3636F0' },
  target: { bg: '#DEDEFA', text: '#3636F0' },
  achieved: { bg: '#DEDEFA', text: '#3636F0' },
  progress: { bg: '#D1FAE5', text: '#059669' },
  default: { bg: '#F4F5FB', text: '#5A5C80' },
};

const labelTextColor = '#7C82A7';

export default function StatPill({
  label,
  value,
  variant = 'default',
}: StatPillProps) {
  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <span
      data-cy="-planningandreporting-planning-and-reporting-components-statpill-tsx-statpill-span-35"
      className="inline-flex items-center gap-3"
    >
      {label && (
        <span
          className="text-[13px] font-normal flex items-center"
          style={{ color: labelTextColor }}
          data-cy="planningandreporting-planning-and-reporting-components-statpill-tsx-span-40"
        >
          <span
            data-cy="-planningandreporting-planning-and-reporting-components-statpill-tsx-statpill-span-41"
            style={{ color: styles.text }}
          >
            •
          </span>
          <span
            data-cy="-planningandreporting-planning-and-reporting-components-statpill-tsx-statpill-span-42"
            className="ml-0.5"
          >
            {label}
          </span>
        </span>
      )}
      <span
        className="inline-flex items-center rounded-[6px] px-3 py-1.5 text-[13px] font-bold"
        style={{
          backgroundColor: styles.bg,
          color: styles.text,
        }}
        data-cy="planningandreporting-planning-and-reporting-components-statpill-tsx-span-58"
      >
        {value}
      </span>
    </span>
  );
}
