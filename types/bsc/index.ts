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

export enum BscCadence {
  Weekly = 'Weekly',
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
  Department = 'Department',
  Role = 'Role',
  Individual = 'Individual',
}

/** Fiscal-year-backed evaluation period + dept/role scope (replaces free-form cycles) */
export interface EvaluationCycle {
  id: string;
  label: string;
  /** Optional purpose / strategy note for this scorecard */
  description?: string | null;
  status: CycleStatus;
  cadence: BscCadence;
  /** Permanent = ongoing; Temporary = fixed active window */
  setupKind?: BscSetupKind;
  fiscalYearId: string;
  fiscalYearName: string;
  /** Month IDs (Monthly) or Session IDs (Quarterly); empty when using custom dates only */
  periodIds: string[];
  periodLabels: string[];
  startDate: string;
  endDate: string;
  /** Permanent always recurs by cadence; temporary is chosen by the user before cadence */
  isRecurring: boolean;
  /** True when start/end came from the temporary duration selector */
  useCustomDates: boolean;
  departmentIds: string[];
  departmentNames: string[];
  positionIds: string[];
  positionTitles: string[];
  /** Optional direct assignees (individuals) */
  employeeIds?: string[];
  employeeNames?: string[];
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
  /** Weight % of the scorecard (0–100); set when assigning KPIs to a role. May be 0 for catalog KPIs. */
  weight: number;
  /** @deprecated use weight */
  suggestedWeight?: number | null;
  worstCase?: number | null;
  bestCase?: number | null;
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
  worstCase?: number | null;
  bestCase?: number | null;
  actualValue?: number | null;
  evidenceUrl?: string | null;
  evidenceFileName?: string | null;
  evidenceHash?: string | null;
  submittedAt?: string | null;
  approvalStatus: KpiApprovalStatus;
  rejectionReason?: string | null;
  /**
   * shared = from scorecard/role template (rebalanced when individuals are added)
   * individual = appended to this person only
   */
  assignmentSource?: 'shared' | 'individual';
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
  weight?: number;
  suggestedWeight?: number | null;
  worstCase?: number | null;
  bestCase?: number | null;
}

export interface CreateEvaluationConfigInput {
  label: string;
  description?: string | null;
  cadence: BscCadence;
  setupKind?: BscSetupKind;
  fiscalYearId: string;
  fiscalYearName: string;
  periodIds: string[];
  periodLabels: string[];
  startDate: string;
  endDate: string;
  isRecurring?: boolean;
  useCustomDates?: boolean;
  departmentIds: string[];
  departmentNames: string[];
  positionIds: string[];
  positionTitles: string[];
  /** Optional direct assignees (individuals) */
  employeeIds?: string[];
  employeeNames?: string[];
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
    worstCase?: number | null;
    bestCase?: number | null;
  }>;
}

/** Append KPIs to one person's scorecard; shared weights are rebalanced to keep 100%. */
export interface AppendIndividualKpisInput {
  scorecardId: string;
  kpis: Array<{
    kpiLibraryId: string;
    weightPercentage: number;
    targetValue: number;
    worstCase?: number | null;
    bestCase?: number | null;
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
}

/** Manager correction of a reported actual while the scorecard is pending evaluation */
export interface AdjustReportedKpiInput {
  targetId: string;
  actualValue: number;
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
