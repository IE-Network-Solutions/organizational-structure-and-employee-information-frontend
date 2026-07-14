import { FieldType } from '@/types/enumTypes';

/** Matches supported-type count pill: `paletteDraggable`, `sortableQuestionCard` */
export const surveyTypePillClassName =
  'inline-flex shrink-0 items-center rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[12px] font-semibold tabular-nums text-gray-600';

/** Per-type color tokens — used for type pills, palette accents, and number badges */
export const SURVEY_TYPE_COLORS: Record<
  string,
  { bg: string; border: string; text: string; accent: string }
> = {
  [FieldType.MULTIPLE_CHOICE]: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    text: '#1d4ed8',
    accent: '#3b82f6',
  },
  [FieldType.SHORT_TEXT]: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    text: '#15803d',
    accent: '#22c55e',
  },
  [FieldType.CHECKBOX]: {
    bg: '#faf5ff',
    border: '#e9d5ff',
    text: '#7e22ce',
    accent: '#a855f7',
  },
  [FieldType.PARAGRAPH]: {
    bg: '#fff7ed',
    border: '#fed7aa',
    text: '#c2410c',
    accent: '#f97316',
  },
  [FieldType.RATING]: {
    bg: '#fefce8',
    border: '#fde68a',
    text: '#a16207',
    accent: '#eab308',
  },
};

/** Returns inline style for a colored type pill — avoids dynamic Tailwind class issues */
export function getSurveyTypePillStyle(fieldType: string): {
  backgroundColor: string;
  borderColor: string;
  color: string;
} {
  const c = SURVEY_TYPE_COLORS[fieldType];
  return c
    ? { backgroundColor: c.bg, borderColor: c.border, color: c.text }
    : { backgroundColor: '#f3f4f6', borderColor: '#d1d5db', color: '#4b5563' };
}

/** Count badge (e.g. "Response: N") — matches type pill surface (responses list mock) */
export const surveyResponseCountBadgeClassName =
  'inline-flex shrink-0 items-center rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[12px] font-semibold tabular-nums text-gray-600';

export const SURVEY_FIELD_TYPE_LABELS: Record<string, string> = {
  [FieldType.MULTIPLE_CHOICE]: 'Multiple Choice',
  [FieldType.CHECKBOX]: 'Checkbox',
  [FieldType.SHORT_TEXT]: 'Short Answer',
  [FieldType.PARAGRAPH]: 'Paragraph',
  [FieldType.TIME]: 'Time',
  [FieldType.DROPDOWN]: 'Dropdown',
  [FieldType.RADIO]: 'Radio',
  [FieldType.RATING]: 'Rating',
};

export function surveyFieldTypeLabel(fieldType: string): string {
  return SURVEY_FIELD_TYPE_LABELS[fieldType] ?? fieldType;
}

export function isSurveyChoiceFieldType(fieldType: string): boolean {
  return (
    fieldType === FieldType.MULTIPLE_CHOICE ||
    fieldType === FieldType.CHECKBOX ||
    fieldType === FieldType.DROPDOWN ||
    fieldType === FieldType.RADIO
  );
}

/** Choice questions summarized with bar + count in the Responses tab. */
export function isSurveyBarSummaryChoiceType(fieldType: string): boolean {
  return (
    fieldType === FieldType.MULTIPLE_CHOICE ||
    fieldType === FieldType.CHECKBOX ||
    fieldType === FieldType.DROPDOWN ||
    fieldType === FieldType.RADIO
  );
}

/** API may return boolean or string; avoid `Boolean("false") === true`. */
export function coerceSurveyRequired(raw: unknown): boolean {
  if (raw === true || raw === 1) return true;
  if (typeof raw === 'string') {
    const t = raw.trim().toLowerCase();
    return t === 'true' || t === '1';
  }
  return false;
}
