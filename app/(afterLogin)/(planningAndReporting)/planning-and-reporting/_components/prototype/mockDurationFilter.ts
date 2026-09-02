import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import {
  appearsInThisMonth,
  appearsInThisWeek,
  todayIso,
} from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import type { MockPlanTask } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';

export function filterMockTasksByDuration(
  tasks: MockPlanTask[],
  kind: DeadlineKind,
  today: string = todayIso(),
): MockPlanTask[] {
  const active = tasks.filter((t) => !t.isReported);
  if (kind === 'daily') {
    return active.filter((t) => String(t.deadline).slice(0, 10) === today);
  }
  if (kind === 'week') {
    return active.filter((t) => appearsInThisWeek(t, today));
  }
  return active.filter((t) => appearsInThisMonth(t, today));
}

export function mockKrTitle(keyResultId: string | null | undefined): string | undefined {
  if (!keyResultId || keyResultId === '__unlinked__') return undefined;
  return undefined;
}
