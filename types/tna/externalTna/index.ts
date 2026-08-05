import { StatusBadgeTheme } from '@/components/common/statusBadge';
import { DateInfo } from '@/types/commons/dateInfo';
import { Meta } from '@/store/server/features/okrPlanningAndReporting/interface';

/** Distinguishes catalogue-backed TNAs from free-text external requests. */
export enum TnaSourceType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

export enum ExternalTrainingStatus {
  PENDING_MANAGER = 'pending-manager',
  PENDING_TNA_OFFICER = 'pending-tna-officer',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export const ExternalTrainingStatusLabel: Record<
  ExternalTrainingStatus,
  string
> = {
  [ExternalTrainingStatus.PENDING_MANAGER]: 'Pending Manager',
  [ExternalTrainingStatus.PENDING_TNA_OFFICER]: 'Pending TNA Officer',
  [ExternalTrainingStatus.APPROVED]: 'Approved',
  [ExternalTrainingStatus.REJECTED]: 'Rejected',
  [ExternalTrainingStatus.CANCELLED]: 'Cancelled',
};

export const ExternalTrainingStatusBadgeTheme: Record<
  ExternalTrainingStatus,
  StatusBadgeTheme
> = {
  [ExternalTrainingStatus.PENDING_MANAGER]: StatusBadgeTheme.secondary,
  [ExternalTrainingStatus.PENDING_TNA_OFFICER]: StatusBadgeTheme.warning,
  [ExternalTrainingStatus.APPROVED]: StatusBadgeTheme.success,
  [ExternalTrainingStatus.REJECTED]: StatusBadgeTheme.danger,
  [ExternalTrainingStatus.CANCELLED]: StatusBadgeTheme.danger,
};

export const externalTrainingStatusOptions: {
  label: string;
  value: ExternalTrainingStatus;
}[] = Object.values(ExternalTrainingStatus).map((value) => ({
  value,
  label: ExternalTrainingStatusLabel[value],
}));

export enum TrainingCommitmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  BREACHED = 'breached',
}

export const TrainingCommitmentStatusLabel: Record<
  TrainingCommitmentStatus,
  string
> = {
  [TrainingCommitmentStatus.ACTIVE]: 'Active',
  [TrainingCommitmentStatus.COMPLETED]: 'Completed',
  [TrainingCommitmentStatus.CANCELLED]: 'Cancelled',
  [TrainingCommitmentStatus.BREACHED]: 'Breached',
};

export const TrainingCommitmentStatusBadgeTheme: Record<
  TrainingCommitmentStatus,
  StatusBadgeTheme
> = {
  [TrainingCommitmentStatus.ACTIVE]: StatusBadgeTheme.warning,
  [TrainingCommitmentStatus.COMPLETED]: StatusBadgeTheme.success,
  [TrainingCommitmentStatus.CANCELLED]: StatusBadgeTheme.secondary,
  [TrainingCommitmentStatus.BREACHED]: StatusBadgeTheme.danger,
};

export const trainingCommitmentStatusOptions: {
  label: string;
  value: TrainingCommitmentStatus;
}[] = Object.values(TrainingCommitmentStatus).map((value) => ({
  value,
  label: TrainingCommitmentStatusLabel[value],
}));

export enum ExternalTrainingApprovalStage {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  TNA_OFFICER = 'tna-officer',
}

export const ExternalTrainingApprovalStageLabel: Record<
  ExternalTrainingApprovalStage,
  string
> = {
  [ExternalTrainingApprovalStage.EMPLOYEE]: 'Employee',
  [ExternalTrainingApprovalStage.MANAGER]: 'Manager',
  [ExternalTrainingApprovalStage.TNA_OFFICER]: 'TNA Officer',
};

export enum ExternalTrainingApprovalAction {
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  PAYMENT_CONFIRMED = 'payment-confirmed',
  COMMITMENT_ACTIVATED = 'commitment-activated',
  COMMITMENT_COMPLETED = 'commitment-completed',
}

export const ExternalTrainingApprovalActionLabel: Record<
  ExternalTrainingApprovalAction,
  string
> = {
  [ExternalTrainingApprovalAction.SUBMITTED]: 'Submitted',
  [ExternalTrainingApprovalAction.APPROVED]: 'Approved',
  [ExternalTrainingApprovalAction.REJECTED]: 'Rejected',
  [ExternalTrainingApprovalAction.CANCELLED]: 'Cancelled',
  [ExternalTrainingApprovalAction.PAYMENT_CONFIRMED]: 'Payment Confirmed',
  [ExternalTrainingApprovalAction.COMMITMENT_ACTIVATED]: 'Commitment Activated',
  [ExternalTrainingApprovalAction.COMMITMENT_COMPLETED]: 'Commitment Completed',
};

/** Progress fields the backend derives for every commitment it returns. */
export interface TrainingCommitmentProgress {
  totalDays: number;
  daysElapsed: number;
  daysRemaining: number;
  progressPercentage: number;
  isExpired: boolean;
}

export interface TrainingCommitment
  extends DateInfo, Partial<TrainingCommitmentProgress> {
  id: string;
  externalTrainingRequestId: string;
  externalTrainingRequest?: ExternalTrainingRequest;
  userId: string;
  departmentId: string | null;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: TrainingCommitmentStatus;
  completedAt: string | null;
  remark: string | null;
  courseName: string | null;
  cost: number | null;
  currencyId: string | null;
  tenantId?: string;
}

export interface ExternalTrainingApproval extends DateInfo {
  id: string;
  externalTrainingRequestId: string;
  stage: ExternalTrainingApprovalStage;
  action: ExternalTrainingApprovalAction;
  actedBy: string | null;
  actedAt: string | null;
  remark: string | null;
  metadata: Record<string, any> | null;
  tenantId?: string;
}

export interface ExternalTrainingRequest extends DateInfo {
  id: string;
  courseName: string;
  cost: number;
  currencyId: string | null;
  trainingProvider: string | null;
  courseLink: string | null;
  businessJustification: string | null;
  trainingNeedCategoryId: string | null;
  trainingStartDate: string | null;
  trainingEndDate: string | null;
  requestedBy: string;
  departmentId: string | null;
  managerId: string | null;
  status: ExternalTrainingStatus;
  managerApprovedBy: string | null;
  managerApprovedAt: string | null;
  managerRemark: string | null;
  tnaOfficerApprovedBy: string | null;
  tnaOfficerApprovedAt: string | null;
  tnaOfficerRemark: string | null;
  isPaymentConfirmed: boolean;
  paymentConfirmedAt: string | null;
  paymentConfirmedBy: string | null;
  paymentReference: string | null;
  paidAmount: number | null;
  commitmentPeriodDays: number | null;
  commitmentStartDate: string | null;
  commitmentEndDate: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  commitment?: TrainingCommitment | null;
  approvals?: ExternalTrainingApproval[];
  tenantId?: string;
}

export interface ExternalTrainingRequestRecord {
  items: ExternalTrainingRequest[];
  meta: Meta;
}

export interface ExternalTrainingEmployeeSummary {
  userId: string;
  requests: ExternalTrainingRequest[];
  commitments: TrainingCommitment[];
  activeCommitments: TrainingCommitment[];
  completedCommitments: TrainingCommitment[];
  stats: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    totalApprovedCost: number;
    paymentsConfirmed: number;
  };
}

export interface ExternalTrainingReportRow {
  id: string;
  courseName: string;
  trainingProvider: string | null;
  cost: number;
  currencyId: string | null;
  requestedBy: string;
  departmentId: string | null;
  managerId: string | null;
  status: ExternalTrainingStatus;
  requestedAt: string;
  managerApprovedAt: string | null;
  tnaOfficerApprovedAt: string | null;
  isPaymentConfirmed: boolean;
  paymentReference: string | null;
  paidAmount: number | null;
  commitmentStartDate: string | null;
  commitmentEndDate: string | null;
  commitmentStatus: TrainingCommitmentStatus | null;
  commitmentProgress: number | null;
  commitmentDaysRemaining: number | null;
}

export interface ExternalTrainingReport {
  summary: {
    totalRequests: number;
    byStatus: Record<string, number>;
    paymentsConfirmed: number;
    paymentsPending: number;
    totalRequestedCost: number;
    totalPaidAmount: number;
    activeCommitments: number;
    completedCommitments: number;
  };
  rows: ExternalTrainingReportRow[];
}

export interface TnaOfficer extends DateInfo {
  id: string;
  userId: string;
  isActive: boolean;
  note: string | null;
  tenantId?: string;
}
