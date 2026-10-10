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

export type KeyResultBandField =
  | 'initialValue'
  | 'thresholdValue'
  | 'targetValue'
  | 'stretchValue';

export interface KeyResultBandIssue {
  /** The one field the message belongs to, so it is shown there only. */
  field: KeyResultBandField;
  message: string;
}

/**
 * First broken band rule, with the field to flag. Type-weighted rule:
 * Baseline ≤ Threshold < Target ≤ Stretch (Stretch may equal Target).
 */
export function getKeyResultBandValidationIssue(
  values: KeyResultScoreBands,
  scoringMode: OkrScoringMode | undefined,
): KeyResultBandIssue | null {
  const baseline = toFiniteNumber(values.initialValue);
  const target = toFiniteNumber(values.targetValue);

  if (baseline == null || target == null) return null;

  if (!shouldIncludeScoringBands(scoringMode)) {
    return target > baseline
      ? null
      : {
          field: 'targetValue',
          message: 'Target must be greater than Baseline.',
        };
  }

  const threshold = toFiniteNumber(values.thresholdValue);
  const stretch = toFiniteNumber(values.stretchValue);
  if (threshold == null || stretch == null) return null;

  if (baseline > threshold) {
    return {
      field: 'thresholdValue',
      message: 'Baseline must be less than or equal to Threshold.',
    };
  }
  if (threshold >= target) {
    return {
      field: 'thresholdValue',
      message: 'Threshold must be less than Target.',
    };
  }
  if (target > stretch) {
    return {
      field: 'stretchValue',
      message: 'Stretch must be greater than or equal to Target.',
    };
  }
  return null;
}

export function getKeyResultBandValidationError(
  values: KeyResultScoreBands,
  scoringMode: OkrScoringMode | undefined,
): string | null {
  return getKeyResultBandValidationIssue(values, scoringMode)?.message ?? null;
}

function toFiniteNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}
