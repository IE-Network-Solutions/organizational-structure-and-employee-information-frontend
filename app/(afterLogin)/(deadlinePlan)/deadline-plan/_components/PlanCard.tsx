'use client';
import React, { useCallback, useMemo } from 'react';
import { Button } from 'antd';
import { CheckOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { DeadlineTaskSearchFilter } from '@/store/server/features/deadlinePlan/interface';
import { useDeadlineTasks } from '@/store/server/features/deadlinePlan/queries';
import {
  useApproveDeadlineTasks,
  useLockDeadlineTasks,
} from '@/store/server/features/deadlinePlan/mutations';
import LoadMore from './LoadMore';
import TaskTable from './TaskTable';
import { PersonOption } from './useDeadlinePeople';
import { flattenTaskPages, resolveTaskPermissions, TaskViewer } from './utils';

interface PlanCardProps {
  assigneeId: string;
  filter: Omit<DeadlineTaskSearchFilter, 'assigneeIds'>;
  viewer: TaskViewer;
  getPerson: (id: string | null | undefined) => PersonOption | null;
}

/** One person's tasks for the current filters, with plan-level actions. */
export default function PlanCard({
  assigneeId,
  filter,
  viewer,
  getPerson,
}: PlanCardProps) {
  const searchFilter = useMemo(
    () => ({ ...filter, assigneeIds: [assigneeId] }),
    [filter, assigneeId],
  );
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useDeadlineTasks(searchFilter);
  const { mutate: lockTasks, isLoading: isLocking } = useLockDeadlineTasks();
  const { mutate: approveTasks, isLoading: isApproving } =
    useApproveDeadlineTasks();

  const tasks = useMemo(() => flattenTaskPages(data?.pages), [data]);
  const totalItems = data?.pages?.[0]?.meta?.totalItems ?? 0;
  const loadMore = useCallback(() => fetchNextPage(), [fetchNextPage]);

  const { lockableIds, unlockableIds, approvableIds } = useMemo(() => {
    const ids = {
      lockableIds: [] as string[],
      unlockableIds: [] as string[],
      approvableIds: [] as string[],
    };
    for (const task of tasks) {
      const permissions = resolveTaskPermissions(task, viewer);
      if (permissions.canLock) ids.lockableIds.push(task.id);
      if (permissions.canUnlock) ids.unlockableIds.push(task.id);
      if (permissions.canApprove && task.approvalStatus === 'pending') {
        ids.approvableIds.push(task.id);
      }
    }
    return ids;
  }, [tasks, viewer]);

  const isSelf = assigneeId === viewer.userId;
  const person = getPerson(assigneeId);
  const title = isSelf ? 'My Plan' : `${person?.name ?? 'Unknown user'}`;

  return (
    <section
      data-cy={`deadline-plan-card-${assigneeId}`}
      className="rounded-2xl border border-slate-100 bg-white p-4"
    >
      <div
        data-cy="deadline-plan-card-header"
        className="mb-3 flex flex-wrap items-center justify-between gap-2"
      >
        <div
          data-cy="deadline-plan-card-heading"
          className="flex min-w-0 items-baseline gap-2"
        >
          <h2
            data-cy="deadline-plan-card-title"
            className="truncate text-base font-bold text-slate-900"
          >
            {title}
          </h2>
          <span
            data-cy="deadline-plan-card-count"
            className="shrink-0 text-xs text-slate-500"
          >
            {isSelf ? '' : `${person?.departmentName ?? 'Plan'} · `}
            {totalItems} task{totalItems === 1 ? '' : 's'}
          </span>
        </div>
        <div
          data-cy="deadline-plan-card-actions"
          className="flex flex-wrap items-center gap-2"
        >
          {approvableIds.length > 0 ? (
            <Button
              size="small"
              icon={<CheckOutlined />}
              loading={isApproving}
              onClick={() => approveTasks(approvableIds)}
              data-cy="deadline-plan-card-approve-all"
            >
              Approve reported ({approvableIds.length})
            </Button>
          ) : null}
          {lockableIds.length > 0 ? (
            <Button
              size="small"
              icon={<LockOutlined />}
              loading={isLocking}
              onClick={() =>
                lockTasks({ taskIds: lockableIds, isLocked: true })
              }
              data-cy="deadline-plan-card-lock-all"
            >
              Lock all tasks
            </Button>
          ) : unlockableIds.length > 0 ? (
            <Button
              size="small"
              icon={<UnlockOutlined />}
              loading={isLocking}
              onClick={() =>
                lockTasks({ taskIds: unlockableIds, isLocked: false })
              }
              data-cy="deadline-plan-card-unlock-all"
            >
              Unlock all tasks
            </Button>
          ) : null}
        </div>
      </div>

      <TaskTable
        tasks={tasks}
        mode="grouped"
        viewer={viewer}
        getPerson={getPerson}
        loading={isLoading}
        emptyText={
          isSelf
            ? 'You have no tasks for these filters.'
            : 'No tasks for these filters.'
        }
      />
      <LoadMore
        hasMore={!!hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={loadMore}
      />
    </section>
  );
}
