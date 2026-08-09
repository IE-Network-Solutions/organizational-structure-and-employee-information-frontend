/**
 * Parent-task capacity for hierarchy planning.
 * Remaining is based on what children have *achieved* (actuals / Done),
 * not on how much was merely planned. Applies to all metric types.
 */

import { NAME } from '@/types/enumTypes';

export type ParentCapacityTask = {
  id?: string;
  parentTaskId?: string | null;
  targetValue?: string | number | null;
  actualValue?: string | number | null;
  isAchieved?: boolean | null;
  status?: string | null;
};

function toNum(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function isBinaryMetricType(metricTypeName?: string | null): boolean {
  const name = String(metricTypeName ?? '').trim();
  return (
    name === NAME.ACHIEVE ||
    name === NAME.MILESTONE ||
    name.toLowerCase() === 'achieve' ||
    name.toLowerCase() === 'milestone'
  );
}

function isChildAchieved(child: ParentCapacityTask): boolean {
  if (child.isAchieved === true) return true;
  const status = String(child.status ?? '').toLowerCase();
  if (
    status === 'done' ||
    status === 'pre_achieved' ||
    status === 'pre-achieved' ||
    status === 'completed'
  ) {
    return true;
  }
  return toNum(child.actualValue) > 0;
}

/**
 * Sum of child task actuals under a parent (achievement toward parent target).
 */
export function sumChildActualsTowardParent(
  children: ParentCapacityTask[],
  parentTaskId: string,
): number {
  return children.reduce((sum, child) => {
    if (child.parentTaskId !== parentTaskId) return sum;
    return sum + toNum(child.actualValue);
  }, 0);
}

/** @deprecated Use sumChildActualsTowardParent — planned targets no longer consume capacity. */
export function sumChildTargetsTowardParent(
  children: ParentCapacityTask[],
  parentTaskId: string,
): number {
  return sumChildActualsTowardParent(children, parentTaskId);
}

export type ParentRemainingCapacity = {
  parentTarget: number;
  /** Amount already achieved toward the parent */
  consumed: number;
  remaining: number;
  isFullyUsed: boolean;
};

export function getParentRemainingCapacity(
  parentTargetValue: unknown,
  children: ParentCapacityTask[],
  parentTaskId: string,
  options?: {
    metricTypeName?: string | null;
    /** True when milestone/KR is already completed upstream */
    parentAlreadyAchieved?: boolean;
  },
): ParentRemainingCapacity | null {
  if (!parentTaskId) return null;

  const related = children.filter((c) => c.parentTaskId === parentTaskId);

  if (isBinaryMetricType(options?.metricTypeName)) {
    const achieved =
      options?.parentAlreadyAchieved === true ||
      related.some((c) => isChildAchieved(c));
    const parentTarget = toNum(parentTargetValue);
    const unit = parentTarget > 0 ? parentTarget : 1;
    return {
      parentTarget: unit,
      consumed: achieved ? unit : 0,
      remaining: achieved ? 0 : unit,
      isFullyUsed: achieved,
    };
  }

  const parentTarget = toNum(parentTargetValue);
  if (!(parentTarget > 0)) return null;

  const consumed = sumChildActualsTowardParent(children, parentTaskId);
  const remaining = Math.max(0, parentTarget - consumed);
  return {
    parentTarget,
    consumed,
    remaining,
    isFullyUsed: remaining <= 0,
  };
}

/**
 * Validates a planned target against KR target and parent remaining capacity.
 * Returns an error message or null.
 *
 * Rules:
 * - Child target cannot exceed parent target
 * - Child target cannot exceed remaining (parent − achieved)
 * - If parent is fully achieved, nothing left to plan
 */
export function validatePlanTargetAgainstCeilings(params: {
  targetValue: unknown;
  keyResultTargetValue?: unknown;
  parentRemaining?: ParentRemainingCapacity | null;
}): string | null {
  const target = Number(params.targetValue);
  if (!Number.isFinite(target)) return null;
  if (target < 0) return 'Value cannot be negative';

  const krTarget = Number(params.keyResultTargetValue);
  if (Number.isFinite(krTarget) && krTarget > 0 && target > krTarget) {
    return `Target cannot exceed the key result target (${krTarget.toLocaleString()})`;
  }

  if (params.parentRemaining) {
    if (params.parentRemaining.isFullyUsed) {
      return `Parent task target (${params.parentRemaining.parentTarget.toLocaleString()}) is fully achieved. Nothing left to plan.`;
    }
    if (target > params.parentRemaining.parentTarget) {
      return `Target cannot exceed the parent task target (${params.parentRemaining.parentTarget.toLocaleString()})`;
    }
    if (target > params.parentRemaining.remaining) {
      return `Target cannot exceed remaining parent capacity (${params.parentRemaining.remaining.toLocaleString()} of ${params.parentRemaining.parentTarget.toLocaleString()} still to achieve)`;
    }
  }

  return null;
}
