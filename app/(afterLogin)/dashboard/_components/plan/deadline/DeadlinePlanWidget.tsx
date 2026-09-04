'use client';

import { useMemo } from 'react';
import { Checkbox, Spin } from 'antd';
import { MdAppRegistration } from 'react-icons/md';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useUserPlanRepositoryMock } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import { isOverdue, todayIso } from './bucket';
import type { DeadlineTask } from './types';
import {
  accompanyingChildrenForRoot,
  selectTopDeadlineRoots,
} from './topDeadlineTasks';
import { useDashboardDeadlineTasks } from './useDashboardDeadlineTasks';

const TaskRow = ({
  task,
  today,
  nested,
  onToggle,
}: {
  task: DeadlineTask;
  today: string;
  nested?: boolean;
  onToggle: (task: DeadlineTask) => void;
}) => {
  const overdue = isOverdue(task, today);
  const completed = task.sourceStatus === 'completed';

  return (
    <div
      className={`flex items-start gap-2 py-1.5 ${nested ? 'pl-6' : ''}`}
      data-cy={`deadline-plan-row-${task.id}`}
    >
      <Checkbox
        checked={task.done}
        onChange={() => onToggle(task)}
        disabled={completed}
        className="mt-0.5 [&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-[#52C41A] [&_.ant-checkbox-checked_.ant-checkbox-inner]:!border-[#52C41A]"
        data-cy={`deadline-plan-checkbox-${task.id}`}
      />
      <div data-cy="deadlineplanwidget-42" className="min-w-0 flex-1">
        <p
          data-cy="deadline-widget-p-43"
          className={`m-0 text-sm text-gray-800 ${
            task.done ? 'text-gray-400 line-through' : ''
          }`}
        >
          {task.title}
        </p>
        <p
          data-cy="deadlineplanwidget-50"
          className="m-0 text-xs text-gray-500"
        >
          {task.keyResultTitle ? `${task.keyResultTitle} · ` : ''}
          {task.spanDays} day{task.spanDays === 1 ? '' : 's'} · {task.deadline}
          {overdue ? ' · Overdue' : ''}
        </p>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <p
    data-cy="deadlineplanwidget-61"
    className="m-0 flex min-h-[190px] items-center justify-center text-lg font-light"
  >
    No upcoming tasks
  </p>
);

const DeadlinePlanWidget = () => {
  const { tasks, isLoading } = useDashboardDeadlineTasks();
  const { userId } = useAuthenticationStore();
  const togglePreAchieved = useUserPlanRepositoryMock(
    (s) => s.togglePreAchieved,
  );
  const today = todayIso();

  const topRoots = useMemo(() => selectTopDeadlineRoots(tasks), [tasks]);

  const onToggle = (task: DeadlineTask) => {
    if (task.sourceStatus === 'completed' || !userId) return;
    togglePreAchieved(userId, task.id);
  };

  const body = isLoading ? (
    <div
      className="flex min-h-[190px] items-center justify-center"
      data-cy="deadline-plan-loading"
    >
      <Spin />
    </div>
  ) : topRoots.length === 0 ? (
    <EmptyState />
  ) : (
    topRoots.map((task) => (
      <div data-cy="deadlineplanwidget-92" key={task.id}>
        <TaskRow task={task} today={today} onToggle={onToggle} />
        {accompanyingChildrenForRoot(tasks, task, today).map((child) => (
          <TaskRow
            key={child.id}
            task={child}
            today={today}
            nested
            onToggle={onToggle}
          />
        ))}
      </div>
    ))
  );

  return (
    <div data-cy="deadline-plan-widget">
      <div
        className="flex items-center justify-between pb-3"
        data-cy="plan-header"
      >
        <div className="flex items-center gap-2" data-cy="plan-title">
          <MdAppRegistration size={24} />
          <span
            className="text-[16px] font-bold text-gray-900"
            data-cy="plan-title-text"
          >
            Planning
          </span>
        </div>
        <span
          className="text-xs text-gray-500"
          data-cy="deadline-plan-subtitle"
        >
          Next 5 deadlines
        </span>
      </div>
      <div
        className="h-[270px] overflow-y-auto scrollbar-none"
        data-cy="plan-body"
      >
        {body}
      </div>
    </div>
  );
};

export default DeadlinePlanWidget;
