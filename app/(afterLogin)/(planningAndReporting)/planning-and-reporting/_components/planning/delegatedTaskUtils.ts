import {
  parseDate,
  todayIso,
} from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import type { KeyResult, PlanSummary, PlanTask } from '../types';
import type { MockPlanTask } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import {
  isPlanHistoryFilter,
  reportedAtMatchesDurationFilter,
  taskInHistoryRange,
  type PlanFilterValue,
} from './durationFilter';

export type TeamTaskRow = {
  id: string;
  title: string;
  assigneeUserId: string;
  assigneeName: string;
  assignedByUserId: string;
  assignedByName: string;
  assignedByMe: boolean;
  deadline: string | null;
  deadlineIso: string | null;
  startDate: string | null;
  priority: string;
  statusLabel: string;
  statusTone: 'default' | 'warning' | 'success' | 'danger';
  overdue: boolean;
  planId: string;
};

/** @deprecated Use TeamTaskRow */
export type DelegatedTaskRow = TeamTaskRow;

type TaskLike = {
  id: string;
  title?: string;
  task?: string;
  taskName?: string;
  deadline?: string | null;
  endDate?: string | null;
  assignedByUserId?: string | null;
  isPendingApproval?: boolean;
  isLocked?: boolean;
  done?: boolean;
  status?: string;
  isReported?: boolean;
  priority?: string;
  start?: string | null;
  startDate?: string | null;
};

export function formatDelegatedDeadlineLabel(
  deadlineIso: string | null,
  today: string = todayIso(),
): { label: string; overdue: boolean } {
  if (!deadlineIso) return { label: '—', overdue: false };
  const end = parseDate(deadlineIso).startOf('day');
  const start = parseDate(today).startOf('day');
  if (!end.isValid() || !start.isValid()) return { label: '—', overdue: false };
  const diff = end.diff(start, 'day');
  if (diff < 0) {
    const n = Math.abs(diff);
    return {
      label: n === 1 ? '1d overdue' : `${n}d overdue`,
      overdue: true,
    };
  }
  if (diff === 0) return { label: 'Due today', overdue: false };
  const formatted = end.format('MMM D');
  return { label: formatted, overdue: false };
}

export function resolveDelegatedTaskStatus(task: TaskLike): {
  label: string;
  tone: TeamTaskRow['statusTone'];
} {
  if (task.isReported) {
    return { label: 'Reported', tone: 'success' };
  }
  return { label: 'In progress', tone: 'default' };
}

function taskTitle(task: TaskLike): string {
  return (
    task.title?.trim() ||
    task.task?.trim() ||
    task.taskName?.trim() ||
    'Untitled task'
  );
}

function taskDeadline(task: TaskLike): string | null {
  const raw = task.deadline || task.endDate;
  return raw ? String(raw).slice(0, 10) : null;
}

function collectTeamAssignedFromTaskList(
  tasks: TaskLike[],
  opts: {
    viewerUserId: string;
    assigneeUserId: string;
    assigneeName: string;
    planId: string;
    resolveUserName: (userId: string) => string;
    assignedByUserId?: string;
  },
): TeamTaskRow[] {
  const rows: TeamTaskRow[] = [];
  const seen = new Set<string>();

  for (const task of tasks) {
    if (!task?.id) continue;
    const assignerId = String(task.assignedByUserId ?? '');
    if (!assignerId) continue;
    if (assignerId === String(opts.assigneeUserId)) continue;
    if (opts.assignedByUserId && assignerId !== String(opts.assignedByUserId)) {
      continue;
    }
    if (seen.has(task.id)) continue;
    seen.add(task.id);

    const deadline = taskDeadline(task);
    const { label: deadlineLabel, overdue } =
      formatDelegatedDeadlineLabel(deadline);
    const status = resolveDelegatedTaskStatus(task);

    const startRaw = task.startDate || task.start;
    rows.push({
      id: task.id,
      title: taskTitle(task),
      assigneeUserId: opts.assigneeUserId,
      assigneeName: opts.assigneeName,
      assignedByUserId: assignerId,
      assignedByName: opts.resolveUserName(assignerId),
      assignedByMe: assignerId === String(opts.viewerUserId),
      deadline: deadlineLabel,
      deadlineIso: deadline,
      startDate: startRaw ? String(startRaw).slice(0, 10) : null,
      priority: String(task.priority ?? 'medium'),
      statusLabel: status.label,
      statusTone: status.tone,
      overdue,
      planId: opts.planId,
    });
  }

  return rows;
}

function flattenSummaryTasks(plan: PlanSummary): TaskLike[] {
  const tasks: TaskLike[] = [];
  const visit = (task: PlanTask & TaskLike) => {
    tasks.push(task);
  };

  plan.tasks?.forEach(visit);
  const visitKr = (kr: KeyResult) => {
    kr.tasks?.forEach(visit);
    kr.milestones?.forEach((m) => {
      m.tasks?.forEach(visit);
      m.parentTask?.forEach((p: any) => p.tasks?.forEach(visit));
    });
    kr.parentTask?.forEach((p: any) => p.tasks?.forEach(visit));
  };
  plan.keyResults?.forEach(visitKr);
  return tasks;
}

export function collectTeamAssignedTasksFromSummaries(
  planSummaries: PlanSummary[],
  viewerUserId: string,
  resolveUserName: (userId: string) => string,
  opts?: { assignedByUserId?: string },
): TeamTaskRow[] {
  const rows: TeamTaskRow[] = [];
  for (const plan of planSummaries) {
    const ownerId = String(plan.ownerUserId ?? '');
    if (!ownerId) continue;
    rows.push(
      ...collectTeamAssignedFromTaskList(flattenSummaryTasks(plan), {
        viewerUserId,
        assigneeUserId: ownerId,
        assigneeName: resolveUserName(ownerId),
        planId: plan.id,
        resolveUserName,
        assignedByUserId: opts?.assignedByUserId,
      }),
    );
  }
  return rows;
}

export function collectTeamAssignedTasksFromMockPlans(
  plansByUserId: Record<
    string,
    {
      userId: string;
      planId: string;
      activeTasks: MockPlanTask[];
      archivedTasks?: MockPlanTask[];
    }
  >,
  viewerUserId: string,
  resolveUserName: (userId: string) => string,
  opts?: { assignedByUserId?: string },
): TeamTaskRow[] {
  const rows: TeamTaskRow[] = [];
  for (const plan of Object.values(plansByUserId)) {
    const ownerId = String(plan.userId ?? '');
    if (!ownerId) continue;
    const assignedTasks = [...plan.activeTasks, ...(plan.archivedTasks ?? [])];
    rows.push(
      ...collectTeamAssignedFromTaskList(assignedTasks, {
        viewerUserId,
        assigneeUserId: ownerId,
        assigneeName: resolveUserName(ownerId),
        planId: plan.planId,
        resolveUserName,
        assignedByUserId: opts?.assignedByUserId,
      }),
    );
  }
  return rows;
}

/** Tasks assigned by the viewer to teammates. */
export function collectDelegatedTasksFromSummaries(
  planSummaries: PlanSummary[],
  viewerUserId: string,
  resolveAssigneeName: (userId: string) => string,
): TeamTaskRow[] {
  return collectTeamAssignedTasksFromSummaries(
    planSummaries,
    viewerUserId,
    resolveAssigneeName,
    { assignedByUserId: viewerUserId },
  ).filter((row) => row.assigneeUserId !== viewerUserId);
}

export function collectDelegatedTasksFromMockPlans(
  plansByUserId: Record<
    string,
    {
      userId: string;
      planId: string;
      activeTasks: MockPlanTask[];
      archivedTasks?: MockPlanTask[];
    }
  >,
  viewerUserId: string,
  resolveAssigneeName: (userId: string) => string,
): TeamTaskRow[] {
  return collectTeamAssignedTasksFromMockPlans(
    plansByUserId,
    viewerUserId,
    resolveAssigneeName,
    { assignedByUserId: viewerUserId },
  ).filter((row) => row.assigneeUserId !== viewerUserId);
}

export function teamTaskMatchesDurationFilter(
  row: TeamTaskRow,
  filter: PlanFilterValue,
  historyRange: { from: string; to: string },
  today: string = todayIso(),
): boolean {
  if (isPlanHistoryFilter(filter)) {
    return taskInHistoryRange(
      { start: row.startDate, deadline: row.deadlineIso },
      historyRange.from,
      historyRange.to,
    );
  }

  const date = row.deadlineIso ?? row.startDate;
  if (!date) return filter !== 'daily';

  return reportedAtMatchesDurationFilter(date, filter, today, historyRange);
}

/** @deprecated Use teamTaskMatchesDurationFilter */
export const delegatedTaskMatchesDurationFilter = teamTaskMatchesDurationFilter;

export function sortTeamTasks(rows: TeamTaskRow[]): TeamTaskRow[] {
  return [...rows].sort((a, b) => {
    const aReported = a.statusLabel === 'Reported' ? 1 : 0;
    const bReported = b.statusLabel === 'Reported' ? 1 : 0;
    if (aReported !== bReported) return aReported - bReported;
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
    return a.assigneeName.localeCompare(b.assigneeName);
  });
}

/** @deprecated Use sortTeamTasks */
export const sortDelegatedTasks = sortTeamTasks;
