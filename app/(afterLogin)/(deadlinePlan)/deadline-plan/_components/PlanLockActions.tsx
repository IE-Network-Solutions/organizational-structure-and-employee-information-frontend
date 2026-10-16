'use client';
import React from 'react';
import { Button, Tooltip } from 'antd';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { DeadlineTaskSearchFilter } from '@/store/server/features/deadlinePlan/interface';
import { useLockDeadlinePlans } from '@/store/server/features/deadlinePlan/mutations';
import { useDeadlinePlanLockState } from '@/store/server/features/deadlinePlan/queries';

export default function PlanLockActions({
  filter,
  userId,
  directReportIds,
  selectedAssigneeIds,
}: {
  filter: DeadlineTaskSearchFilter;
  userId: string;
  directReportIds: string[];
  selectedAssigneeIds?: string[];
}) {
  const { mutate, isLoading } = useLockDeadlinePlans();
  const availableIds = filter.assigneeIds.filter(
    (id) => id !== userId && directReportIds.includes(id),
  );
  const managedIds =
    selectedAssigneeIds === undefined
      ? availableIds
      : availableIds.filter((id) => selectedAssigneeIds.includes(id));
  const managedFilter = { ...filter, assigneeIds: managedIds };
  const {
    data: lockState,
    isFetching,
    isError,
  } = useDeadlinePlanLockState(managedFilter);
  if (!availableIds.length) return null;
  const reported = filter.status === 'reported';
  const isLocked = lockState === 'locked';
  const label = isLocked ? 'Unlock plans' : 'Lock plans';
  const disabled =
    reported ||
    !managedIds.length ||
    isLoading ||
    isFetching ||
    isError ||
    !lockState ||
    lockState === 'empty';
  const changeLock = () => {
    if (disabled) return;
    mutate({ filter: managedFilter, isLocked: !isLocked });
  };

  return (
    <div
      className="flex items-center gap-1"
      data-cy="deadline-plan-lock-actions"
    >
      <Tooltip
        title={
          reported
            ? 'Choose Active or All to manage plan locks.'
            : !managedIds.length
              ? 'Select one or more direct reports’ plans.'
              : isError
                ? 'Could not load plan locks.'
                : lockState === 'empty'
                  ? 'No active tasks in the selected plans.'
                  : `${isLocked ? 'Unlock' : 'Lock'} the active tasks in the selected plans.`
        }
      >
        <span data-cy="deadline-plan-plan-lock-actions-span-69">
          <Button
            type="text"
            icon={isLocked ? <UnlockOutlined /> : <LockOutlined />}
            className={isLocked ? '!text-slate-500' : '!text-okr-primary'}
            onClick={changeLock}
            disabled={disabled}
            loading={isLoading || isFetching}
            data-cy={
              isLocked
                ? 'deadline-plan-unlock-plans'
                : 'deadline-plan-lock-plans'
            }
          >
            {label}
          </Button>
        </span>
      </Tooltip>
    </div>
  );
}
