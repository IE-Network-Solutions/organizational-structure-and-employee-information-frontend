import type { PlanSummary } from '../types';

export function isOwnPlanSummary(
  plan: PlanSummary,
  currentUserId: string,
): boolean {
  return (
    String(plan.ownerUserId ?? '') === currentUserId ||
    plan.summary === 'My Plan' ||
    plan.owner?.name === 'My Plan'
  );
}
