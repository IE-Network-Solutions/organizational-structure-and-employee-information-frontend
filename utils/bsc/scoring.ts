import {
  BSC_PERSPECTIVES,
  CompositeScoreResult,
  ScoreBreakdownItem,
  ScorecardKpiTarget,
  TargetLogic,
} from '@/types/bsc';

export const DEFAULT_R_MAX = 1.25;
/** Absolute upper bound for a single perspective weight (100% when only one is used). */
export const MAX_PERSPECTIVE_WEIGHT = 100;

/**
 * Wrong side of the acceptable threshold: below it (higher-is-better) or above
 * it (lower-is-better). No threshold configured → never fails.
 */
export function failsAcceptableThreshold(
  actual: number,
  logic: TargetLogic,
  threshold?: number | null,
): boolean {
  if (threshold == null || !Number.isFinite(threshold)) return false;
  if (logic === TargetLogic.HigherBetter) return actual < threshold;
  if (logic === TargetLogic.LowerBetter) return actual > threshold;
  return false;
}

/** True when any reported KPI on a scorecard breaches its threshold. */
export function hasThresholdBreach(
  items: Array<{
    actualValue?: number | null;
    targetLogic: TargetLogic;
    acceptableThreshold?: number | null;
  }>,
): boolean {
  return items.some(
    (item) =>
      item.actualValue != null &&
      failsAcceptableThreshold(
        item.actualValue,
        item.targetLogic,
        item.acceptableThreshold,
      ),
  );
}

/**
 * Over-achievement cap as a ratio of target: stretch / target
 * (target / stretch for lower-is-better). No usable stretch → 1 (100%).
 */
function stretchCapRatio(
  target: number,
  logic: TargetLogic,
  stretch?: number | null,
): number {
  if (stretch == null || !Number.isFinite(stretch)) return 1;
  if (logic === TargetLogic.HigherBetter) {
    return stretch > target && target > 0 ? stretch / target : 1;
  }
  if (logic === TargetLogic.LowerBetter) {
    return stretch > 0 && stretch < target ? target / stretch : 1;
  }
  return 1;
}

/**
 * Progress ratio (same rule as BE scoring):
 * - Below target: actual / target (target / actual for lower-is-better).
 * - KPI's own result on the wrong side of its threshold: 0.
 * - Better than target: actual / target, capped at stretch / target
 *   (no stretch → 100%). If any KPI on the scorecard breaches its threshold
 *   (`cardThresholdBreached`), over-achievement is capped at 100% instead.
 */
export function normalizeRatio(
  actual: number,
  target: number,
  logic: TargetLogic,
  options?: {
    worstCase?: number | null;
    bestCase?: number | null;
    rMax?: number;
    /** Min acceptable (higher-is-better) / max acceptable (lower-is-better). */
    acceptableThreshold?: number | null;
    /** Best result that still earns extra credit. */
    stretchTarget?: number | null;
    /** Some KPI on the same scorecard breaches its threshold. */
    cardThresholdBreached?: boolean;
  },
): { ratio: number; capped: boolean } {
  const rMax = options?.rMax ?? DEFAULT_R_MAX;

  // Threshold gate: wrong side of the acceptable threshold earns no credit —
  // e.g. target 90, threshold 80, actual 75 → 0.
  if (failsAcceptableThreshold(actual, logic, options?.acceptableThreshold)) {
    return { ratio: 0, capped: false };
  }

  if (logic === TargetLogic.Bounded) {
    const worst = options?.worstCase;
    const best = options?.bestCase;
    let raw = 0;
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
    const capped = raw > rMax;
    return { ratio: Math.min(Math.max(raw, 0), rMax), capped };
  }

  let raw = 0;
  if (logic === TargetLogic.LowerBetter) {
    // Zero or below is as good as it gets → takes the cap below.
    raw = actual <= 0 ? Number.POSITIVE_INFINITY : target / actual;
  } else {
    raw = target <= 0 ? 0 : actual / target;
  }

  const cap = options?.cardThresholdBreached
    ? 1
    : stretchCapRatio(target, logic, options?.stretchTarget);
  if (raw > 1 && raw > cap) {
    return { ratio: cap, capped: true };
  }
  return { ratio: Math.max(raw, 0), capped: false };
}

export function validateWeights(
  weights: number[],
  perspectives: string[],
): { valid: boolean; message?: string } {
  if (weights.length === 0) {
    return { valid: false, message: 'At least one KPI is required' };
  }
  if (perspectives.some((perspective) => !perspective?.trim())) {
    return {
      valid: false,
      message: 'Select a perspective for every KPI',
    };
  }
  const sum = weights.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 100) > 0.01) {
    return { valid: false, message: 'Weights must sum to exactly 100%' };
  }
  const uniquePerspectives = new Set(perspectives);
  if (uniquePerspectives.size < 1) {
    return {
      valid: false,
      message: 'At least one KPI is required',
    };
  }
  const byPerspective: Record<string, number> = {};
  weights.forEach((w, i) => {
    const p = perspectives[i];
    byPerspective[p] = (byPerspective[p] || 0) + w;
  });
  for (const [p, total] of Object.entries(byPerspective)) {
    if ((total || 0) > 100 + 0.01) {
      return {
        valid: false,
        message: `${p} cannot exceed 100% of total weight`,
      };
    }
  }
  return { valid: true };
}

export function emptyPerspectiveWeightMap(
  names: string[] = [...BSC_PERSPECTIVES],
): Record<string, number> {
  return Object.fromEntries(names.map((name) => [name, 0]));
}

export function validatePerspectiveWeights(weights: Record<string, number>): {
  valid: boolean;
  message?: string;
} {
  const entries = Object.entries(weights).filter(([name]) => name.trim());
  if (entries.length === 0) {
    return { valid: false, message: 'Add at least one perspective' };
  }
  for (const [perspective, raw] of entries) {
    const value = Number(raw || 0);
    if (value <= 0) {
      return {
        valid: false,
        message: `${perspective} weight must be greater than 0`,
      };
    }
    if (value > 100 + 0.01) {
      return {
        valid: false,
        message: `${perspective} cannot exceed 100%`,
      };
    }
  }
  const sum = entries.reduce(
    (total, [, value]) => total + Number(value || 0),
    0,
  );
  if (Math.abs(sum - 100) > 0.01) {
    return {
      valid: false,
      message: 'Perspective weights must sum to exactly 100%',
    };
  }
  return { valid: true };
}

export function validateKpisMatchPerspectiveAllocation(
  kpiWeights: number[],
  perspectives: string[],
  allocation: Record<string, number>,
): { valid: boolean; message?: string } {
  const assigned = new Set(
    Object.entries(allocation)
      .filter(([, weight]) => Number(weight) > 0)
      .map(([name]) => name),
  );
  if (!assigned.size) {
    return {
      valid: false,
      message: 'Assign perspectives to this role before adding KPIs',
    };
  }
  for (const perspective of perspectives) {
    if (!perspective?.trim()) {
      return {
        valid: false,
        message: 'Select a perspective for every KPI',
      };
    }
    if (!assigned.has(perspective)) {
      return {
        valid: false,
        message: `${perspective} is not assigned to this role`,
      };
    }
  }
  const byPerspective: Record<string, number> = {};
  kpiWeights.forEach((weight, i) => {
    const perspective = perspectives[i];
    byPerspective[perspective] =
      (byPerspective[perspective] || 0) + Number(weight || 0);
  });
  for (const [perspective, expectedRaw] of Object.entries(allocation)) {
    const expected = Number(expectedRaw || 0);
    if (expected <= 0) continue;
    const actual = byPerspective[perspective] || 0;
    if (Math.abs(actual - expected) > 0.01) {
      return {
        valid: false,
        message: `${perspective} KPI weights must sum to ${expected}%`,
      };
    }
  }
  return { valid: true };
}

/**
 * SYSTEM_SCORING: Σ (weight/100 × ratio), ratio capped at rMax = 1.25.
 * Called synchronously from finalizeApprovals; not a persisted scorecard status.
 */
export function computeCompositeScore(
  targets: ScorecardKpiTarget[],
  rMax: number = DEFAULT_R_MAX,
): CompositeScoreResult {
  const items: ScoreBreakdownItem[] = [];
  let sum = 0;
  const cardThresholdBreached = hasThresholdBreach(targets);

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
        acceptableThreshold: t.acceptableThreshold,
        stretchTarget: t.stretchTarget,
        cardThresholdBreached,
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

/**
 * Option A: append individual KPI weights and scale existing shared weights
 * so the person still totals 100%. Does not mutate other people's scorecards.
 */
export function rebalanceSharedWeightsForAppend(
  existingWeights: number[],
  existingSources: Array<'shared' | 'individual' | undefined>,
  newIndividualWeights: number[],
): { sharedScaled: number[]; valid: boolean; message?: string } {
  if (!newIndividualWeights.length) {
    return {
      sharedScaled: existingWeights,
      valid: false,
      message: 'Add at least one individual KPI',
    };
  }
  if (newIndividualWeights.some((w) => !w || w <= 0)) {
    return {
      sharedScaled: existingWeights,
      valid: false,
      message: 'Each individual KPI weight must be greater than 0',
    };
  }

  const newSum = newIndividualWeights.reduce((a, b) => a + b, 0);
  if (newSum >= 100) {
    return {
      sharedScaled: existingWeights,
      valid: false,
      message: 'Individual KPI weights must total less than 100%',
    };
  }

  const sharedIndices: number[] = [];
  let sharedSum = 0;
  existingWeights.forEach((weight, index) => {
    const source = existingSources[index] || 'shared';
    if (source === 'shared') {
      sharedIndices.push(index);
      sharedSum += weight;
    }
  });

  if (!sharedIndices.length || sharedSum <= 0) {
    return {
      sharedScaled: existingWeights,
      valid: false,
      message: 'No shared KPIs to rebalance against',
    };
  }

  // Keep previously appended individual weights and scale only shared
  const priorIndividualSum = existingWeights.reduce((sum, weight, index) => {
    const source = existingSources[index] || 'shared';
    return source === 'individual' ? sum + weight : sum;
  }, 0);
  const totalIndividual = priorIndividualSum + newSum;
  if (totalIndividual >= 100) {
    return {
      sharedScaled: existingWeights,
      valid: false,
      message: 'Individual KPI weights must leave room for shared KPIs',
    };
  }

  const finalSharedBudget = 100 - totalIndividual;
  const scaled = existingWeights.map((weight, index) => {
    const source = existingSources[index] || 'shared';
    if (source !== 'shared') return weight;
    return Math.round((weight / sharedSum) * finalSharedBudget * 100) / 100;
  });

  // Fix rounding drift on the last shared KPI
  const sharedAfter = scaled.reduce((sum, weight, index) => {
    const source = existingSources[index] || 'shared';
    return source === 'shared' ? sum + weight : sum;
  }, 0);
  const drift = Math.round((finalSharedBudget - sharedAfter) * 100) / 100;
  if (drift !== 0 && sharedIndices.length) {
    const last = sharedIndices[sharedIndices.length - 1];
    scaled[last] = Math.round((scaled[last] + drift) * 100) / 100;
  }

  return { sharedScaled: scaled, valid: true };
}

/** Validates acceptable threshold against target using higher/lower is better rules. */
export function validateAcceptableThreshold(
  target: number,
  threshold: number,
  logic: TargetLogic,
): { valid: boolean; message?: string } {
  if (!Number.isFinite(target) || !Number.isFinite(threshold)) {
    return { valid: false, message: 'Target and threshold must be numbers' };
  }
  if (logic === TargetLogic.HigherBetter) {
    if (threshold > target) {
      return {
        valid: false,
        message:
          'For higher-is-better KPIs, acceptable threshold must be less than or equal to the target',
      };
    }
    return { valid: true };
  }
  if (logic === TargetLogic.LowerBetter) {
    if (threshold < target) {
      return {
        valid: false,
        message:
          'For lower-is-better KPIs, acceptable threshold must be greater than or equal to the target',
      };
    }
    return { valid: true };
  }
  return {
    valid: false,
    message: 'Acceptable threshold is only supported for higher/lower KPIs',
  };
}
