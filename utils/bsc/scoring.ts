import {
  BscPerspective,
  CompositeScoreResult,
  ScoreBreakdownItem,
  ScorecardKpiTarget,
  TargetLogic,
} from '@/types/bsc';

export const DEFAULT_R_MAX = 1.25;
export const MAX_PERSPECTIVE_WEIGHT = 50;

export function normalizeRatio(
  actual: number,
  target: number,
  logic: TargetLogic,
  options?: {
    worstCase?: number | null;
    bestCase?: number | null;
    rMax?: number;
  },
): { ratio: number; capped: boolean } {
  const rMax = options?.rMax ?? DEFAULT_R_MAX;
  let raw = 0;

  if (logic === TargetLogic.Bounded) {
    const worst = options?.worstCase;
    const best = options?.bestCase;
    if (
      worst === null ||
      worst === undefined ||
      best === null ||
      best === undefined ||
      worst === best
    ) {
      raw = 0;
    } else if (
      (worst > best && actual >= worst) ||
      (worst < best && actual <= worst)
    ) {
      raw = 0;
    } else {
      raw = (worst - actual) / (worst - best);
    }
  } else if (logic === TargetLogic.LowerBetter) {
    if (actual <= 0) {
      raw = rMax;
    } else {
      raw = target / actual;
    }
  } else {
    if (target <= 0) {
      raw = 0;
    } else {
      raw = actual / target;
    }
  }

  const capped = raw > rMax;
  return { ratio: Math.min(Math.max(raw, 0), rMax), capped };
}

export function validateWeights(
  weights: number[],
  perspectives: BscPerspective[],
): { valid: boolean; message?: string } {
  if (weights.length === 0) {
    return { valid: false, message: 'At least one KPI is required' };
  }
  const sum = weights.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 100) > 0.01) {
    return { valid: false, message: 'Weights must sum to exactly 100%' };
  }
  const uniquePerspectives = new Set(perspectives);
  if (uniquePerspectives.size < 3) {
    return {
      valid: false,
      message: 'At least one KPI is required in each perspective',
    };
  }
  const byPerspective: Partial<Record<BscPerspective, number>> = {};
  weights.forEach((w, i) => {
    const p = perspectives[i];
    byPerspective[p] = (byPerspective[p] || 0) + w;
  });
  for (const [p, total] of Object.entries(byPerspective)) {
    if ((total || 0) > MAX_PERSPECTIVE_WEIGHT + 0.01) {
      return {
        valid: false,
        message: `${p} cannot exceed ${MAX_PERSPECTIVE_WEIGHT}% of total weight`,
      };
    }
  }
  return { valid: true };
}

export function computeCompositeScore(
  targets: ScorecardKpiTarget[],
  rMax: number = DEFAULT_R_MAX,
): CompositeScoreResult {
  const items: ScoreBreakdownItem[] = [];
  let sum = 0;

  for (const t of targets) {
    const weight = t.weightPercentage / 100;
    if (t.actualValue === null || t.actualValue === undefined) {
      items.push({
        targetId: t.id,
        kpiName: t.kpiName,
        perspective: t.perspective,
        weight,
        ratio: 0,
        weightedValue: 0,
        capped: false,
      });
      continue;
    }
    const { ratio, capped } = normalizeRatio(
      t.actualValue,
      t.targetValue,
      t.targetLogic,
      {
        worstCase: t.worstCase,
        bestCase: t.bestCase,
        rMax,
      },
    );
    const weightedValue = weight * ratio;
    sum += weightedValue;
    items.push({
      targetId: t.id,
      kpiName: t.kpiName,
      perspective: t.perspective,
      weight,
      ratio,
      weightedValue,
      capped,
    });
  }

  return {
    compositeScore: Number((sum * 100).toFixed(2)),
    items,
  };
}
