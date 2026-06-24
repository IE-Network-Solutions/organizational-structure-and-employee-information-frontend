import { v4 as uuidv4 } from 'uuid';
import { coerceSurveyRequired } from '../surveyFieldUi';

export const RATING_DESCRIPTION_VALUE = 'description';

export type RatingFieldItem = {
  id: string;
  value: string;
  required?: boolean;
  label?: string;
};

export function buildRatingFields(
  starCount: number,
  options: {
    descriptionLabel?: string;
    descriptionRequired?: boolean;
    existingFields?: RatingFieldItem[];
  },
): RatingFieldItem[] {
  const existing = options.existingFields ?? [];
  const numericExisting = existing.filter(
    (f) => f.value !== RATING_DESCRIPTION_VALUE,
  );
  const descExisting = existing.find(
    (f) => f.value === RATING_DESCRIPTION_VALUE,
  );

  const stars = Array.from({ length: starCount }, (notUsed, i) => ({
    id: numericExisting[i]?.id ?? uuidv4(),
    value: String(i + 1),
  }));

  const descField: RatingFieldItem = {
    id: descExisting?.id ?? uuidv4(),
    value: RATING_DESCRIPTION_VALUE,
  };
  if (options.descriptionRequired) {
    descField.required = true;
  }
  const label = options.descriptionLabel?.trim();
  if (label) {
    descField.label = label;
  }

  return [...stars, descField];
}

export function parseRatingFields(field: RatingFieldItem[] | undefined) {
  const list = field ?? [];
  const descConfig = list.find((f) => f.value === RATING_DESCRIPTION_VALUE);
  const starCount = list.filter(
    (f) => f.value !== RATING_DESCRIPTION_VALUE,
  ).length;

  return {
    starCount: starCount > 0 ? starCount : undefined,
    descriptionLabel: descConfig?.label ?? '',
    descriptionRequired: coerceSurveyRequired(descConfig?.required),
  };
}
