import type { MockPlanTask } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';

/** Toolbar task visibility filter (stored in `planningTaskStatusFilter`). */
export type PlanningTaskStatusFilter = 'all' | 'active' | 'reported';

export const planTaskStatusOptions: {
  label: string;
  value: PlanningTaskStatusFilter;
}[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Reported', value: 'reported' },
];

export function normalizePlanningTaskStatusFilter(
  value: string | undefined | null,
): PlanningTaskStatusFilter {
  if (value === 'all') return 'all';
  if (value === 'reported') return 'reported';
  return 'active';
}

export function isReportedPlanningTask(task: MockPlanTask): boolean {
  return !!task.isReported || !!task.isManuallyArchived || !!task.done;
}

/** Reported task closed by the manager — only visible under Reported filter. */
export function isManagerClosedReportedTask(task: MockPlanTask): boolean {
  return isReportedPlanningTask(task) && !!task.isLocked;
}

/**
 * Whether a task appears for the toolbar task-status filter.
 * - `all`: every task (in progress, reported, manager-closed).
 * - `active`: in-progress and reported tasks not yet closed by the manager.
 * - `reported`: reported tasks locked/closed by the manager.
 */
export function mockTaskMatchesPlanningStatusFilter(
  task: MockPlanTask,
  filter: PlanningTaskStatusFilter,
): boolean {
  if (filter === 'all') return true;
  if (filter === 'reported') return isManagerClosedReportedTask(task);
  return !isManagerClosedReportedTask(task);
}

type TaskLike = {
  isReported?: boolean;
  isManuallyArchived?: boolean;
  isLocked?: boolean;
  done?: boolean;
  status?: string;
};

export function apiTaskMatchesPlanningStatusFilter(
  task: TaskLike,
  filter: PlanningTaskStatusFilter,
): boolean {
  if (filter === 'all') return true;
  const reported =
    !!task.isReported ||
    !!task.isManuallyArchived ||
    task.status === 'pre_achieved' ||
    task.status === 'completed' ||
    !!task.done;
  const managerClosed = reported && !!task.isLocked;
  if (filter === 'reported') return managerClosed;
  return !managerClosed;
}

export function collectMockTasksForStatusFilter(
  plan: {
    activeTasks: MockPlanTask[];
    archivedTasks?: MockPlanTask[];
  },
  filter: PlanningTaskStatusFilter,
): MockPlanTask[] {
  const pool = [...plan.activeTasks, ...(plan.archivedTasks ?? [])];
  return pool.filter((t) => mockTaskMatchesPlanningStatusFilter(t, filter));
}
