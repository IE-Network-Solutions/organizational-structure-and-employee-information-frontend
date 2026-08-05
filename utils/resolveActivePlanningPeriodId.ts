/**
 * Resolve the active planning-period UUID used by planning/reporting queries.
 * Prefer the synced store id; fall back to the assigned period at the 1-based tab index.
 * Never use AssignedPlanningPeriod.id (that is the assignment row id, not the period id).
 */
export function resolveActivePlanningPeriodId(
  activePlanPeriodId: string | null | undefined,
  assignedPeriods:
    | Array<{
        planningPeriodId?: string;
        planningPeriod?: { id?: string } | null;
      }>
    | null
    | undefined,
  activePlanPeriodIndex: number,
): string {
  if (activePlanPeriodId) return activePlanPeriodId;
  const item = assignedPeriods?.[activePlanPeriodIndex - 1];
  return (
    item?.planningPeriodId ||
    item?.planningPeriod?.id ||
    ''
  );
}
