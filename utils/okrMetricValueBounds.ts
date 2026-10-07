/**
 * Bounds for plan task target / report actualValue on quantitative KRs.
 * Values are absolute readings on the same scale as KR initial → target
 * (and stretch when configured for type-weighted scoring).
 */

import {
  getMetricTypeName,
  type KeyResultLikeInput,
} from '@/utils/okrKeyResultProgressDisplay';

const QUANTITATIVE_METRICS = new Set([
  'Numeric',
  'Currency',
  'Percentage',
  'Percent',
  'KPI',
]);

export type MetricValueKrInput =
  | (Pick<
      KeyResultLikeInput,
      | 'metricType'
      | 'metricTypeName'
      | 'key_type'
      | 'initialValue'
      | 'targetValue'
    > & {
      stretchValue?: number | string | null;
    })
  | null
  | undefined;

export function isQuantitativeMetricType(
  metric: string | null | undefined,
): boolean {
  if (!metric) return false;
  return QUANTITATIVE_METRICS.has(metric.trim());
}

function coerceFiniteNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export type QuantitativeMetricBounds =
  | { applies: false }
  | {
      applies: true;
      direction: 'increasing' | 'decreasing';
      initial: number;
      target: number | null;
      stretch: number | null;
      /** Inclusive floor for absolute metric values */
      min: number | null;
      /** Inclusive ceiling for absolute metric values */
      max: number | null;
    };

/**
 * Upper absolute reading for planning / reporting: stretch when set, else target.
 * Used so type-weighted KRs can plan/report above target up to stretch.
 */
export function getKeyResultMetricCeiling(
  kr: MetricValueKrInput,
): number | null {
  const stretch = coerceFiniteNumber(kr?.stretchValue);
  const target = coerceFiniteNumber(kr?.targetValue);
  if (stretch != null && (target == null || stretch > target)) {
    return stretch;
  }
  return target;
}

/**
 * Absolute-value bounds vs KR initial (and target when decreasing).
 * Type-weighted stretch raises the increasing ceiling above target when set.
 * Achieve / Milestone / unknown metrics: no bound from this helper.
 * Missing `initialValue` is treated as 0 for quantitative metrics so a floor
 * still applies (blocks negatives / values below baseline).
 */
export function getQuantitativeMetricValueBounds(
  kr: MetricValueKrInput,
): QuantitativeMetricBounds {
  const metric = getMetricTypeName(kr ?? undefined);
  if (!isQuantitativeMetricType(metric)) {
    return { applies: false };
  }

  const initial = coerceFiniteNumber(kr?.initialValue) ?? 0;
  const target = coerceFiniteNumber(kr?.targetValue);
  const stretch = coerceFiniteNumber(kr?.stretchValue);
  if (target != null && target < initial) {
    const decreasingFloor =
      stretch != null && stretch < target ? stretch : target;
    return {
      applies: true,
      direction: 'decreasing',
      initial,
      target,
      stretch,
      // Never allow below 0 even when KR target is negative.
      min: Math.max(0, decreasingFloor),
      max: initial,
    };
  }

  const increasingCeiling =
    stretch != null && (target == null || stretch > target) ? stretch : null;

  return {
    applies: true,
    direction: 'increasing',
    initial,
    target,
    stretch,
    min: Math.max(0, initial),
    // Stretch (type-weighted) is the hard InputNumber max; classic stays open-ended.
    max: increasingCeiling,
  };
}

/** Error message when `value` is outside allowed metric bounds; otherwise null. */
export function validateMetricValueAgainstInitial(
  value: unknown,
  kr: MetricValueKrInput,
): string | null {
  const n = coerceFiniteNumber(value);
  if (n == null) return null;

  // Always reject negatives for plan target / report actual (all metric types).
  if (n < 0) {
    return 'Value cannot be negative';
  }

  const bounds = getQuantitativeMetricValueBounds(kr);
  if (!bounds.applies) return null;

  if (bounds.min != null && n < bounds.min) {
    const label =
      bounds.direction === 'decreasing'
        ? 'key result target'
        : 'key result initial';
    return `Value cannot be less than the ${label} (${bounds.min.toLocaleString()})`;
  }
  if (bounds.max != null && n > bounds.max) {
    const label =
      bounds.stretch != null && bounds.max === bounds.stretch
        ? 'key result stretch'
        : 'key result initial';
    return `Value cannot be greater than the ${label} (${bounds.max.toLocaleString()})`;
  }
  return null;
}

/** Ant Design InputNumber `min` when a floor applies. */
export function getMetricValueInputMin(
  kr: MetricValueKrInput,
  fallback = 0,
): number {
  const bounds = getQuantitativeMetricValueBounds(kr);
  if (bounds.applies && bounds.min != null) return bounds.min;
  return fallback;
}

/** Ant Design InputNumber `max` when a ceiling applies. */
export function getMetricValueInputMax(
  kr: MetricValueKrInput,
): number | undefined {
  const bounds = getQuantitativeMetricValueBounds(kr);
  if (bounds.applies && bounds.max != null) return bounds.max;
  return undefined;
}
