import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import { spanDays } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';

export const UNLINKED_KR_ID = '__unlinked__';

export const MOCK_KEY_RESULTS = [
  { id: 'kr-team-cadence', title: 'Team cadence' },
  { id: 'kr-q-demo', title: 'Q-demo delivery' },
  { id: UNLINKED_KR_ID, title: 'General (no key result)' },
] as const;

/** Fixed mock team — never from live employee APIs. */
export const MOCK_TEAM_MEMBERS = [
  { id: 'mock-alice', displayName: 'Alice', role: 'Engineering' },
  { id: 'mock-bob', displayName: 'Bob', role: 'Product' },
  { id: 'mock-cara', displayName: 'Cara', role: 'Design' },
  { id: 'mock-dan', displayName: 'Dan', role: 'Ops' },
] as const;

export function mockTeamMemberIds(): string[] {
  return MOCK_TEAM_MEMBERS.map((m) => m.id);
}

export function mockDisplayNameForUserId(
  userId: string,
  currentUserId: string,
): string {
  if (userId && currentUserId && String(userId) === String(currentUserId)) {
    return 'My';
  }
  const member = MOCK_TEAM_MEMBERS.find((m) => m.id === userId);
  return member?.displayName ?? 'User';
}

export function mockRoleForUserId(
  userId: string,
  currentUserId: string,
): string {
  if (userId && currentUserId && String(userId) === String(currentUserId)) {
    return 'Plan';
  }
  return MOCK_TEAM_MEMBERS.find((m) => m.id === userId)?.role ?? 'Plan';
}

function isAllowedMockUserId(id: string, currentUserId: string): boolean {
  if (!id || id === 'all' || id === 'subordinate') return false;
  if (currentUserId && String(id) === String(currentUserId)) return true;
  return mockTeamMemberIds().includes(id);
}

/**
 * Resolve which mock user ids to show for the current filter.
 * Always uses the fixed mock roster — never live employee directories.
 */
export function resolveMockScopeUserIds(opts: {
  currentUserId: string;
  planType: string;
  selectedUser: string[];
}): string[] {
  const { currentUserId, planType, selectedUser } = opts;
  const teamIds = mockTeamMemberIds();
  const concrete = selectedUser.filter((id) =>
    isAllowedMockUserId(id, currentUserId),
  );

  if (planType === 'myPlan') {
    return currentUserId ? [currentUserId] : [];
  }

  if (planType === 'subordinatePlan') {
    if (concrete.length > 0) {
      return concrete.filter((id) => String(id) !== String(currentUserId));
    }
    return [...teamIds];
  }

  // All Plans — specific mock person selected
  if (concrete.length > 0) {
    const onlyOthers = concrete.every(
      (id) => String(id) !== String(currentUserId),
    );
    // Single teammate filter → just that person (not force-pin self into list scope;
    // pin still applies when self is included via All).
    if (onlyOthers && concrete.length === 1) {
      return concrete;
    }
    const others = concrete.filter(
      (id) => String(id) !== String(currentUserId),
    );
    return currentUserId ? [currentUserId, ...others] : others;
  }

  // All / empty / live leftovers ignored → self + full mock team (My Plan first)
  return currentUserId ? [currentUserId, ...teamIds] : [...teamIds];
}

/** Filter dropdown options for the mock prototype (no live HR names). */
export function buildMockEmployeeFilterOptions(): {
  label: string;
  value: string;
}[] {
  return [
    { label: 'All employees', value: 'all' },
    ...MOCK_TEAM_MEMBERS.map((m) => ({
      label: m.displayName,
      value: m.id,
    })),
  ];
}

export function mockDepartmentFilterOptions(): {
  label: string;
  value: string;
}[] {
  return [
    { label: 'All Departments', value: 'all' },
    { label: 'Engineering', value: 'mock-dept-eng' },
    { label: 'Product', value: 'mock-dept-product' },
    { label: 'Design', value: 'mock-dept-design' },
    { label: 'Ops', value: 'mock-dept-ops' },
  ];
}

export function mockUserIdsForDepartment(departmentId: string): string[] {
  const map: Record<string, string[]> = {
    'mock-dept-eng': ['mock-alice'],
    'mock-dept-product': ['mock-bob'],
    'mock-dept-design': ['mock-cara'],
    'mock-dept-ops': ['mock-dan'],
  };
  return map[departmentId] ?? [];
}

export function childCapForParent(
  parentKind: DeadlineKind,
  parentStart: string,
  parentDeadline: string,
): number {
  if (parentKind === 'daily') return 0;
  if (parentKind === 'week') {
    const days = spanDays(parentStart, parentDeadline) ?? 7;
    return Math.min(7, days);
  }
  return 4;
}

export function childKindForParent(
  parentKind: DeadlineKind,
): DeadlineKind | null {
  if (parentKind === 'month') return 'week';
  if (parentKind === 'week') return 'daily';
  return null;
}

export function countChildren(
  tasks: { id: string; parentId: string | null }[],
  parentId: string,
): number {
  return tasks.filter((t) => t.parentId === parentId).length;
}
