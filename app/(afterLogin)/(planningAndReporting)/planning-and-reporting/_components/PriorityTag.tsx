import React from 'react';
import { Priority } from './types';

interface PriorityTagProps {
  priority: Priority;
}

/** Light fill + matching border (reporting / planning mock). */
const priorityPalette: Record<
  Priority,
  { bg: string; text: string; border: string }
> = {
  Low: { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
  Medium: { bg: '#FFEDD5', text: '#C2410C', border: '#FDBA74' },
  High: { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' },
  Priority: { bg: '#E8EDFF', text: '#2D5BFF', border: '#A5B4FC' },
};

export default function PriorityTag({ priority }: PriorityTagProps) {
  const safePriority: Priority =
    priority && priorityPalette[priority] ? priority : 'Low';
  const colors = priorityPalette[safePriority];
  const level = priority || 'Low';
  const displayText =
    safePriority === 'Priority' ? level : `Priority: ${level}`;

  return (
    <span
      data-cy="planning-reporting-priority-tag"
      className="inline-flex items-center rounded border px-2.5 py-0.5 text-[10px] font-bold md:px-3 md:py-1 md:text-xs"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
    >
      {displayText}
    </span>
  );
}
