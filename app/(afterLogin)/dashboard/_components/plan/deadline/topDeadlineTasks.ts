'use client';

import { childrenOf, todayIso, weekDailiesForSection } from './bucket';
import type { DeadlineTask } from './types';

const DASHBOARD_TOP_N = 5;

/** Closest-deadline root tasks for dashboard (children render nested, not counted in N). */
export function selectTopDeadlineRoots(
  tasks: DeadlineTask[],
  limit = DASHBOARD_TOP_N,
): DeadlineTask[] {
  const roots = tasks.filter((t) => t.parentId == null);
  const active = roots.filter((t) => t.sourceStatus !== 'completed');
  return [...active]
    .sort((a, b) => {
      const da = a.deadline.localeCompare(b.deadline);
      if (da !== 0) return da;
      return a.start.localeCompare(b.start);
    })
    .slice(0, limit);
}

export function accompanyingChildrenForRoot(
  tasks: DeadlineTask[],
  root: DeadlineTask,
  today: string = todayIso(),
): DeadlineTask[] {
  if (root.kind === 'week') {
    return weekDailiesForSection(tasks, root.id, today);
  }
  if (root.kind === 'month') {
    return childrenOf(tasks, root.id).filter((c) => c.kind === 'week');
  }
  return [];
}

export { DASHBOARD_TOP_N };
