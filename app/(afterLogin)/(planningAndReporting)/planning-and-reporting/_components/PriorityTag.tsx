import React from 'react';
import { Tag } from 'antd';
import { Priority } from './types';

interface PriorityTagProps {
  priority: Priority;
}

const priorityPalette: Record<Priority, { bg: string; text: string }> = {
  Low: { bg: '#DCFCE7', text: '#166534' },
  Medium: { bg: '#FEF9C3', text: '#854D0E' },
  High: { bg: '#FEE2E2', text: '#991B1B' },
  Priority: { bg: '#E0E7FF', text: '#3730A3' },
};

export default function PriorityTag({ priority }: PriorityTagProps) {
  // Fallback to 'Low' if priority is undefined or not in the palette
  const safePriority = priority && priorityPalette[priority] ? priority : 'Low';
  const colors = priorityPalette[safePriority];

  return (
    <Tag
      className="rounded-[4px] border-none px-3 py-1 text-xs font-medium"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {priority || 'Low'}
    </Tag>
  );
}
