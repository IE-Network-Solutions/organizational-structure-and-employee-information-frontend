'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { Avatar, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useUserPlanRepositoryMock } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import type { MockPlanTask } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { isDeadlinePlanningMockEnabled } from '@/utils/deadlinePlanningMocks';
import SubtasksModal from '../cards/SubtasksModal';
import TaskDetailModal from './TaskDetailModal';
import type { PlanSummary } from '../types';
import {
  teamTaskMatchesDurationFilter,
  type TeamTaskRow,
} from './delegatedTaskUtils';
import { planFilterValueToKind } from './durationFilter';
import TeamTaskTitleCell from './TeamTaskTitleCell';
import { useAssigneeChipRoster } from './useAssigneeChipRoster';
import { useEffectivePlanUserIds } from './usePlanningData';
import { useTeamAssignedTasks } from './useTeamAssignedTasks';
import {
  PLANNING_TASK_TABLE_CLASS,
  usePlanningTaskTableScrollY,
} from './planningTaskTableLayout';
import {
  PLANNING_INFINITE_PAGE_SIZE,
  useInfiniteLoadMore,
} from './useInfiniteLoadMore';
import {
  useAutoFillScrollContainer,
  useScrollNearBottom,
} from './useScrollNearBottom';

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

type SubtasksModalState = {
  parent: MockPlanTask;
  ownerUserId: string;
  allActiveTasks: MockPlanTask[];
  canAdd: boolean;
};

type TaskDetailModalState = {
  task: MockPlanTask | null;
  fallbackTitle: string;
  fallbackDescription: string;
  ownerUserId: string;
  allActiveTasks: MockPlanTask[];
  canAddSubtasks: boolean;
};

export default function TeamTasksView({ planSummaries }: TeamTasksViewProps) {
  const { tasks } = useTeamAssignedTasks(planSummaries);
  const { roster } = useAssigneeChipRoster();
  const effectiveUserIds = useEffectivePlanUserIds();
  const mockEnabled = isDeadlinePlanningMockEnabled();
  const viewerUserId = String(useAuthenticationStore((s) => s.userId) ?? '');
  const mockPlansByUserId = useUserPlanRepositoryMock((s) => s.plansByUserId);
  const [subtasksModal, setSubtasksModal] = useState<SubtasksModalState | null>(
    null,
  );
  const [taskDetailModal, setTaskDetailModal] =
    useState<TaskDetailModalState | null>(null);
  const tableShellRef = useRef<HTMLDivElement>(null);
  const tableScrollY = usePlanningTaskTableScrollY(tableShellRef);
  const {
    planningDurationFilter,
    planningHistoryRange,
    planningTaskStatusFilter,
  } = PlanningAndReportingStore();

  const durationKind = planFilterValueToKind(planningDurationFilter || 'daily');

  const resolveMockTaskContext = useCallback(
    (row: TeamTaskRow) => {
      if (!mockEnabled) return null;
      const plan = mockPlansByUserId[row.assigneeUserId];
      if (!plan) return null;
      const task = [...plan.activeTasks, ...(plan.archivedTasks ?? [])].find(
        (item) => item.id === row.id,
      );
      if (!task) return null;
      return { task, allActiveTasks: plan.activeTasks };
    },
    [mockEnabled, mockPlansByUserId],
  );

  const chipByUserId = useMemo(() => {
    const map = new Map<string, (typeof roster)[number]>();
    for (const chip of roster) {
      map.set(chip.userId, chip);
    }
    return map;
  }, [roster]);

  const filteredTasks = useMemo(() => {
    let scoped = tasks.filter((task) =>
      teamTaskMatchesDurationFilter(
        task,
        planningDurationFilter || 'daily',
        planningHistoryRange,
      ),
    );

    if (effectiveUserIds.length > 0) {
      const allowed = new Set(effectiveUserIds.map(String));
      scoped = scoped.filter((task) =>
        allowed.has(String(task.assigneeUserId)),
      );
    }

    return scoped;
  }, [tasks, effectiveUserIds, planningDurationFilter, planningHistoryRange]);

  const {
    visibleItems: visibleTasks,
    hasMore: hasMoreTasks,
    loadMore: loadMoreTasks,
    visibleCount: visibleTaskCount,
  } = useInfiniteLoadMore(filteredTasks, PLANNING_INFINITE_PAGE_SIZE, [
    planningDurationFilter,
    planningHistoryRange,
    planningTaskStatusFilter,
    effectiveUserIds.join(','),
  ]);

  const listScrollReady = hasMoreTasks && Boolean(tableScrollY);

  useScrollNearBottom(
    tableShellRef,
    '.ant-table-body',
    loadMoreTasks,
    listScrollReady,
  );

  useAutoFillScrollContainer(
    tableShellRef,
    '.ant-table-body',
    loadMoreTasks,
    listScrollReady,
    visibleTaskCount,
  );

  const resolveCanAddSubtasks = useCallback(
    (ownerUserId: string) => {
      const plan = mockPlansByUserId[ownerUserId];
      if (!plan || !mockEnabled) return false;
      const isTeammatePlan = Boolean(
        ownerUserId && viewerUserId && ownerUserId !== viewerUserId,
      );
      const planReported = plan.activeTasks.every((t) => t.isReported);
      return !isTeammatePlan && !planReported;
    },
    [mockEnabled, mockPlansByUserId, viewerUserId],
  );

  const handleOpenSubtasks = useCallback(
    (parent: MockPlanTask, ownerUserId: string) => {
      const plan = mockPlansByUserId[ownerUserId];
      if (!plan) return;

      setSubtasksModal({
        parent,
        ownerUserId,
        allActiveTasks: plan.activeTasks,
        canAdd: resolveCanAddSubtasks(ownerUserId),
      });
    },
    [mockPlansByUserId, resolveCanAddSubtasks],
  );

  const handleOpenTaskDetail = useCallback(
    (row: TeamTaskRow) => {
      const mockContext = resolveMockTaskContext(row);
      const plan = mockPlansByUserId[row.assigneeUserId];
      setTaskDetailModal({
        task: mockContext?.task ?? null,
        fallbackTitle: row.title,
        fallbackDescription: mockContext?.task?.description?.trim() ?? '',
        ownerUserId: row.assigneeUserId,
        allActiveTasks: mockContext?.allActiveTasks ?? plan?.activeTasks ?? [],
        canAddSubtasks: resolveCanAddSubtasks(row.assigneeUserId),
      });
    },
    [mockPlansByUserId, resolveCanAddSubtasks, resolveMockTaskContext],
  );

  const renderPersonCell = (
    userIdKey: string,
    name: string,
    rowId: string,
    prefix: string,
  ) => {
    const chip = chipByUserId.get(userIdKey);
    const displayName = chip?.label ?? name;
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
          {!chip?.avatar ? (chip?.initials ?? displayName.slice(0, 2)) : null}
        </Avatar>
        <span
          className="truncate text-gray-700"
          data-cy={`team-tasks-${prefix}-name-${rowId}`}
        >
          {displayName}
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
        render: (unusedTitle: string, row) => {
          void unusedTitle;
          const mockContext = resolveMockTaskContext(row);
          return (
            <TeamTaskTitleCell
              row={row}
              mockTask={mockContext?.task ?? null}
              allActiveTasks={mockContext?.allActiveTasks ?? []}
              durationKind={durationKind}
              onOpenSubtasks={(parent) =>
                handleOpenSubtasks(parent, row.assigneeUserId)
              }
              onOpenTaskDetail={() => handleOpenTaskDetail(row)}
            />
          );
        },
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
    ],
    [
      handleOpenTaskDetail,
      handleOpenSubtasks,
      resolveMockTaskContext,
      mockEnabled,
      chipByUserId,
      durationKind,
    ],
  );

  return (
    <div
      className="flex h-full min-h-0 w-full min-w-0 flex-col"
      data-cy="team-tasks-view"
    >
      <div
        ref={tableShellRef}
        className={classNames(
          'flex min-h-0 flex-1 flex-col bg-white rounded-lg border border-[#E5E7EB] shadow-none p-3',
          PLANNING_TASK_TABLE_CLASS,
        )}
        data-cy="team-tasks-table-panel"
      >
        <Table<TeamTaskRow>
          rowKey="id"
          columns={columns}
          dataSource={visibleTasks}
          pagination={false}
          locale={{
            emptyText: (
              <div
                className="py-8 text-center text-sm text-gray-500"
                data-cy="team-tasks-empty"
              >
                {tasks.length === 0
                  ? 'No tasks yet. Use Add task to create or delegate work.'
                  : 'No tasks match the current filters.'}
              </div>
            ),
          }}
          scroll={tableScrollY ? { y: tableScrollY } : undefined}
          tableLayout="fixed"
          data-cy="team-tasks-table"
        />
      </div>
      <TaskDetailModal
        open={!!taskDetailModal}
        task={taskDetailModal?.task ?? null}
        fallbackTitle={taskDetailModal?.fallbackTitle ?? ''}
        fallbackDescription={taskDetailModal?.fallbackDescription ?? ''}
        ownerUserId={taskDetailModal?.ownerUserId ?? ''}
        allActiveTasks={taskDetailModal?.allActiveTasks ?? []}
        durationKind={durationKind}
        canAddSubtasks={taskDetailModal?.canAddSubtasks ?? false}
        onClose={() => setTaskDetailModal(null)}
        onOpenSubtasks={(parent) => {
          const ownerUserId = taskDetailModal?.ownerUserId ?? '';
          if (!ownerUserId) return;
          handleOpenSubtasks(parent, ownerUserId);
        }}
      />
      <SubtasksModal
        open={!!subtasksModal}
        parent={subtasksModal?.parent ?? null}
        ownerUserId={subtasksModal?.ownerUserId ?? ''}
        allActiveTasks={subtasksModal?.allActiveTasks ?? []}
        canAdd={subtasksModal?.canAdd ?? false}
        onClose={() => setSubtasksModal(null)}
      />
    </div>
  );
}
