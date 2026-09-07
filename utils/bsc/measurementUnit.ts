/** Human-readable labels for stored measurement unit values */
const UNIT_LABELS: Record<string, string> = {
  '%': 'Percentage',
  'Boolean (1 or 0)': 'Achieved/Not',
  'Rating (1.0 - 5.0)': 'Rating',
};

export function measurementUnitLabel(unit?: string | null): string | null {
  const trimmed = unit?.trim();
  if (!trimmed) return null;
  return UNIT_LABELS[trimmed] ?? trimmed;
}

export const METRIC_UNIT_OPTIONS: { value: string; label: string }[] = [
  { value: '%', label: 'Percentage' },
  { value: 'Boolean (1 or 0)', label: 'Achieved/Not' },
  { value: 'Currency', label: 'Currency' },
  { value: 'Count', label: 'Count' },
  { value: 'Days', label: 'Days' },
  { value: 'Hours', label: 'Hours' },
  { value: 'Ratio', label: 'Ratio' },
  { value: 'Score', label: 'Score' },
  { value: 'Index', label: 'Index' },
  { value: 'Rating (1.0 - 5.0)', label: 'Rating (1.0 - 5.0)' },
];

export type TargetDisplay = {
  primary: string;
  unitTag: string | null;
};

function formatMetricNumber(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return Math.abs(value % 1) < 1e-9
    ? String(Math.round(value))
    : String(Number(value.toFixed(2)));
}

function parseRatingRange(
  unit: string,
): { min: number; max: number } | null {
  const match = unit.match(/rating\s*\(([\d.]+)\s*-\s*([\d.]+)\)/i);
  if (!match) return null;
  const min = Number(match[1]);
  const max = Number(match[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return { min, max };
}

/** Compact target/actual display: value + optional unit tag label. */
export function formatTargetDisplay(
  value: number | null | undefined,
  unit?: string | null,
  bounds?: { worstCase?: number | null; bestCase?: number | null },
): TargetDisplay {
  const trimmed = unit?.trim() || '';
  const unitTag = measurementUnitLabel(trimmed);

  if (value == null || !Number.isFinite(value)) {
    return { primary: '—', unitTag };
  }

  if (trimmed === '%') {
    return { primary: `${formatMetricNumber(value)}%`, unitTag: null };
  }

  const ratingRange = parseRatingRange(trimmed);
  if (ratingRange) {
    const max =
      bounds?.bestCase != null && Number.isFinite(bounds.bestCase)
        ? bounds.bestCase
        : ratingRange.max;
    return {
      primary: `${formatMetricNumber(value)}/${formatMetricNumber(max)}`,
      unitTag: 'Rating',
    };
  }

  return { primary: formatMetricNumber(value), unitTag };
}
