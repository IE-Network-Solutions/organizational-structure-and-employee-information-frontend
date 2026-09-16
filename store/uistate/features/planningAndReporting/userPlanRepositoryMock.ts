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
import {
  childCapForParent,
  childKindForParent,
  countChildren,
  resolveHierarchyParentKind,
  MOCK_KEY_RESULTS,
  MOCK_PLAN_SEED_VERSION,
  mockSeedPeerDelegatorForOwner,
  mockSeedPlanIsClosed,
  mockTeamMemberIds,
  UNLINKED_KR_ID,
} from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/prototype/mockPlanningConstants';

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export type MockTaskComment = {
  id: string;
  text: string;
  authorUserId: string;
  createdAt: string;
};

export type MockPlanTask = DeadlineTask & {
  /** Optional detail entered when creating the task. */
  description?: string;
  isReported?: boolean;
  /** Shelved without a formal report submit. */
  isManuallyArchived?: boolean;
  isPendingApproval?: boolean;
  /** Report submitted; awaiting manager validation on Reports tab. */
  isPendingReportApproval?: boolean;
  /** Manager lock — independent of children. */
  isLocked?: boolean;
  lockComment?: string;
  comments?: MockTaskComment[];
  priority?: string;
  weight?: number;
  /** Metric target when linked to a key result. */
  targetValue?: number;
  keyResultId?: string | null;
  reportNote?: string;
  actualValue?: number | null;
  /** Manager who delegated this task onto the assignee's plan. */
  assignedByUserId?: string;
};

export type MockReportRecord = {
  id: string;
  submittedAt: string;
  taskIds: string[];
  taskTitles: string[];
};

export type MockUserPlan = {
  userId: string;
  displayName: string;
  planId: string;
  isValidated: boolean;
  activeTasks: MockPlanTask[];
  archivedTasks: MockPlanTask[];
  /** Submitted reports awaiting manager validation (Reports tab Pending section). */
  pendingReportTasks: MockPlanTask[];
  reportHistory: MockReportRecord[];
  pendingReopenRequest: boolean;
  /** When set, ensurePlan rebuilds if it does not match MOCK_PLAN_SEED_VERSION. */
  seedVersion?: number;
  /** Viewer who seeded manager-delegated tasks onto this plan. */
  seedViewerUserId?: string | null;
};

function krTitleForId(
  keyResultId: string | null | undefined,
): string | undefined {
  if (!keyResultId || keyResultId === UNLINKED_KR_ID) return undefined;
  return MOCK_KEY_RESULTS.find((k) => k.id === keyResultId)?.title;
}

function buildMockDelegatedSeedTasks(
  ownerUserId: string,
  today: string,
  tid: (suffix: string) => string,
  viewerUserId?: string | null,
): MockPlanTask[] {
  const plus = (days: number) => formatDate(parseDate(today).add(days, 'day'));
  const owner = String(ownerUserId);
  const tasks: MockPlanTask[] = [];
  const peerDelegator = mockSeedPeerDelegatorForOwner(owner);
  if (peerDelegator && String(peerDelegator) !== owner) {
    tasks.push({
      id: tid('delegated-peer-1'),
      title: 'Cross-team follow-up',
      start: today,
      deadline: today,
      spanDays: 1,
      kind: 'daily',
      parentId: null,
      done: false,
      isLocked: true,
      assignedByUserId: String(peerDelegator),
      keyResultId: UNLINKED_KR_ID,
      priority: 'medium',
      weight: 8,
    });
  }

  const viewer = viewerUserId ? String(viewerUserId) : null;
  const team = mockTeamMemberIds();
  const ownerIdx = team.indexOf(owner);

  if (viewer && viewer !== owner && ownerIdx >= 0) {
    const viewerDelegations: Array<{
      suffix: string;
      title: string;
      start: string;
      deadline: string;
      priority: string;
      weight: number;
      kind: 'daily' | 'week';
    }> =
      ownerIdx === 0
        ? [
            {
              suffix: 'delegated-viewer-1',
              title: 'Manager priority item',
              start: today,
              deadline: today,
              priority: 'high',
              weight: 10,
              kind: 'daily',
            },
            {
              suffix: 'delegated-viewer-2',
              title: 'Review sprint blockers',
              start: today,
              deadline: plus(3),
              priority: 'medium',
              weight: 8,
              kind: 'daily',
            },
          ]
        : ownerIdx === 1
          ? [
              {
                suffix: 'delegated-viewer-1',
                title: 'Prepare client demo',
                start: plus(-1),
                deadline: plus(1),
                priority: 'high',
                weight: 12,
                kind: 'daily',
              },
              {
                suffix: 'delegated-viewer-overdue',
                title: 'Submit weekly status',
                start: plus(-5),
                deadline: plus(-2),
                priority: 'high',
                weight: 9,
                kind: 'daily',
              },
            ]
          : ownerIdx === 2
            ? [
                {
                  suffix: 'delegated-viewer-1',
                  title: 'Update design specs',
                  start: today,
                  deadline: today,
                  priority: 'medium',
                  weight: 7,
                  kind: 'daily',
                },
                {
                  suffix: 'delegated-viewer-2',
                  title: 'Sync with vendor',
                  start: plus(1),
                  deadline: plus(5),
                  priority: 'low',
                  weight: 5,
                  kind: 'week',
                },
              ]
            : [
                {
                  suffix: 'delegated-viewer-1',
                  title: 'Ops checklist review',
                  start: today,
                  deadline: today,
                  priority: 'medium',
                  weight: 6,
                  kind: 'daily',
                },
                {
                  suffix: 'delegated-viewer-overdue',
                  title: 'Incident follow-up',
                  start: plus(-4),
                  deadline: plus(-1),
                  priority: 'high',
                  weight: 11,
                  kind: 'daily',
                },
              ];

    for (const item of viewerDelegations) {
      const hierarchyKind = resolveHierarchyParentKind({
        kind: item.kind,
        start: item.start,
        deadline: item.deadline,
      });
      tasks.push({
        id: tid(item.suffix),
        title: item.title,
        start: item.start,
        deadline: item.deadline,
        spanDays: spanDays(item.start, item.deadline) ?? 1,
        kind: hierarchyKind,
        parentId: null,
        done: false,
        isLocked: true,
        assignedByUserId: viewer,
        keyResultId: UNLINKED_KR_ID,
        priority: item.priority,
        weight: item.weight,
      });
    }
  }

  return tasks;
}

const buildMockUserPlan = (
  userId: string,
  displayName: string,
  today: string,
  viewerUserId?: string | null,
): MockUserPlan => {
  const plus = (days: number) => formatDate(parseDate(today).add(days, 'day'));
  const monthStart = plus(-2);
  const monthEnd = plus(15);
  const uid = String(userId);
  const tid = (suffix: string) => `${uid}-${suffix}`;
  const monthId = tid('month-1');

  const activeTasks: MockPlanTask[] = [
    {
      id: tid('today-1'),
      title: 'Prep standup notes',
      start: today,
      deadline: today,
      spanDays: 1,
      kind: 'daily',
      parentId: null,
      done: false,
      keyResultId: UNLINKED_KR_ID,
      priority: 'high',
      weight: 10,
    },
    {
      id: tid('overdue-1'),
      title: 'Send client status email',
      start: plus(-4),
      deadline: plus(-2),
      spanDays: 3,
      kind: 'daily',
      parentId: null,
      done: false,
      keyResultId: 'kr-team-cadence',
      keyResultTitle: 'Team cadence',
      priority: 'high',
      weight: 15,
    },
    {
      id: tid('week-1'),
      title: 'Sprint demo deck',
      start: plus(-2),
      deadline: plus(2),
      spanDays: 5,
      kind: 'week',
      parentId: null,
      done: false,
      keyResultId: 'kr-q-demo',
      keyResultTitle: 'Q-demo delivery',
      priority: 'medium',
      weight: 20,
    },
    {
      id: tid('daily-under-sprint-1'),
      title: 'Outline demo narrative',
      start: today,
      deadline: today,
      spanDays: 1,
      kind: 'daily',
      parentId: tid('week-1'),
      done: false,
      keyResultId: 'kr-q-demo',
      keyResultTitle: 'Q-demo delivery',
      priority: 'high',
      weight: 3,
    },
    {
      id: tid('daily-under-sprint-2'),
      title: 'Build slide skeleton',
      start: plus(1),
      deadline: plus(1),
      spanDays: 1,
      kind: 'daily',
      parentId: tid('week-1'),
      done: false,
      keyResultId: UNLINKED_KR_ID,
      priority: 'medium',
      weight: 4,
    },
    {
      id: tid('daily-under-sprint-3'),
      title: 'Rehearse with team',
      start: plus(2),
      deadline: plus(2),
      spanDays: 1,
      kind: 'daily',
      parentId: tid('week-1'),
      done: false,
      keyResultId: UNLINKED_KR_ID,
      priority: 'medium',
      weight: 3,
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
      keyResultId: 'kr-q-demo',
      keyResultTitle: 'Q-demo delivery',
      priority: 'medium',
      weight: 25,
    },
    {
      id: tid('week-slice-1'),
      title: 'Cleanup: week 1',
      start: plus(0),
      deadline: plus(6),
      spanDays: 7,
      kind: 'week',
      parentId: monthId,
      done: false,
      keyResultId: UNLINKED_KR_ID,
      priority: 'low',
      weight: 5,
    },
    {
      id: tid('daily-under-week-1'),
      title: 'Cleanup: Monday triage',
      start: today,
      deadline: today,
      spanDays: 1,
      kind: 'daily',
      parentId: tid('week-slice-1'),
      done: false,
      keyResultId: 'kr-q-demo',
      keyResultTitle: 'Q-demo delivery',
      priority: 'medium',
      weight: 2,
    },
    {
      id: tid('daily-under-week-2'),
      title: 'Cleanup: archive old tickets',
      start: plus(1),
      deadline: plus(1),
      spanDays: 1,
      kind: 'daily',
      parentId: tid('week-slice-1'),
      done: false,
      keyResultId: UNLINKED_KR_ID,
      priority: 'low',
      weight: 2,
    },
    {
      id: tid('daily-under-week-3'),
      title: 'Cleanup: update runbooks',
      start: plus(2),
      deadline: plus(2),
      spanDays: 1,
      kind: 'daily',
      parentId: tid('week-slice-1'),
      done: false,
      keyResultId: UNLINKED_KR_ID,
      priority: 'low',
      weight: 2,
    },
    {
      id: tid('daily-under-week-4'),
      title: 'Cleanup: close stale PRs',
      start: plus(3),
      deadline: plus(3),
      spanDays: 1,
      kind: 'daily',
      parentId: tid('week-slice-1'),
      done: false,
      keyResultId: UNLINKED_KR_ID,
      priority: 'medium',
      weight: 2,
    },
    {
      id: tid('future-1'),
      title: 'Draft next quarter goals',
      start: plus(5),
      deadline: plus(12),
      spanDays: 8,
      kind: 'week',
      parentId: null,
      done: false,
      keyResultId: UNLINKED_KR_ID,
      priority: 'medium',
      weight: 15,
    },
    {
      id: tid('unlinked-1'),
      title: 'Update documentation',
      start: plus(1),
      deadline: plus(3),
      spanDays: 3,
      kind: 'week',
      parentId: null,
      done: false,
      keyResultId: UNLINKED_KR_ID,
      priority: 'low',
      weight: 5,
    },
    {
      id: tid('pending-1'),
      title: 'New overlapping task',
      start: plus(0),
      deadline: plus(4),
      spanDays: 5,
      kind: 'week',
      parentId: null,
      done: false,
      isPendingApproval: true,
      keyResultId: UNLINKED_KR_ID,
      priority: 'medium',
      weight: 10,
    },
    {
      id: tid('pending-2'),
      title: 'Follow-up stakeholder sync',
      start: plus(1),
      deadline: plus(3),
      spanDays: 3,
      kind: 'daily',
      parentId: null,
      done: false,
      isPendingApproval: true,
      keyResultId: UNLINKED_KR_ID,
      priority: 'high',
      weight: 10,
    },
    ...buildMockDelegatedSeedTasks(uid, today, tid, viewerUserId),
  ];

  // ── Pre-seeded report history ──────────────────────────────────────────────
  // Give every user two already-submitted reports so the Reports tab has data
  // without the user having to manually check & report tasks first.

  // Report submission dates drive Reports duration filter (Today / Week / Month).
  // Seed spans today + earlier this week + prior week so each filter has data.
  const pastDaily1: MockPlanTask = {
    id: tid('arch-d1'),
    title: 'Daily standup sync',
    start: plus(0),
    deadline: plus(0),
    spanDays: 1,
    kind: 'daily',
    parentId: null,
    done: true,
    isReported: true,
    keyResultId: UNLINKED_KR_ID,
    priority: 'medium',
    weight: 3,
    actualValue: 1,
  };

  const pastDaily2: MockPlanTask = {
    id: tid('arch-d2'),
    title: 'Write unit tests for auth module',
    start: plus(0),
    deadline: plus(0),
    spanDays: 1,
    kind: 'daily',
    parentId: null,
    done: true,
    isReported: true,
    keyResultId: 'kr-q-demo',
    keyResultTitle: 'Q-demo delivery',
    priority: 'high',
    weight: 5,
    actualValue: 1,
  };

  const pastWeekly1: MockPlanTask = {
    id: tid('arch-w1'),
    title: 'Deliver initial feature prototype',
    start: plus(-14),
    deadline: plus(-8),
    spanDays: 7,
    kind: 'week',
    parentId: null,
    done: true,
    isReported: true,
    keyResultId: 'kr-q-demo',
    keyResultTitle: 'Q-demo delivery',
    priority: 'high',
    weight: 20,
    actualValue: 100,
  };

  const pastDaily3: MockPlanTask = {
    id: tid('arch-d3'),
    title: 'Reviewed PR and left feedback',
    start: plus(-2),
    deadline: plus(-2),
    spanDays: 1,
    kind: 'daily',
    parentId: null,
    done: false,
    isReported: true,
    keyResultId: UNLINKED_KR_ID,
    priority: 'low',
    weight: 2,
    actualValue: 0,
    reportNote: 'Partially done – pending second pass',
  };

  /** Manager-closed reported tasks — visible under Status → Reported filter. */
  const managerClosedToday: MockPlanTask = {
    id: tid('mgr-closed-today'),
    title: 'Closed: daily checkpoint',
    start: plus(0),
    deadline: plus(0),
    spanDays: 1,
    kind: 'daily',
    parentId: null,
    done: true,
    isReported: true,
    isLocked: true,
    lockComment: 'Approved and closed by manager',
    keyResultId: UNLINKED_KR_ID,
    priority: 'medium',
    weight: 5,
    actualValue: 1,
  };

  const managerClosedWeek: MockPlanTask = {
    id: tid('mgr-closed-week'),
    title: 'Closed: sprint wrap-up notes',
    start: plus(-3),
    deadline: plus(-1),
    spanDays: 3,
    kind: 'daily',
    parentId: null,
    done: true,
    isReported: true,
    isLocked: true,
    lockComment: 'Locked after report review',
    keyResultId: 'kr-team-cadence',
    keyResultTitle: 'Team cadence',
    priority: 'high',
    weight: 8,
    actualValue: 1,
  };

  const managerClosedMonth: MockPlanTask = {
    id: tid('mgr-closed-month'),
    title: 'Closed: monthly retrospective',
    start: plus(-10),
    deadline: plus(-5),
    spanDays: 6,
    kind: 'week',
    parentId: null,
    done: true,
    isReported: true,
    isLocked: true,
    lockComment: 'Closed after manager sign-off',
    keyResultId: 'kr-q-demo',
    keyResultTitle: 'Q-demo delivery',
    priority: 'medium',
    weight: 12,
    actualValue: 100,
  };

  const managerClosedDelegated: MockPlanTask | null =
    viewerUserId && String(viewerUserId) !== uid
      ? {
          id: tid('mgr-closed-delegated'),
          title: 'Closed: delegated deliverable',
          start: plus(0),
          deadline: plus(0),
          spanDays: 1,
          kind: 'daily',
          parentId: null,
          done: true,
          isReported: true,
          isLocked: true,
          assignedByUserId: String(viewerUserId),
          lockComment: 'Manager closed delegated task',
          keyResultId: UNLINKED_KR_ID,
          priority: 'high',
          weight: 6,
          actualValue: 1,
        }
      : null;

  const archivedTasks: MockPlanTask[] = [
    pastDaily1,
    pastDaily2,
    pastWeekly1,
    pastDaily3,
    managerClosedToday,
    managerClosedWeek,
    managerClosedMonth,
    ...(managerClosedDelegated ? [managerClosedDelegated] : []),
  ];

  const reportRecordToday: MockReportRecord = {
    id: `rep-${uid}-today`,
    submittedAt: plus(0) + 'T09:00:00.000Z',
    taskIds: [
      pastDaily1.id,
      pastDaily2.id,
      managerClosedToday.id,
      ...(managerClosedDelegated ? [managerClosedDelegated.id] : []),
    ],
    taskTitles: [
      pastDaily1.title,
      pastDaily2.title,
      managerClosedToday.title,
      ...(managerClosedDelegated ? [managerClosedDelegated.title] : []),
    ],
  };

  const reportRecordThisWeek: MockReportRecord = {
    id: `rep-${uid}-week`,
    submittedAt: plus(-2) + 'T17:30:00.000Z',
    taskIds: [pastDaily3.id, managerClosedWeek.id],
    taskTitles: [pastDaily3.title, managerClosedWeek.title],
  };

  const reportRecordPriorWeek: MockReportRecord = {
    id: `rep-${uid}-prior`,
    submittedAt: plus(-8) + 'T14:00:00.000Z',
    taskIds: [pastWeekly1.id],
    taskTitles: [pastWeekly1.title],
  };

  const pendingReportTask1: MockPlanTask = {
    id: tid('preport-1'),
    title: 'Submit Q-demo metrics',
    start: plus(0),
    deadline: plus(0),
    spanDays: 1,
    kind: 'daily',
    parentId: null,
    done: true,
    isPendingReportApproval: true,
    keyResultId: 'kr-q-demo',
    keyResultTitle: 'Q-demo delivery',
    priority: 'high',
    weight: 8,
    actualValue: 85,
  };

  const pendingReportTask2: MockPlanTask = {
    id: tid('preport-2'),
    title: 'Document sprint outcomes',
    start: plus(0),
    deadline: plus(0),
    spanDays: 1,
    kind: 'daily',
    parentId: null,
    done: false,
    isPendingReportApproval: true,
    keyResultId: UNLINKED_KR_ID,
    priority: 'medium',
    weight: 5,
    actualValue: 0,
  };

  return {
    userId,
    displayName,
    planId: `plan-${userId}`,
    // Closed so the card shows Closed tasks + Pending (approval) tasks inside.
    isValidated: mockSeedPlanIsClosed(),
    activeTasks,
    archivedTasks,
    pendingReportTasks: [pendingReportTask1, pendingReportTask2],
    reportHistory: [
      reportRecordToday,
      reportRecordThisWeek,
      reportRecordPriorWeek,
    ],
    pendingReopenRequest: false,
    seedVersion: MOCK_PLAN_SEED_VERSION,
    seedViewerUserId: viewerUserId ?? null,
  };
};

export interface AppendMockTaskInput {
  title: string;
  start: string;
  deadline: string;
  description?: string;
  keyResultId?: string | null;
  priority?: string;
  parentId?: string | null;
  /** When set, task was delegated by a manager onto this user's plan. */
  assignedByUserId?: string;
}

interface UserPlanRepositoryState {
  plansByUserId: Record<string, MockUserPlan>;
  ensurePlan: (
    userId: string,
    displayName?: string,
    viewerUserId?: string | null,
  ) => MockUserPlan;
  getPlan: (userId: string) => MockUserPlan | null;
  getActiveTasks: (userId: string) => MockPlanTask[];
  appendTask: (
    userId: string,
    input: AppendMockTaskInput,
  ) => { ok: true; task: MockPlanTask } | { ok: false; error: string };
  approvePending: (userId: string) => { mergedCount: number };
  reportTasks: (
    userId: string,
    payload: Array<{
      taskId: string;
      status: 'Done' | 'Not';
      note?: string;
      actualValue?: number | null;
    }>,
  ) => void;
  requestReopen: (userId: string) => void;
  approveReopen: (userId: string) => void;
  openPlanDirect: (userId: string) => void;
  dismissReopenRequest: (userId: string) => void;
  togglePreAchieved: (userId: string, taskId: string) => void;
  removeTask: (userId: string, taskId: string) => void;
  lockTasks: (
    userId: string,
    taskIds: string[],
    comment?: string,
  ) => { lockedCount: number };
  unlockTask: (userId: string, taskId: string) => void;
  addTaskComment: (
    userId: string,
    taskId: string,
    text: string,
    authorUserId: string,
  ) => { ok: true } | { ok: false; error: string };
  /** Lock + validate pending report submissions (Reports tab Pending section). */
  validatePendingReportTasks: (
    userId: string,
    taskIds: string[],
    comment?: string,
  ) => { validatedCount: number };
  /** Move active (non-pending) tasks into history without a report submit. */
  archiveTasks: (
    userId: string,
    taskIds: string[],
  ) => { archivedCount: number };
}

export const useUserPlanRepositoryMock = create<UserPlanRepositoryState>()(
  devtools((set, get) => ({
    plansByUserId: {},
    ensurePlan: (userId, displayName = 'My', viewerUserId = null) => {
      const existing = get().plansByUserId[userId];
      const normalizedViewer = viewerUserId ? String(viewerUserId) : null;
      // Only rebuild when seed version or display name changes.
      // Do not wipe user-added tasks (UUID ids) or open/close state.
      const seedIsStale =
        !!existing &&
        (existing.seedVersion !== MOCK_PLAN_SEED_VERSION ||
          existing.displayName !== displayName ||
          (existing.seedViewerUserId ?? null) !== normalizedViewer);
      if (existing && !seedIsStale) return existing;
      const plan = buildMockUserPlan(
        userId,
        displayName,
        todayIso(),
        normalizedViewer,
      );
      set({
        plansByUserId: { ...get().plansByUserId, [userId]: plan },
      });
      return plan;
    },
    getPlan: (userId) => get().plansByUserId[userId] ?? null,
    getActiveTasks: (userId) => {
      const existing = get().plansByUserId[userId];
      const plan = get().ensurePlan(
        userId,
        existing?.displayName ?? 'My',
        existing?.seedViewerUserId ?? null,
      );
      return plan.activeTasks.filter((t) => !t.isReported);
    },
    appendTask: (userId, input) => {
      const existing = get().plansByUserId[userId];
      const plan = get().ensurePlan(
        userId,
        existing?.displayName ?? 'My',
        existing?.seedViewerUserId ?? null,
      );
      const trimmed = input.title.trim();
      if (!trimmed) return { ok: false, error: 'Title is required.' };
      const description = input.description?.trim() || undefined;
      const isDelegated =
        !!input.assignedByUserId &&
        String(input.assignedByUserId) !== String(userId);
      const delegationMeta = isDelegated
        ? {
            assignedByUserId: String(input.assignedByUserId),
            isLocked: true as const,
          }
        : {};
      const pendingMeta = isDelegated
        ? {}
        : ({ isPendingApproval: true as const } as const);
      const delegatedKeyResultId = isDelegated
        ? UNLINKED_KR_ID
        : (input.keyResultId ?? UNLINKED_KR_ID);

      if (input.parentId) {
        const parent = plan.activeTasks.find((t) => t.id === input.parentId);
        if (!parent) return { ok: false, error: 'Parent task not found.' };
        const parentHierarchyKind = resolveHierarchyParentKind(parent);
        const cap = childCapForParent(
          parentHierarchyKind,
          parent.start,
          parent.deadline,
        );
        const childKind = childKindForParent(parentHierarchyKind);
        if (!childKind) {
          return { ok: false, error: 'This task cannot have subtasks.' };
        }
        if (countChildren(plan.activeTasks, parent.id) >= cap) {
          return {
            ok: false,
            error: `Maximum ${cap} subtasks for this ${parent.kind} task.`,
          };
        }
        const validationParent: DeadlineTask = {
          ...parent,
          kind: parentHierarchyKind,
        };
        if (childKind === 'daily') {
          const valid = validateDailySubtask(validationParent, input.start);
          if (!valid.ok) return valid;
          const task: MockPlanTask = {
            id: newId(),
            title: trimmed,
            start: input.start,
            deadline: input.start,
            spanDays: 1,
            kind: 'daily',
            parentId: parent.id,
            done: false,
            ...pendingMeta,
            keyResultId: parent.keyResultId ?? null,
            keyResultTitle: parent.keyResultTitle,
            priority: input.priority ?? 'medium',
            description,
            ...delegationMeta,
          };
          set({
            plansByUserId: {
              ...get().plansByUserId,
              [userId]: {
                ...plan,
                activeTasks: [...plan.activeTasks, task],
              },
            },
          });
          return { ok: true, task };
        }
        const valid = validateWeeklySubtask(
          validationParent,
          input.start,
          input.deadline,
        );
        if (!valid.ok) return valid;
        const task: MockPlanTask = {
          id: newId(),
          title: trimmed,
          start: input.start,
          deadline: input.deadline,
          spanDays: valid.spanDays,
          kind: 'week',
          parentId: parent.id,
          done: false,
          ...pendingMeta,
          keyResultId: parent.keyResultId ?? null,
          keyResultTitle: parent.keyResultTitle,
          priority: input.priority ?? 'medium',
          description,
          ...delegationMeta,
        };
        set({
          plansByUserId: {
            ...get().plansByUserId,
            [userId]: {
              ...plan,
              activeTasks: [...plan.activeTasks, task],
            },
          },
        });
        return { ok: true, task };
      }

      const built = buildParentTask({
        id: newId(),
        title: trimmed,
        start: input.start,
        deadline: input.deadline,
        keyResultTitle: krTitleForId(input.keyResultId),
      });
      if (!built.ok) return built;
      const task: MockPlanTask = {
        ...built.task,
        ...pendingMeta,
        keyResultId: delegatedKeyResultId,
        keyResultTitle: krTitleForId(delegatedKeyResultId),
        priority: input.priority ?? 'medium',
        description,
        ...delegationMeta,
      };
      set({
        plansByUserId: {
          ...get().plansByUserId,
          [userId]: {
            ...plan,
            activeTasks: [...plan.activeTasks, task],
          },
        },
      });
      return { ok: true, task };
    },
    approvePending: (userId) => {
      const plan = get().plansByUserId[userId];
      if (!plan) return { mergedCount: 0 };
      const pending = plan.activeTasks.filter((t) => t.isPendingApproval);
      set({
        plansByUserId: {
          ...get().plansByUserId,
          [userId]: {
            ...plan,
            isValidated: true,
            activeTasks: plan.activeTasks.map((t) => ({
              ...t,
              isPendingApproval: false,
            })),
          },
        },
      });
      return { mergedCount: pending.length };
    },
    reportTasks: (userId, payload) => {
      const plan = get().plansByUserId[userId];
      if (!plan) return;
      const ids = new Set(payload.map((p) => p.taskId));
      const toArchive = plan.activeTasks
        .filter((t) => ids.has(t.id))
        .map((t) => {
          const row = payload.find((p) => p.taskId === t.id);
          return {
            ...t,
            isReported: true,
            done: row?.status === 'Done',
            reportNote: row?.note,
            actualValue: row?.actualValue ?? null,
          };
        });
      const remaining = plan.activeTasks.filter((t) => !ids.has(t.id));
      const record: MockReportRecord = {
        id: newId(),
        submittedAt: new Date().toISOString(),
        taskIds: payload.map((p) => p.taskId),
        taskTitles: toArchive.map((t) => t.title),
      };
      set({
        plansByUserId: {
          ...get().plansByUserId,
          [userId]: {
            ...plan,
            activeTasks: remaining,
            archivedTasks: [...plan.archivedTasks, ...toArchive],
            reportHistory: [record, ...plan.reportHistory],
          },
        },
      });
    },
    requestReopen: (userId) => {
      const plan = get().plansByUserId[userId];
      if (!plan || !plan.isValidated) return;
      set({
        plansByUserId: {
          ...get().plansByUserId,
          [userId]: { ...plan, pendingReopenRequest: true },
        },
      });
    },
    approveReopen: (userId) => {
      const plan = get().plansByUserId[userId];
      if (!plan) return;
      set({
        plansByUserId: {
          ...get().plansByUserId,
          [userId]: {
            ...plan,
            isValidated: false,
            pendingReopenRequest: false,
          },
        },
      });
    },
    openPlanDirect: (userId) => {
      const plan = get().plansByUserId[userId];
      if (!plan) return;
      set({
        plansByUserId: {
          ...get().plansByUserId,
          [userId]: {
            ...plan,
            isValidated: false,
            pendingReopenRequest: false,
          },
        },
      });
    },
    dismissReopenRequest: (userId) => {
      const plan = get().plansByUserId[userId];
      if (!plan) return;
      set({
        plansByUserId: {
          ...get().plansByUserId,
          [userId]: { ...plan, pendingReopenRequest: false },
        },
      });
    },
    togglePreAchieved: (userId, taskId) => {
      const plan = get().plansByUserId[userId];
      if (!plan) return;
      set({
        plansByUserId: {
          ...get().plansByUserId,
          [userId]: {
            ...plan,
            activeTasks: plan.activeTasks.map((t) =>
              t.id === taskId ? { ...t, done: !t.done } : t,
            ),
          },
        },
      });
    },
    removeTask: (userId, taskId) => {
      const plan = get().plansByUserId[userId];
      if (!plan) return;
      const removeIds = new Set<string>([taskId]);
      plan.activeTasks.forEach((t) => {
        if (t.parentId === taskId) removeIds.add(t.id);
      });
      set({
        plansByUserId: {
          ...get().plansByUserId,
          [userId]: {
            ...plan,
            activeTasks: plan.activeTasks.filter((t) => !removeIds.has(t.id)),
          },
        },
      });
    },
    lockTasks: (userId, taskIds, comment) => {
      const plan = get().plansByUserId[userId];
      if (!plan || taskIds.length === 0) return { lockedCount: 0 };
      const ids = new Set(taskIds);
      const note = comment?.trim() || undefined;
      let lockedCount = 0;
      const activeTasks = plan.activeTasks.map((t) => {
        if (!ids.has(t.id)) return t;
        lockedCount += 1;
        return {
          ...t,
          isLocked: true,
          lockComment: note,
          isPendingApproval: false,
        };
      });
      const pendingReportTasks = (plan.pendingReportTasks ?? []).map((t) => {
        if (!ids.has(t.id)) return t;
        lockedCount += 1;
        return {
          ...t,
          isLocked: true,
          lockComment: note,
        };
      });
      if (lockedCount === 0) return { lockedCount: 0 };
      set({
        plansByUserId: {
          ...get().plansByUserId,
          [userId]: {
            ...plan,
            activeTasks,
            pendingReportTasks,
          },
        },
      });
      return { lockedCount };
    },
    unlockTask: (userId, taskId) => {
      const plan = get().plansByUserId[userId];
      if (!plan) return;
      set({
        plansByUserId: {
          ...get().plansByUserId,
          [userId]: {
            ...plan,
            activeTasks: plan.activeTasks.map((t) =>
              t.id === taskId
                ? { ...t, isLocked: false, lockComment: undefined }
                : t,
            ),
            pendingReportTasks: (plan.pendingReportTasks ?? []).map((t) =>
              t.id === taskId
                ? { ...t, isLocked: false, lockComment: undefined }
                : t,
            ),
          },
        },
      });
    },
    addTaskComment: (userId, taskId, text, authorUserId) => {
      const plan = get().plansByUserId[userId];
      if (!plan) return { ok: false, error: 'Plan not found.' };
      if (String(authorUserId) === String(userId)) {
        return {
          ok: false,
          error: 'You cannot comment on your own plan or report.',
        };
      }
      const trimmed = text.trim();
      if (!trimmed) return { ok: false, error: 'Comment is required.' };
      const inActive = plan.activeTasks.some((t) => t.id === taskId);
      const inPendingReport = (plan.pendingReportTasks ?? []).some(
        (t) => t.id === taskId,
      );
      if (!inActive && !inPendingReport) {
        return { ok: false, error: 'Task not found.' };
      }
      const entry: MockTaskComment = {
        id: newId(),
        text: trimmed,
        authorUserId,
        createdAt: new Date().toISOString(),
      };
      set({
        plansByUserId: {
          ...get().plansByUserId,
          [userId]: {
            ...plan,
            activeTasks: plan.activeTasks.map((t) =>
              t.id === taskId
                ? { ...t, comments: [...(t.comments ?? []), entry] }
                : t,
            ),
            pendingReportTasks: (plan.pendingReportTasks ?? []).map((t) =>
              t.id === taskId
                ? { ...t, comments: [...(t.comments ?? []), entry] }
                : t,
            ),
          },
        },
      });
      return { ok: true };
    },
    validatePendingReportTasks: (userId, taskIds, comment) => {
      const plan = get().plansByUserId[userId];
      if (!plan || taskIds.length === 0) return { validatedCount: 0 };
      const ids = new Set(taskIds);
      const note = comment?.trim() || undefined;
      const toValidate = (plan.pendingReportTasks ?? []).filter((t) =>
        ids.has(t.id),
      );
      if (toValidate.length === 0) return { validatedCount: 0 };
      const remaining = (plan.pendingReportTasks ?? []).filter(
        (t) => !ids.has(t.id),
      );
      const validated = toValidate.map((t) => ({
        ...t,
        isPendingReportApproval: false,
        isReported: true,
        isLocked: true,
        lockComment: note ?? t.lockComment,
        done: t.done ?? false,
      }));
      const record: MockReportRecord = {
        id: newId(),
        submittedAt: new Date().toISOString(),
        taskIds: validated.map((t) => t.id),
        taskTitles: validated.map((t) => t.title),
      };
      set({
        plansByUserId: {
          ...get().plansByUserId,
          [userId]: {
            ...plan,
            pendingReportTasks: remaining,
            archivedTasks: [...plan.archivedTasks, ...validated],
            reportHistory: [record, ...plan.reportHistory],
          },
        },
      });
      return { validatedCount: validated.length };
    },
    archiveTasks: (userId, taskIds) => {
      const plan = get().plansByUserId[userId];
      if (!plan || taskIds.length === 0) return { archivedCount: 0 };
      const ids = new Set(taskIds);
      // Also pull direct children of selected parents into history.
      plan.activeTasks.forEach((t) => {
        if (t.parentId && ids.has(t.parentId)) ids.add(t.id);
      });
      const toArchive = plan.activeTasks
        .filter((t) => ids.has(t.id) && !t.isPendingApproval)
        .map((t) => ({
          ...t,
          isReported: true,
          isManuallyArchived: true,
          isPendingApproval: false,
        }));
      if (toArchive.length === 0) return { archivedCount: 0 };
      const archivedIds = new Set(toArchive.map((t) => t.id));
      set({
        plansByUserId: {
          ...get().plansByUserId,
          [userId]: {
            ...plan,
            activeTasks: plan.activeTasks.filter((t) => !archivedIds.has(t.id)),
            archivedTasks: [...toArchive, ...plan.archivedTasks],
          },
        },
      });
      return { archivedCount: toArchive.length };
    },
  })),
);

export { MOCK_KEY_RESULTS, UNLINKED_KR_ID };
