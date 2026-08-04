/**
 * Bounds for plan task target / report actualValue on quantitative KRs.
 * Values are absolute readings on the same scale as KR initial → target.
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
  | Pick<
      KeyResultLikeInput,
      | 'metricType'
      | 'metricTypeName'
      | 'key_type'
      | 'initialValue'
      | 'targetValue'
    >
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
      /** Inclusive floor for absolute metric values */
      min: number | null;
      /** Inclusive ceiling for absolute metric values */
      max: number | null;
    };

/**
 * Absolute-value bounds vs KR initial (and target when decreasing).
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
  if (target != null && target < initial) {
    return {
      applies: true,
      direction: 'decreasing',
      initial,
      target,
      // Never allow below 0 even when KR target is negative.
      min: Math.max(0, target),
      max: initial,
    };
  }

  return {
    applies: true,
    direction: 'increasing',
    initial,
    target,
    min: Math.max(0, initial),
    max: null,
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
    return `Value cannot be greater than the key result initial (${bounds.max.toLocaleString()})`;
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
