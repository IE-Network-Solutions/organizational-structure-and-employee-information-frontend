import { FieldType } from '@/types/enumTypes';

/** Matches supported-type count pill: `paletteDraggable`, `sortableQuestionCard` */
export const surveyTypePillClassName =
  'inline-flex shrink-0 items-center rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[12px] font-semibold tabular-nums text-gray-600';

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

/** Multiple choice & checkbox: same bar summary as Insights; dropdown/radio keep list UI. */
export function isSurveyBarSummaryChoiceType(fieldType: string): boolean {
  return (
    fieldType === FieldType.MULTIPLE_CHOICE || fieldType === FieldType.CHECKBOX
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
