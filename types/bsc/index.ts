export enum BscPerspective {
  Customer = 'Customer',
  InternalProcess = 'Internal Process',
  LearningGrowth = 'Learning & Growth',
}

export enum TargetLogic {
  HigherBetter = 'HigherBetter',
  LowerBetter = 'LowerBetter',
  Bounded = 'Bounded',
}

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
  Custom = 'Custom',
}

/** Fiscal-year-backed evaluation period + dept/role scope (replaces free-form cycles) */
export interface EvaluationCycle {
  id: string;
  label: string;
  status: CycleStatus;
  cadence: BscCadence;
  fiscalYearId: string;
  fiscalYearName: string;
  /** Month IDs (Monthly) or Session IDs (Quarterly); empty when using custom dates only */
  periodIds: string[];
  periodLabels: string[];
  startDate: string;
  endDate: string;
  /** When true, evaluations repeat for each matching cadence period */
  isRecurring: boolean;
  /** True when start/end came from the optional date selector */
  useCustomDates: boolean;
  departmentIds: string[];
  departmentNames: string[];
  positionIds: string[];
  positionTitles: string[];
  /** @deprecated kept for assign UI display fallback */
  year?: number;
  month?: number;
}

export interface KpiLibraryItem {
  id: string;
  evaluationConfigId: string;
  name: string;
  description?: string | null;
  perspective: BscPerspective;
  targetLogic: TargetLogic;
  measurementUnit: string;
  departmentId?: string | null;
  departmentName?: string | null;
  positionId?: string | null;
  positionTitle?: string | null;
  defaultTarget?: number | null;
  /** Weight % of the scorecard (0–100); must be set when defining the KPI */
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
  perspective: BscPerspective;
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
}

export interface FinalEvaluation {
  compositeScore: number;
  managerNote: string;
  evaluatedAt: string;
  evaluatorUserId: string;
}

export interface EmployeeScorecard {
  id: string;
  userId: string;
  userName: string;
  managerId: string;
  departmentId?: string | null;
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
  finalEvaluation?: FinalEvaluation | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKpiLibraryInput {
  evaluationConfigId: string;
  name: string;
  description?: string | null;
  perspective: BscPerspective;
  targetLogic?: TargetLogic;
  measurementUnit?: string;
  departmentId?: string | null;
  departmentName?: string | null;
  positionId?: string | null;
  positionTitle?: string | null;
  defaultTarget?: number | null;
  weight: number;
  suggestedWeight?: number | null;
  worstCase?: number | null;
  bestCase?: number | null;
}

export interface CreateEvaluationConfigInput {
  label: string;
  cadence: BscCadence;
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
}

export interface UpdateEvaluationConfigInput
  extends Partial<CreateEvaluationConfigInput> {
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

export interface ReportKpiInput {
  targetId: string;
  actualValue: number;
  evidenceUrl: string;
  evidenceFileName?: string;
}

export interface ScoreBreakdownItem {
  targetId: string;
  kpiName: string;
  perspective: BscPerspective;
  weight: number;
  ratio: number;
  weightedValue: number;
  capped: boolean;
}

export interface CompositeScoreResult {
  compositeScore: number;
  items: ScoreBreakdownItem[];
}
