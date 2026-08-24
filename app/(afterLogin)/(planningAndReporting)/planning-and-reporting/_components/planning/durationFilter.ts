import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
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

const asDeadlineTask = (
  id: string,
  start: string,
  deadline: string,
  kind: DeadlineKind,
  days: number,
  done: boolean,
) => ({
  id,
  title: id,
  start,
  deadline,
  spanDays: days,
  kind,
  parentId: null,
  done,
});

export const durationFilterMatchesTask = (
  task: any,
  filterKind: DeadlineKind,
  today: string,
  overlay: Record<string, TaskDateSpan>,
  fallbackKind: DeadlineKind,
): boolean => {
  const id = String(task?.id ?? '');
  const overlaySpan =
    overlay[id] ||
    overlay[
      `${task?.task || task?.taskName || ''}::${task?.keyResultId || task?.keyResult?.id || ''}`
    ];
  const start =
    overlaySpan?.start ||
    task?.startDate ||
    task?.start ||
    task?.deadlineStart ||
    null;
  const deadline =
    overlaySpan?.deadline ||
    task?.endDate ||
    task?.deadline ||
    task?.end ||
    null;
  const resolved = resolveSpan(start, deadline);
  const kind = resolved?.kind ?? fallbackKind;
  const days =
    resolved?.spanDays ?? (kind === 'daily' ? 1 : kind === 'month' ? 15 : 5);
  const startIso = start || today;
  const deadlineIso = deadline || today;
  const fake = asDeadlineTask(
    id || 'task',
    startIso,
    deadlineIso,
    kind,
    days,
    task?.status === 'completed' || task?.status === 'pre_achieved',
  );

  if (!resolved) {
    return kind === filterKind;
  }
  if (filterKind === 'daily') return appearsInToday(fake, [fake], today);
  if (filterKind === 'week') return appearsInThisWeek(fake, today);
  return appearsInThisMonth(fake, today);
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
