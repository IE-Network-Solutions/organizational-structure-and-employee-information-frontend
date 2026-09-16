import {
  formatDelegatedDeadlineLabel,
  type TeamTaskRow,
} from './delegatedTaskUtils';
import { resolvePlanningPersonLabel } from './assigneeChipRoster';
import type { PlanSummary } from '../types';
import type { MockPlanTask } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';

export type PlanCardIndicatorTone =
  | 'default'
  | 'warning'
  | 'success'
  | 'danger';

export type PlanCardTaskTableRow = TeamTaskRow & {
  rawTask: Record<string, unknown>;
  mockTask: MockPlanTask | null;
  approvalLabel: string;
  approvalTone: PlanCardIndicatorTone;
  taskStatusLabel: string;
  taskStatusTone: PlanCardIndicatorTone;
};

function taskTitle(task: Record<string, unknown>): string {
  return String(
    task.title ?? task.task ?? task.taskName ?? task.name ?? 'Untitled task',
  ).trim();
}

function taskPriority(task: Record<string, unknown>): string {
  return String(task.priority ?? 'medium');
}

export function taskDescriptionFromRaw(task: Record<string, unknown>): string {
  const desc = task.description ?? task.taskDescription;
  return typeof desc === 'string' ? desc.trim() : '';
}

function resolveApproval(task: Record<string, unknown>): {
  label: string;
  tone: PlanCardIndicatorTone;
} {
  if (task.isPendingApproval) {
    return { label: 'Open', tone: 'warning' };
  }
  return { label: 'Closed', tone: 'success' };
}

export function isPlanCardTaskMarkedReported(
  task: Record<string, unknown>,
): boolean {
  if (task.isReported) return true;
  const status = String(task.status ?? '');
  if (status === 'pre_achieved' || status === 'completed') return true;
  return Boolean(task.done);
}

function resolveTaskStatus(task: Record<string, unknown>): {
  label: string;
  tone: PlanCardIndicatorTone;
} {
  if (task.isLocked) {
    return { label: 'Locked', tone: 'default' };
  }
  if (isPlanCardTaskMarkedReported(task)) {
    return { label: 'Reported', tone: 'success' };
  }
  if (task.isPendingApproval) {
    return { label: 'Pending', tone: 'warning' };
  }
  return { label: 'In progress', tone: 'default' };
}

export function planTaskToTableRow(
  task: Record<string, unknown>,
  plan: PlanSummary,
  resolveUserName: (userId: string) => string,
  mockTask: MockPlanTask | null = null,
  viewerUserId?: string,
): PlanCardTaskTableRow {
  const assigneeUserId = String(plan.ownerUserId ?? '');
  const assignedByUserId = task.assignedByUserId
    ? String(task.assignedByUserId)
    : assigneeUserId;
  const deadlineIso =
    String(task.deadline ?? task.endDate ?? mockTask?.deadline ?? '').slice(
      0,
      10,
    ) || null;
  const startRaw = task.startDate ?? task.start ?? mockTask?.start;
  const { label: deadlineLabel, overdue } =
    formatDelegatedDeadlineLabel(deadlineIso);
  const approval = resolveApproval(task);
  const taskStatus = resolveTaskStatus(task);
  const viewerId = viewerUserId ?? assigneeUserId;

  return {
    id: String(task.id),
    title: taskTitle(task),
    assigneeUserId,
    assigneeName: resolvePlanningPersonLabel(
      assigneeUserId,
      viewerId,
      plan.owner?.name ?? resolveUserName(assigneeUserId),
    ),
    assignedByUserId,
    assignedByName: resolvePlanningPersonLabel(
      assignedByUserId,
      viewerId,
      resolveUserName(assignedByUserId),
    ),
    assignedByMe: assignedByUserId !== assigneeUserId,
    deadline: deadlineLabel,
    deadlineIso,
    startDate: startRaw ? String(startRaw).slice(0, 10) : null,
    priority: taskPriority(task),
    statusLabel: taskStatus.label,
    statusTone: taskStatus.tone,
    approvalLabel: approval.label,
    approvalTone: approval.tone,
    taskStatusLabel: taskStatus.label,
    taskStatusTone: taskStatus.tone,
    overdue,
    planId: plan.id,
    rawTask: task,
    mockTask,
  };
}

export function formatPlanCardPriorityLabel(priority: string): string {
  const key = priority.toLowerCase();
  if (key === 'priority') return 'Urgent';
  if (key === 'high') return 'High';
  if (key === 'medium') return 'Medium';
  if (key === 'low') return 'Low';
  return priority;
}
