'use client';

import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { Avatar, Segmented, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import CustomButton from '@/components/common/buttons/customButton';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import type { PlanSummary } from '../types';
import { mergeMeWithPickerSelection } from './assigneeChipRoster';
import {
  teamTaskMatchesDurationFilter,
  type TeamTaskRow,
} from './delegatedTaskUtils';
import { useAssigneeChipRoster } from './useAssigneeChipRoster';
import { useTeamAssignedTasks } from './useTeamAssignedTasks';

const STATUS_TAG_CLASS: Record<TeamTaskRow['statusTone'], string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
};

function formatPriorityLabel(priority: string): string {
  const key = priority.toLowerCase();
  if (key === 'priority') return 'Urgent';
  if (key === 'high') return 'High';
  if (key === 'medium') return 'Medium';
  if (key === 'low') return 'Low';
  return priority;
}

type TeamTasksViewProps = {
  planSummaries: PlanSummary[];
};

export default function TeamTasksView({ planSummaries }: TeamTasksViewProps) {
  const { userId } = useAuthenticationStore();
  const { tasks } = useTeamAssignedTasks(planSummaries);
  const { roster, selectedIds } = useAssigneeChipRoster();
  const {
    setActiveTab,
    setSelectedUser,
    setPage,
    setPlanningFilterPlanType,
    setPlanningFilterEmployee,
    openCreatePlansModal,
    planningDurationFilter,
    planningHistoryRange,
    teamTasksAssignedByFilter,
    setTeamTasksAssignedByFilter,
  } = PlanningAndReportingStore();

  const chipByUserId = useMemo(() => {
    const map = new Map<string, (typeof roster)[number]>();
    for (const chip of roster) {
      map.set(chip.userId, chip);
    }
    return map;
  }, [roster]);

  const filteredTasks = useMemo(() => {
    const currentUserId = String(userId ?? '');
    let scoped = tasks;

    if (teamTasksAssignedByFilter === 'me') {
      scoped = scoped.filter((task) => task.assignedByMe);
    }

    scoped = scoped.filter((task) =>
      teamTaskMatchesDurationFilter(
        task,
        planningDurationFilter || 'daily',
        planningHistoryRange,
      ),
    );

    const otherSelected = selectedIds.filter(
      (id) => String(id) !== currentUserId,
    );
    if (otherSelected.length === 0) return scoped;
    const allowed = new Set(otherSelected.map(String));
    return scoped.filter((task) => allowed.has(String(task.assigneeUserId)));
  }, [
    tasks,
    selectedIds,
    userId,
    planningDurationFilter,
    planningHistoryRange,
    teamTasksAssignedByFilter,
  ]);

  const handleViewOnPlan = useCallback(
    (task: TeamTaskRow) => {
      setPlanningFilterPlanType('all');
      setPlanningFilterEmployee('all');
      setSelectedUser(
        mergeMeWithPickerSelection(
          true,
          [task.assigneeUserId],
          task.assigneeUserId,
        ),
      );
      setPage(1);
      setActiveTab(1);
      requestAnimationFrame(() => {
        document
          .querySelector(`[data-cy="plan-card-wrap-${task.planId}"]`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    },
    [
      setActiveTab,
      setSelectedUser,
      setPage,
      setPlanningFilterPlanType,
      setPlanningFilterEmployee,
    ],
  );

  const renderPersonCell = (
    userIdKey: string,
    name: string,
    rowId: string,
    prefix: string,
  ) => {
    const chip = chipByUserId.get(userIdKey);
    return (
      <span
        className="inline-flex min-w-0 items-center gap-2"
        data-cy={`team-tasks-${prefix}-${rowId}`}
      >
        <Avatar
          size={24}
          src={chip?.avatar}
          className="shrink-0"
          data-cy={`team-tasks-${prefix}-avatar-${rowId}`}
          style={
            chip?.avatar
              ? undefined
              : {
                  backgroundColor: '#F3F4F6',
                  color: '#6B7280',
                  fontSize: 10,
                  fontWeight: 600,
                }
          }
        >
          {!chip?.avatar ? (chip?.initials ?? name.slice(0, 2)) : null}
        </Avatar>
        <span
          className="truncate text-gray-700"
          data-cy={`team-tasks-${prefix}-name-${rowId}`}
        >
          {name}
        </span>
      </span>
    );
  };

  const columns: ColumnsType<TeamTaskRow> = useMemo(
    () => [
      {
        title: 'Task',
        dataIndex: 'title',
        key: 'title',
        ellipsis: true,
        render: (title: string, row) => (
          <span
            className="font-medium text-gray-900"
            data-cy={`team-tasks-title-${row.id}`}
          >
            {title}
          </span>
        ),
      },
      {
        title: 'Assignee',
        dataIndex: 'assigneeName',
        key: 'assigneeName',
        width: 160,
        render: (name: string, row) =>
          renderPersonCell(row.assigneeUserId, name, row.id, 'assignee'),
      },
      {
        title: 'Assigned by',
        dataIndex: 'assignedByName',
        key: 'assignedByName',
        width: 160,
        render: (name: string, row) =>
          renderPersonCell(row.assignedByUserId, name, row.id, 'assigner'),
      },
      {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
        width: 100,
        render: (priority: string, row) => (
          <span
            className="text-gray-600"
            data-cy={`team-tasks-priority-${row.id}`}
          >
            {formatPriorityLabel(priority)}
          </span>
        ),
      },
      {
        title: 'Start',
        dataIndex: 'startDate',
        key: 'startDate',
        width: 110,
        render: (start: string | null, row) => (
          <span data-cy={`team-tasks-start-${row.id}`}>{start ?? '—'}</span>
        ),
      },
      {
        title: 'Deadline',
        dataIndex: 'deadline',
        key: 'deadline',
        width: 120,
        render: (deadline: string | null, row) => (
          <span
            className={classNames(
              'font-medium',
              row.overdue ? 'text-red-500' : 'text-gray-700',
            )}
            data-cy={`team-tasks-deadline-${row.id}`}
          >
            {deadline ?? '—'}
          </span>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'statusLabel',
        key: 'statusLabel',
        width: 120,
        render: (label: string, row) => (
          <Tag
            bordered
            className={classNames(
              'm-0 rounded-md border text-xs font-medium',
              STATUS_TAG_CLASS[row.statusTone],
            )}
            data-cy={`team-tasks-status-${row.id}`}
          >
            {label}
          </Tag>
        ),
      },
      {
        title: '',
        key: 'actions',
        width: 100,
        align: 'right',
        render: (unusedColumnValue, row) => (
          <button
            type="button"
            onClick={() => handleViewOnPlan(row)}
            className="text-sm font-medium text-[#1E40AF] hover:text-[#1E3A8A]"
            data-cy={`team-tasks-view-plan-${row.id}`}
          >
            View plan
          </button>
        ),
      },
    ],
    [handleViewOnPlan, chipByUserId],
  );

  return (
    <div
      className="flex min-h-0 w-full min-w-0 flex-col gap-4"
      data-cy="team-tasks-view"
    >
      <div
        className="flex flex-wrap items-start justify-between gap-3"
        data-cy="team-tasks-view-header"
      >
        <div data-cy="team-tasks-view-header-copy">
          <h2
            className="text-2xl font-bold text-gray-900"
            data-cy="team-tasks-view-title"
          >
            Team tasks
          </h2>
          <p
            className="mt-1 text-sm text-gray-500"
            data-cy="team-tasks-view-subtitle"
          >
            Assigned tasks across your team, including who assigned them.
          </p>
        </div>
        <CustomButton
          title="Assign task"
          onClick={() => openCreatePlansModal({ delegateOnly: true })}
          data-cy="team-tasks-add-task"
        />
      </div>

      <div
        className="flex flex-wrap items-center gap-2"
        data-cy="team-tasks-assigned-by-filter"
      >
        <Segmented
          value={teamTasksAssignedByFilter}
          onChange={(value) =>
            setTeamTasksAssignedByFilter(value as 'all' | 'me')
          }
          options={[
            { label: 'All assignments', value: 'all' },
            { label: 'Assigned by me', value: 'me' },
          ]}
          data-cy="team-tasks-assigned-by-segmented"
        />
      </div>

      <div
        className="bg-white rounded-lg border border-[#E5E7EB] shadow-none p-3"
        data-cy="team-tasks-table-panel"
      >
        <Table<TeamTaskRow>
          rowKey="id"
          columns={columns}
          dataSource={filteredTasks}
          pagination={filteredTasks.length > 10 ? { pageSize: 10 } : false}
          locale={{
            emptyText: (
              <div
                className="py-8 text-center text-sm text-gray-500"
                data-cy="team-tasks-empty"
              >
                {tasks.length === 0
                  ? 'No team assignments yet. Use Assign task to delegate work.'
                  : 'No team tasks match the current filters.'}
              </div>
            ),
          }}
          scroll={{ x: 920 }}
          data-cy="team-tasks-table"
        />
      </div>
    </div>
  );
}
