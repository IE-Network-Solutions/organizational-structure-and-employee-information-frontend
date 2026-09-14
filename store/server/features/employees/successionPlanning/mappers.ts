import type { CriticalRole } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/criticalRoleModal';
import type { RoleCompetency } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/steps/stepCompetencyDefinition';
import type { CompetencyEvaluation } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/steps/stepEvaluatorAssignment';
import type {
  CompetencyGap,
  DevelopmentAction,
  IdpActivity,
  IndividualDevelopmentPlan,
  SuccessorReadiness,
} from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/successionTypes';
import { formatEducationLabel } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/educationCatalog';
import type {
  EducationField,
  EducationLevel,
} from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/educationCatalog';
import type {
  ApiCompetencyCriteria,
  ApiCriticalRole,
  ApiCriticalRolePayload,
  ApiCriticalRoleSuccessor,
  ApiDevelopmentPlan,
  ApiDevelopmentPlanActivity,
  ApiEvaluatorAssignmentPayload,
  ApiSuccessorEvaluation,
  ApiSuccessorGap,
  ApiSuccessorGapAction,
} from './types';

/**
 * Translation between the succession-planning API and the shape the UI
 * components already consume.
 *
 * Keeping this in one place means the component tree — and therefore the
 * approved design — did not have to change when the prototype's mock store was
 * replaced with real data.
 */

const ANY_FIELD: EducationField = 'Any';

const notDeleted = <T extends { deletedAt?: string | null }>(rows?: T[]): T[] =>
  (rows ?? []).filter((row) => !row.deletedAt);

// ── API → UI ────────────────────────────────────────────────────────────────

export const mapCompetency = (
  competency: ApiCompetencyCriteria,
): RoleCompetency => ({
  id: competency.id,
  name: competency.skill,
  category: competency.category,
  importance: competency.importance,
  weight: Number(competency.weight ?? 0),
  description: competency.description ?? undefined,
});

export const mapEvaluation = (
  evaluation: ApiSuccessorEvaluation,
): CompetencyEvaluation => ({
  competencyCriteriaId: evaluation.competencyCriteriaId,
  competencyName: evaluation.competencyCriteria?.skill ?? '',
  category: evaluation.competencyCriteria?.category ?? 'Skill',
  importance: evaluation.competencyCriteria?.importance ?? 'Required',
  weight: Number(evaluation.competencyCriteria?.weight ?? 0),
  evaluatorId: evaluation.evaluatorId ?? '',
  evaluatorName: evaluation.evaluator?.name ?? '',
  status: evaluation.status,
  rating: evaluation.rating ?? undefined,
  score: evaluation.score ?? undefined,
  comment: evaluation.comment ?? undefined,
});

export const mapGap = (gap: ApiSuccessorGap): CompetencyGap => ({
  id: gap.id,
  competencyName: gap.competencyName,
  category: gap.category,
  importance: (gap.importance ?? 'Required') as CompetencyGap['importance'],
  requiredLevel: gap.requiredLevel ?? '—',
  currentLevel: gap.currentLevel ?? '—',
  gapSeverity: gap.gapSeverity,
  status: gap.status,
});

export const mapDevelopmentAction = (
  action: ApiSuccessorGapAction,
  responsiblePersonName = '',
): DevelopmentAction => ({
  id: action.id,
  actionItem: action.actionItem,
  responsiblePersonId: action.responsiblePersonId ?? '',
  responsiblePersonName,
  targetCompletionDate: action.targetCompletionDate ?? '',
  status: action.status,
  completionDate: action.completionDate ?? undefined,
  remarks: action.remark ?? undefined,
  gapId: action.successorGapId || undefined,
});

const mapIdpActivity = (activity: ApiDevelopmentPlanActivity): IdpActivity => ({
  id: activity.id,
  type: activity.type,
  title: activity.title,
  notes: activity.notes ?? undefined,
  targetDate: activity.targetDate ?? undefined,
  status: activity.status,
  linkedActionIds: activity.linkedActionIds ?? undefined,
});

export const mapDevelopmentPlan = (
  plan?: ApiDevelopmentPlan | null,
): IndividualDevelopmentPlan | undefined => {
  if (!plan) return undefined;
  return {
    status: plan.status,
    activities: notDeleted(plan.activities).map(mapIdpActivity),
  };
};

const mapSuccessor = (
  successor: ApiCriticalRoleSuccessor,
  context: RoleMapContext = {},
): CriticalRole['successors'][number] => {
  const gaps = notDeleted(successor.gaps);
  const actionsById = new Map<string, DevelopmentAction>();
  gaps.forEach((gap) => {
    notDeleted(gap.actions).forEach((action) => {
      actionsById.set(action.id, mapDevelopmentAction(action));
    });
  });
  notDeleted(successor.developmentActions).forEach((action) => {
    if (!actionsById.has(action.id)) {
      actionsById.set(action.id, mapDevelopmentAction(action));
    }
  });
  const developmentActions = Array.from(actionsById.values());
  // The API returns the newest plan first; the UI shows a single active IDP.
  const plan = notDeleted(successor.developmentPlans)[0];

  // Fallbacks for when identity hydration could not resolve the person's
  // current job — the positions catalog still knows the title and department.
  const positionTitle = successor.currentPositionId
    ? context.positionTitleById?.get(successor.currentPositionId)
    : undefined;
  const positionDepartment = successor.currentPositionId
    ? context.positionDepartmentById?.get(successor.currentPositionId)
    : undefined;

  return {
    // The nomination row id — this is what every successor-scoped endpoint
    // takes, and what the detail routes carry in `[successorId]`.
    id: successor.id,
    // The person behind the nomination; role updates match successors on this.
    userId: successor.userId,
    name: successor.user?.name ?? 'Employee',
    jobTitle:
      successor.user?.jobTitle ??
      successor.currentPositionName ??
      positionTitle ??
      '—',
    department: successor.user?.department ?? positionDepartment ?? '—',
    readiness: (successor.readiness ?? undefined) as
      | SuccessorReadiness
      | undefined,
    educationLevel: (successor.educationLevel ?? undefined) as
      | EducationLevel
      | undefined,
    educationField: successor.educationField ?? undefined,
    education: formatEducationLabel(
      successor.educationLevel as EducationLevel | undefined,
      successor.educationField ?? undefined,
    ),
    relevantExperience: successor.relevantExperience ?? undefined,
    currentPositionId: successor.currentPositionId ?? undefined,
    currentPosition: successor.currentPositionName ?? positionTitle,
    competencyEvaluations: notDeleted(successor.evaluations).map(mapEvaluation),
    gaps: gaps.map(mapGap),
    developmentActions,
    idp: mapDevelopmentPlan(plan),
    educationRelatedAccepted: Boolean(successor.educationRelatedAccepted),
    educationRelatedAcceptedField:
      successor.educationRelatedAcceptedField ?? undefined,
  };
};

/** Lookup so display names survive even when the API has no cached label. */
export interface RoleMapContext {
  positionTitleById?: Map<string, string>;
  positionDepartmentById?: Map<string, string>;
}

/** Backend critical role → the `CriticalRole` the UI components render. */
export const mapCriticalRole = (
  role: ApiCriticalRole,
  context: RoleMapContext = {},
): CriticalRole => {
  const requiredPositions = role.requiredPositions ?? [];
  const successors = notDeleted(role.successors).map((successor) =>
    mapSuccessor(successor, context),
  );

  return {
    id: role.id,
    positionId: role.positionId,
    roleName:
      role.positionName ??
      context.positionTitleById?.get(role.positionId) ??
      '—',
    // The API stores departmentId but has no cheap way to label it (Core owns
    // department names), so the live positions catalog resolves it here — the
    // same derivation the pickers use.
    department:
      role.departmentName ??
      context.positionDepartmentById?.get(role.positionId) ??
      '—',
    priority: role.priority,
    riskLevel: role.riskLevel,
    successorCount: successors.length,
    notes: role.note ?? '',
    requiredEducationLevel: (role.educationalLevel ??
      undefined) as EducationLevel,
    // A null fieldOfStudyId is the API's representation of "Any field".
    requiredEducationField: role.fieldOfStudy?.name ?? ANY_FIELD,
    allowRelatedEducationFields: Boolean(role.allowRelatedFields),
    requiredRelevantExperience: Number(role.yearsOfExperience ?? 0),
    requiredCurrentPositionIds: requiredPositions.map(
      (required) => required.positionId,
    ),
    requiredCurrentPositions: requiredPositions
      .map((required) => required.positionName)
      .filter((name): name is string => Boolean(name)),
    competencies: notDeleted(role.competencyCriteria).map(mapCompetency),
    successors,
  };
};

export const mapCriticalRoles = (
  roles: ApiCriticalRole[],
  context: RoleMapContext = {},
): CriticalRole[] =>
  (roles ?? []).map((role) => mapCriticalRole(role, context));

// ── UI → API ────────────────────────────────────────────────────────────────

export interface BuildRolePayloadOptions {
  /** Resolves a field-of-study name to its catalog id (null means "Any"). */
  fieldOfStudyIdByName?: Map<string, string>;
  /** Maps a wizard successor row to the Core userId to nominate. */
  resolveUserId?: (successorId: string) => string | undefined;
  /** Core department the role's position sits in. */
  departmentId?: string;
}

/**
 * Wizard values → create/update payload.
 *
 * Evaluator assignments are sent by `competencyIndex` because a brand-new role
 * has no competency ids yet; the server resolves the index against the
 * competency array in the same request.
 */
export const buildCriticalRolePayload = (
  values: Omit<CriticalRole, 'id' | 'successorCount'>,
  options: BuildRolePayloadOptions = {},
): ApiCriticalRolePayload => {
  const competencies = (values.competencies ?? []).filter((competency) =>
    competency?.name?.trim(),
  );

  const fieldName = values.requiredEducationField;
  const fieldOfStudyId =
    !fieldName || fieldName === ANY_FIELD
      ? null
      : (options.fieldOfStudyIdByName?.get(fieldName.trim().toLowerCase()) ??
        null);

  return {
    positionId: values.positionId,
    priority: values.priority,
    note: values.notes || undefined,
    educationalLevel:
      values.requiredEducationLevel as ApiCriticalRolePayload['educationalLevel'],
    fieldOfStudyId,
    yearsOfExperience: Number(values.requiredRelevantExperience ?? 0),
    allowRelatedFields: Boolean(values.allowRelatedEducationFields),
    ...(options.departmentId ? { departmentId: options.departmentId } : {}),
    requiredPositionIds: values.requiredCurrentPositionIds ?? [],
    competencyCriteria: competencies.map((competency) => ({
      // Keeping the id makes an update an edit-in-place rather than a
      // delete-and-recreate, so existing scores and gaps survive.
      ...(competency.id ? { id: competency.id } : {}),
      skill: competency.name.trim(),
      category: competency.category,
      importance: competency.importance,
      weight: Number(competency.weight ?? 0),
      description: competency.description || undefined,
    })),
    successors: (values.successors ?? []).map((successor) => {
      // Persisted successors carry `userId`; wizard rows only have the employee
      // id in `id`. Never send a nomination row id as a userId.
      const userId =
        options.resolveUserId?.(successor.id) ??
        successor.userId ??
        successor.id;
      return {
        userId,
        educationLevel:
          successor.educationLevel as ApiCriticalRolePayload['educationalLevel'],
        educationField: successor.educationField || undefined,
        relevantExperience: successor.relevantExperience,
        currentPositionId: successor.currentPositionId,
        evaluatorAssignments: competencies
          .map((competency, index): ApiEvaluatorAssignmentPayload | null => {
            const evaluation = (successor.competencyEvaluations ?? []).find(
              (candidate) =>
                candidate.competencyName === competency.name &&
                candidate.category === competency.category,
            );
            if (!evaluation?.evaluatorId) return null;
            // Address the criterion by id once it exists; fall back to its
            // index in this request while the role is still being created.
            return competency.id
              ? {
                  competencyCriteriaId: competency.id,
                  evaluatorId: evaluation.evaluatorId,
                }
              : { competencyIndex: index, evaluatorId: evaluation.evaluatorId };
          })
          .filter(
            (assignment): assignment is ApiEvaluatorAssignmentPayload =>
              assignment != null,
          ),
      };
    }),
  };
};
