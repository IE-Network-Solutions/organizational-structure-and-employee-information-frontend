import React from 'react';

interface StatPillProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'metric' | 'milestone' | 'target' | 'achieved' | 'progress';
}

const variantStyles: Record<string, { bg: string; text: string }> = {
  metric: { bg: '#DEDEFA', text: '#574CFF' },
  milestone: { bg: '#DEDEFA', text: '#574CFF' },
  target: { bg: '#DEDEFA', text: '#574CFF' },
  achieved: { bg: '#DEDEFA', text: '#574CFF' },
  progress: { bg: '#D1FAE5', text: '#059669' },
  default: { bg: '#F4F5FB', text: '#5A5C80' },
};

// Text color for labels (always gray)
const labelTextColor = '#8F94A3';

export default function StatPill({ label, value, variant = 'default' }: StatPillProps) {
  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <span className="inline-flex items-center gap-1.5">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: labelTextColor }}>
          •{label}
        </span>
      )}
      <span
        className="inline-flex items-center rounded-[6px] px-3 py-1 text-xs font-semibold"
        style={{
          backgroundColor: styles.bg,
          color: styles.text,
        }}
      >
        {value}
      </span>
    </span>
  );
}

