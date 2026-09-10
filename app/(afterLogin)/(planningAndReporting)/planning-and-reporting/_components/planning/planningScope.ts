import { getSubordinateIds } from './departmentUsers';

export type PlanningScopeValue = 'myPlan' | 'subordinatePlan' | 'all';

export const PLANNING_SCOPE_OPTIONS: ReadonlyArray<{
  label: string;
  value: PlanningScopeValue;
}> = [
  { label: 'My Plans', value: 'myPlan' },
  { label: 'Team Plans', value: 'subordinatePlan' },
  { label: 'All', value: 'all' },
];

export function isPlanningScopeValue(
  value: string,
): value is PlanningScopeValue {
  return value === 'myPlan' || value === 'subordinatePlan' || value === 'all';
}

export function subordinateIdsFromEmployees(
  employeeData: { items?: any[] } | undefined,
  userId: string,
  mockTeamMemberIds?: () => string[],
): string[] {
  if (mockTeamMemberIds) return mockTeamMemberIds();
  return getSubordinateIds(employeeData, userId);
}

/** Resolve selectedUser for a scope tab + optional department roster. */
export function resolveSelectedUserForScope(
  scope: PlanningScopeValue,
  userId: string,
  subordinateIds: string[],
  departmentUserIds?: string[],
): string[] {
  const inDepartment = (ids: string[]) => {
    if (!departmentUserIds || departmentUserIds.length === 0) return ids;
    return ids.filter((id) => departmentUserIds.includes(id));
  };

  if (scope === 'myPlan') {
    if (departmentUserIds?.length && !departmentUserIds.includes(userId)) {
      return [];
    }
    return userId ? [userId] : [];
  }

  if (scope === 'subordinatePlan') {
    const subs = inDepartment(subordinateIds);
    return subs.length > 0 ? ['subordinate', ...subs] : ['subordinate'];
  }

  if (departmentUserIds && departmentUserIds.length > 0) {
    return departmentUserIds;
  }
  return ['all'];
}
