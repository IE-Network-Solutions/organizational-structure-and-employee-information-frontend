import {
  mockDisplayNameForUserId,
  mockTeamMemberIds,
  mockUserIdsForDepartment,
} from '../prototype/mockPlanningConstants';
import {
  getEmployeeDepartmentId,
  getEmployeeItems,
  getSubordinateIds,
} from './departmentUsers';

export type AssigneeChip = {
  userId: string;
  label: string;
  initials: string;
  avatar?: string;
  isSelf: boolean;
};

const META_USER_TOKENS = new Set(['all', 'subordinate']);

export function formatEmployeeDisplayName(employee: any): string {
  const full =
    `${employee?.firstName || ''} ${employee?.middleName || ''} ${employee?.lastName || ''}`.trim();
  return full || 'Unknown';
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}

/** Same profile-image resolution as manage-employees user table. */
export function resolveEmployeeProfileImageUrl(
  profileImage?: string | null,
): string | undefined {
  if (!profileImage || typeof profileImage !== 'string') return undefined;
  if (profileImage.startsWith('http')) return profileImage;
  try {
    const parsed = JSON.parse(profileImage) as { url?: string };
    if (
      parsed?.url &&
      typeof parsed.url === 'string' &&
      parsed.url.startsWith('http')
    ) {
      return parsed.url;
    }
  } catch {
    // Not JSON — ignore.
  }
  return undefined;
}

export function concreteSelectedUserIds(selectedUser: string[]): string[] {
  return selectedUser.filter((id) => id && !META_USER_TOKENS.has(id));
}

export function buildMockAssigneeRoster(
  currentUserId: string,
  departmentId?: string,
): AssigneeChip[] {
  let ids = currentUserId
    ? [currentUserId, ...mockTeamMemberIds()]
    : [...mockTeamMemberIds()];

  if (departmentId) {
    const allowed = new Set(mockUserIdsForDepartment(departmentId));
    ids = ids.filter((id) => allowed.has(id));
  }

  const unique = Array.from(new Set(ids));
  const chips: AssigneeChip[] = unique.map((id) => {
    const isSelf = String(id) === String(currentUserId);
    const displayName = mockDisplayNameForUserId(id, currentUserId);
    const fullName = isSelf ? 'Me' : displayName;
    return {
      userId: id,
      label: fullName,
      initials: isSelf ? 'Me' : initialsFromName(displayName),
      isSelf,
    };
  });

  chips.sort((a, b) => {
    if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1;
    return a.label.localeCompare(b.label);
  });

  return chips;
}

function mapEmployeeToChip(id: string, emp: any, userId: string): AssigneeChip {
  const isSelf = String(id) === String(userId);
  const fullName = formatEmployeeDisplayName(emp);
  const label = isSelf ? 'Me' : fullName;
  return {
    userId: String(id),
    label,
    initials: isSelf ? 'Me' : initialsFromName(fullName),
    avatar: resolveEmployeeProfileImageUrl(
      emp?.profileImage || emp?.profilePicture,
    ),
    isSelf,
  };
}

/** Direct reports only — for the assignee picker modal. */
export function buildSubordinatePickerRoster(
  employeeData: { items?: any[] } | undefined,
  userId: string,
  departmentId?: string,
  mockEnabled = false,
): AssigneeChip[] {
  if (mockEnabled) {
    return buildMockAssigneeRoster(userId, departmentId).filter(
      (chip) => !chip.isSelf,
    );
  }

  const employees = getEmployeeItems(employeeData);
  let subordinateIds = getSubordinateIds({ items: employees }, userId).filter(
    (id) => String(id) !== String(userId),
  );

  if (departmentId) {
    const inDept = new Set(
      employees
        .filter((emp) => getEmployeeDepartmentId(emp) === departmentId)
        .map((emp) => String(emp.id)),
    );
    subordinateIds = subordinateIds.filter((id) => inDept.has(String(id)));
  }

  const chips = subordinateIds.map((id) => {
    const emp = employees.find((e) => String(e.id) === String(id));
    return mapEmployeeToChip(String(id), emp, userId);
  });

  chips.sort((a, b) => a.label.localeCompare(b.label));
  return chips;
}

/** Org-wide list (excludes self) — requires ViewAllEmployeePlan. */
export function buildAllEmployeesPickerRoster(
  employeeData: { items?: any[] } | undefined,
  userId: string,
  departmentId?: string,
  mockEnabled = false,
): AssigneeChip[] {
  if (mockEnabled) {
    return buildMockAssigneeRoster(userId, departmentId).filter(
      (chip) => !chip.isSelf,
    );
  }

  let employees = getEmployeeItems(employeeData).filter(
    (emp) => String(emp?.id) !== String(userId),
  );

  if (departmentId) {
    employees = employees.filter(
      (emp) => getEmployeeDepartmentId(emp) === departmentId,
    );
  }

  const chips = employees
    .filter((emp) => emp?.id)
    .map((emp) => mapEmployeeToChip(String(emp.id), emp, userId));

  chips.sort((a, b) => a.label.localeCompare(b.label));
  return chips;
}

export function buildAssigneeRoster(
  employeeData: { items?: any[] } | undefined,
  userId: string,
  departmentId?: string,
): AssigneeChip[] {
  const employees = getEmployeeItems(employeeData);
  const subordinateIds = getSubordinateIds({ items: employees }, userId);
  let rosterIds = userId
    ? [userId, ...subordinateIds.filter((id) => String(id) !== String(userId))]
    : [...subordinateIds];

  if (departmentId) {
    const inDept = new Set(
      employees
        .filter((emp) => getEmployeeDepartmentId(emp) === departmentId)
        .map((emp) => String(emp.id)),
    );
    rosterIds = rosterIds.filter((id) => inDept.has(String(id)));
  }

  rosterIds = Array.from(new Set(rosterIds.filter(Boolean)));

  const chips: AssigneeChip[] = rosterIds.map((id) => {
    const emp = employees.find((e) => String(e.id) === String(id));
    return mapEmployeeToChip(String(id), emp, userId);
  });

  chips.sort((a, b) => {
    if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1;
    return a.label.localeCompare(b.label);
  });

  return chips;
}

export function defaultSelectedUserIds(roster: AssigneeChip[]): string[] {
  return roster.map((chip) => chip.userId);
}

export function toggleMeInSelection(
  selectedIds: string[],
  userId: string,
): string[] {
  if (!userId) return selectedIds;
  const uid = String(userId);
  const hasMe = selectedIds.some((id) => String(id) === uid);
  if (hasMe) {
    const others = selectedIds.filter((id) => String(id) !== uid);
    if (others.length === 0) return selectedIds;
    return others;
  }
  return [uid, ...selectedIds.filter((id) => String(id) !== uid)];
}

export function mergeMeWithPickerSelection(
  meSelected: boolean,
  otherIds: string[],
  userId: string,
): string[] {
  const others = Array.from(new Set(otherIds.filter(Boolean).map(String)));
  const merged =
    meSelected && userId
      ? [String(userId), ...others.filter((id) => id !== String(userId))]
      : others;
  if (merged.length === 0 && userId) return [String(userId)];
  return merged;
}

export function toggleAssigneeChipSelection(
  selectedIds: string[],
  rosterIds: string[],
  toggledId: string,
): string[] {
  const rosterSet = new Set(rosterIds);
  if (!rosterSet.has(toggledId)) return selectedIds;

  const current = selectedIds.filter((id) => rosterSet.has(id));
  const isSelected = current.includes(toggledId);

  if (isSelected) {
    if (current.length <= 1) return current;
    return current.filter((id) => id !== toggledId);
  }

  return [...current, toggledId].sort(
    (a, b) => rosterIds.indexOf(a) - rosterIds.indexOf(b),
  );
}

export function isAllRosterSelected(
  selectedIds: string[],
  rosterIds: string[],
): boolean {
  if (rosterIds.length === 0) return true;
  const selected = new Set(selectedIds);
  return rosterIds.every((id) => selected.has(id));
}

export function normalizeSelectedUserForRoster(
  selectedUser: string[],
  roster: AssigneeChip[],
): string[] {
  const rosterIds = roster.map((c) => c.userId);
  const concrete = concreteSelectedUserIds(selectedUser);
  const rosterSet = new Set(rosterIds);

  if (concrete.length === 0 || selectedUser.includes('all')) {
    return defaultSelectedUserIds(roster);
  }

  const filtered = concrete.filter((id) => rosterSet.has(id));
  if (filtered.length === 0) return defaultSelectedUserIds(roster);
  return filtered.sort((a, b) => rosterIds.indexOf(a) - rosterIds.indexOf(b));
}

export function resolveDefaultAssigneeSelection(
  userId: string,
  subordinateIds: string[],
): { planningFilterPlanType: string; selectedUser: string[] } {
  const ids = userId
    ? [userId, ...subordinateIds.filter((id) => String(id) !== String(userId))]
    : [...subordinateIds];
  const unique = Array.from(new Set(ids.filter(Boolean)));
  return {
    planningFilterPlanType: 'all',
    selectedUser: unique.length > 0 ? unique : userId ? [userId] : [],
  };
}
