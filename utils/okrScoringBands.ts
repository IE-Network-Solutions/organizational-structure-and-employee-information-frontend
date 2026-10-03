import { OkrScoringMode } from '@/store/server/features/okrplanning/okr-setting/interface';

export interface KeyResultScoreBands {
  initialValue?: unknown;
  thresholdValue?: unknown;
  targetValue?: unknown;
  stretchValue?: unknown;
}

export function shouldIncludeScoringBands(
  scoringMode: OkrScoringMode | undefined,
): boolean {
  return scoringMode === 'TYPE_WEIGHTED';
}

export function getKeyResultBandValidationError(
  values: KeyResultScoreBands,
  scoringMode: OkrScoringMode | undefined,
): string | null {
  const baseline = toFiniteNumber(values.initialValue);
  const target = toFiniteNumber(values.targetValue);

  if (baseline == null || target == null) return null;

  if (!shouldIncludeScoringBands(scoringMode)) {
    return target > baseline ? null : 'Target must be greater than Baseline.';
  }

  const threshold = toFiniteNumber(values.thresholdValue);
  const stretch = toFiniteNumber(values.stretchValue);
  if (threshold == null || stretch == null) return null;

  if (baseline > threshold) {
    return 'Baseline must be less than or equal to Threshold.';
  }
  if (threshold >= target) {
    return 'Threshold must be less than Target.';
  }
  if (target >= stretch) {
    return 'Target must be less than Stretch.';
  }
  return null;
}

function toFiniteNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}
