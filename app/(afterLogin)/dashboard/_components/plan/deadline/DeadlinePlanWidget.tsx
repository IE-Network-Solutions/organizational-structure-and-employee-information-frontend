'use client';

import { Button, Checkbox, DatePicker, Input, Modal, Select } from 'antd';
import { type Dayjs } from 'dayjs';
import { MdAppRegistration } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useDeadlinePlanStore } from '@/store/uistate/features/dashboard/plan/deadline';
import {
  appearsInThisMonth,
  appearsInThisWeek,
  appearsInToday,
  childrenOf,
  dateInRange,
  defaultDailySubtaskDate,
  isOverdue,
  todayIso,
  weekDailiesForSection,
} from './bucket';
import type { DeadlineTask } from './types';

const isoFromPicker = (value: Dayjs | null): string | null =>
  value ? value.format('YYYY-MM-DD') : null;

const AddDailyModal = ({
  parent,
  onClose,
}: {
  parent: DeadlineTask | null;
  onClose: () => void;
}) => {
  const addDailySubtask = useDeadlinePlanStore(
    (state) => state.addDailySubtask,
  );
  const today = todayIso();
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parent) return;
    setTitle('');
    setError(null);
  }, [parent]);

  const submit = () => {
    if (!parent) return;
    const dateIso = defaultDailySubtaskDate(parent, today);
    const result = addDailySubtask(parent.id, title, dateIso);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setTitle('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      title={parent ? `Daily subtask of ${parent.title}` : 'Daily subtask'}
      open={parent != null}
      onCancel={onClose}
      onOk={submit}
      okText="Add daily"
      destroyOnClose
    >
      {parent ? (
        <div className="flex flex-col gap-3 pt-1">
          <Input
            placeholder="Task name"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onPressEnter={submit}
          />
          {error ? <p className="m-0 text-sm text-red-500">{error}</p> : null}
        </div>
      ) : null}
    </Modal>
  );
};

const AddWeeklyModal = ({
  parent,
  onClose,
}: {
  parent: DeadlineTask | null;
  onClose: () => void;
}) => {
  const addWeeklySubtask = useDeadlinePlanStore(
    (state) => state.addWeeklySubtask,
  );
  const [title, setTitle] = useState('');
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parent) return;
    setTitle('');
    setRange(null);
    setError(null);
  }, [parent]);

  const submit = () => {
    if (!parent) return;
    const startIso = isoFromPicker(range?.[0] ?? null);
    const endIso = isoFromPicker(range?.[1] ?? null);
    if (!startIso || !endIso) {
      setError('Pick a week range.');
      return;
    }
    const result = addWeeklySubtask(parent.id, title, startIso, endIso);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setTitle('');
    setRange(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      title={parent ? `Weekly subtask of ${parent.title}` : 'Weekly subtask'}
      open={parent != null}
      onCancel={onClose}
      onOk={submit}
      okText="Add weekly"
      destroyOnClose
    >
      {parent ? (
        <div className="flex flex-col gap-3 pt-1">
          <Input
            placeholder="Week slice title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <DatePicker.RangePicker
            className="w-full"
            value={range}
            onChange={(next) => setRange(next)}
            disabledDate={(current) =>
              !dateInRange(
                current.format('YYYY-MM-DD'),
                parent.start,
                parent.deadline,
              )
            }
          />
          {error ? <p className="m-0 text-sm text-red-500">{error}</p> : null}
        </div>
      ) : null}
    </Modal>
  );
};

const TaskRow = ({
  task,
  today,
  nested,
  action,
}: {
  task: DeadlineTask;
  today: string;
  nested?: boolean;
  action?: React.ReactNode;
}) => {
  const toggleDone = useDeadlinePlanStore((state) => state.toggleDone);
  const overdue = isOverdue(task, today);
  return (
    <div
      className={`flex items-start gap-2 py-1.5 ${nested ? 'pl-6' : ''}`}
      data-cy={`deadline-plan-row-${task.id}`}
    >
      <Checkbox
        checked={task.done}
        onChange={() => toggleDone(task.id)}
        className="mt-0.5"
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
      {action}
    </div>
  );
};

type PlanView = 'today' | 'week' | 'month';

const PLAN_VIEW_OPTIONS = [
  { value: 'today', label: "Today's tasks" },
  { value: 'week', label: "This week's tasks" },
  { value: 'month', label: "This month's tasks" },
];

const DeadlinePlanWidget = () => {
  const tasks = useDeadlinePlanStore((state) => state.tasks);
  const today = todayIso();
  const [planView, setPlanView] = useState<PlanView>('today');
  const [dailyParent, setDailyParent] = useState<DeadlineTask | null>(null);
  const [weeklyParent, setWeeklyParent] = useState<DeadlineTask | null>(null);

  const todayTasks = tasks.filter((task) => appearsInToday(task, tasks, today));
  const weekParents = tasks.filter(
    (task) => appearsInThisWeek(task, today) && task.parentId == null,
  );
  const weekSlices = tasks.filter(
    (task) => appearsInThisWeek(task, today) && task.parentId != null,
  );
  const monthParents = tasks.filter((task) =>
    appearsInThisMonth(task, today),
  );

  const addDailyButton = (task: DeadlineTask) =>
    task.kind === 'week' ? (
      <Button
        type="text"
        size="small"
        className="!px-1 !text-primary hover:!text-primary"
        onClick={() => setDailyParent(task)}
      >
        Add daily
      </Button>
    ) : null;

  const weekList = (
    <>
      {weekParents.map((task) => (
        <div key={task.id}>
          <TaskRow task={task} today={today} action={addDailyButton(task)} />
          {weekDailiesForSection(tasks, task.id, today).map((child) => (
            <TaskRow key={child.id} task={child} today={today} nested />
          ))}
        </div>
      ))}
      {weekSlices.map((task) => (
        <div key={task.id}>
          <TaskRow task={task} today={today} action={addDailyButton(task)} />
          {weekDailiesForSection(tasks, task.id, today).map((child) => (
            <TaskRow key={child.id} task={child} today={today} nested />
          ))}
        </div>
      ))}
    </>
  );

  const monthList = monthParents.map((task) => (
    <div key={task.id}>
      <TaskRow
        task={task}
        today={today}
        action={
          <Button
            type="text"
            size="small"
            className="!px-1 !text-primary hover:!text-primary"
            onClick={() => setWeeklyParent(task)}
          >
            Add weekly
          </Button>
        }
      />
      {childrenOf(tasks, task.id)
        .filter((child) => child.kind === 'week')
        .map((child) => (
          <TaskRow key={child.id} task={child} today={today} nested />
        ))}
    </div>
  ));

  const weekCount = weekParents.length + weekSlices.length;
  const body =
    planView === 'today' ? (
      todayTasks.length === 0 ? (
        <p className="m-0 flex min-h-[190px] items-center justify-center text-lg font-light">
          No tasks today
        </p>
      ) : (
        todayTasks.map((task) => (
          <TaskRow key={task.id} task={task} today={today} />
        ))
      )
    ) : planView === 'week' ? (
      weekCount === 0 ? (
        <p className="m-0 flex min-h-[190px] items-center justify-center text-lg font-light">
          No tasks this week
        </p>
      ) : (
        weekList
      )
    ) : monthParents.length === 0 ? (
      <p className="m-0 flex min-h-[190px] items-center justify-center text-lg font-light">
        No tasks this month
      </p>
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
      <AddDailyModal
        parent={dailyParent}
        onClose={() => setDailyParent(null)}
      />
      <AddWeeklyModal
        parent={weeklyParent}
        onClose={() => setWeeklyParent(null)}
      />
    </div>
  );
};

export default DeadlinePlanWidget;
