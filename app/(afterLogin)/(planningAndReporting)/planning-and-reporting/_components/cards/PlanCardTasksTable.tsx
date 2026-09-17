'use client';

import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Avatar, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import type { MockPlanTask } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import type { PlanSummary } from '../types';
import SubtasksModal from './SubtasksModal';
import TaskDetailModal from '../planning/TaskDetailModal';
import {
  formatPlanCardPriorityLabel,
  isPlanCardTaskMarkedReported,
  planTaskToTableRow,
  taskDescriptionFromRaw,
  type PlanCardTaskTableRow,
} from '../planning/planCardTaskTableUtils';
import TeamTaskTitleCell from '../planning/TeamTaskTitleCell';
import { useAssigneeChipRoster } from '../planning/useAssigneeChipRoster';
import { isDeadlinePlanningMockEnabled } from '@/utils/deadlinePlanningMocks';
import {
  PLANNING_TASK_TABLE_CLASS,
  planCardTaskTableScrollY,
} from '../planning/planningTaskTableLayout';
import {
  buildHierarchicalTaskRows,
  type HierarchicalTaskRow,
} from '../planning/collapsibleTaskRows';

const INDICATOR_TAG_CLASS: Record<
  PlanCardTaskTableRow['approvalTone'],
  string
> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
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

export type PlanCardTasksTableProps = {
  tasks: Record<string, unknown>[];
  plan: PlanSummary;
  durationKind: DeadlineKind;
  resolveUserName: (userId: string) => string;
  mockTasksById?: Map<string, MockPlanTask>;
  allActiveTasks?: MockPlanTask[];
  canAddSubtasks?: boolean;
  isTeammatePlan?: boolean;
  hideInteractiveMarkers?: boolean;
  viewerUserId?: string;
  emptyText?: string;
  showCheckboxColumn?: boolean;
  showActionsColumn?: boolean;
  renderCheckboxCell?: (task: Record<string, unknown>) => React.ReactNode;
  renderActionsCell?: (task: Record<string, unknown>) => React.ReactNode;
  tableHeaderExtra?: React.ReactNode;
  'data-cy'?: string;
};

export default function PlanCardTasksTable({
  tasks,
  plan,
  durationKind,
  resolveUserName,
  mockTasksById,
  allActiveTasks = [],
  canAddSubtasks = false,
  isTeammatePlan = false,
  hideInteractiveMarkers = false,
  viewerUserId,
  emptyText = 'No tasks',
  showCheckboxColumn = false,
  showActionsColumn = false,
  renderCheckboxCell,
  renderActionsCell,
  tableHeaderExtra,
  'data-cy': dataCy,
}: PlanCardTasksTableProps) {
  const mockEnabled = isDeadlinePlanningMockEnabled();
  const { roster } = useAssigneeChipRoster();
  const [subtasksModal, setSubtasksModal] = useState<SubtasksModalState | null>(
    null,
  );
  const [taskDetailModal, setTaskDetailModal] =
    useState<TaskDetailModalState | null>(null);

  const chipByUserId = useMemo(() => {
    const map = new Map<string, (typeof roster)[number]>();
    for (const chip of roster) {
      map.set(chip.userId, chip);
    }
    return map;
  }, [roster]);

  const rows = useMemo(
    () =>
      tasks.map((task) =>
        planTaskToTableRow(
          task,
          plan,
          resolveUserName,
          mockTasksById?.get(String(task.id)) ?? null,
          viewerUserId,
        ),
      ),
    [tasks, plan, resolveUserName, mockTasksById, viewerUserId],
  );

  const hierarchicalRows = useMemo(
    () => buildHierarchicalTaskRows(rows, durationKind),
    [rows, durationKind],
  );

  const handleOpenSubtasks = useCallback(
    (parent: MockPlanTask) => {
      const ownerUserId = String(plan.ownerUserId ?? '');
      if (!ownerUserId) return;
      setSubtasksModal({
        parent,
        ownerUserId,
        allActiveTasks,
        canAdd: canAddSubtasks && !isTeammatePlan && !hideInteractiveMarkers,
      });
    },
    [
      plan.ownerUserId,
      allActiveTasks,
      canAddSubtasks,
      isTeammatePlan,
      hideInteractiveMarkers,
    ],
  );

  const handleOpenTaskDetail = useCallback(
    (row: PlanCardTaskTableRow) => {
      const ownerUserId = String(plan.ownerUserId ?? '');
      if (!ownerUserId) return;
      setTaskDetailModal({
        task: row.mockTask,
        fallbackTitle: row.title,
        fallbackDescription: taskDescriptionFromRaw(row.rawTask),
        ownerUserId,
        allActiveTasks,
        canAddSubtasks:
          canAddSubtasks && !isTeammatePlan && !hideInteractiveMarkers,
      });
    },
    [
      plan.ownerUserId,
      allActiveTasks,
      canAddSubtasks,
      isTeammatePlan,
      hideInteractiveMarkers,
    ],
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
        data-cy={`plan-card-tasks-${prefix}-${rowId}`}
      >
        <Avatar
          size={24}
          src={chip?.avatar}
          className="shrink-0"
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
          data-cy={`plan-card-task-person-name-${userIdKey}`}
        >
          {displayName}
        </span>
      </span>
    );
  };

  const columns: ColumnsType<PlanCardTaskTableRow> = useMemo(() => {
    const cols: ColumnsType<PlanCardTaskTableRow> = [];

    if (showCheckboxColumn && renderCheckboxCell) {
      cols.push({
        title: '',
        key: 'checkbox',
        width: 40,
        render: (unusedValue, row) => {
          void unusedValue;
          return renderCheckboxCell(row.rawTask);
        },
      });
    }

    cols.push(
      {
        title: 'Task',
        dataIndex: 'title',
        key: 'title',
        ellipsis: true,
        render: (unusedTitle: string, row) => {
          void unusedTitle;
          return (
            <TeamTaskTitleCell
              row={row}
              mockTask={row.mockTask}
              allActiveTasks={allActiveTasks}
              durationKind={durationKind}
              onOpenSubtasks={handleOpenSubtasks}
              onOpenTaskDetail={() => handleOpenTaskDetail(row)}
              markedReported={
                isPlanCardTaskMarkedReported(row.rawTask) ||
                Boolean(row.mockTask?.done)
              }
              treeDepth={row.treeDepth ?? 0}
            />
          );
        },
      },
      {
        title: 'Assignee',
        dataIndex: 'assigneeName',
        key: 'assigneeName',
        width: 140,
        render: (name: string, row) =>
          renderPersonCell(row.assigneeUserId, name, row.id, 'assignee'),
      },
      {
        title: 'Assigned by',
        dataIndex: 'assignedByName',
        key: 'assignedByName',
        width: 140,
        render: (name: string, row) =>
          row.assignedByUserId === row.assigneeUserId ? (
            <span
              className="text-gray-400"
              data-cy={`plan-card-task-no-assigner-${row.id}`}
            >
              —
            </span>
          ) : (
            renderPersonCell(row.assignedByUserId, name, row.id, 'assigner')
          ),
      },
      {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
        width: 96,
        render: (priority: string) => (
          <span
            className="text-gray-600"
            data-cy="plan-card-task-priority-label"
          >
            {formatPlanCardPriorityLabel(priority)}
          </span>
        ),
      },
      {
        title: 'Start',
        dataIndex: 'startDate',
        key: 'startDate',
        width: 100,
        render: (start: string | null) => start ?? '—',
      },
      {
        title: 'Deadline',
        dataIndex: 'deadline',
        key: 'deadline',
        width: 112,
        render: (deadline: string | null, row) => (
          <span
            className={classNames(
              'font-medium',
              row.overdue ? 'text-red-500' : 'text-gray-700',
            )}
            data-cy={`plan-card-task-deadline-${row.id}`}
          >
            {deadline ?? '—'}
          </span>
        ),
      },
      {
        title: 'Approval',
        dataIndex: 'approvalLabel',
        key: 'approvalLabel',
        width: 96,
        render: (unusedLabel: string, row) => {
          void unusedLabel;
          return (
            <Tag
              bordered
              className={classNames(
                'm-0 rounded-md border text-xs font-medium',
                INDICATOR_TAG_CLASS[row.approvalTone],
              )}
              data-cy={`plan-card-task-approval-${row.id}`}
            >
              {row.approvalLabel}
            </Tag>
          );
        },
      },
      {
        title: 'Status',
        dataIndex: 'taskStatusLabel',
        key: 'taskStatusLabel',
        width: 112,
        render: (unusedLabel: string, row) => {
          void unusedLabel;
          return (
            <Tag
              bordered
              className={classNames(
                'm-0 rounded-md border text-xs font-medium',
                INDICATOR_TAG_CLASS[row.taskStatusTone],
              )}
              data-cy={`plan-card-task-status-${row.id}`}
            >
              {row.taskStatusLabel}
            </Tag>
          );
        },
      },
    );

    if (showActionsColumn && renderActionsCell) {
      cols.push({
        title: '',
        key: 'actions',
        width: 88,
        align: 'right',
        render: (unusedValue, row) => {
          void unusedValue;
          return renderActionsCell(row.rawTask);
        },
      });
    }

    return cols;
  }, [
    showCheckboxColumn,
    showActionsColumn,
    renderCheckboxCell,
    renderActionsCell,
    allActiveTasks,
    durationKind,
    handleOpenSubtasks,
    handleOpenTaskDetail,
    chipByUserId,
  ]);

  const tableScrollY = planCardTaskTableScrollY(hierarchicalRows.length);

  if (hierarchicalRows.length === 0) {
    return (
      <p
        className="py-6 text-center text-sm text-gray-500"
        data-cy={`${dataCy}-empty`}
      >
        {emptyText}
      </p>
    );
  }

  return (
    <>
      <div className={PLANNING_TASK_TABLE_CLASS} data-cy={dataCy}>
        {tableHeaderExtra ? (
          <div
            className="mb-2 flex items-center justify-end"
            data-cy={`${dataCy}-header-extra`}
          >
            {tableHeaderExtra}
          </div>
        ) : null}
        <Table<HierarchicalTaskRow<PlanCardTaskTableRow>>
          rowKey="id"
          columns={columns}
          dataSource={hierarchicalRows}
          pagination={false}
          scroll={tableScrollY ? { y: tableScrollY } : undefined}
          tableLayout="fixed"
          size="middle"
          defaultExpandAllRows={durationKind !== 'daily'}
          data-cy={`${dataCy}-table`}
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
        onOpenSubtasks={
          mockEnabled
            ? (parent) => {
                handleOpenSubtasks(parent);
              }
            : undefined
        }
      />
      {mockEnabled ? (
        <SubtasksModal
          open={!!subtasksModal}
          parent={subtasksModal?.parent ?? null}
          ownerUserId={subtasksModal?.ownerUserId ?? ''}
          allActiveTasks={subtasksModal?.allActiveTasks ?? []}
          canAdd={subtasksModal?.canAdd ?? false}
          onClose={() => setSubtasksModal(null)}
        />
      ) : null}
    </>
  );
}
