'use client';
import React from 'react';
import classNames from 'classnames';
import { CheckOutlined } from '@ant-design/icons';
import { DeadlineTask } from '@/store/server/features/deadlinePlan/interface';
import { isTaskDone, TaskActions } from './useTaskActions';

export default function TaskCompletion({
  task,
  parent,
  actions,
  onReport,
}: {
  task: DeadlineTask;
  parent?: DeadlineTask;
  actions: TaskActions;
  onReport?: () => void;
}) {
  const done = isTaskDone(task);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={`${done ? 'Mark as not done' : 'Mark as done'}: ${task.title}`}
      disabled={!actions.canToggle(task, parent) || actions.isToggling}
      onClick={() => actions.toggleDone(task, onReport, parent)}
      data-cy={`deadline-task-done-${task.id}`}
      className={classNames(
        'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-okr-primary disabled:cursor-default',
        done
          ? 'border-okr-primary bg-okr-primary text-white'
          : 'border-slate-300 bg-white text-transparent enabled:hover:border-okr-primary enabled:hover:bg-blue-50 enabled:hover:text-okr-primary disabled:border-slate-200',
      )}
    >
      <CheckOutlined />
    </button>
  );
}
