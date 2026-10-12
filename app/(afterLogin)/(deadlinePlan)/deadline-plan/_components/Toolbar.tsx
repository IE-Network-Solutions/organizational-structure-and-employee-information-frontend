'use client';
import React from 'react';
import dayjs from 'dayjs';
import { Button, DatePicker, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DeadlineTaskStatusFilter } from '@/store/server/features/deadlinePlan/interface';
import {
  DeadlineDuration,
  DeadlineViewMode,
  useDeadlinePlanStore,
} from '@/store/uistate/features/deadlinePlan/useStore';
import AssigneePicker from './AssigneePicker';
import { PersonOption } from './useDeadlinePeople';
import { DATE_FORMAT, resolveDurationRange } from './utils';

const VIEW_OPTIONS: { label: string; value: DeadlineViewMode }[] = [
  { label: 'List', value: 'list' },
  { label: 'Grouped', value: 'grouped' },
];

const DURATION_OPTIONS: { label: string; value: DeadlineDuration }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'History', value: 'history' },
];

const STATUS_OPTIONS: { label: string; value: DeadlineTaskStatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Reported', value: 'reported' },
];

interface ToolbarProps {
  userId: string;
  people: PersonOption[];
  departmentOptions: { label: string; value: string }[];
  selectedAssigneeIds: string[];
  /** Changing the department also re-scopes the selected assignees. */
  onDepartmentChange: (department: string) => void;
}

export default function Toolbar({
  userId,
  people,
  departmentOptions,
  selectedAssigneeIds,
  onDepartmentChange,
}: ToolbarProps) {
  const {
    viewMode,
    duration,
    historyRange,
    department,
    status,
    setViewMode,
    setDuration,
    setHistoryRange,
    setStatus,
    setAssigneeIds,
    openTaskForm,
  } = useDeadlinePlanStore();

  const isHistory = duration === 'history';
  const range = resolveDurationRange(duration, dayjs(), historyRange);

  return (
    <div
      data-cy="deadline-plan-toolbar"
      className="flex w-full flex-wrap items-center justify-end gap-2"
    >
      <Select
        className="w-32"
        size="large"
        value={viewMode}
        options={VIEW_OPTIONS}
        onChange={setViewMode}
        aria-label="View mode"
        data-cy="deadline-plan-view-mode"
      />
      <Select
        className="w-36"
        size="large"
        value={duration}
        options={DURATION_OPTIONS}
        onChange={setDuration}
        aria-label="Duration"
        data-cy="deadline-plan-duration"
      />
      {isHistory ? (
        <DatePicker.RangePicker
          size="large"
          allowClear={false}
          value={[dayjs(range.from), dayjs(range.to)]}
          onChange={(value) => {
            const [from, to] = value ?? [];
            if (from && to) {
              setHistoryRange([
                from.format(DATE_FORMAT),
                to.format(DATE_FORMAT),
              ]);
            }
          }}
          aria-label="History range"
          data-cy="deadline-plan-history-range"
        />
      ) : null}
      <Select
        className="w-44"
        size="large"
        showSearch
        optionFilterProp="label"
        value={department}
        options={departmentOptions}
        onChange={onDepartmentChange}
        aria-label="Department"
        data-cy="deadline-plan-department"
      />
      <Select
        className="w-32"
        size="large"
        // History is the archive: it always lists reported and closed tasks.
        value={isHistory ? 'reported' : status}
        disabled={isHistory}
        options={STATUS_OPTIONS}
        onChange={setStatus}
        aria-label="Task status"
        data-cy="deadline-plan-status"
      />
      <AssigneePicker
        userId={userId}
        people={people}
        selectedIds={selectedAssigneeIds}
        onChange={setAssigneeIds}
      />
      <Button
        type="primary"
        size="large"
        icon={<PlusOutlined />}
        onClick={() => openTaskForm()}
        data-cy="deadline-plan-add-task"
      >
        Task
      </Button>
    </div>
  );
}
