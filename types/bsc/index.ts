export enum BscPerspective {
  Customer = 'Customer',
  InternalProcess = 'Internal Process',
  LearningGrowth = 'Learning & Growth',
}

/** Default non-financial perspectives. Additional perspectives can be defined in settings. */
export const BSC_PERSPECTIVES = [
  BscPerspective.Customer,
  BscPerspective.InternalProcess,
  BscPerspective.LearningGrowth,
] as const;

export interface BscPerspectiveDefinition {
  id: string;
  name: string;
  description?: string | null;
  /** Seeded defaults cannot be deleted */
  isSystem?: boolean;
  createdAt: string;
}

export interface CreatePerspectiveInput {
  name: string;
  description?: string | null;
}

export enum TargetLogic {
  HigherBetter = 'HigherBetter',
  LowerBetter = 'LowerBetter',
  Bounded = 'Bounded',
}

/**
 * Persisted scorecard lifecycle. Prompt names map as:
 * DRAFT → Draft
 * PENDING_ACK → PendingAck
 * ACTIVE_CYCLE → Active
 * PENDING_EVAL → PendingEval
 * (reject path) → NeedsResubmit
 * SYSTEM_SCORING → not persisted (runs inside finalizeApprovals)
 * MANAGER_REVIEW → Scored
 * COMPLETED → Completed
 */
export enum ScorecardStatus {
  Draft = 'Draft',
  PendingAck = 'PendingAck',
  Active = 'Active',
  PendingEval = 'PendingEval',
  NeedsResubmit = 'NeedsResubmit',
  Scored = 'Scored',
  Completed = 'Completed',
}

export enum CycleStatus {
  Open = 'Open',
  Locked = 'Locked',
  Closed = 'Closed',
}

export enum KpiApprovalStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

/** PEP audit flag for reported KPI results on the Results tab */
export enum PepAuditFlag {
  PendingReview = 'PendingReview',
  Realistic = 'Realistic',
  Unrealistic = 'Unrealistic',
}

export enum BscCadence {
  Weekly = 'Weekly',
  BiWeekly = 'BiWeekly',
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  Yearly = 'Yearly',
  Custom = 'Custom',
}

/** Permanent = ongoing; Temporary = fixed active window */
export enum BscSetupKind {
  Permanent = 'Permanent',
  Temporary = 'Temporary',
}

/** Who the scorecard is assigned to in settings scope */
export enum BscScopeTarget {
  Company = 'Company',
  Department = 'Department',
  Role = 'Role',
  Individual = 'Individual',
}

/** Who evaluates assignees on a scorecard template */
export type BscEvaluatorMode = 'directManager' | 'user';

/** @deprecated prefer BscEvaluatorStep chains via kpiEvaluationFlows */
export type BscKpiEvaluatorAssignment = {
  mode: BscEvaluatorMode;
  userId?: string | null;
};

/** Step in a per-KPI evaluation chain (any order / combination allowed) */
export type BscEvaluatorStepKind = 'self' | 'directManager' | 'user';

export type BscEvaluatorStep = {
  kind: BscEvaluatorStepKind;
  /** Required when kind === 'user' */
  userId?: string | null;
};

/** Fiscal-year-backed evaluation period + dept/role scope (replaces free-form cycles) */
export interface EvaluationCycle {
  id: string;
  label: string;
  /** Optional purpose / strategy note for this scorecard */
  description?: string | null;
  status: CycleStatus;
  /**
   * @deprecated Prefer per-KPI cadence on KpiLibraryItem / ScorecardKpiTarget.
   * Kept for catalog labels and legacy seed data.
   */
  cadence: BscCadence;
  /** @deprecated Horizon removed from setup Define; kept for legacy configs */
  setupKind?: BscSetupKind;
  fiscalYearId: string;
  fiscalYearName: string;
  /** True when this scorecard template is turned on */
  isActive?: boolean;
  /**
   * Calendar day counting / check-in may begin.
   * When Active and unset, treat as today.
   */
  effectiveFrom?: string | null;
  /** Month IDs (Monthly) or Session IDs (Quarterly); empty when using custom dates only */
  periodIds: string[];
  periodLabels: string[];
  startDate: string;
  endDate: string;
  /** Permanent always recurs by cadence; temporary is chosen by the user before cadence */
  isRecurring: boolean;
  /** True when start/end came from the temporary duration selector */
  useCustomDates: boolean;
  /** Persisted assign-to choice; preferred over inferring from ID lists */
  scopeTarget?: BscScopeTarget;
  departmentIds: string[];
  departmentNames: string[];
  positionIds: string[];
  positionTitles: string[];
  /** Optional direct assignees (individuals) */
  employeeIds?: string[];
  employeeNames?: string[];
  /** Scorecard-level default evaluator (derived / fallback) */
  evaluatorMode?: BscEvaluatorMode;
  evaluatorUserId?: string | null;
  /** @deprecated prefer kpiEvaluationFlows */
  kpiEvaluators?: Record<string, BscKpiEvaluatorAssignment>;
  /** Per-KPI ordered evaluation chains keyed by catalog KPI id */
  kpiEvaluationFlows?: Record<string, BscEvaluatorStep[]>;
  /** Snapshot of scorecard KPI template lines (API create/update / edit hydrate) */
  templateKpis?: Array<{
    kpiLibraryId: string;
    weightPercentage: number;
    targetValue?: number | null;
    stretchTarget?: number | null;
    worstCase?: number | null;
    bestCase?: number | null;
    dataSource?: string | null;
    acceptableThreshold?: number | null;
    cadence?: BscCadence | null;
    checkInDay?: number | null;
    /** Display fields hydrated from joined KPI library on GET */
    name?: string | null;
    description?: string | null;
    perspective?: string | null;
    measurementUnit?: string | null;
    targetLogic?: TargetLogic | null;
    evaluationFlow?: BscEvaluatorStep[];
  }>;
  /** @deprecated kept for assign UI display fallback */
  year?: number;
  month?: number;
}

export interface KpiLibraryItem {
  id: string;
  evaluationConfigId: string;
  name: string;
  description?: string | null;
  perspective: string;
  targetLogic: TargetLogic;
  measurementUnit: string;
  departmentId?: string | null;
  departmentName?: string | null;
  positionId?: string | null;
  positionTitle?: string | null;
  defaultTarget?: number | null;
  /** Aspirational stretch target beyond the standard target */
  stretchTarget?: number | null;
  /** Weight % of the scorecard (0–100); set when assigning KPIs to a role. May be 0 for catalog KPIs. */
  weight: number;
  /** @deprecated use weight */
  suggestedWeight?: number | null;
  worstCase?: number | null;
  bestCase?: number | null;
  /** How often this KPI expects a check-in */
  cadence?: BscCadence | null;
  /**
   * Check-in day within the cadence period:
   * Weekly: 1–7 (Mon–Sun), BiWeekly: 1–14, Monthly: 1–31
   */
  checkInDay?: number | null;
  /** Default data source when assigned to a scorecard */
  dataSource?: string | null;
  /** Default acceptable threshold when assigned to a scorecard */
  acceptableThreshold?: number | null;
  createdAt: string;
}

export interface ScorecardKpiTarget {
  id: string;
  scorecardId: string;
  kpiLibraryId: string;
  kpiName: string;
  perspective: string;
  targetLogic: TargetLogic;
  measurementUnit: string;
  weightPercentage: number;
  targetValue: number;
  /** Aspirational stretch target beyond the standard target */
  stretchTarget?: number | null;
  worstCase?: number | null;
  bestCase?: number | null;
  /** How often this KPI expects a check-in */
  cadence?: BscCadence | null;
  /**
   * Check-in day within the cadence period:
   * Weekly: 1–7 (Mon–Sun), BiWeekly: 1–14, Monthly: 1–31
   */
  checkInDay?: number | null;
  actualValue?: number | null;
  evidenceUrl?: string | null;
  evidenceFileName?: string | null;
  evidenceHash?: string | null;
  submittedAt?: string | null;
  approvalStatus: KpiApprovalStatus;
  rejectionReason?: string | null;
  /** Source system for validating reported results */
  dataSource?: string | null;
  /** Minimum (higher-is-better) or maximum (lower-is-better) acceptable result */
  acceptableThreshold?: number | null;
  /** Computed or persisted PEP audit status for Results review */
  pepAuditFlag?: PepAuditFlag | null;
  /** PEP auditor comment when returning a result to the manager for revision */
  pepReturnReason?: string | null;
  /**
   * shared = from scorecard/role template (rebalanced when individuals are added)
   * individual = appended to this person only
   */
  assignmentSource?: 'shared' | 'individual';
  /** Ordered evaluation chain for this KPI */
  evaluationFlow?: BscEvaluatorStep[];
  /**
   * Index into evaluationFlow for the step currently awaiting action.
   * 0 = first step (usually self). Advanced on submit / approve.
   */
  evaluationStepIndex?: number;
  /** @deprecated prefer evaluationFlow */
  evaluatorMode?: BscEvaluatorMode;
  evaluatorUserId?: string | null;
}

export interface FinalEvaluation {
  compositeScore: number;
  managerNote: string;
  evaluatedAt: string;
  evaluatorUserId: string;
}

export interface ScorecardAuditEvent {
  id: string;
  scorecardId: string;
  from: ScorecardStatus | null;
  to: ScorecardStatus;
  actorId: string;
  at: string;
}

export interface EmployeeScorecard {
  id: string;
  userId: string;
  userName: string;
  managerId: string;
  departmentId?: string | null;
  departmentName?: string | null;
  positionId?: string | null;
  positionTitle?: string | null;
  cycleId: string;
  cycleLabel: string;
  /** Used for Variable-Pay-style session/month filtering in mocks */
  periodMonthName?: string | null;
  periodYear?: number | null;
  status: ScorecardStatus;
  targets: ScorecardKpiTarget[];
  acknowledgedAt?: string | null;
  acknowledgedBy?: string | null;
  /** Mock digital signature token applied on employee ack */
  acknowledgmentSignature?: string | null;
  finalEvaluation?: FinalEvaluation | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKpiLibraryInput {
  /** Optional for perspective-catalog KPIs not yet tied to a setup/role */
  evaluationConfigId?: string;
  name: string;
  description?: string | null;
  perspective: string;
  targetLogic?: TargetLogic;
  measurementUnit?: string;
  departmentId?: string | null;
  departmentName?: string | null;
  positionId?: string | null;
  positionTitle?: string | null;
  defaultTarget?: number | null;
  stretchTarget?: number | null;
  weight?: number;
  suggestedWeight?: number | null;
  worstCase?: number | null;
  bestCase?: number | null;
  cadence?: BscCadence | null;
  checkInDay?: number | null;
  dataSource?: string | null;
  acceptableThreshold?: number | null;
}

export interface KpiImportRowInput {
  name: string;
  description?: string | null;
  perspective: string;
  measurementUnit: string;
  weight?: number;
  targetLogic?: TargetLogic;
  defaultTarget?: number | null;
  cadence?: BscCadence | null;
}

export interface KpiImportRowResult {
  row: number;
  input?: KpiImportRowInput;
  error?: string;
}

export interface KpiImportBatchResult {
  created: KpiLibraryItem[];
  errors: KpiImportRowResult[];
}

export interface PepAuditRow {
  scorecardId: string;
  targetId: string;
  userId: string;
  employeeName: string;
  cycleLabel: string;
  departmentName?: string | null;
  kpiName: string;
  perspective: string;
  targetValue: number;
  stretchTarget: number | null;
  actualValue: number | null;
  acceptableThreshold: number | null;
  dataSource: string | null;
  targetLogic: TargetLogic;
  measurementUnit: string;
  pepAuditFlag: PepAuditFlag;
  approvalStatus: KpiApprovalStatus;
  rejectionReason?: string | null;
  pepReturnReason?: string | null;
}

export interface CreateEvaluationConfigInput {
  label: string;
  description?: string | null;
  /** @deprecated Prefer per-KPI cadence */
  cadence: BscCadence;
  /** @deprecated */
  setupKind?: BscSetupKind;
  /** Whether the scorecard template is turned on */
  isActive?: boolean;
  /** From which day counting / check-in may begin (YYYY-MM-DD) */
  effectiveFrom?: string | null;
  fiscalYearId: string;
  fiscalYearName: string;
  periodIds: string[];
  periodLabels: string[];
  startDate: string;
  endDate: string;
  isRecurring?: boolean;
  useCustomDates?: boolean;
  scopeTarget?: BscScopeTarget;
  departmentIds: string[];
  departmentNames: string[];
  positionIds: string[];
  positionTitles: string[];
  /** Optional direct assignees (individuals) */
  employeeIds?: string[];
  employeeNames?: string[];
  evaluatorMode?: BscEvaluatorMode;
  evaluatorUserId?: string | null;
  /** @deprecated prefer kpiEvaluationFlows */
  kpiEvaluators?: Record<string, BscKpiEvaluatorAssignment>;
  kpiEvaluationFlows?: Record<string, BscEvaluatorStep[]>;
}

export interface UpdateEvaluationConfigInput extends Partial<CreateEvaluationConfigInput> {
  status?: CycleStatus;
}

/** @deprecated use CreateEvaluationConfigInput */
export type CreateCycleInput = CreateEvaluationConfigInput;

export interface AssignScorecardInput {
  userId: string;
  userName: string;
  managerId: string;
  departmentId?: string | null;
  positionId?: string | null;
  cycleId: string;
  targets: Array<{
    kpiLibraryId: string;
    weightPercentage: number;
    targetValue: number;
    stretchTarget?: number | null;
    worstCase?: number | null;
    bestCase?: number | null;
    cadence?: BscCadence | null;
    checkInDay?: number | null;
    dataSource?: string | null;
    acceptableThreshold?: number | null;
    evaluationFlow?: BscEvaluatorStep[];
    /** @deprecated prefer evaluationFlow */
    evaluatorMode?: BscEvaluatorMode;
    evaluatorUserId?: string | null;
  }>;
}

/** Append KPIs to one person's scorecard; shared weights are rebalanced to keep 100%. */
export interface AppendIndividualKpisInput {
  scorecardId: string;
  kpis: Array<{
    kpiLibraryId: string;
    weightPercentage: number;
    targetValue: number;
    stretchTarget?: number | null;
    worstCase?: number | null;
    bestCase?: number | null;
    cadence?: BscCadence | null;
    checkInDay?: number | null;
    dataSource?: string | null;
    acceptableThreshold?: number | null;
    evaluationFlow?: BscEvaluatorStep[];
  }>;
  /**
   * Optional explicit weights for existing targets on this person.
   * When provided, those replace auto-rebalance of shared KPIs.
   * Combined with new KPI weights must sum to 100%.
   */
  existingWeights?: Array<{
    targetId: string;
    weightPercentage: number;
  }>;
}

export interface ReportKpiInput {
  targetId: string;
  actualValue: number;
  evidenceUrl?: string;
  evidenceFileName?: string;
  evidenceHash?: string;
  /** Optional data source URL or system label supplied at check-in */
  dataSource?: string | null;
}

/** Manager correction of a reported actual while the scorecard is pending evaluation */
export interface AdjustReportedKpiInput {
  targetId: string;
  actualValue: number;
  dataSource?: string | null;
}

export interface ScoreBreakdownItem {
  targetId: string;
  kpiName: string;
  perspective: string;
  weight: number;
  ratio: number;
  weightedValue: number;
  capped: boolean;
}

export interface CompositeScoreResult {
  compositeScore: number;
  items: ScoreBreakdownItem[];
}

/** Role-level allocation of the three non-financial perspectives. Weights must sum to 100%. */
export interface RolePerspectiveAllocation {
  id: string;
  evaluationConfigId: string;
  positionId: string | null;
  positionTitle: string;
  departmentName?: string | null;
  weights: Record<string, number>;
  updatedAt: string;
}

export interface SaveRolePerspectiveInput {
  evaluationConfigId: string;
  positionId: string | null;
  positionTitle: string;
  departmentName?: string | null;
  weights: Record<string, number>;
}
