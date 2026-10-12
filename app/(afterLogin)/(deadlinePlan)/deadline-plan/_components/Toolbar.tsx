'use client';
import React from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { Button, DatePicker, Popover, Select } from 'antd';
import { FilterOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { DeadlineTaskStatusFilter } from '@/store/server/features/deadlinePlan/interface';
import {
  DeadlineDuration,
  useDeadlinePlanStore,
} from '@/store/uistate/features/deadlinePlan/useStore';
import AssigneePicker from './AssigneePicker';
import ViewSwitcher from './ViewSwitcher';
import { PersonOption } from './useDeadlinePeople';
import { DATE_FORMAT, resolveDurationRange } from './utils';
import styles from './deadlinePlan.module.css';

const DURATION_OPTIONS: { label: string; value: DeadlineDuration }[] = [
  { label: 'Upcoming', value: 'upcoming' },
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
  onDepartmentChange: (department: string) => void;
  className?: string;
}

export default function Toolbar({
  userId,
  people,
  departmentOptions,
  selectedAssigneeIds,
  onDepartmentChange,
  className,
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
  const heading =
    DURATION_OPTIONS.find((option) => option.value === duration)?.label ??
    'Upcoming';
  const hasCustomFilters =
    duration !== 'upcoming' ||
    (viewMode === 'list' && (department !== 'all' || status !== 'active'));

  const scopeFields = (
    <>
      <div
        data-cy="deadline-plan-department-field"
        className="flex flex-col gap-1.5"
      >
        <span
          data-cy="deadline-plan-department-label"
          className="text-xs font-medium text-slate-500"
        >
          Department
        </span>
        <Select
          className="w-full"
          value={department}
          options={departmentOptions}
          onChange={onDepartmentChange}
          aria-label="Department"
          data-cy="deadline-plan-department"
        />
      </div>
      <div
        data-cy="deadline-plan-people-field"
        className="flex flex-col items-start gap-1.5"
      >
        <span
          data-cy="deadline-plan-people-label"
          className="text-xs font-medium text-slate-500"
        >
          Assignees
        </span>
        <AssigneePicker
          userId={userId}
          people={people}
          selectedIds={selectedAssigneeIds}
          onChange={setAssigneeIds}
        />
      </div>
      <Button
        type="text"
        size="small"
        className="self-start !text-okr-primary"
        onClick={() => onDepartmentChange('all')}
        data-cy="deadline-plan-direct-reports"
      >
        Me & direct reports
      </Button>
    </>
  );

  const peopleOptions = (
    <div
      data-cy="deadline-plan-people-options"
      className="flex w-[min(300px,calc(100vw-72px))] flex-col gap-4"
    >
      <div
        data-cy="deadline-plan-people-heading"
        className="text-sm font-semibold text-[#161A2C]"
      >
        Choose whose plans to review
      </div>
      {scopeFields}
    </div>
  );

  const filters = (
    <div
      data-cy="deadline-plan-filters"
      className="flex w-[min(300px,calc(100vw-72px))] flex-col gap-4"
    >
      <div
        data-cy="deadline-plan-filter-heading"
        className="border-b border-[#F1F2F6] pb-3 text-sm font-semibold text-[#161A2C]"
      >
        View options
      </div>
      <div
        data-cy="deadline-plan-duration-field"
        className="flex flex-col gap-1.5"
      >
        <span
          data-cy="deadline-plan-duration-label"
          className="text-xs font-medium text-slate-500"
        >
          Dates
        </span>
        <Select
          className="w-full"
          value={duration}
          options={DURATION_OPTIONS}
          onChange={setDuration}
          aria-label="Duration"
          data-cy="deadline-plan-duration"
        />
      </div>
      {isHistory ? (
        <DatePicker.RangePicker
          className="w-full"
          allowClear={false}
          value={[dayjs(range.from), dayjs(range.to)]}
          onChange={(value) => {
            const [from, to] = value ?? [];
            if (from && to)
              setHistoryRange([
                from.format(DATE_FORMAT),
                to.format(DATE_FORMAT),
              ]);
          }}
          aria-label="History range"
          data-cy="deadline-plan-history-range"
        />
      ) : null}
      {viewMode === 'list' ? (
        <>
          {scopeFields}
          <div
            data-cy="deadline-plan-status-field"
            className="flex flex-col gap-1.5"
          >
            <span
              data-cy="deadline-plan-status-label"
              className="text-xs font-medium text-slate-500"
            >
              Status
            </span>
            <Select
              className="w-full"
              value={isHistory ? 'reported' : status}
              disabled={isHistory}
              options={STATUS_OPTIONS}
              onChange={setStatus}
              aria-label="Task status"
              data-cy="deadline-plan-status"
            />
          </div>
        </>
      ) : null}
    </div>
  );

  return (
    <div
      data-cy="deadline-plan-toolbar"
      className={classNames(
        'flex min-w-0 flex-col gap-4 px-1 pb-2 pt-1 sm:px-4',
        className,
      )}
    >
      <div
        data-cy="deadline-plan-toolbar-heading-row"
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div data-cy="deadline-plan-list-heading" className="min-w-0">
          <h1
            data-cy="deadline-plan-list-title"
            className="text-2xl font-bold leading-tight text-[#161A2C]"
          >
            {heading}
          </h1>
          <p
            data-cy="deadline-plan-list-date"
            className="mt-1 text-xs text-slate-500"
          >
            {isHistory
              ? 'Reported and closed tasks'
              : dayjs().format('dddd, MMMM D')}
            {' · '}
            {selectedAssigneeIds.length}{' '}
            {selectedAssigneeIds.length === 1 ? 'person' : 'people'}
          </p>
        </div>
        <div
          data-cy="deadline-plan-toolbar-actions"
          className="flex items-center gap-2"
        >
          <Popover
            content={filters}
            trigger="click"
            placement="bottomRight"
            overlayClassName={styles.filterPopover}
          >
            <Button
              type="text"
              icon={<FilterOutlined />}
              className={
                hasCustomFilters
                  ? '!bg-blue-50 !text-okr-primary'
                  : '!text-slate-500'
              }
              aria-label="Filter and view options"
              data-cy="deadline-plan-filter-button"
            >
              Filters
            </Button>
          </Popover>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openTaskForm()}
            data-cy="deadline-plan-add-task"
          >
            Add task
          </Button>
        </div>
      </div>
      <div
        data-cy="deadline-plan-view-controls"
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <ViewSwitcher value={viewMode} onChange={setViewMode} />
        {viewMode === 'grouped' ? (
          <Popover
            content={peopleOptions}
            trigger="click"
            placement="bottomRight"
            overlayClassName={styles.filterPopover}
          >
            <Button
              type="text"
              icon={<TeamOutlined />}
              className="!text-slate-500"
              aria-label="Choose people and departments"
              data-cy="deadline-plan-people-button"
            >
              People
            </Button>
          </Popover>
        ) : null}
      </div>
    </div>
  );
}
