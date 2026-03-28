import React from 'react';
import { Priority } from './types';

interface PriorityTagProps {
  priority: Priority;
}

const priorityPalette: Record<Priority, { bg: string; text: string }> = {
  Low: { bg: '#DCFCE7', text: '#166534' },
  Medium: { bg: '#FFEDD5', text: '#C2410C' },
  High: { bg: '#FEE2E2', text: '#991B1B' },
  Priority: { bg: '#EEF2FF', text: '#4338CA' },
};

export default function PriorityTag({ priority }: PriorityTagProps) {
  const safePriority = priority && priorityPalette[priority] ? priority : 'Low';
  const colors = priorityPalette[safePriority];

  return (
    <span
      data-cy="planning-reporting-priority-tag"
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold md:px-3 md:py-1 md:text-xs"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      Priority: {priority || 'Low'}
    </span>
  );
}
