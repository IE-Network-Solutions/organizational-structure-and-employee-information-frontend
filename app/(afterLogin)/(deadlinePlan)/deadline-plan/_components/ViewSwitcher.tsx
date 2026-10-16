'use client';
import React from 'react';
import { Segmented } from 'antd';
import { TeamOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { DeadlineViewMode } from '@/store/uistate/features/deadlinePlan/useStore';

export default function ViewSwitcher({
  value,
  onChange,
}: {
  value: DeadlineViewMode;
  onChange: (value: DeadlineViewMode) => void;
}) {
  return (
    <Segmented<DeadlineViewMode>
      value={value}
      onChange={onChange}
      aria-label="Task view"
      data-cy="deadline-plan-view-mode"
      className="!bg-slate-50 [&_.ant-segmented-item-label]:!px-3 [&_.ant-segmented-item-selected]:!text-okr-primary"
      options={[
        {
          value: 'list',
          label: (
            <span
              data-cy="deadline-plan-list-option"
              className="inline-flex items-center gap-2 text-sm"
            >
              <UnorderedListOutlined aria-hidden /> Tasks
            </span>
          ),
        },
        {
          value: 'grouped',
          label: (
            <span
              data-cy="deadline-plan-grouped-option"
              className="inline-flex items-center gap-2 text-sm"
            >
              <TeamOutlined aria-hidden /> Grouped view
            </span>
          ),
        },
      ]}
    />
  );
}
