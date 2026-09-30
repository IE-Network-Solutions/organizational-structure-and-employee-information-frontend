export type OkrDepartmentWithUsers = {
  id: string;
  users?: Array<{ id?: string } | string>;
};

export type EmployeeJobInfo = {
  departmentId?: string;
  department?: { id?: string };
};

/** Ant Design Select: empty string shows as a blank value; use undefined for placeholder. */
export function selectValueOrUndefined(
  value: string | null | undefined,
): string | undefined {
  return value ? value : undefined;
}

export function resolveEmployeeDepartmentId(
  jobInfo: EmployeeJobInfo | null | undefined,
): string | undefined {
  return jobInfo?.departmentId || jobInfo?.department?.id || undefined;
}

export function extractDepartmentUserIds(
  departments: OkrDepartmentWithUsers[] | null | undefined,
  departmentId: string | null | undefined,
): string[] {
  if (!departmentId || !departments?.length) return [];
  const department = departments.find((d) => d.id === departmentId);
  if (!department?.users?.length) return [];
  return Array.from(
    new Set(
      department.users
        .map((user) =>
          typeof user === 'string' ? user : String(user?.id ?? ''),
        )
        .filter(Boolean),
    ),
  );
}

/**
 * Team OKR backend scopes by the header userId's department (not the users[] body).
 * Prefer an explicit employee filter; else any user in the selected department; else self.
 */
export function resolveTeamViewerUserId(params: {
  filterUserId?: string | null;
  filterDepartmentId?: string | null;
  currentUserId: string;
  departments?: OkrDepartmentWithUsers[] | null;
}): string {
  const { filterUserId, filterDepartmentId, currentUserId, departments } =
    params;
  if (filterUserId) return filterUserId;
  if (filterDepartmentId) {
    const departmentUserIds = extractDepartmentUserIds(
      departments,
      filterDepartmentId,
    );
    if (departmentUserIds[0]) return departmentUserIds[0];
  }
  return currentUserId || '';
}

export function extractUserIdsFromPayload(payload: unknown): string[] {
  if (!payload) return [];
  const collect = (users: any[]) =>
    users
      .map((user) =>
        typeof user === 'string'
          ? user
          : String(user?.id ?? user?.userId ?? ''),
      )
      .filter(Boolean);

  if (Array.isArray(payload)) return Array.from(new Set(collect(payload)));

  const nested = payload as Record<string, any>;
  for (const candidate of [
    nested.users,
    nested.items,
    nested.data,
    nested.data?.users,
    nested.data?.items,
  ]) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return Array.from(new Set(collect(candidate)));
    }
  }
  return [];
}

/**
 * Company OKR: when a department is selected, restrict to those users.
 * When an employee is selected without a department, restrict to that employee.
 * When neither is set, return [] so the API returns tenant-wide company OKRs.
 */
export function resolveCompanyFilterUserIds(params: {
  filterUserId?: string | null;
  filterDepartmentId?: string | null;
  departments?: OkrDepartmentWithUsers[] | null;
  allLevelDepartmentUserIds?: string[] | null;
}): string[] {
  const {
    filterUserId,
    filterDepartmentId,
    departments,
    allLevelDepartmentUserIds,
  } = params;

  if (filterDepartmentId) {
    const fromDept = extractDepartmentUserIds(departments, filterDepartmentId);
    const merged = Array.from(
      new Set([...(allLevelDepartmentUserIds ?? []), ...fromDept]),
    );
    // Employee is more specific than department when both are set.
    if (filterUserId) return [filterUserId];
    return merged;
  }

  if (filterUserId) return [filterUserId];
  return [];
}
