import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  buildParentTask,
  formatDate,
  parseDate,
  spanDays,
  todayIso,
  validateDailySubtask,
  validateWeeklySubtask,
} from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import type { DeadlineTask } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const buildSeedTasks = (today: string): DeadlineTask[] => {
  const plus = (days: number) => formatDate(parseDate(today).add(days, 'day'));

  const monthStart = plus(-2);
  const monthEnd = plus(15);
  const monthId = 'seed-month-18';
  const weekSliceStart = plus(0);
  const weekSliceEnd = plus(6);

  const seed: DeadlineTask[] = [
    {
      id: 'seed-today-1',
      title: 'Prep standup notes',
      start: today,
      deadline: today,
      spanDays: 1,
      kind: 'daily',
      parentId: null,
      done: false,
      keyResultTitle: 'Team cadence',
    },
    {
      id: 'seed-overdue-1',
      title: 'Send yesterday recap',
      start: plus(-1),
      deadline: plus(-1),
      spanDays: 1,
      kind: 'daily',
      parentId: null,
      done: false,
    },
    {
      id: 'seed-short-week-today',
      title: 'Fix login bug',
      start: plus(-1),
      deadline: plus(1),
      spanDays: 3,
      kind: 'week',
      parentId: null,
      done: false,
      keyResultTitle: 'Auth reliability',
    },
    {
      id: 'seed-short-week-later',
      title: 'Review vendor contract',
      start: plus(1),
      deadline: plus(2),
      spanDays: 2,
      kind: 'week',
      parentId: null,
      done: false,
    },
    {
      id: 'seed-week-5',
      title: 'Sprint demo deck',
      start: plus(-2),
      deadline: plus(2),
      spanDays: 5,
      kind: 'week',
      parentId: null,
      done: false,
      keyResultTitle: 'Q-demo',
    },
    {
      id: monthId,
      title: 'Q-end cleanup',
      start: monthStart,
      deadline: monthEnd,
      spanDays: spanDays(monthStart, monthEnd) ?? 18,
      kind: 'month',
      parentId: null,
      done: false,
    },
    {
      id: 'seed-month-week-slice',
      title: 'Cleanup: this week slice',
      start: weekSliceStart,
      deadline: weekSliceEnd,
      spanDays: spanDays(weekSliceStart, weekSliceEnd) ?? 7,
      kind: 'week',
      parentId: monthId,
      done: false,
    },
  ];

  return seed;
};

interface DeadlinePlanState {
  tasks: DeadlineTask[];
  addParent: (input: {
    title: string;
    start: string;
    deadline: string;
    keyResultTitle?: string;
  }) => { ok: true } | { ok: false; error: string };
  addDailySubtask: (
    parentId: string,
    title: string,
    date: string,
  ) => { ok: true } | { ok: false; error: string };
  addWeeklySubtask: (
    parentId: string,
    title: string,
    start: string,
    deadline: string,
  ) => { ok: true } | { ok: false; error: string };
  toggleDone: (id: string) => void;
}

export const useDeadlinePlanStore = create<DeadlinePlanState>()(
  devtools((set, get) => ({
    tasks: buildSeedTasks(todayIso()),
    addParent: (input) => {
      const built = buildParentTask({
        id: newId(),
        title: input.title,
        start: input.start,
        deadline: input.deadline,
        keyResultTitle: input.keyResultTitle,
      });
      if (!built.ok) return built;
      if (!built.task.title) {
        return { ok: false, error: 'Title is required.' };
      }
      set({ tasks: [...get().tasks, built.task] });
      return { ok: true };
    },
    addDailySubtask: (parentId, title, date) => {
      const parent = get().tasks.find((task) => task.id === parentId);
      if (!parent) return { ok: false, error: 'Parent task not found.' };
      const valid = validateDailySubtask(parent, date);
      if (!valid.ok) return valid;
      const trimmed = title.trim();
      if (!trimmed) return { ok: false, error: 'Title is required.' };
      const next: DeadlineTask = {
        id: newId(),
        title: trimmed,
        start: date,
        deadline: date,
        spanDays: 1,
        kind: 'daily',
        parentId,
        done: false,
      };
      set({ tasks: [...get().tasks, next] });
      return { ok: true };
    },
    addWeeklySubtask: (parentId, title, start, deadline) => {
      const parent = get().tasks.find((task) => task.id === parentId);
      if (!parent) return { ok: false, error: 'Parent task not found.' };
      const valid = validateWeeklySubtask(parent, start, deadline);
      if (!valid.ok) return valid;
      const trimmed = title.trim();
      if (!trimmed) return { ok: false, error: 'Title is required.' };
      const next: DeadlineTask = {
        id: newId(),
        title: trimmed,
        start,
        deadline,
        spanDays: valid.spanDays,
        kind: 'week',
        parentId,
        done: false,
      };
      set({ tasks: [...get().tasks, next] });
      return { ok: true };
    },
    toggleDone: (id) =>
      set({
        tasks: get().tasks.map((task) =>
          task.id === id ? { ...task, done: !task.done } : task,
        ),
      }),
  })),
);
