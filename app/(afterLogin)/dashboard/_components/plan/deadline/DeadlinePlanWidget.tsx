'use client';

import { Checkbox, Select, Spin } from 'antd';
import { MdAppRegistration } from 'react-icons/md';
import { useState } from 'react';
import { useUpdateStatus } from '@/store/server/features/okrPlanningAndReporting/mutations';
import {
  appearsInThisMonth,
  appearsInThisWeek,
  appearsInToday,
  childrenOf,
  isOverdue,
  todayIso,
  weekDailiesForSection,
} from './bucket';
import type { DeadlineTask } from './types';
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
      <div className="min-w-0 flex-1">
        <p
          className={`m-0 text-sm text-gray-800 ${
            task.done ? 'text-gray-400 line-through' : ''
          }`}
        >
          {task.title}
        </p>
        <p className="m-0 text-xs text-gray-500">
          {task.keyResultTitle ? `${task.keyResultTitle} · ` : ''}
          {task.spanDays} day{task.spanDays === 1 ? '' : 's'} · {task.deadline}
          {overdue ? ' · Overdue' : ''}
        </p>
      </div>
    </div>
  );
};

type PlanView = 'today' | 'week' | 'month';

const PLAN_VIEW_OPTIONS = [
  { value: 'today', label: "Today's tasks" },
  { value: 'week', label: "This week's tasks" },
  { value: 'month', label: "This month's tasks" },
];

const EmptyState = ({ label }: { label: string }) => (
  <p className="m-0 flex min-h-[190px] items-center justify-center text-lg font-light">
    {label}
  </p>
);

const DeadlinePlanWidget = () => {
  const { tasks, isLoading } = useDashboardDeadlineTasks();
  const { mutate: updateStatus } = useUpdateStatus();
  const today = todayIso();
  const [planView, setPlanView] = useState<PlanView>('today');

  const onToggle = (task: DeadlineTask) => {
    if (task.sourceStatus === 'completed') return;
    updateStatus({
      id: task.id,
      status:
        task.sourceStatus === 'pre_achieved' ? 'pre_pending' : 'pre_achieved',
      planningPeriodId: task.planningPeriodId,
    });
  };

  const todayTasks = tasks.filter((task) => appearsInToday(task, tasks, today));
  const weekParents = tasks.filter(
    (task) => appearsInThisWeek(task, today) && task.parentId == null,
  );
  const weekSlices = tasks.filter(
    (task) => appearsInThisWeek(task, today) && task.parentId != null,
  );
  const monthParents = tasks.filter((task) => appearsInThisMonth(task, today));

  const weekList = (
    <>
      {weekParents.map((task) => (
        <div key={task.id}>
          <TaskRow task={task} today={today} onToggle={onToggle} />
          {weekDailiesForSection(tasks, task.id, today).map((child) => (
            <TaskRow
              key={child.id}
              task={child}
              today={today}
              nested
              onToggle={onToggle}
            />
          ))}
        </div>
      ))}
      {weekSlices.map((task) => (
        <div key={task.id}>
          <TaskRow task={task} today={today} onToggle={onToggle} />
          {weekDailiesForSection(tasks, task.id, today).map((child) => (
            <TaskRow
              key={child.id}
              task={child}
              today={today}
              nested
              onToggle={onToggle}
            />
          ))}
        </div>
      ))}
    </>
  );

  const monthList = monthParents.map((task) => (
    <div key={task.id}>
      <TaskRow task={task} today={today} onToggle={onToggle} />
      {childrenOf(tasks, task.id)
        .filter((child) => child.kind === 'week')
        .map((child) => (
          <TaskRow
            key={child.id}
            task={child}
            today={today}
            nested
            onToggle={onToggle}
          />
        ))}
    </div>
  ));

  const weekCount = weekParents.length + weekSlices.length;
  const body = isLoading ? (
    <div
      className="flex min-h-[190px] items-center justify-center"
      data-cy="deadline-plan-loading"
    >
      <Spin />
    </div>
  ) : planView === 'today' ? (
    todayTasks.length === 0 ? (
      <EmptyState label="No tasks today" />
    ) : (
      todayTasks.map((task) => (
        <TaskRow key={task.id} task={task} today={today} onToggle={onToggle} />
      ))
    )
  ) : planView === 'week' ? (
    weekCount === 0 ? (
      <EmptyState label="No tasks this week" />
    ) : (
      weekList
    )
  ) : monthParents.length === 0 ? (
    <EmptyState label="No tasks this month" />
  ) : (
    monthList
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
        <div className="flex items-center gap-1" data-cy="plan-selector">
          <Select
            value={planView}
            className="w-[160px] min-w-[160px] text-sm rounded-md border-gray-200 [&_.ant-select-selector]:rounded-md [&_.ant-select-selector]:border-gray-200"
            onChange={(value) => setPlanView(value)}
            options={PLAN_VIEW_OPTIONS}
            data-cy="deadline-plan-view-select"
          />
        </div>
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
