import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import { todayIso } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import {
  UNLINKED_KR_ID,
  type MockPlanTask,
  type MockUserPlan,
} from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import { filterMockTasksByDuration } from './mockDurationFilter';
import { periodNameToKind } from '../planning/durationFilter';

export function userIdFromMockPlanId(planId: string): string | null {
  if (planId.startsWith('plan-')) return planId.slice('plan-'.length);
  return null;
}

export function resolveMockUserIds(
  selectedUser: string[],
  currentUserId: string,
  allEmployeeIds: string[] = [],
): string[] {
  const ids = selectedUser.filter(
    (id) => id && id !== 'all' && id !== 'subordinate',
  );
  if (ids.length > 0) return ids;
  if (selectedUser.includes('all') && allEmployeeIds.length > 0) {
    return Array.from(new Set(allEmployeeIds));
  }
  return currentUserId ? [currentUserId] : [];
}

function kindToPeriodName(kind: DeadlineKind): string {
  if (kind === 'daily') return 'Daily';
  if (kind === 'month') return 'Monthly';
  return 'Weekly';
}

function mockTaskToApiTask(task: MockPlanTask, plan: MockUserPlan) {
  const krId =
    task.keyResultId && task.keyResultId !== UNLINKED_KR_ID
      ? task.keyResultId
      : UNLINKED_KR_ID;
  const parent = task.parentId
    ? plan.activeTasks.find((t) => t.id === task.parentId)
    : null;

  return {
    id: task.id,
    task: task.title,
    taskName: task.title,
    priority: task.priority ?? 'medium',
    weight: typeof task.weight === 'number' ? task.weight : 0,
    targetValue: task.actualValue ?? 0,
    status: task.done ? 'pre_achieved' : 'pre_pending',
    achieveMK: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startDate: task.start,
    endDate: task.deadline,
    deadline: task.deadline,
    isPendingApproval: task.isPendingApproval,
    keyResultId: krId,
    kind: task.kind,
    parentId: task.parentId,
    keyResult:
      krId === UNLINKED_KR_ID
        ? { id: UNLINKED_KR_ID, title: 'General (no key result)' }
        : { id: krId, title: task.keyResultTitle ?? 'Key result' },
    parentTask: parent ? { id: parent.id, task: parent.title } : null,
    milestone: null,
  };
}

function mockTaskToReportSourceTask(task: MockPlanTask, plan: MockUserPlan) {
  const apiTask = mockTaskToApiTask(task, plan);
  return {
    ...apiTask,
    keyResultId: apiTask.keyResultId,
  };
}

export function mockPlansToActivePlanningItems(
  plans: MockUserPlan[],
  /** When omitted, include every active task so each plan card can filter locally. */
  durationKind?: DeadlineKind,
  today: string = todayIso(),
): any[] {
  return plans.map((plan) => {
    const source = plan.activeTasks.filter((t) => !t.isReported);
    const filtered =
      durationKind == null
        ? source
        : filterMockTasksByDuration(source, durationKind, today);

    const roots = filtered.filter((t) => !t.parentId);
    const periodName =
      roots.length > 0 ? kindToPeriodName(roots[0].kind) : 'Weekly';

    return {
      id: plan.planId,
      userId: plan.userId,
      isValidated: plan.isValidated,
      isReported: false,
      pendingReopenRequest: plan.pendingReopenRequest,
      createdAt: new Date().toISOString(),
      _periodName: periodName,
      displayName: plan.displayName,
      tasks: filtered.map((t) => mockTaskToApiTask(t, plan)),
    };
  });
}

export function mockPlansToReportingItems(
  plans: MockUserPlan[],
  durationKind: DeadlineKind,
  today: string = todayIso(),
): any[] {
  void durationKind;
  void today;
  return plans.flatMap((plan) => {
    if (plan.reportHistory.length === 0) return [];

    const reportedTaskIds = new Set(
      plan.reportHistory.flatMap((record) => record.taskIds),
    );
    const filtered = plan.archivedTasks.filter((task) =>
      reportedTaskIds.has(task.id),
    );
    if (filtered.length === 0) return [];

    const latestSubmittedAt = plan.reportHistory
      .map((record) => record.submittedAt)
      .sort((a, b) => String(b).localeCompare(String(a)))[0];

    const periodName =
      filtered.length > 0 ? kindToPeriodName(filtered[0].kind) : 'Weekly';

    return [
      {
        id: `report-plan-${plan.userId}`,
        planId: plan.planId,
        userId: plan.userId,
        isValidated: true,
        isReported: true,
        createdAt: latestSubmittedAt,
        _periodName: periodName,
        tasks: filtered.map((t) => ({
          ...mockTaskToApiTask(t, plan),
          status: t.done ? 'Done' : 'Not',
          isAchieved: t.done,
          actualValue: t.actualValue ?? 0,
          customReason: t.reportNote ?? '',
        })),
      },
    ];
  });
}

export function mockActiveTasksForReport(
  plan: MockUserPlan | null | undefined,
): any[] {
  if (!plan) return [];
  return plan.activeTasks
    .filter((t) => !t.isReported)
    .map((t) => mockTaskToReportSourceTask(t, plan));
}

export function cadenceFromPeriodName(name?: string) {
  const kind = periodNameToKind(name);
  if (kind === 'daily') return 'daily';
  if (kind === 'month') return 'monthly';
  return 'weekly';
}

/** Single-plan repository title: "My Plan" for self, "{Name}'s Plan" for others. */
export function userPlanDisplayTitle(
  planUserId: string,
  currentUserId: string,
  ownerName?: string,
  displayName?: string,
): string {
  if (
    planUserId &&
    currentUserId &&
    String(planUserId) === String(currentUserId)
  ) {
    return 'My Plan';
  }
  const first =
    (displayName && String(displayName).trim()) ||
    (ownerName && String(ownerName).trim().split(/\s+/)[0]) ||
    'User';
  return `${first}'s Plan`;
}
