'use client';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { Button, Checkbox, DatePicker, Popover, Select } from 'antd';
import { FilterOutlined, PlusOutlined } from '@ant-design/icons';
import {
  DeadlineTaskSearchFilter,
  DeadlineTaskStatusFilter,
} from '@/store/server/features/deadlinePlan/interface';
import {
  DeadlineDuration,
  useDeadlinePlanStore,
} from '@/store/uistate/features/deadlinePlan/useStore';
import AssigneePicker from './AssigneePicker';
import ViewSwitcher from './ViewSwitcher';
import PlanLockActions from './PlanLockActions';
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
  directReportIds: string[];
  getDepartmentMemberIds: (department: string) => string[];
  filter: DeadlineTaskSearchFilter;
  selectedPlanIds?: string[];
  onPlanSelectionChange?: (ids: string[]) => void;
  className?: string;
}

export default function Toolbar({
  userId,
  people,
  departmentOptions,
  selectedAssigneeIds,
  directReportIds,
  getDepartmentMemberIds,
  filter,
  selectedPlanIds = [],
  onPlanSelectionChange,
  className,
}: ToolbarProps) {
  const {
    viewMode,
    duration,
    historyRange,
    department,
    status,
    assigneeIds,
    setViewMode,
    applyFilters,
    openTaskForm,
  } = useDeadlinePlanStore();
  const snapshot = () => ({
    duration,
    historyRange,
    department,
    status,
    assigneeIds,
  });
  const [draft, setDraft] = useState(snapshot);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const setPopover = (open: boolean) => {
    if (open) setDraft(snapshot());
    setFilterOpen(open);
  };
  const draftPeople =
    draft.department === 'all'
      ? people
      : people.filter((person) =>
          getDepartmentMemberIds(draft.department).includes(person.id),
        );
  const draftAssigneeIds = (
    draft.assigneeIds ?? [userId, ...directReportIds]
  ).filter((id) => draftPeople.some((person) => person.id === id));
  const isHistory = duration === 'history';
  const draftIsHistory = draft.duration === 'history';
  const range = resolveDurationRange(
    draft.duration,
    dayjs(),
    draft.historyRange,
  );
  const heading =
    DURATION_OPTIONS.find((option) => option.value === duration)?.label ??
    'Upcoming';
  const hasCustomFilters =
    duration !== 'upcoming' ||
    department !== 'all' ||
    status !== 'active' ||
    assigneeIds !== null;
  const manageablePlanIds = filter.assigneeIds.filter(
    (id) => id !== userId && directReportIds.includes(id),
  );
  const selectedCount = selectedPlanIds.filter((id) =>
    manageablePlanIds.includes(id),
  ).length;

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
          value={draft.department}
          options={departmentOptions}
          onChange={(nextDepartment) =>
            setDraft((current) => ({
              ...current,
              department: nextDepartment,
              assigneeIds:
                nextDepartment === 'all'
                  ? null
                  : people
                      .filter((person) =>
                        getDepartmentMemberIds(nextDepartment).includes(
                          person.id,
                        ),
                      )
                      .map((person) => person.id),
            }))
          }
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
          people={draftPeople}
          selectedIds={draftAssigneeIds}
          onChange={(ids) =>
            setDraft((current) => ({ ...current, assigneeIds: ids }))
          }
        />
      </div>
      <Button
        type="text"
        size="small"
        className="self-start !text-okr-primary"
        onClick={() =>
          setDraft((current) => ({
            ...current,
            department: 'all',
            assigneeIds: null,
          }))
        }
        data-cy="deadline-plan-direct-reports"
      >
        Me & direct reports
      </Button>
    </>
  );

  const filterActions = (
    <div
      className="flex justify-end gap-2 border-t border-[#F1F2F6] pt-3"
      data-cy="deadline-plan-filter-actions"
    >
      <Button
        onClick={() => setFilterOpen(false)}
        data-cy="deadline-plan-filter-cancel"
      >
        Cancel
      </Button>
      <Button
        type="primary"
        onClick={() => {
          applyFilters(draft);
          setFilterOpen(false);
        }}
        data-cy="deadline-plan-filter-apply"
      >
        Apply
      </Button>
    </div>
  );

  const filters = (
    <div
      data-cy="deadline-plan-filters"
      className="flex max-h-[70vh] w-[min(300px,calc(100vw-72px))] flex-col gap-4 overflow-y-auto"
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
          value={draft.duration}
          options={DURATION_OPTIONS}
          onChange={(nextDuration) =>
            setDraft((current) => ({ ...current, duration: nextDuration }))
          }
          aria-label="Duration"
          data-cy="deadline-plan-duration"
        />
      </div>
      {draftIsHistory ? (
        <DatePicker.RangePicker
          className="w-full"
          allowClear={false}
          value={[dayjs(range.from), dayjs(range.to)]}
          onChange={(value) => {
            const [from, to] = value ?? [];
            if (from && to)
              setDraft((current) => ({
                ...current,
                historyRange: [
                  from.format(DATE_FORMAT),
                  to.format(DATE_FORMAT),
                ],
              }));
          }}
          aria-label="History range"
          data-cy="deadline-plan-history-range"
        />
      ) : null}
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
          value={draftIsHistory ? 'reported' : draft.status}
          disabled={draftIsHistory}
          options={STATUS_OPTIONS}
          onChange={(nextStatus) =>
            setDraft((current) => ({ ...current, status: nextStatus }))
          }
          aria-label="Task status"
          data-cy="deadline-plan-status"
        />
      </div>
      {filterActions}
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
            open={isFilterOpen}
            onOpenChange={setPopover}
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
        <div
          className="flex flex-wrap items-center gap-3"
          data-cy="deadline-plan-management-actions"
        >
          {viewMode === 'grouped' &&
          onPlanSelectionChange &&
          manageablePlanIds.length > 0 &&
          filter.status !== 'reported' ? (
            <>
              <Checkbox
                checked={selectedCount === manageablePlanIds.length}
                indeterminate={
                  selectedCount > 0 && selectedCount < manageablePlanIds.length
                }
                onChange={(event) =>
                  onPlanSelectionChange(
                    event.target.checked ? manageablePlanIds : [],
                  )
                }
              >
                Select all plans
              </Checkbox>
              {selectedCount > 0 ? (
                <span
                  className="text-xs text-slate-500"
                  data-cy="deadline-plan-selected-count"
                >
                  {selectedCount} selected
                </span>
              ) : null}
            </>
          ) : null}
          <PlanLockActions
            filter={filter}
            userId={userId}
            directReportIds={directReportIds}
            selectedAssigneeIds={
              viewMode === 'grouped' ? selectedPlanIds : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
