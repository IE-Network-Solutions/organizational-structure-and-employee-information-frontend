import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import { todayIso } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import {
  UNLINKED_KR_ID,
  type MockPlanTask,
  type MockUserPlan,
} from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import { filterMockTasksByDuration } from './mockDurationFilter';
import {
  periodNameToKind,
  reportedAtMatchesDurationFilter,
  type PlanFilterValue,
} from '../planning/durationFilter';

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
    ? plan.activeTasks.find((t) => t.id === task.parentId) ||
      plan.archivedTasks.find((t) => t.id === task.parentId)
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

function reportedAtByTaskId(plan: MockUserPlan): Map<string, string> {
  const map = new Map<string, string>();
  // Oldest first so later submissions overwrite with newer dates when re-reported.
  const chronological = [...plan.reportHistory].sort((a, b) =>
    String(a.submittedAt).localeCompare(String(b.submittedAt)),
  );
  for (const record of chronological) {
    for (const taskId of record.taskIds) {
      map.set(taskId, record.submittedAt);
    }
  }
  return map;
}

export function mockPlansToReportingItems(
  plans: MockUserPlan[],
  durationFilter: PlanFilterValue,
  today: string = todayIso(),
  historyRange?: { from: string; to: string },
): any[] {
  return plans.flatMap((plan) => {
    if (plan.reportHistory.length === 0) return [];

    const reportedAtMap = reportedAtByTaskId(plan);
    const filtered = plan.archivedTasks.filter((task) => {
      if (!reportedAtMap.has(task.id)) return false;
      return reportedAtMatchesDurationFilter(
        reportedAtMap.get(task.id),
        durationFilter,
        today,
        historyRange,
      );
    });
    if (filtered.length === 0) return [];

    const latestSubmittedAt = filtered
      .map((t) => reportedAtMap.get(t.id) || '')
      .filter(Boolean)
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
        plan: {
          id: plan.planId,
          isReportValidated: true,
        },
        _periodName: periodName,
        reportTask: filtered.map((t) => {
          const apiTask = mockTaskToApiTask(t, plan);
          const reportedAt = reportedAtMap.get(t.id) || latestSubmittedAt;
          return {
            id: `rt-${t.id}`,
            planTaskId: t.id,
            status: t.done ? 'Done' : 'Not',
            isAchieved: !!t.done,
            actualValue: t.actualValue ?? 0,
            customReason: t.reportNote ?? '',
            weight: typeof t.weight === 'number' ? t.weight : 0,
            createdAt: reportedAt,
            reportedAt,
            planTask: {
              ...apiTask,
              id: t.id,
              task: t.title,
              taskName: t.title,
              targetValue:
                typeof t.targetValue === 'number'
                  ? t.targetValue
                  : typeof t.weight === 'number'
                    ? t.weight
                    : 0,
            },
          };
        }),
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

/** Single-plan repository title: "My Plan"/"My Report" for self, "{Name}'s …" for others. */
export function userPlanDisplayTitle(
  planUserId: string,
  currentUserId: string,
  ownerName?: string,
  displayName?: string,
  entity: 'plan' | 'report' = 'plan',
): string {
  const noun = entity === 'report' ? 'Report' : 'Plan';
  if (
    planUserId &&
    currentUserId &&
    String(planUserId) === String(currentUserId)
  ) {
    return `My ${noun}`;
  }
  const first =
    (displayName && String(displayName).trim()) ||
    (ownerName && String(ownerName).trim().split(/\s+/)[0]) ||
    'User';
  return `${first}'s ${noun}`;
}
