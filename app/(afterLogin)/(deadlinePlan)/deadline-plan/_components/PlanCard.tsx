'use client';
import React, { useCallback, useMemo } from 'react';
import { Button, Tooltip } from 'antd';
import {
  CheckOutlined,
  LockOutlined,
  PlusOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { DeadlineTaskSearchFilter } from '@/store/server/features/deadlinePlan/interface';
import { useDeadlineTasks } from '@/store/server/features/deadlinePlan/queries';
import { useLockDeadlineTasks } from '@/store/server/features/deadlinePlan/mutations';
import LoadMore from './LoadMore';
import TaskList from './TaskList';
import { PersonOption } from './useDeadlinePeople';
import { UserAvatar } from './TaskBadges';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
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
  const openTaskForm = useDeadlinePlanStore((state) => state.openTaskForm);
  const setApprovalRequest = useDeadlinePlanStore(
    (state) => state.setApprovalRequest,
  );
  const searchFilter = useMemo(
    () => ({ ...filter, assigneeIds: [assigneeId] }),
    [filter, assigneeId],
  );
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useDeadlineTasks(searchFilter);
  const { mutate: lockTasks, isLoading: isLocking } = useLockDeadlineTasks();

  const tasks = useMemo(() => flattenTaskPages(data?.pages), [data]);
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
  const subtitle = isSelf
    ? person?.name
    : [
        viewer.subordinateIds.includes(assigneeId) ? 'Direct report' : null,
        person?.departmentName,
      ]
        .filter(Boolean)
        .join(' · ');

  return (
    <section
      data-cy={`deadline-plan-card-${assigneeId}`}
      aria-label={title}
      className="min-w-0 bg-white px-1 sm:px-4"
    >
      <div
        data-cy="deadline-plan-card-header"
        className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50/80 px-4 py-3"
      >
        <div
          data-cy="deadline-plan-card-heading"
          className="flex min-w-0 flex-1 basis-[180px] items-center gap-3"
        >
          <UserAvatar name={person?.name ?? 'Unknown user'} size="lg" />
          <div data-cy="deadline-plan-card-person" className="min-w-0">
            <h2
              data-cy="deadline-plan-card-title"
              className="truncate text-base font-semibold text-[#161A2C]"
            >
              {title}
            </h2>
            {subtitle ? (
              <p
                data-cy="deadline-plan-card-person-context"
                className="mt-0.5 truncate text-xs text-slate-500"
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <div
          data-cy="deadline-plan-card-actions"
          className="flex max-w-full flex-wrap items-center gap-1"
        >
          {approvableIds.length > 0 ? (
            <Tooltip title="Approve the reported tasks in this list.">
              <Button
                type="text"
                className="!bg-blue-50 !text-okr-primary"
                size="small"
                icon={<CheckOutlined aria-hidden />}
                onClick={() =>
                  setApprovalRequest({
                    taskIds: approvableIds,
                    title: `${title}'s reported tasks`,
                  })
                }
                data-cy="deadline-plan-card-approve-all"
              >
                Approve reported
              </Button>
            </Tooltip>
          ) : null}
          {lockableIds.length > 0 ? (
            <Button
              type="text"
              className="!text-slate-500"
              size="small"
              icon={<LockOutlined aria-hidden />}
              loading={isLocking}
              onClick={() =>
                lockTasks({ taskIds: lockableIds, isLocked: true })
              }
              data-cy="deadline-plan-card-lock-all"
            >
              Lock tasks
            </Button>
          ) : unlockableIds.length > 0 ? (
            <Button
              type="text"
              className="!text-slate-500"
              size="small"
              icon={<UnlockOutlined aria-hidden />}
              loading={isLocking}
              onClick={() =>
                lockTasks({ taskIds: unlockableIds, isLocked: false })
              }
              data-cy="deadline-plan-card-unlock-all"
            >
              Unlock tasks
            </Button>
          ) : null}
          <Button
            type="text"
            size="small"
            className="!text-okr-primary"
            icon={<PlusOutlined aria-hidden />}
            onClick={() => openTaskForm({ assigneeId })}
            data-cy="deadline-plan-card-add-task"
          >
            Add task
          </Button>
        </div>
      </div>

      <TaskList
        tasks={tasks}
        viewer={viewer}
        getPerson={getPerson}
        loading={isLoading}
        showAddTask={false}
        emptyText={
          isSelf
            ? 'You have no tasks for the selected dates.'
            : 'No tasks for the selected dates.'
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
