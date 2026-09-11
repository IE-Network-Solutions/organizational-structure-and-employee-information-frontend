/**
 * Wire types for the OSEI succession-planning API
 * (`/succession-planning/*` on ORG_AND_EMP_URL).
 *
 * These mirror the backend entities. The UI keeps consuming the richer
 * `CriticalRole` shape defined in the succession-planning components; see
 * `mappers.ts` for the translation in both directions.
 */

export type ApiCriticalRolePriority = 'Critical' | 'High' | 'Medium';
export type ApiCriticalRoleRiskLevel = 'High' | 'Medium' | 'Low';

export type ApiEducationalLevel =
  | 'Secondary'
  | 'Diploma'
  | 'Bachelor'
  | 'Master'
  | 'Doctorate'
  | 'ProfessionalCert';

export type ApiCompetencyCategory =
  | 'Skill'
  | 'Knowledge'
  | 'Behavior'
  | 'Experience'
  | 'Certification';

export type ApiCompetencyImportance = 'Required' | 'Preferred' | 'Nice to Have';

export type ApiEvaluationStatus = 'Pending' | 'Evaluated';

export type ApiGapStatus = 'Open' | 'In Progress' | 'Closed';
export type ApiGapSeverity = 'None' | 'Minor' | 'Major' | 'Critical';

export type ApiDevelopmentActionStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'Overdue';

export type ApiIdpPlanStatus = 'Draft' | 'Active' | 'Completed';
export type ApiIdpActivityStatus = 'Not Started' | 'In Progress' | 'Completed';

/** Identity resolved from Core and attached at read time. */
export interface ApiUserSummary {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  jobTitle?: string;
  department?: string;
}

export interface ApiFieldOfStudy {
  id: string;
  name: string;
  description?: string;
  tenantId?: string;
}

export interface ApiIdpActivityType {
  id: string;
  name: string;
  isPreset: boolean;
}

export interface ApiCompetencyCriteria {
  id: string;
  criticalRoleId: string;
  skill: string;
  category: ApiCompetencyCategory;
  importance: ApiCompetencyImportance;
  weight: number;
  description?: string;
  passingScore: number;
  deletedAt?: string | null;
}

export interface ApiSuccessorEvaluation {
  id: string;
  criticalRoleSuccessorId: string;
  competencyCriteriaId: string;
  competencyCriteria?: ApiCompetencyCriteria;
  evaluatorId?: string | null;
  evaluator?: ApiUserSummary | null;
  rating?: number | null;
  score?: number | null;
  comment?: string | null;
  status: ApiEvaluationStatus;
  evaluatedAt?: string | null;
  deletedAt?: string | null;
}

export interface ApiSuccessorGapAction {
  id: string;
  successorGapId?: string | null;
  criticalRoleSuccessorId?: string | null;
  actionItem: string;
  responsiblePersonId?: string | null;
  targetCompletionDate?: string | null;
  completionDate?: string | null;
  status: ApiDevelopmentActionStatus;
  remark?: string | null;
  deletedAt?: string | null;
}

export interface ApiSuccessorGap {
  id: string;
  criticalRoleSuccessorId: string;
  gapKey: string;
  competencyCriteriaId?: string | null;
  competencyName: string;
  category: string;
  importance?: string | null;
  requiredLevel?: string | null;
  currentLevel?: string | null;
  gapSeverity: ApiGapSeverity;
  status: ApiGapStatus;
  actions?: ApiSuccessorGapAction[];
  deletedAt?: string | null;
}

export interface ApiDevelopmentPlanActivity {
  id: string;
  developmentPlanId: string;
  type: string;
  title: string;
  notes?: string | null;
  targetDate?: string | null;
  status: ApiIdpActivityStatus;
  linkedActionIds?: string[] | null;
  deletedAt?: string | null;
}

export interface ApiDevelopmentPlan {
  id: string;
  criticalRoleSuccessorId: string;
  status: ApiIdpPlanStatus;
  activities?: ApiDevelopmentPlanActivity[];
  deletedAt?: string | null;
}

export interface ApiCriticalRoleSuccessor {
  id: string;
  criticalRoleId: string;
  userId: string;
  user?: ApiUserSummary | null;
  readiness?: string | null;
  educationLevel?: ApiEducationalLevel | null;
  educationField?: string | null;
  relevantExperience?: number | null;
  currentPositionId?: string | null;
  currentPositionName?: string | null;
  educationRelatedAccepted: boolean;
  educationRelatedAcceptedField?: string | null;
  evaluations?: ApiSuccessorEvaluation[];
  gaps?: ApiSuccessorGap[];
  developmentActions?: ApiSuccessorGapAction[];
  developmentPlans?: ApiDevelopmentPlan[];
  deletedAt?: string | null;
}

export interface ApiCriticalRoleRequiredPosition {
  id: string;
  criticalRoleId: string;
  positionId: string;
  positionName?: string | null;
}

export interface ApiCriticalRole {
  id: string;
  positionId: string;
  positionName?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  priority: ApiCriticalRolePriority;
  riskLevel: ApiCriticalRoleRiskLevel;
  note?: string | null;
  educationalLevel?: ApiEducationalLevel | null;
  fieldOfStudyId?: string | null;
  fieldOfStudy?: ApiFieldOfStudy | null;
  yearsOfExperience: number;
  allowRelatedFields: boolean;
  requiredPositionId?: string | null;
  requiredPositions?: ApiCriticalRoleRequiredPosition[];
  competencyCriteria?: ApiCompetencyCriteria[];
  successors?: ApiCriticalRoleSuccessor[];
  deletedAt?: string | null;
}

// ── Request payloads ────────────────────────────────────────────────────────

export interface ApiCompetencyCriteriaPayload {
  id?: string;
  skill: string;
  category: ApiCompetencyCategory;
  importance: ApiCompetencyImportance;
  weight: number;
  description?: string;
  passingScore?: number;
}

export interface ApiEvaluatorAssignmentPayload {
  competencyCriteriaId?: string;
  /** Index into the request's competencyCriteria array (create flow). */
  competencyIndex?: number;
  evaluatorId?: string;
}

export interface ApiSuccessorNominationPayload {
  userId: string;
  readiness?: string;
  educationLevel?: ApiEducationalLevel;
  educationField?: string;
  relevantExperience?: number;
  currentPositionId?: string;
  evaluatorAssignments?: ApiEvaluatorAssignmentPayload[];
}

export interface ApiCriticalRolePayload {
  positionId: string;
  priority: ApiCriticalRolePriority;
  note?: string;
  educationalLevel?: ApiEducationalLevel;
  fieldOfStudyId?: string | null;
  yearsOfExperience?: number;
  allowRelatedFields?: boolean;
  departmentId?: string;
  requiredPositionIds?: string[];
  competencyCriteria?: ApiCompetencyCriteriaPayload[];
  successors?: ApiSuccessorNominationPayload[];
}

export interface ApiEvaluationScorePayload {
  competencyCriteriaId: string;
  /** Raw 0–100 rating; the server derives the weighted score. */
  rating: number;
  comment?: string;
}

// ── KPI + report shapes ─────────────────────────────────────────────────────

export interface ApiCriticalRoleKpis {
  totalRoles: number;
  positionsWithSuccessors: number;
  positionsWithoutSuccessors: number;
  readyNowCount: number;
  readyWithinOneYearCount: number;
  successionCoveragePercent: number;
  totalSuccessors: number;
}

export interface ApiEvaluatorKpis {
  sessionCount: number;
  uniqueEvaluatorCount: number;
  pendingEvaluationCount: number;
  completedEvaluationCount: number;
  evaluationCompletionPercent: number;
}

export interface ApiSuccessorAssessment {
  positionMatch: 'Meets' | 'Mismatch' | 'Not assessed';
  educationMatch: 'Meets' | 'Below level' | 'Field mismatch' | 'Not assessed';
  experienceMatch: 'Meets' | 'Not matched' | 'Not assessed';
  requiredEducationLabel: string;
  actualEducationLabel: string;
  requiredExperienceLabel: string;
  actualExperienceLabel: string;
  requiredPositionIds: string[];
  canMarkEducationRelated: boolean;
  educationRelatedAccepted: boolean;
  totalScore: number;
  evaluatedCount: number;
  pendingCount: number;
}

export interface ApiEvaluatorAssignmentRow {
  evaluatorId: string;
  evaluatorName?: string;
  criticalRoleId: string;
  criticalRoleSuccessorId: string;
  successorUserId: string;
  successorName?: string;
  successorJobTitle?: string;
  competencyCriteriaId: string;
  competencyName: string;
  category: string;
  importance: string;
  weight: number;
  status: ApiEvaluationStatus;
  rating?: number;
  score?: number;
  comment?: string;
}
