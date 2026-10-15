'use client';
import React from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import {
  CalendarOutlined,
  AimOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { DeadlineTask } from '@/store/server/features/deadlinePlan/interface';
import TaskCompletion from './TaskCompletion';
import { UserAvatar } from './TaskBadges';
import { PersonOption } from './useDeadlinePeople';
import { isTaskDone, TaskActions } from './useTaskActions';
import { isTaskFinished } from './utils';
import { taskCardMetric } from './taskDateGroups';

interface TaskCardProps {
  task: DeadlineTask;
  person: PersonOption | null;
  actions: TaskActions;
  onOpen: () => void;
}

export default function TaskCard({
  task,
  person,
  actions,
  onOpen,
}: TaskCardProps) {
  const today = dayjs();
  const date = dayjs(task.deadline);
  const overdue = !isTaskFinished(task) && date.isBefore(today, 'day');
  const dateLabel = date.isSame(today, 'day')
    ? 'Today'
    : date.isSame(today.add(1, 'day'), 'day')
      ? 'Tomorrow'
      : date.format(date.year() === today.year() ? 'MMM D' : 'MMM D, YYYY');
  const metric = taskCardMetric(task);
  const name = person?.name ?? 'Unknown user';

  return (
    <article
      data-cy={`deadline-task-card-${task.id}`}
      className="group flex min-w-0 items-start gap-3 rounded-xl border border-[#F1F2F6] bg-white px-4 py-3.5 transition-colors hover:border-okr-primary/20 hover:bg-slate-50/60"
    >
      <TaskCompletion task={task} actions={actions} />
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View task details: ${task.title}`}
        data-cy={`deadline-task-open-${task.id}`}
        className="flex min-w-0 flex-1 flex-col gap-2 text-left focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-okr-primary"
      >
        <span
          data-cy="deadline-task-title"
          className={classNames(
            'break-words text-[15px] font-medium leading-snug text-[#161A2C]',
            isTaskDone(task) && 'text-slate-400 line-through',
          )}
        >
          {task.title}
        </span>
        <span
          data-cy="deadline-task-card-meta"
          className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500"
        >
          <span
            data-cy="deadline-task-metric"
            className="inline-flex min-w-0 max-w-full items-center gap-1.5 sm:max-w-[55%]"
            title={metric}
          >
            <AimOutlined className="shrink-0 text-slate-400" />
            <span data-cy="deadline-task-metric-label" className="truncate">
              {metric}
            </span>
          </span>
          <time
            dateTime={task.deadline}
            title={date.format('MMM D, YYYY')}
            data-cy="deadline-task-deadline"
            className={classNames(
              'inline-flex items-center gap-1.5',
              overdue
                ? 'text-red-600'
                : date.isSame(today, 'day')
                  ? 'text-okr-primary'
                  : 'text-slate-500',
            )}
          >
            <CalendarOutlined /> {dateLabel}
          </time>
          {task.subTasks?.length ? (
            <span
              data-cy="deadline-task-subtask-progress"
              className="inline-flex items-center gap-1.5"
              aria-label={`${task.subTasks.filter(isTaskDone).length} of ${task.subTasks.length} subtasks completed`}
              title="Completed subtasks"
            >
              <UnorderedListOutlined />
              {task.subTasks.filter(isTaskDone).length}/{task.subTasks.length}
            </span>
          ) : null}
          <span
            data-cy="deadline-task-assignee"
            className="inline-flex min-w-0 max-w-full items-center gap-1.5 sm:ml-auto"
            title={name}
          >
            <UserAvatar name={name} size="sm" />
            <span data-cy="deadline-task-assignee-name" className="truncate">
              {name}
            </span>
          </span>
        </span>
      </button>
    </article>
  );
}
