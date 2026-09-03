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
import type { DeadlineKind, DeadlineTask } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import {
  childCapForParent,
  childKindForParent,
  countChildren,
  MOCK_KEY_RESULTS,
  MOCK_PLAN_SEED_VERSION,
  mockSeedPlanIsClosed,
  UNLINKED_KR_ID,
} from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/prototype/mockPlanningConstants';

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export type MockPlanTask = DeadlineTask & {
  isReported?: boolean;
  isPendingApproval?: boolean;
  priority?: string;
  weight?: number;
  keyResultId?: string | null;
  reportNote?: string;
  actualValue?: number | null;
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
  reportHistory: MockReportRecord[];
  pendingReopenRequest: boolean;
  /** When set, ensurePlan rebuilds if it does not match MOCK_PLAN_SEED_VERSION. */
  seedVersion?: number;
};

function krTitleForId(keyResultId: string | null | undefined): string | undefined {
  if (!keyResultId || keyResultId === UNLINKED_KR_ID) return undefined;
  return MOCK_KEY_RESULTS.find((k) => k.id === keyResultId)?.title;
}

const buildMockUserPlan = (
  userId: string,
  displayName: string,
  today: string,
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
      keyResultId: 'kr-team-cadence',
      keyResultTitle: 'Team cadence',
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
      keyResultId: 'kr-q-demo',
      keyResultTitle: 'Q-demo delivery',
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
      keyResultId: 'kr-q-demo',
      keyResultTitle: 'Q-demo delivery',
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
      keyResultId: 'kr-q-demo',
      keyResultTitle: 'Q-demo delivery',
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
      keyResultId: 'kr-q-demo',
      keyResultTitle: 'Q-demo delivery',
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
      keyResultId: 'kr-q-demo',
      keyResultTitle: 'Q-demo delivery',
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
      keyResultId: 'kr-q-demo',
      keyResultTitle: 'Q-demo delivery',
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
      title: 'New overlapping task (pending approval)',
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
      title: 'Follow-up stakeholder sync (pending approval)',
      start: plus(1),
      deadline: plus(3),
      spanDays: 3,
      kind: 'daily',
      parentId: null,
      done: false,
      isPendingApproval: true,
      keyResultId: 'kr-team-cadence',
      keyResultTitle: 'Team cadence',
      priority: 'high',
      weight: 10,
    },
  ];

  // ── Pre-seeded report history ──────────────────────────────────────────────
  // Give every user two already-submitted reports so the Reports tab has data
  // without the user having to manually check & report tasks first.

  const pastDaily1: MockPlanTask = {
    id: tid('arch-d1'),
    title: 'Daily standup sync',
    start: plus(-7),
    deadline: plus(-7),
    spanDays: 1,
    kind: 'daily',
    parentId: null,
    done: true,
    isReported: true,
    keyResultId: 'kr-team-cadence',
    keyResultTitle: 'Team cadence',
    priority: 'medium',
    weight: 3,
    actualValue: 1,
  };

  const pastDaily2: MockPlanTask = {
    id: tid('arch-d2'),
    title: 'Write unit tests for auth module',
    start: plus(-6),
    deadline: plus(-6),
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
    start: plus(-3),
    deadline: plus(-3),
    spanDays: 1,
    kind: 'daily',
    parentId: null,
    done: false,
    isReported: true,
    keyResultId: 'kr-team-cadence',
    keyResultTitle: 'Team cadence',
    priority: 'low',
    weight: 2,
    actualValue: 0,
    reportNote: 'Partially done – pending second pass',
  };

  const archivedTasks: MockPlanTask[] = [pastDaily1, pastDaily2, pastWeekly1, pastDaily3];

  const reportRecord1: MockReportRecord = {
    id: `rep-${uid}-1`,
    submittedAt: plus(-7) + 'T09:00:00.000Z',
    taskIds: [pastDaily1.id, pastDaily2.id],
    taskTitles: [pastDaily1.title, pastDaily2.title],
  };

  const reportRecord2: MockReportRecord = {
    id: `rep-${uid}-2`,
    submittedAt: plus(-8) + 'T17:30:00.000Z',
    taskIds: [pastWeekly1.id, pastDaily3.id],
    taskTitles: [pastWeekly1.title, pastDaily3.title],
  };

  return {
    userId,
    displayName,
    planId: `plan-${userId}`,
    // Closed so the card shows Closed tasks + Pending (approval) tasks inside.
    isValidated: mockSeedPlanIsClosed(userId),
    activeTasks,
    archivedTasks,
    reportHistory: [reportRecord2, reportRecord1],
    pendingReopenRequest: false,
    seedVersion: MOCK_PLAN_SEED_VERSION,
  };
};

export interface AppendMockTaskInput {
  title: string;
  start: string;
  deadline: string;
  keyResultId?: string | null;
  priority?: string;
  parentId?: string | null;
}

interface UserPlanRepositoryState {
  plansByUserId: Record<string, MockUserPlan>;
  ensurePlan: (userId: string, displayName?: string) => MockUserPlan;
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
}

export const useUserPlanRepositoryMock = create<UserPlanRepositoryState>()(
  devtools((set, get) => ({
    plansByUserId: {},
    ensurePlan: (userId, displayName = 'My') => {
      const existing = get().plansByUserId[userId];
      // Only rebuild when seed version or display name changes.
      // Do not wipe user-added tasks (UUID ids) or open/close state.
      const seedIsStale =
        !!existing &&
        (existing.seedVersion !== MOCK_PLAN_SEED_VERSION ||
          existing.displayName !== displayName);
      if (existing && !seedIsStale) return existing;
      const plan = buildMockUserPlan(userId, displayName, todayIso());
      set({
        plansByUserId: { ...get().plansByUserId, [userId]: plan },
      });
      return plan;
    },
    getPlan: (userId) => get().plansByUserId[userId] ?? null,
    getActiveTasks: (userId) => {
      const plan = get().ensurePlan(userId);
      return plan.activeTasks.filter((t) => !t.isReported);
    },
    appendTask: (userId, input) => {
      const plan = get().ensurePlan(userId);
      const trimmed = input.title.trim();
      if (!trimmed) return { ok: false, error: 'Title is required.' };

      if (input.parentId) {
        const parent = plan.activeTasks.find((t) => t.id === input.parentId);
        if (!parent) return { ok: false, error: 'Parent task not found.' };
        const cap = childCapForParent(parent.kind, parent.start, parent.deadline);
        const childKind = childKindForParent(parent.kind);
        if (!childKind) {
          return { ok: false, error: 'This task cannot have subtasks.' };
        }
        if (countChildren(plan.activeTasks, parent.id) >= cap) {
          return {
            ok: false,
            error: `Maximum ${cap} subtasks for this ${parent.kind} task.`,
          };
        }
        if (childKind === 'daily') {
          const valid = validateDailySubtask(parent, input.start);
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
            // New adds always land under the Pending tag until approved.
            isPendingApproval: true,
            keyResultId: parent.keyResultId ?? null,
            keyResultTitle: parent.keyResultTitle,
            priority: input.priority ?? 'medium',
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
          parent,
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
          isPendingApproval: true,
          keyResultId: parent.keyResultId ?? null,
          keyResultTitle: parent.keyResultTitle,
          priority: input.priority ?? 'medium',
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
        // New adds always land under the Pending tag until approved.
        isPendingApproval: true,
        keyResultId: input.keyResultId ?? UNLINKED_KR_ID,
        keyResultTitle: krTitleForId(input.keyResultId),
        priority: input.priority ?? 'medium',
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
  })),
);

export { MOCK_KEY_RESULTS, UNLINKED_KR_ID };
