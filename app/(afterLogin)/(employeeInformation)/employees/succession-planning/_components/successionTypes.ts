import type { CompetencyImportance } from './steps/stepCompetencyDefinition';
import type { CompetencyEvaluation } from './steps/stepEvaluatorAssignment';
import type { RoleCompetency } from './steps/stepCompetencyDefinition';
import {
  experienceYearsDeficit,
  formatEducationLabel,
  formatYearsLabel,
  matchesEducationRequirement,
  matchesExperienceRequirement,
  type EducationBackground,
  type EducationMatchOptions,
  type EducationRequirement,
} from './educationCatalog';

export type SuccessorReadiness =
  | 'Ready Now'
  | 'Ready within 6 Months'
  | 'Ready within 1 Year'
  | 'Ready within 2 Years'
  | 'Ready within 3+ Years';

/**
 * Readiness from experience-year shortfall.
 * e.g. required 3, actual 2 → Ready within 1 Year.
 * Larger shortfalls map to 2 Years / 3+ Years — never claim "1 Year" for a 5-year gap.
 */
export const deriveReadinessFromExperienceGap = (
  requiredYears?: number | null,
  actualYears?: number | null,
): SuccessorReadiness | null => {
  const deficit = experienceYearsDeficit(requiredYears, actualYears);
  if (deficit == null) return null;
  if (deficit <= 0) return 'Ready Now';
  if (deficit <= 0.5) return 'Ready within 6 Months';
  if (deficit <= 1) return 'Ready within 1 Year';
  if (deficit <= 2) return 'Ready within 2 Years';
  return 'Ready within 3+ Years';
};

export const formatExperienceReadinessHint = (
  requiredYears?: number | null,
  actualYears?: number | null,
): string | null => {
  const deficit = experienceYearsDeficit(requiredYears, actualYears);
  if (deficit == null || deficit <= 0) return null;
  return deriveReadinessFromExperienceGap(requiredYears, actualYears);
};

export type GapSeverity = 'None' | 'Minor' | 'Major' | 'Critical';
export type GapStatus = 'Open' | 'In Progress' | 'Closed';

export type DevelopmentActionStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'Overdue';

export type IdpActivityType =
  | 'Leadership Training'
  | 'Technical Training'
  | 'Certification'
  | 'Delegation / Acting Assignment'
  | 'Other';

export type IdpActivityStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed';

export type IdpPlanStatus = 'Draft' | 'Active' | 'Completed';

export interface CompetencyGap {
  id: string;
  competencyName: string;
  category: string;
  importance: CompetencyImportance;
  requiredLevel: string;
  currentLevel: string;
  gapSeverity: GapSeverity;
  status: GapStatus;
}

export interface DevelopmentAction {
  id: string;
  actionItem: string;
  responsiblePersonId: string;
  responsiblePersonName: string;
  targetCompletionDate: string;
  status: DevelopmentActionStatus;
  completionDate?: string;
  remarks?: string;
  gapId?: string;
}

export interface IdpActivity {
  id: string;
  type: IdpActivityType;
  title: string;
  notes?: string;
  targetDate?: string;
  status: IdpActivityStatus;
  linkedActionIds?: string[];
}

export interface IndividualDevelopmentPlan {
  objectives: string;
  status: IdpPlanStatus;
  activities: IdpActivity[];
}

/** Rating threshold below which a competency counts as under-evaluated / gap. */
export const GAP_RATING_THRESHOLD = 70;

export const deriveCompetencyGaps = (
  competencies: RoleCompetency[],
  evaluations: CompetencyEvaluation[] = [],
  existingGaps: CompetencyGap[] = [],
): CompetencyGap[] => {
  // Every role competency that is under-evaluated (not assessed or below threshold)
  // appears on the Gaps tab — not only Required importance.
  const tracked = competencies.filter((c) => c?.name?.trim());
  const byKey = new Map(
    evaluations.map((e) => [`${e.competencyName}::${e.category}`, e]),
  );
  const existingByKey = new Map(
    existingGaps.map((g) => [`${g.competencyName}::${g.category}`, g]),
  );

  const next: CompetencyGap[] = [];

  tracked.forEach((comp) => {
    const key = `${comp.name}::${comp.category}`;
    const evaluation = byKey.get(key);
    const prev = existingByKey.get(key);
    const rating =
      evaluation?.status === 'Evaluated' && evaluation.rating != null
        ? evaluation.rating
        : null;

    let gapSeverity: GapSeverity = 'None';
    let currentLevel = 'Not assessed';
    let status: GapStatus = 'Closed';

    if (rating == null) {
      gapSeverity =
        comp.importance === 'Required'
          ? 'Critical'
          : comp.importance === 'Preferred'
            ? 'Major'
            : 'Minor';
      currentLevel = 'Not assessed';
      status = 'Open';
    } else if (rating < GAP_RATING_THRESHOLD) {
      gapSeverity = rating < 50 ? 'Major' : 'Minor';
      currentLevel = `${rating}%`;
      status = 'Open';
    } else {
      gapSeverity = 'None';
      currentLevel = `${rating}%`;
      status = 'Closed';
    }

    if (gapSeverity === 'None' && status === 'Closed' && !prev) {
      return;
    }

    if (gapSeverity === 'None') {
      if (prev && prev.status !== 'Closed') {
        next.push({
          ...prev,
          currentLevel,
          gapSeverity: 'None',
          status: 'Closed',
          requiredLevel: `Weight ${comp.weight ?? 0}%`,
          importance: comp.importance,
        });
      }
      return;
    }

    next.push({
      id: prev?.id ?? `gap-${comp.name}-${comp.category}`.replace(/\s+/g, '-'),
      competencyName: comp.name,
      category: comp.category,
      importance: comp.importance,
      requiredLevel: `Weight ${comp.weight ?? 0}% · ${comp.importance}`,
      currentLevel,
      gapSeverity: prev?.status === 'Closed' ? prev.gapSeverity : gapSeverity,
      status:
        prev?.status === 'In Progress' || prev?.status === 'Closed'
          ? prev.status
          : status,
    });
  });

  return next;
};

const EDUCATION_GAP_NAME = 'Education';
const EDUCATION_GAP_CATEGORY = 'Qualification';
const EXPERIENCE_GAP_NAME = 'Relevant Experience';
const EXPERIENCE_GAP_CATEGORY = 'Qualification';

const isQualificationGap = (g: CompetencyGap) =>
  g.category === EDUCATION_GAP_CATEGORY &&
  (g.competencyName === EDUCATION_GAP_NAME ||
    g.competencyName === EXPERIENCE_GAP_NAME);

/** Non-competency education gap when successor does not meet role requirement. */
export const deriveEducationGap = (
  requirement: EducationRequirement | null | undefined,
  background: EducationBackground | null | undefined,
  existingGaps: CompetencyGap[] = [],
  matchOptions?: EducationMatchOptions,
): CompetencyGap | null => {
  const matchStatus = matchesEducationRequirement(
    requirement,
    background,
    matchOptions,
  );
  const prev = existingGaps.find(
    (g) =>
      g.competencyName === EDUCATION_GAP_NAME &&
      g.category === EDUCATION_GAP_CATEGORY,
  );
  const requiredLevel = formatEducationLabel(
    requirement?.level,
    requirement?.field,
  );
  const actualLabel = formatEducationLabel(
    background?.level,
    background?.field,
  );

  if (!requirement?.level) return null;

  if (matchStatus === 'Meets') {
    if (prev && prev.status !== 'Closed') {
      return {
        ...prev,
        currentLevel: actualLabel,
        gapSeverity: 'None',
        status: 'Closed',
        requiredLevel,
        importance: 'Required',
      };
    }
    return null;
  }

  const gapSeverity: GapSeverity =
    matchStatus === 'Below level'
      ? 'Major'
      : matchStatus === 'Field mismatch'
        ? 'Minor'
        : 'Critical';

  return {
    id: prev?.id ?? 'gap-education-qualification',
    competencyName: EDUCATION_GAP_NAME,
    category: EDUCATION_GAP_CATEGORY,
    importance: 'Required',
    requiredLevel,
    currentLevel:
      matchStatus === 'Not assessed'
        ? 'Not assessed'
        : `${actualLabel} · ${matchStatus}`,
    gapSeverity: prev?.status === 'Closed' ? prev.gapSeverity : gapSeverity,
    status:
      prev?.status === 'In Progress' || prev?.status === 'Closed'
        ? prev.status
        : 'Open',
  };
};

/** Non-competency experience gap when successor years are below role requirement. */
export const deriveExperienceGap = (
  requiredYears?: number | null,
  actualYears?: number | null,
  existingGaps: CompetencyGap[] = [],
): CompetencyGap | null => {
  const matchStatus = matchesExperienceRequirement(requiredYears, actualYears);
  const prev = existingGaps.find(
    (g) =>
      g.competencyName === EXPERIENCE_GAP_NAME &&
      g.category === EXPERIENCE_GAP_CATEGORY,
  );
  const requiredLevel = formatYearsLabel(requiredYears);
  const actualLabel = formatYearsLabel(actualYears);

  if (requiredYears == null || Number.isNaN(Number(requiredYears))) {
    return null;
  }

  if (matchStatus === 'Meets') {
    if (prev && prev.status !== 'Closed') {
      return {
        ...prev,
        currentLevel: actualLabel,
        gapSeverity: 'None',
        status: 'Closed',
        requiredLevel,
        importance: 'Required',
      };
    }
    return null;
  }

  const readinessHint = formatExperienceReadinessHint(
    requiredYears,
    actualYears,
  );

  return {
    id: prev?.id ?? 'gap-experience-qualification',
    competencyName: EXPERIENCE_GAP_NAME,
    category: EXPERIENCE_GAP_CATEGORY,
    importance: 'Required',
    requiredLevel,
    currentLevel:
      matchStatus === 'Not assessed'
        ? 'Not assessed'
        : readinessHint
          ? `${actualLabel} · Not matched · ${readinessHint}`
          : `${actualLabel} · Not matched`,
    gapSeverity: prev?.status === 'Closed' ? prev.gapSeverity : 'Major',
    status:
      prev?.status === 'In Progress' || prev?.status === 'Closed'
        ? prev.status
        : 'Open',
  };
};

/** Competency gaps plus optional education / experience qualification gaps. */
export const deriveSuccessorGaps = (
  competencies: RoleCompetency[],
  evaluations: CompetencyEvaluation[] = [],
  existingGaps: CompetencyGap[] = [],
  educationRequirement?: EducationRequirement | null,
  educationBackground?: EducationBackground | null,
  requiredExperienceYears?: number | null,
  actualExperienceYears?: number | null,
  educationMatchOptions?: EducationMatchOptions,
): CompetencyGap[] => {
  const competencyGaps = deriveCompetencyGaps(
    competencies,
    evaluations,
    existingGaps.filter((g) => !isQualificationGap(g)),
  );
  const qualificationGaps = [
    deriveEducationGap(
      educationRequirement,
      educationBackground,
      existingGaps,
      educationMatchOptions,
    ),
    deriveExperienceGap(
      requiredExperienceYears,
      actualExperienceYears,
      existingGaps,
    ),
  ].filter((g): g is CompetencyGap => g != null);
  return [...competencyGaps, ...qualificationGaps];
};

export const resolveActionStatus = (
  status: DevelopmentActionStatus,
  targetCompletionDate: string,
  completionDate?: string,
): DevelopmentActionStatus => {
  if (status === 'Completed' || completionDate) return 'Completed';
  if (!targetCompletionDate) return status;
  const target = new Date(targetCompletionDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (target < today) return 'Overdue';
  return status === 'Overdue' ? 'In Progress' : status;
};
