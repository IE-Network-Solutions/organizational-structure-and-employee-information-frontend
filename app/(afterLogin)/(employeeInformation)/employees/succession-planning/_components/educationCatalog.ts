/** Shared education catalog for succession role requirements vs employee background. */

export type EducationLevel =
  | 'Secondary'
  | 'Diploma'
  | 'Bachelor'
  | 'Master'
  | 'Doctorate'
  | 'ProfessionalCert';

/** Field-of-study name. Use `Any` on a role requirement to skip field matching. */
export type EducationField = string;

export const EDUCATION_LEVEL_RANK: Record<EducationLevel, number> = {
  Secondary: 1,
  Diploma: 2,
  Bachelor: 3,
  Master: 4,
  Doctorate: 5,
  ProfessionalCert: 4, // treat as Master-equivalent for matching
};

export const EDUCATION_LEVELS: EducationLevel[] = [
  'Secondary',
  'Diploma',
  'Bachelor',
  'Master',
  'Doctorate',
  'ProfessionalCert',
];

/**
 * The field-of-study list itself is NOT held here — it is a per-tenant table
 * seeded at onboarding and served by `/succession-planning/fields-of-study`.
 * Use `useFieldsOfStudy()` / `useCreateFieldOfStudy()`; a module-level array
 * would not persist and would drift from what the API validates against.
 */

/** Fields that count as equivalent for matching (role field → acceptable employee fields). */
export const EDUCATION_FIELD_EQUIVALENTS: Partial<
  Record<EducationField, EducationField[]>
> = {
  'Business Administration': [
    'Business Administration',
    'Finance',
    'Marketing',
  ],
  Finance: ['Finance', 'Accounting', 'Business Administration'],
  Accounting: ['Accounting', 'Finance'],
  'Computer Science': [
    'Computer Science',
    'Software Engineering',
    'Information Systems',
  ],
  'Software Engineering': [
    'Software Engineering',
    'Computer Science',
    'Information Systems',
  ],
  'Information Systems': [
    'Information Systems',
    'Computer Science',
    'Software Engineering',
  ],
};

export type EducationMatchStatus =
  | 'Meets'
  | 'Below level'
  | 'Field mismatch'
  | 'Not assessed';

export interface EducationRequirement {
  level: EducationLevel;
  field: EducationField;
}

export interface EducationBackground {
  level?: EducationLevel;
  field?: EducationField;
}

export interface EducationMatchOptions {
  /** Role allows PM to accept non-exact fields as related. */
  allowRelated?: boolean;
  /** Successor was marked related for this role. */
  relatedAccepted?: boolean;
}

export const formatEducationLabel = (
  level?: EducationLevel | null,
  field?: EducationField | null,
): string => {
  if (!level) return '—';
  if (!field || field === 'Any') return level;
  if (level === 'ProfessionalCert') return `Professional cert — ${field}`;
  return `${level} — ${field}`;
};

export const educationLevelOptions = EDUCATION_LEVELS.map((value) => ({
  value,
  label: value === 'ProfessionalCert' ? 'Professional certification' : value,
}));

const normalizeField = (field?: EducationField | null): string =>
  (field ?? '').trim().toLowerCase();

/** Exact field compare (trim + case-insensitive). `Any` accepts all. */
export const fieldsExactMatch = (
  requiredField: EducationField,
  actualField: EducationField,
): boolean => {
  if (requiredField === 'Any') return true;
  return normalizeField(requiredField) === normalizeField(actualField);
};

/** Related fields listed for UI helper text (not used for auto-match). */
export const getRelatedEducationFields = (
  field?: EducationField | null,
): EducationField[] => {
  if (!field || field === 'Any') return [];
  const equivalents = EDUCATION_FIELD_EQUIVALENTS[field] ?? [field];
  return equivalents.filter((f) => normalizeField(f) !== normalizeField(field));
};

/**
 * True when match is only via PM “Mark as related” (not exact, not Any).
 */
export const isRelatedEducationAcceptance = (
  requirement: EducationRequirement | null | undefined,
  background: EducationBackground | null | undefined,
  options?: EducationMatchOptions,
): boolean => {
  if (!options?.allowRelated || !options?.relatedAccepted) return false;
  if (!requirement?.level || !background?.level) return false;
  const requiredField = requirement.field ?? 'Any';
  const actualField = background.field ?? 'Other';
  if (requiredField === 'Any') return false;
  if (fieldsExactMatch(requiredField, actualField)) return false;
  const requiredRank = EDUCATION_LEVEL_RANK[requirement.level];
  const actualRank = EDUCATION_LEVEL_RANK[background.level];
  if (actualRank < requiredRank) return false;
  return true;
};

export const matchesEducationRequirement = (
  requirement: EducationRequirement | null | undefined,
  background: EducationBackground | null | undefined,
  options?: EducationMatchOptions,
): EducationMatchStatus => {
  if (!requirement?.level) return 'Not assessed';
  if (!background?.level) return 'Not assessed';

  const requiredRank = EDUCATION_LEVEL_RANK[requirement.level];
  const actualRank = EDUCATION_LEVEL_RANK[background.level];

  if (actualRank < requiredRank) return 'Below level';

  const requiredField = requirement.field ?? 'Any';
  const actualField = background.field ?? 'Other';

  if (fieldsExactMatch(requiredField, actualField)) return 'Meets';

  if (options?.allowRelated && options?.relatedAccepted) return 'Meets';

  return 'Field mismatch';
};

export const educationMatchTagColor: Record<EducationMatchStatus, string> = {
  Meets: 'green',
  'Below level': 'red',
  'Field mismatch': 'orange',
  'Not assessed': 'default',
};

/** Years of relevant experience — role requirement vs employee background. */

export type ExperienceMatchStatus = 'Meets' | 'Not matched' | 'Not assessed';

export const formatYearsLabel = (years?: number | null): string => {
  if (years == null || Number.isNaN(Number(years))) return '—';
  const n = Number(years);
  return `${n} year${n === 1 ? '' : 's'}`;
};

/** Years still needed to meet the role experience requirement (0 if met). */
export const experienceYearsDeficit = (
  requiredYears?: number | null,
  actualYears?: number | null,
): number | null => {
  if (requiredYears == null || Number.isNaN(Number(requiredYears))) return null;
  if (actualYears == null || Number.isNaN(Number(actualYears))) return null;
  return Math.max(0, Number(requiredYears) - Number(actualYears));
};

export const matchesExperienceRequirement = (
  requiredYears?: number | null,
  actualYears?: number | null,
): ExperienceMatchStatus => {
  if (requiredYears == null || Number.isNaN(Number(requiredYears))) {
    return 'Not assessed';
  }
  if (actualYears == null || Number.isNaN(Number(actualYears))) {
    return 'Not assessed';
  }
  return Number(actualYears) >= Number(requiredYears) ? 'Meets' : 'Not matched';
};

export const experienceMatchTagColor: Record<ExperienceMatchStatus, string> = {
  Meets: 'green',
  'Not matched': 'red',
  'Not assessed': 'default',
};

/** Current position requirement vs employee org position. */

export type PositionMatchStatus = 'Meets' | 'Mismatch' | 'Not assessed';

export const matchesPositionRequirement = (
  requiredPositionIds?: string[] | null,
  actualPositionId?: string | null,
  requiredTitles?: string[] | null,
  actualTitle?: string | null,
): PositionMatchStatus => {
  if (requiredPositionIds?.length && actualPositionId) {
    return requiredPositionIds.includes(actualPositionId)
      ? 'Meets'
      : 'Mismatch';
  }
  if (requiredTitles?.length && actualTitle) {
    const actual = actualTitle.trim().toLowerCase();
    return requiredTitles.some((t) => t.trim().toLowerCase() === actual)
      ? 'Meets'
      : 'Mismatch';
  }
  return 'Not assessed';
};

export const positionMatchTagColor: Record<PositionMatchStatus, string> = {
  Meets: 'green',
  Mismatch: 'orange',
  'Not assessed': 'default',
};
