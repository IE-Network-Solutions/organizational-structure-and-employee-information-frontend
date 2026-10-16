'use client';
import React from 'react';
import { Button } from 'antd';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { DeadlineTask } from '@/store/server/features/deadlinePlan/interface';
import type { TaskActions } from './useTaskActions';

export default function TaskLockButton({
  task,
  actions,
}: {
  task: DeadlineTask;
  actions: TaskActions;
}) {
  const permissions = actions.permissionsOf(task);
  if (!permissions.canLock && !permissions.canUnlock) return null;
  const label = permissions.canUnlock ? 'Unlock task' : 'Lock task';
  return (
    <Button
      type="text"
      icon={permissions.canUnlock ? <UnlockOutlined /> : <LockOutlined />}
      onClick={() => actions.setLock(task, !task.isLocked)}
      loading={actions.isLocking}
      className="!text-slate-500"
      aria-label={label}
      data-cy="deadline-detail-lock-action"
    >
      {label}
    </Button>
  );
}
