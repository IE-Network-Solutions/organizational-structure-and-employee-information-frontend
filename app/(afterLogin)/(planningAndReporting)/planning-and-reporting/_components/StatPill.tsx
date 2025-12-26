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
    <span className="inline-flex items-center gap-3">
      {label && (
        <span className="text-xs font-normal flex items-center" style={{ color: labelTextColor }}>
          <span style={{ color: styles.text }}>•</span>
          <span className="ml-0.5">{label}</span>
        </span>
      )}
      <span
        className="inline-flex items-center rounded-[6px] px-3 py-1 text-xs font-normal"
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

