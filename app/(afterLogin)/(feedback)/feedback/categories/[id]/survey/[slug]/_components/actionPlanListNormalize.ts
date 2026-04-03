import dayjs from 'dayjs';

export function normalizeStatus(
  status: string | undefined,
): 'resolved' | 'pending' | 'unresolved' {
  const s = (status || '').toLowerCase();
  if (s === 'solved' || s === 'completed' || s === 'resolved')
    return 'resolved';
  if (s === 'pending') return 'pending';
  return 'unresolved';
}

/** User id who resolved the plan, when status is resolved (supports common API shapes). */
export function resolvedByUserId(item: any): string | undefined {
  if (normalizeStatus(item?.status) !== 'resolved') return undefined;
  const raw =
    item?.resolvedBy ??
    item?.resolvedById ??
    item?.resolved_by ??
    item?.solvedBy ??
    item?.solved_by ??
    item?.completedBy ??
    item?.completedById ??
    item?.updatedBy;
  if (raw == null || raw === '') return undefined;
  return String(raw);
}

export function responsibleIds(item: any): string[] {
  const rp = item?.responsiblePerson;
  if (Array.isArray(rp)) return rp.filter(Boolean).map(String);
  if (rp != null && rp !== '') return [String(rp)];
  return [];
}

export function employeeFullName(u: {
  firstName?: string;
  middleName?: string;
  lastName?: string;
}): string {
  return [u.firstName, u.middleName].filter(Boolean).join(' ');
}

export function normalizeActionPlanListPayload(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: any[] }).items;
  }
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return (data as { data: any[] }).data;
  }
  return [];
}

/** Flatten JSON:API / nested / snake_case shapes so table columns see deadline & priority. */
export function normalizeActionPlanListItem(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;
  const attr =
    raw.attributes &&
    typeof raw.attributes === 'object' &&
    !Array.isArray(raw.attributes)
      ? raw.attributes
      : {};
  let merged: Record<string, any> = { ...raw, ...attr };
  if (merged.actionPlan && typeof merged.actionPlan === 'object') {
    merged = { ...merged, ...merged.actionPlan };
  }
  if (
    merged.data &&
    typeof merged.data === 'object' &&
    !Array.isArray(merged.data)
  ) {
    merged = { ...merged, ...merged.data };
  }
  const dl =
    merged.deadline ??
    merged.due_date ??
    merged.dueDate ??
    merged.endDate ??
    merged.end_date;
  let pr = merged.priority ?? merged.priority_level ?? merged.priorityLevel;
  if (pr != null && typeof pr === 'object') {
    pr =
      (pr as { value?: unknown }).value ??
      (pr as { slug?: unknown }).slug ??
      (pr as { name?: unknown }).name ??
      String(pr);
  }
  const out = { ...merged };
  if (dl != null && dl !== '') out.deadline = dl;
  if (pr != null && pr !== '') out.priority = pr;
  return out;
}

export function pickActionPlanDeadlineRaw(item: any): unknown {
  if (!item || typeof item !== 'object') return undefined;
  return (
    item.deadline ??
    item.dueDate ??
    item.due_date ??
    item.endDate ??
    item.end_date
  );
}

export function pickActionPlanPriority(item: any): string | undefined {
  if (!item || typeof item !== 'object') return undefined;
  const p = item.priority ?? item.priorityLevel ?? item.priority_level;
  if (p == null || p === '') return undefined;
  if (typeof p === 'object' && p !== null) {
    if ('value' in p && (p as { value?: unknown }).value != null) {
      return String((p as { value: unknown }).value);
    }
    if ('slug' in p && (p as { slug?: unknown }).slug != null) {
      return String((p as { slug: unknown }).slug);
    }
    if ('name' in p && (p as { name?: unknown }).name != null) {
      return String((p as { name: unknown }).name);
    }
  }
  return String(p);
}

export function pickActionPlanCreatedAtRaw(item: any): unknown {
  if (!item || typeof item !== 'object') return undefined;
  return (
    item.createdAt ??
    item.created_at ??
    item.createTime ??
    item.create_time ??
    item.insertedAt ??
    item.inserted_at
  );
}

/** Milliseconds since epoch for sorting; invalid / missing → 0 (sorts last when newest-first). */
export function actionPlanCreatedAtSortMs(item: any): number {
  const raw = pickActionPlanCreatedAtRaw(item);
  if (raw == null || raw === '') return 0;
  const d = dayjs(raw as string | number | Date);
  return d.isValid() ? d.valueOf() : 0;
}
