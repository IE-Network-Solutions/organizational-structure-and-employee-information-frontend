export function getEmployeeItems(employeeData: any): any[] {
  if (!employeeData) return [];
  if (Array.isArray(employeeData)) return employeeData;
  if (Array.isArray(employeeData.items)) return employeeData.items;
  if (Array.isArray(employeeData.data)) return employeeData.data;
  if (Array.isArray(employeeData.users)) return employeeData.users;
  return [];
}

export function extractDepartmentUserIds(payload: any): string[] {
  if (!payload) return [];

  const collect = (users: any[]) =>
    users
      .map((user: any) => String(user?.id ?? user?.userId ?? ''))
      .filter((id: string) => id);

  if (Array.isArray(payload)) return Array.from(new Set(collect(payload)));

  const nestedCandidates = [
    payload.users,
    payload.items,
    payload.data,
    payload.data?.users,
    payload.data?.items,
  ];

  for (const candidate of nestedCandidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return Array.from(new Set(collect(candidate)));
    }
  }

  return [];
}

export function getDepartmentUserTotal(payload: any, extractedCount: number) {
  const meta = payload?.meta ?? payload?.data?.meta ?? {};
  return (
    Number(
      meta.totalItems ?? meta.total ?? payload?.totalItems ?? extractedCount,
    ) || extractedCount
  );
}

export function getSubordinateIds(employeeData: any, managerId: string) {
  if (!managerId) return [];
  return getEmployeeItems(employeeData)
    .filter(
      (employee: any) =>
        String(employee?.delegatedTo?.id || employee?.reportingTo?.id || '') ===
        String(managerId),
    )
    .map((employee: any) => employee.id)
    .filter(Boolean);
}

/** Default assignee chips: me + direct reports (all selected). */
export function resolveDefaultPlanScope(
  userId: string,
  subordinateIds: string[],
) {
  const ids = userId
    ? [userId, ...subordinateIds.filter((id) => String(id) !== String(userId))]
    : [...subordinateIds];
  const unique = Array.from(new Set(ids.filter(Boolean)));
  return {
    planningFilterPlanType: 'all',
    selectedUser: unique.length > 0 ? unique : userId ? [userId] : [],
  };
}

export function getEmployeeDepartmentId(employee: any): string | undefined {
  return (
    employee?.employeeJobInformation?.[0]?.department?.id ||
    employee?.employeeJobInformation?.[0]?.departmentId ||
    employee?.department?.id ||
    employee?.departmentId
  );
}
