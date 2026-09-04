import dayjs, { type Dayjs } from 'dayjs';
import { DATE_FORMAT, type DeadlineKind, type DeadlineTask } from './types';

export const parseDate = (iso: string): Dayjs =>
  dayjs(`${iso.slice(0, 10)}T00:00:00`);

export const formatDate = (value: Dayjs): string => value.format(DATE_FORMAT);

export const todayIso = (now: Dayjs = dayjs()): string =>
  formatDate(now.startOf('day'));

const toDay = (iso: string): Dayjs | null => {
  const parsed = parseDate(iso);
  return parsed.isValid() ? parsed.startOf('day') : null;
};

export const spanDays = (start: string, deadline: string): number | null => {
  const startDay = toDay(start);
  const endDay = toDay(deadline);
  if (!startDay || !endDay) return null;
  if (endDay.isBefore(startDay, 'day')) return null;
  return endDay.diff(startDay, 'day') + 1;
};

export const kindFromSpan = (days: number): DeadlineKind => {
  if (days <= 1) return 'daily';
  if (days <= 14) return 'week';
  return 'month';
};

export const kindLabel = (kind: DeadlineKind): string => {
  if (kind === 'daily') return "Today's tasks";
  if (kind === 'week') return "This week's tasks";
  return "This month's tasks";
};

/** Monday–Sunday containing `today`. */
export const weekBounds = (today: string): { start: string; end: string } => {
  const day = toDay(today);
  if (!day) return { start: today, end: today };
  const weekday = day.day();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  const monday = day.subtract(daysFromMonday, 'day');
  return {
    start: formatDate(monday),
    end: formatDate(monday.add(6, 'day')),
  };
};

export const monthBounds = (today: string): { start: string; end: string } => {
  const day = toDay(today);
  if (!day) return { start: today, end: today };
  return {
    start: formatDate(day.startOf('month')),
    end: formatDate(day.endOf('month')),
  };
};

export const dateInRange = (
  date: string,
  start: string,
  deadline: string,
): boolean => {
  const day = toDay(date);
  const startDay = toDay(start);
  const endDay = toDay(deadline);
  if (!day || !startDay || !endDay) return false;
  return !day.isBefore(startDay, 'day') && !day.isAfter(endDay, 'day');
};

export const rangesOverlap = (
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean => {
  const aStart = toDay(startA);
  const aEnd = toDay(endA);
  const bStart = toDay(startB);
  const bEnd = toDay(endB);
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  return !aEnd.isBefore(bStart, 'day') && !bEnd.isBefore(aStart, 'day');
};

export const isOverdue = (task: DeadlineTask, today: string): boolean =>
  !task.done &&
  !!toDay(task.deadline)?.isBefore(toDay(today) ?? dayjs(), 'day');

export type RangeResult =
  | { ok: true; spanDays: number; kind: DeadlineKind }
  | { ok: false; error: string };

export const validateRange = (start: string, deadline: string): RangeResult => {
  const days = spanDays(start, deadline);
  if (days == null) {
    return { ok: false, error: 'Deadline must be on or after the start date.' };
  }
  return { ok: true, spanDays: days, kind: kindFromSpan(days) };
};

export const canAddDailySubtask = (parent: DeadlineTask): boolean =>
  parent.kind === 'week';

export const canAddWeeklySubtask = (parent: DeadlineTask): boolean =>
  parent.kind === 'month';

export const validateDailySubtask = (
  parent: DeadlineTask,
  date: string,
): RangeResult => {
  if (!canAddDailySubtask(parent)) {
    return {
      ok: false,
      error: 'Daily subtasks can only be added under a This week task.',
    };
  }
  if (!dateInRange(date, parent.start, parent.deadline)) {
    return {
      ok: false,
      error: "Daily date must fall inside the parent task's span.",
    };
  }
  return { ok: true, spanDays: 1, kind: 'daily' };
};

export const validateWeeklySubtask = (
  parent: DeadlineTask,
  start: string,
  deadline: string,
): RangeResult => {
  if (!canAddWeeklySubtask(parent)) {
    return {
      ok: false,
      error: 'Weekly subtasks can only be added under a This month task.',
    };
  }
  const range = validateRange(start, deadline);
  if (!range.ok) return range;
  if (range.kind !== 'week') {
    return {
      ok: false,
      error: 'A weekly subtask must span 2–14 days.',
    };
  }
  if (
    !dateInRange(start, parent.start, parent.deadline) ||
    !dateInRange(deadline, parent.start, parent.deadline)
  ) {
    return {
      ok: false,
      error: "Weekly range must fall inside the parent task's span.",
    };
  }
  return range;
};

export const defaultDailySubtaskDate = (
  parent: DeadlineTask,
  today: string,
): string =>
  dateInRange(today, parent.start, parent.deadline) ? today : parent.start;

export const hasDailyChildOnDate = (
  tasks: DeadlineTask[],
  parentId: string,
  date: string,
): boolean =>
  tasks.some(
    (task) =>
      task.parentId === parentId &&
      task.kind === 'daily' &&
      dateInRange(date, task.start, task.deadline),
  );

export const appearsInToday = (
  task: DeadlineTask,
  tasks: DeadlineTask[],
  today: string,
): boolean => {
  if (task.kind === 'daily') {
    if (dateInRange(today, task.start, task.deadline)) return true;
    return isOverdue(task, today) && task.spanDays === 1;
  }
  if (
    task.kind === 'week' &&
    task.parentId == null &&
    task.spanDays >= 2 &&
    task.spanDays <= 3
  ) {
    if (!dateInRange(today, task.start, task.deadline)) return false;
    return !hasDailyChildOnDate(tasks, task.id, today);
  }
  return false;
};

export const appearsInThisWeek = (
  task: DeadlineTask,
  today: string,
): boolean => {
  if (task.kind !== 'week') return false;
  const week = weekBounds(today);
  if (rangesOverlap(task.start, task.deadline, week.start, week.end)) {
    return true;
  }
  return isOverdue(task, today);
};

export const appearsInThisMonth = (
  task: DeadlineTask,
  today: string,
): boolean => {
  if (task.kind !== 'month' || task.parentId != null) return false;
  const month = monthBounds(today);
  if (rangesOverlap(task.start, task.deadline, month.start, month.end)) {
    return true;
  }
  return isOverdue(task, today);
};

export const childrenOf = (
  tasks: DeadlineTask[],
  parentId: string,
): DeadlineTask[] => tasks.filter((task) => task.parentId === parentId);

export const weekDailiesForSection = (
  tasks: DeadlineTask[],
  parentId: string,
  today: string,
): DeadlineTask[] => {
  const week = weekBounds(today);
  return childrenOf(tasks, parentId).filter((task) => {
    if (task.kind !== 'daily') return false;
    return (
      rangesOverlap(task.start, task.deadline, week.start, week.end) ||
      isOverdue(task, today)
    );
  });
};

export const buildParentTask = (input: {
  id: string;
  title: string;
  start: string;
  deadline: string;
  keyResultTitle?: string;
}): { ok: true; task: DeadlineTask } | { ok: false; error: string } => {
  const range = validateRange(input.start, input.deadline);
  if (!range.ok) return range;
  return {
    ok: true,
    task: {
      id: input.id,
      title: input.title.trim(),
      start: input.start,
      deadline: input.deadline,
      spanDays: range.spanDays,
      kind: range.kind,
      parentId: null,
      done: false,
      keyResultTitle: input.keyResultTitle,
    },
  };
};
