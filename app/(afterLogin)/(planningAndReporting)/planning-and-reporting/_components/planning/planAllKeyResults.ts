import {
  isPlanningTargetBlocked,
  type PlanningTarget,
} from './buildPlanningTargets';

/** Draft task fields the inline composer needs (it adds its own row id). */
export type PlanAllDraft = {
  task: string;
  priority: string;
  weight: number;
  targetValue: number;
  keyResultId: string;
  milestoneId: string | null;
  parentTaskId: null;
  parentPlanId: null;
  label: string;
  achieveMK: boolean;
  metricTypeName: string | null;
  isDailySlot: false;
  keyResultTitle: string;
  milestoneTitle: string | null;
};

/** "Plan all key results" is offered on the quarterly cadence only. */
export function isQuarterlyPlanningPeriod(periodLabel: string): boolean {
  return periodLabel.trim().toLowerCase().includes('quarter');
}

/** Integers summing to 100, split as evenly as possible (3 → 34, 33, 33). */
function equalWeights(count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(100 / count);
  const remainder = 100 - base * count;
  return Array.from({ length: count }, (value, i) => {
    void value;
    return base + (i < remainder ? 1 : 0);
  });
}

function krTargetValue(apiKr: any): number {
  const n = Number(apiKr?.targetValue);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

/**
 * One draft task per plannable slot in the left panel: a key result, or each
 * open milestone of a milestone key result. Achieve and milestone slots become
 * outcome tasks; quantitative key results start with the key result's target.
 * Weights are split equally so the plan can be saved as-is or adjusted.
 */
export function buildPlanAllDrafts(
  targets: PlanningTarget[],
  userKeyResultItems: any[] = [],
): PlanAllDraft[] {
  const seen = new Set<string>();
  const selectable = targets.filter((t) => {
    if (t.isDailySlot || t.isCompleted || seen.has(t.id)) return false;
    if (isPlanningTargetBlocked(t, userKeyResultItems)) return false;
    seen.add(t.id);
    return true;
  });

  const weights = equalWeights(selectable.length);

  return selectable.map((t, i) => {
    const krTitle = (t.keyResultTitle || '').trim() || 'Key result';
    const milestoneTitle = t.milestoneId
      ? (t.milestoneTitle || '').trim() || 'Milestone'
      : null;
    // Literal metric names (NAME.ACHIEVE / NAME.MILESTONE), as in buildPlanningTargets.
    const isAchieve = t.metricTypeName === 'Achieve';
    const isMilestone = t.metricTypeName === 'Milestone';
    const achieveMK = isAchieve || (isMilestone && !!t.milestoneId);
    const apiKr = userKeyResultItems.find(
      (k) => k && k.deletedAt == null && String(k.id) === String(t.keyResultId),
    );

    return {
      task: milestoneTitle ?? krTitle,
      priority: 'medium',
      weight: weights[i],
      targetValue: isAchieve || isMilestone ? 0 : krTargetValue(apiKr),
      keyResultId: t.keyResultId,
      milestoneId: t.milestoneId,
      parentTaskId: null,
      parentPlanId: null,
      label: milestoneTitle ?? krTitle,
      achieveMK,
      metricTypeName: t.metricTypeName ?? null,
      isDailySlot: false,
      keyResultTitle: krTitle,
      milestoneTitle,
    };
  });
}
