/**
 * Which assigned planning cadence updates OKR.
 *
 * Lowest cadences stay as plan/report tracking. Only the employee's highest
 * assigned period (by interval) writes OKR progress / score:
 *   Daily only              → Daily counts
 *   Daily + Weekly          → Weekly counts
 *   Daily + Weekly + Monthly → Monthly counts
 */

const NAME_RANK_DAYS: Record<string, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  annually: 365,
  yearly: 365,
};

export type PlanningPeriodIntervalFields = {
  name?: string | null;
  intervalLength?: unknown;
  intervalType?: string | null;
};

export type AssignedPlanningPeriodLike = {
  planningPeriodId?: string | null;
  planningPeriod?: (PlanningPeriodIntervalFields & { id?: string | null }) | null;
};

function scaleByIntervalType(value: number, intervalType?: string | null): number {
  const type = String(intervalType || '')
    .trim()
    .toLowerCase();
  if (type.startsWith('month')) return value * 30;
  if (type.startsWith('week')) return value * 7;
  return value;
}

function coerceIntervalToDays(
  raw: unknown,
  intervalType?: string | null,
): number {
  if (raw == null || raw === '') return 0;

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return scaleByIntervalType(raw, intervalType);
  }

  if (typeof raw === 'string') {
    const parsed = parseFloat(raw);
    if (Number.isFinite(parsed)) {
      return scaleByIntervalType(parsed, intervalType);
    }
  }

  if (typeof raw === 'object') {
    const obj = raw as { days?: unknown; months?: unknown };
    const months = Number(obj.months);
    if (Number.isFinite(months) && months > 0) return months * 30;
    const days = Number(obj.days);
    if (Number.isFinite(days) && days > 0) return days;
  }

  return 0;
}

/** Larger rank = higher cadence (Monthly > Weekly > Daily). */
export function planningPeriodIntervalRank(
  period: PlanningPeriodIntervalFields | null | undefined,
): number {
  if (!period) return 0;
  const fromLength = coerceIntervalToDays(
    period.intervalLength,
    period.intervalType,
  );
  if (fromLength > 0) return fromLength;
  const name = String(period.name || '')
    .trim()
    .toLowerCase();
  return NAME_RANK_DAYS[name] ?? 0;
}

export function getAssignmentPlanningPeriodId(
  assignment: AssignedPlanningPeriodLike | null | undefined,
): string {
  return String(
    assignment?.planningPeriodId || assignment?.planningPeriod?.id || '',
  );
}

/** Assigned period with the longest interval — the one that should affect OKR. */
export function getHighestAssignedPlanningPeriod<
  T extends AssignedPlanningPeriodLike,
>(assignments: T[] | null | undefined): T | null {
  if (!Array.isArray(assignments) || assignments.length === 0) return null;
  return assignments.reduce((best, item) => {
    const bestRank = planningPeriodIntervalRank(best?.planningPeriod);
    const itemRank = planningPeriodIntervalRank(item?.planningPeriod);
    return itemRank > bestRank ? item : best;
  });
}

export function getOkrCountingPeriodName(
  assignments: AssignedPlanningPeriodLike[] | null | undefined,
): string {
  const highest = getHighestAssignedPlanningPeriod(assignments);
  const name = String(highest?.planningPeriod?.name || '').trim();
  return name || 'highest assigned';
}

/**
 * True when this period is the employee's highest assigned cadence.
 * Unknown assignment lists fail open (count) so we never drop a real OKR report.
 */
export function doesPlanningPeriodAffectOkr(
  planningPeriodId: string | null | undefined,
  assignments: AssignedPlanningPeriodLike[] | null | undefined,
): boolean {
  if (!planningPeriodId) return true;
  if (!Array.isArray(assignments) || assignments.length === 0) return true;
  const highest = getHighestAssignedPlanningPeriod(assignments);
  const highestId = getAssignmentPlanningPeriodId(highest);
  if (!highestId) return true;
  return String(planningPeriodId) === highestId;
}

export function appendApplyToOkrQuery(
  url: string,
  applyToOkr: boolean,
): string {
  const join = url.includes('?') ? '&' : '?';
  return `${url}${join}applyToOkr=${applyToOkr ? 'true' : 'false'}`;
}
