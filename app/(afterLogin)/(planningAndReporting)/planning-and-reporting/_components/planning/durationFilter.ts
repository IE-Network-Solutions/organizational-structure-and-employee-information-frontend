import type {
  DeadlineKind,
  DeadlineTask,
} from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import {
  appearsInThisMonth,
  appearsInThisWeek,
  appearsInToday,
  formatDate,
  kindFromSpan,
  parseDate,
  spanDays,
  todayIso,
} from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import type { TaskDateSpan } from '@/store/uistate/features/planningAndReporting/taskDates';

export const periodNameToKind = (name?: string): DeadlineKind => {
  const n = (name || '').toLowerCase();
  if (n.includes('daily') || n.includes('today')) return 'daily';
  if (n.includes('month')) return 'month';
  return 'week';
};

export const durationFilterLabel = (kind: DeadlineKind): string => {
  if (kind === 'daily') return 'Today';
  if (kind === 'week') return 'This week';
  return 'This month';
};

export const defaultSpanForKind = (
  kind: DeadlineKind,
  today: string = todayIso(),
): { start: string; deadline: string } => {
  if (kind === 'daily') return { start: today, deadline: today };
  if (kind === 'week') {
    return {
      start: today,
      deadline: formatDate(parseDate(today).add(6, 'day')),
    };
  }
  return {
    start: today,
    deadline: formatDate(parseDate(today).add(14, 'day')),
  };
};

export const resolveSpan = (
  start?: string | null,
  deadline?: string | null,
): { spanDays: number; kind: DeadlineKind } | null => {
  if (!start || !deadline) return null;
  const days = spanDays(start, deadline);
  if (days == null) return null;
  return { spanDays: days, kind: kindFromSpan(days) };
};

export const toIsoDate = (value?: string | null): string | null => {
  if (value == null || value === '') return null;
  const sliced = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(sliced) ? sliced : null;
};

export const resolveTaskDates = (
  task: any,
  overlay: Record<string, TaskDateSpan>,
): { start: string | null; deadline: string | null } => {
  const id = String(task?.id ?? '');
  const overlaySpan =
    overlay[id] ||
    overlay[
      `${task?.task || task?.taskName || ''}::${task?.keyResultId || task?.keyResult?.id || ''}`
    ];
  return {
    start: toIsoDate(
      overlaySpan?.start ||
        task?.startDate ||
        task?.start ||
        task?.deadlineStart ||
        null,
    ),
    deadline: toIsoDate(
      overlaySpan?.deadline ||
        task?.endDate ||
        task?.deadline ||
        task?.end ||
        null,
    ),
  };
};

export const plannedTaskToDeadlineTask = (
  task: any,
  overlay: Record<string, TaskDateSpan>,
  fallbackKind: DeadlineKind,
  today: string = todayIso(),
  planningPeriodId?: string,
): DeadlineTask | null => {
  const id = String(task?.id ?? '');
  const title = String(task?.task || task?.taskName || '').trim();
  if (!id && !title) return null;

  const { start, deadline } = resolveTaskDates(task, overlay);
  const resolved = resolveSpan(start, deadline);
  const kind = resolved?.kind ?? fallbackKind;
  const fallback = defaultSpanForKind(kind, today);
  const startIso = start && resolved ? start : fallback.start;
  const deadlineIso = deadline && resolved ? deadline : fallback.deadline;
  const parentId = task?.parentTaskId || task?.parentTask?.id || null;
  const sourceStatus = task?.status ? String(task.status) : undefined;

  return {
    id: id || `${title}::${task?.keyResultId || task?.keyResult?.id || ''}`,
    title: title || 'Task',
    start: startIso,
    deadline: deadlineIso,
    spanDays:
      resolved?.spanDays ?? (kind === 'daily' ? 1 : kind === 'month' ? 15 : 5),
    kind,
    parentId: parentId ? String(parentId) : null,
    done: sourceStatus === 'completed' || sourceStatus === 'pre_achieved',
    keyResultTitle: task?.keyResult?.title || undefined,
    planningPeriodId: planningPeriodId || task?.planningPeriodId || undefined,
    sourceStatus,
  };
};

export const collectDeadlineTasksFromPlans = (
  plans: any[],
  overlay: Record<string, TaskDateSpan>,
  today: string,
): DeadlineTask[] => {
  const out: DeadlineTask[] = [];
  const seen = new Set<string>();
  for (const plan of plans) {
    const fallbackKind = periodNameToKind(
      plan?._periodName ||
        plan?.planningUser?.planningPeriod?.name ||
        plan?.planningPeriod?.name,
    );
    const planningPeriodId = String(
      plan?.planningUser?.planningPeriod?.id || plan?.planningPeriodId || '',
    );
    const tasks = Array.isArray(plan?.tasks) ? plan.tasks : [];
    for (const task of tasks) {
      const mapped = plannedTaskToDeadlineTask(
        task,
        overlay,
        fallbackKind,
        today,
        planningPeriodId || undefined,
      );
      if (!mapped || seen.has(mapped.id)) continue;
      seen.add(mapped.id);
      out.push(mapped);
    }
  }
  return out;
};

export const durationFilterMatchesTask = (
  task: any,
  filterKind: DeadlineKind,
  today: string,
  overlay: Record<string, TaskDateSpan>,
  fallbackKind: DeadlineKind,
): boolean => {
  const { start, deadline } = resolveTaskDates(task, overlay);
  const resolved = resolveSpan(start, deadline);
  const mapped = plannedTaskToDeadlineTask(
    task,
    overlay,
    fallbackKind,
    today,
  );
  if (!mapped) return fallbackKind === filterKind;

  if (!resolved) {
    return mapped.kind === filterKind;
  }
  if (filterKind === 'daily') return appearsInToday(mapped, [mapped], today);
  if (filterKind === 'week') return appearsInThisWeek(mapped, today);
  return appearsInThisMonth(mapped, today);
};

export const cadenceAssignmentByKind = (
  defaultItems: any[] | undefined,
  userAssignments: any[] | undefined,
): Record<DeadlineKind, { periodId: string; planningUserId: string }> => {
  const defaults = Array.isArray(defaultItems) ? defaultItems : [];
  const assignments = Array.isArray(userAssignments) ? userAssignments : [];
  const pick = (name: string) => {
    const def = defaults.find(
      (item: any) =>
        String(item?.name || '').toLowerCase() === name.toLowerCase(),
    );
    const assignment =
      assignments.find(
        (item: any) =>
          item?.planningPeriod?.id === def?.id ||
          String(item?.planningPeriod?.name || '').toLowerCase() ===
            name.toLowerCase(),
      ) ||
      assignments.find(
        (item: any) =>
          periodNameToKind(item?.planningPeriod?.name) ===
          periodNameToKind(name),
      );
    return {
      periodId: String(
        def?.id ||
          assignment?.planningPeriod?.id ||
          assignment?.planningPeriodId ||
          '',
      ),
      planningUserId: String(assignment?.id || ''),
    };
  };
  return {
    daily: pick('Daily'),
    week: pick('Weekly'),
    month: pick('Monthly'),
  };
};

export const cadencePeriodLabel = (kind: DeadlineKind): string => {
  if (kind === 'daily') return 'Daily';
  if (kind === 'month') return 'Monthly';
  return 'Weekly';
};

export type CadenceGroup<T> = {
  planningPeriodId: string;
  planningUserId: string;
  kind: DeadlineKind;
  lines: T[];
};

export const groupLinesByDeadlineCadence = <
  T extends { start: string; deadline: string },
>(
  lines: T[],
  assignments: Record<
    DeadlineKind,
    { periodId: string; planningUserId: string }
  >,
): { ok: true; groups: CadenceGroup<T>[] } | { ok: false; error: string } => {
  const groups = new Map<string, CadenceGroup<T>>();
  for (const line of lines) {
    const resolved = resolveSpan(line.start, line.deadline);
    if (!resolved) {
      return {
        ok: false,
        error: 'Each task needs a start date and an end date.',
      };
    }
    const assignment = assignments[resolved.kind];
    if (!assignment.periodId) {
      return {
        ok: false,
        error: `No ${cadencePeriodLabel(resolved.kind)} planning period is available.`,
      };
    }
    const existing = groups.get(assignment.periodId);
    if (existing) {
      existing.lines.push(line);
    } else {
      groups.set(assignment.periodId, {
        planningPeriodId: assignment.periodId,
        planningUserId: assignment.planningUserId,
        kind: resolved.kind,
        lines: [line],
      });
    }
  }
  return { ok: true, groups: Array.from(groups.values()) };
};

export const planItemMatchesDurationFilter = (
  plan: any,
  filterKind: DeadlineKind,
  today: string,
  overlay: Record<string, TaskDateSpan>,
  fallbackKind: DeadlineKind,
): boolean => {
  const tasks = Array.isArray(plan?.tasks) ? plan.tasks : [];
  if (tasks.length === 0) return fallbackKind === filterKind;
  return tasks.some((task: any) =>
    durationFilterMatchesTask(task, filterKind, today, overlay, fallbackKind),
  );
};
