'use client';
import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { Button, Checkbox, Dropdown, Modal, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { LinkOutlined, LockOutlined, MoreOutlined } from '@ant-design/icons';
import { DeadlineTask } from '@/store/server/features/deadlinePlan/interface';
import {
  useApproveDeadlineTasks,
  useDeleteDeadlineTask,
  useLockDeadlineTasks,
  useReportDeadlineTasks,
  useUnreportDeadlineTasks,
} from '@/store/server/features/deadlinePlan/mutations';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
import { PriorityLabel, ToneBadge, ToneText, UserCell } from './TaskBadges';
import {
  deadlineLabel,
  resolveApproval,
  resolveMetricKind,
  resolveTaskPermissions,
  resolveTaskStatus,
  TaskViewer,
} from './utils';
import { PersonOption } from './useDeadlinePeople';

type TaskRow = DeadlineTask & { children?: TaskRow[]; parent?: DeadlineTask };

interface TaskTableProps {
  tasks: DeadlineTask[];
  /** Grouped adds the done checkbox and the Approval column. */
  mode: 'list' | 'grouped';
  viewer: TaskViewer;
  getPerson: (id: string | null | undefined) => PersonOption | null;
  loading?: boolean;
  emptyText?: React.ReactNode;
}

const isDone = (task: DeadlineTask) =>
  task.status === 'reported' && task.outcome === 'done';

export default function TaskTable({
  tasks,
  mode,
  viewer,
  getPerson,
  loading,
  emptyText,
}: TaskTableProps) {
  const openTaskForm = useDeadlinePlanStore((state) => state.openTaskForm);
  const setReportingTask = useDeadlinePlanStore(
    (state) => state.setReportingTask,
  );
  const { mutate: reportTasks, isLoading: isReporting } =
    useReportDeadlineTasks();
  const { mutate: unreportTasks, isLoading: isUndoing } =
    useUnreportDeadlineTasks();
  const { mutate: lockTasks } = useLockDeadlineTasks();
  const { mutate: approveTasks } = useApproveDeadlineTasks();
  const { mutate: deleteTask } = useDeleteDeadlineTask();

  const today = useMemo(() => dayjs(), []);
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);

  const rows = useMemo<TaskRow[]>(
    () =>
      tasks.map((task) => ({
        ...task,
        children: task.subTasks?.length
          ? task.subTasks.map((subTask) => ({ ...subTask, parent: task }))
          : undefined,
      })),
    [tasks],
  );

  /** Subtasks follow their parent task's permissions. */
  const permissionsOf = (row: TaskRow) =>
    resolveTaskPermissions(row.parent ?? row, viewer);

  const toggleDone = (row: TaskRow, checked: boolean) => {
    if (!checked) {
      unreportTasks([row.id]);
      return;
    }
    // A numeric key result needs the achieved value before it can be reported.
    if (!row.parentTaskId && resolveMetricKind(row.keyResult) === 'numeric') {
      setReportingTask(row);
      return;
    }
    reportTasks([{ taskId: row.id, outcome: 'done' }]);
  };

  const confirmDelete = (row: TaskRow) => {
    Modal.confirm({
      title: row.parentTaskId ? 'Delete this subtask?' : 'Delete this task?',
      content: row.children?.length
        ? 'Its subtasks will be deleted as well.'
        : undefined,
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => deleteTask(row.id),
    });
  };

  const menuItemsOf = (row: TaskRow): MenuProps['items'] => {
    const permissions = permissionsOf(row);

    // Subtasks are edited through their parent task's form.
    if (row.parentTaskId) {
      return permissions.canEdit
        ? [
            {
              key: 'delete',
              label: 'Delete subtask',
              danger: true,
              onClick: () => confirmDelete(row),
            },
          ]
        : [];
    }

    const items: NonNullable<MenuProps['items']> = [];
    if (permissions.canEdit) {
      items.push({
        key: 'edit',
        label: 'Edit',
        onClick: () => openTaskForm({ task: row }),
      });
    }
    if (permissions.canReport) {
      items.push({
        key: 'report',
        label: 'Report…',
        onClick: () => setReportingTask(row),
      });
    }
    if (permissions.canUndoReport) {
      items.push({
        key: 'undo',
        label: row.approvalStatus === 'closed' ? 'Reopen' : 'Undo report',
        onClick: () => unreportTasks([row.id]),
      });
    }
    if (permissions.canApprove) {
      items.push({
        key: 'approve',
        label: row.status === 'reported' ? 'Approve and close' : 'Close task',
        onClick: () => approveTasks([row.id]),
      });
    }
    if (permissions.canLock) {
      items.push({
        key: 'lock',
        label: 'Lock',
        onClick: () => lockTasks({ taskIds: [row.id], isLocked: true }),
      });
    }
    if (permissions.canUnlock) {
      items.push({
        key: 'unlock',
        label: 'Unlock',
        onClick: () => lockTasks({ taskIds: [row.id], isLocked: false }),
      });
    }
    if (permissions.canEdit) {
      items.push({ type: 'divider' });
      items.push({
        key: 'delete',
        label: 'Delete',
        danger: true,
        onClick: () => confirmDelete(row),
      });
    }
    return items;
  };

  const columns: ColumnsType<TaskRow> = [
    {
      title: 'Task',
      key: 'task',
      render: (unused, row) => {
        const permissions = permissionsOf(row);
        const done = isDone(row);
        // A subtask is not approved on its own, so it can be unchecked for as
        // long as its parent task is still open.
        const canToggle =
          done && !row.parentTaskId
            ? permissions.canUndoReport
            : permissions.canReport;
        const linked = [row.keyResult?.title, row.milestone?.title]
          .filter(Boolean)
          .join(' · ');

        return (
          <div
            data-cy={`deadline-task-cell-${row.id}`}
            className="inline-flex min-w-[220px] max-w-[420px] items-start gap-2 align-top"
          >
            {mode === 'grouped' ? (
              <Checkbox
                className="mt-0.5"
                checked={done}
                disabled={!canToggle || isReporting || isUndoing}
                onChange={(event) => toggleDone(row, event.target.checked)}
                aria-label={done ? 'Mark as not done' : 'Mark as done'}
                data-cy={`deadline-task-done-${row.id}`}
              />
            ) : (
              <span
                data-cy="deadline-task-kind-icon"
                className={classNames(
                  'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded',
                  row.keyResultId
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-slate-100 text-slate-400',
                )}
                title={row.keyResultId ? 'Linked to a key result' : undefined}
              >
                {row.keyResultId ? <LinkOutlined /> : null}
              </span>
            )}
            <span
              data-cy="deadline-task-title-wrap"
              className="flex min-w-0 flex-col"
            >
              <span
                data-cy="deadline-task-title"
                className={classNames(
                  'break-words text-sm',
                  row.parentTaskId
                    ? 'text-slate-600'
                    : 'font-medium text-slate-800',
                  done && 'text-slate-400 line-through',
                )}
              >
                {row.title}
              </span>
              {linked ? (
                <span
                  data-cy="deadline-task-key-result"
                  className="truncate text-xs text-slate-500"
                  title={linked}
                >
                  {mode === 'grouped' ? (
                    <LinkOutlined className="mr-1" />
                  ) : null}
                  {linked}
                </span>
              ) : null}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Assignee',
      key: 'assignee',
      width: 200,
      render: (unused, row) =>
        row.parentTaskId ? null : (
          <UserCell
            name={getPerson(row.assigneeId)?.name ?? null}
            isSelf={row.assigneeId === viewer.userId}
          />
        ),
    },
    {
      title: 'Assigned by',
      key: 'assignedBy',
      width: 190,
      render: (unused, row) =>
        row.parentTaskId ? null : (
          <UserCell
            name={getPerson(row.assignedById)?.name ?? null}
            isSelf={row.assignedById === viewer.userId}
          />
        ),
    },
    {
      title: 'Priority',
      key: 'priority',
      width: 100,
      render: (unused, row) =>
        row.parentTaskId ? null : <PriorityLabel priority={row.priority} />,
    },
    {
      title: 'Start',
      key: 'startDate',
      width: 120,
      render: (unused, row) => (
        <span
          data-cy="deadline-task-start"
          className="whitespace-nowrap text-sm text-slate-900"
        >
          {row.startDate}
        </span>
      ),
    },
    {
      title: 'Deadline',
      key: 'deadline',
      width: 150,
      render: (unused, row) => {
        const label = deadlineLabel(row, today);
        return (
          <Tooltip title={row.deadline}>
            <span data-cy="deadline-task-deadline">
              <ToneText text={label.text} tone={label.tone} />
            </span>
          </Tooltip>
        );
      },
    },
    ...(mode === 'grouped'
      ? ([
          {
            title: 'Approval',
            key: 'approval',
            width: 110,
            render: (unused, row) => {
              const approval = row.parentTaskId ? null : resolveApproval(row);
              return approval ? (
                <ToneBadge label={approval.label} tone={approval.tone} />
              ) : (
                <span
                  data-cy="deadline-task-approval-empty"
                  className="text-slate-400"
                >
                  —
                </span>
              );
            },
          },
        ] as ColumnsType<TaskRow>)
      : []),
    {
      title: 'Status',
      key: 'status',
      width: 130,
      render: (unused, row) => {
        const status = resolveTaskStatus(row);
        return (
          <span
            data-cy="deadline-task-status"
            className="inline-flex items-center gap-1.5"
          >
            <ToneBadge label={status.label} tone={status.tone} />
            {row.isLocked && status.label !== 'Locked' ? (
              <Tooltip title="Locked">
                <LockOutlined className="text-slate-400" />
              </Tooltip>
            ) : null}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 48,
      align: 'right',
      render: (unused, row) => {
        const items = menuItemsOf(row);
        if (!items?.length) return null;
        return (
          <Dropdown
            menu={{ items }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              aria-label="Task actions"
              data-cy={`deadline-task-actions-${row.id}`}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Table<TaskRow>
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={rows}
      loading={loading}
      pagination={false}
      scroll={{ x: 'max-content' }}
      expandable={{
        // Subtasks start expanded; only what the user collapses is tracked.
        expandedRowKeys: rows
          .filter((row) => row.children && !collapsedIds.includes(row.id))
          .map((row) => row.id),
        onExpand: (expanded, row) =>
          setCollapsedIds((ids) =>
            expanded ? ids.filter((id) => id !== row.id) : [...ids, row.id],
          ),
      }}
      locale={{ emptyText }}
      data-cy="deadline-task-table"
    />
  );
}
