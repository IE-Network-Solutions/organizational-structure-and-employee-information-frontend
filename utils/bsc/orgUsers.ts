/**
 * Normalizes org-and-emp user payloads for BSC people pickers/lists.
 *
 * Response shapes vary by endpoint:
 * - `/users/all-users/all` → `{ items: [...] }` or a bare array (all users)
 * - `/users` → paginated `{ items, meta }` or an id-keyed map `{ [id]: user }`
 */
export type BscOrgEmployee = {
  id: string;
  name: string;
  email: string | null;
  positionTitle: string | null;
  departmentName: string | null;
  profileImage: string | null;
};

export function normalizeOrgUsers(data: unknown): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data !== 'object') return [];

  const body = data as Record<string, any>;
  const candidates = [
    body.items,
    body.data,
    body.users,
    body.employees,
    body.data?.items,
    body.data?.users,
    body.data?.data,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) return candidate;
  }

  // Id-keyed map: { [uuid]: { id, firstName, ... } }
  return Object.values(body).filter(
    (value) =>
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      ('id' in value || 'email' in value || 'firstName' in value),
  );
}

export function resolveProfileImageSrc(profileImage: unknown): string | null {
  if (!profileImage || typeof profileImage !== 'string') return null;
  try {
    const parsed = JSON.parse(profileImage);
    if (typeof parsed?.url === 'string' && parsed.url.startsWith('http')) {
      return parsed.url;
    }
  } catch {
    if (profileImage.startsWith('http')) return profileImage;
  }
  return null;
}

export function toOrgEmployee(user: any): BscOrgEmployee | null {
  const id = String(user?.id || user?.userId || '').trim();
  if (!id) return null;

  const info = user?.employeeInformation;
  const job = Array.isArray(user?.employeeJobInformation)
    ? user.employeeJobInformation[0]
    : user?.employeeJobInformation;

  const name =
    user?.fullName ||
    info?.fullName ||
    [
      user?.firstName || info?.firstName,
      user?.middleName || info?.middleName,
      user?.lastName || info?.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim() ||
    user?.email ||
    'Employee';

  return {
    id,
    name,
    email: typeof user?.email === 'string' ? user.email : null,
    positionTitle:
      job?.position?.name || user?.position?.name || user?.positionName || null,
    departmentName:
      job?.department?.name ||
      user?.department?.name ||
      user?.departmentName ||
      null,
    profileImage: resolveProfileImageSrc(
      user?.profileImage || info?.profileImage,
    ),
  };
}

/**
 * id → name for org-emp list payloads (positions, departments). Accepts a bare
 * array, `{ items }` / `{ data }`, and walks nested `children` (department tree).
 */
export function namesById(data: unknown): Map<string, string> {
  const map = new Map<string, string>();
  const body = data as { items?: unknown; data?: unknown } | null | undefined;
  const roots = Array.isArray(data)
    ? data
    : Array.isArray(body?.items)
      ? body.items
      : Array.isArray(body?.data)
        ? body.data
        : [];

  const visit = (rows: any[]) => {
    for (const row of rows) {
      const name = String(
        row?.name ||
          row?.departmentName ||
          row?.positionName ||
          row?.title ||
          '',
      ).trim();
      if (row?.id && name && !map.has(String(row.id))) {
        map.set(String(row.id), name);
      }
      if (Array.isArray(row?.children)) visit(row.children);
      if (Array.isArray(row?.department)) visit(row.department);
    }
  };
  visit(roots as any[]);
  return map;
}

/**
 * BE employee scorecards carry ids only (userName is left empty by the mapper).
 * Fill name, role and department so roll-ups/tables can group and display them.
 */
export function enrichScorecardPeople<
  T extends {
    userId: string;
    userName: string;
    positionId?: string | null;
    positionTitle?: string | null;
    departmentId?: string | null;
    departmentName?: string | null;
  },
>(
  card: T,
  lookups: {
    employeeById: Map<string, BscOrgEmployee>;
    positionNameById?: Map<string, string>;
    departmentNameById?: Map<string, string>;
  },
): T {
  const employee = lookups.employeeById.get(card.userId);
  return {
    ...card,
    userName: card.userName || employee?.name || 'Employee',
    positionTitle:
      card.positionTitle ||
      (card.positionId
        ? lookups.positionNameById?.get(card.positionId)
        : undefined) ||
      employee?.positionTitle ||
      null,
    departmentName:
      card.departmentName ||
      (card.departmentId
        ? lookups.departmentNameById?.get(card.departmentId)
        : undefined) ||
      employee?.departmentName ||
      null,
  };
}

export type BscPositionOption = {
  value: string;
  label: string;
  departmentName: string | null;
};

/** Rows from any org-emp list shape: array, {items}, {data}, {data:{items}}, id-keyed map. */
function listRows(data: unknown): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data !== 'object') return [];
  const body = data as Record<string, any>;
  for (const candidate of [
    body.items,
    body.data,
    body.positions,
    body.data?.items,
    body.data?.data,
  ]) {
    if (Array.isArray(candidate)) return candidate;
  }
  return Object.values(body).filter(
    (value) =>
      value && typeof value === 'object' && !Array.isArray(value) && 'id' in value,
  );
}

/**
 * Role picker options. Primary source is the positions list; employees' current
 * job positions fill in anything missing (or everything, if `/positions`
 * failed or returned nothing), so the picker always shows real positions.
 */
export function buildPositionOptions(
  positionsData: unknown,
  ...userSources: unknown[]
): BscPositionOption[] {
  const byId = new Map<string, BscPositionOption>();
  const add = (row: any, departmentName?: string | null) => {
    const id = row?.id ? String(row.id) : '';
    const label = String(
      row?.name || row?.positionName || row?.title || '',
    ).trim();
    if (!id || !label || byId.has(id)) return;
    byId.set(id, {
      value: id,
      label,
      departmentName:
        departmentName ?? row?.departmentName ?? row?.department?.name ?? null,
    });
  };

  for (const row of listRows(positionsData)) add(row);

  for (const source of userSources) {
    for (const user of normalizeOrgUsers(source)) {
      const jobs = Array.isArray(user?.employeeJobInformation)
        ? user.employeeJobInformation
        : user?.employeeJobInformation
          ? [user.employeeJobInformation]
          : [];
      for (const job of jobs) {
        if (job?.position) add(job.position, job?.department?.name ?? null);
      }
      if (user?.position) add(user.position);
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
}

/**
 * Merge the full user list with the `/users` fallback, de-duplicated by id.
 * The primary list wins; fallback only fills ids missing from it.
 */
export function buildOrgEmployees(
  primary: unknown,
  fallback?: unknown,
): BscOrgEmployee[] {
  const byId = new Map<string, BscOrgEmployee>();
  for (const source of [primary, fallback]) {
    for (const user of normalizeOrgUsers(source)) {
      const employee = toOrgEmployee(user);
      if (employee && !byId.has(employee.id)) byId.set(employee.id, employee);
    }
  }
  return Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}
