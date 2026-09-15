import { StatusBadgeTheme } from '@/components/common/statusBadge';
import { DateInfo } from '@/types/commons/dateInfo';
import { Meta } from '@/store/server/features/okrPlanningAndReporting/interface';

/**
 * Distinguishes catalogue-backed courses from free-text training requests.
 * Internal = a `Course` from the learning catalogue, External = a
 * `TrainingRequest`.
 */
export enum TnaSourceType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

export enum TrainingRequestApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export const TrainingRequestApprovalStatusLabel: Record<
  TrainingRequestApprovalStatus,
  string
> = {
  [TrainingRequestApprovalStatus.PENDING]: 'Pending',
  [TrainingRequestApprovalStatus.APPROVED]: 'Approved',
  [TrainingRequestApprovalStatus.REJECTED]: 'Rejected',
  [TrainingRequestApprovalStatus.CANCELLED]: 'Cancelled',
};

export const TrainingRequestApprovalStatusBadgeTheme: Record<
  TrainingRequestApprovalStatus,
  StatusBadgeTheme
> = {
  [TrainingRequestApprovalStatus.PENDING]: StatusBadgeTheme.warning,
  [TrainingRequestApprovalStatus.APPROVED]: StatusBadgeTheme.success,
  [TrainingRequestApprovalStatus.REJECTED]: StatusBadgeTheme.danger,
  [TrainingRequestApprovalStatus.CANCELLED]: StatusBadgeTheme.secondary,
};

export const trainingRequestApprovalStatusOptions: {
  label: string;
  value: TrainingRequestApprovalStatus;
}[] = Object.values(TrainingRequestApprovalStatus).map((value) => ({
  value,
  label: TrainingRequestApprovalStatusLabel[value],
}));

/**
 * Where a request sits in its lifecycle, derived from the flags rather than
 * stored. Approval status alone does not say whether the training has been
 * closed out, paid for or confirmed.
 */
export enum TrainingRequestStage {
  PENDING_APPROVAL = 'pending-approval',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  AWAITING_OUTCOME = 'awaiting-outcome',
  AWAITING_PAYMENT = 'awaiting-payment',
  AWAITING_CONFIRMATION = 'awaiting-confirmation',
  CONFIRMED = 'confirmed',
}

export const TrainingRequestStageLabel: Record<TrainingRequestStage, string> = {
  [TrainingRequestStage.PENDING_APPROVAL]: 'Pending Approval',
  [TrainingRequestStage.REJECTED]: 'Rejected',
  [TrainingRequestStage.CANCELLED]: 'Cancelled',
  [TrainingRequestStage.AWAITING_OUTCOME]: 'Awaiting Outcome',
  [TrainingRequestStage.AWAITING_PAYMENT]: 'Awaiting Payment',
  [TrainingRequestStage.AWAITING_CONFIRMATION]: 'Awaiting Confirmation',
  [TrainingRequestStage.CONFIRMED]: 'Confirmed',
};

export const TrainingRequestStageBadgeTheme: Record<
  TrainingRequestStage,
  StatusBadgeTheme
> = {
  [TrainingRequestStage.PENDING_APPROVAL]: StatusBadgeTheme.warning,
  [TrainingRequestStage.REJECTED]: StatusBadgeTheme.danger,
  [TrainingRequestStage.CANCELLED]: StatusBadgeTheme.secondary,
  [TrainingRequestStage.AWAITING_OUTCOME]: StatusBadgeTheme.secondary,
  [TrainingRequestStage.AWAITING_PAYMENT]: StatusBadgeTheme.warning,
  [TrainingRequestStage.AWAITING_CONFIRMATION]: StatusBadgeTheme.warning,
  [TrainingRequestStage.CONFIRMED]: StatusBadgeTheme.success,
};

export interface TrainingRequest extends DateInfo {
  id: string;
  userId: string;
  courseName: string | null;
  amount: number;
  currencyId: string | null;
  startDate: string | null;
  /** Completion date when passed, failure date when failed. */
  endDate: string | null;
  /** Training provider / where the training came from. */
  source: string | null;
  reason: string | null;
  description: string | null;
  hasCompleted: boolean;
  hasFailed: boolean;
  /** Workflow the request is routed through in the shared approver service. */
  approvalWorkflowId: string | null;
  approvalStatus: TrainingRequestApprovalStatus;
  isPaid: boolean;
  certificatePath: string | null;
  failureFilePath: string | null;
  isConfirmed: boolean;
  commitment?: UserTrainingCommitment | null;
  tenantId?: string;
}

export interface TrainingRequestRecord {
  items: TrainingRequest[];
  meta: Meta;
}

export interface UserTrainingCommitment extends DateInfo {
  id: string;
  commitmentConfigurationId: string | null;
  commitmentConfiguration?: CommitmentConfiguration | null;
  trainingRequestId: string;
  trainingRequest?: TrainingRequest | null;
  userId: string;
  startDate: string;
  endDate: string;
  daysLeft: number;
  amountLeft: number;
  completedCommitment: boolean;
  tenantId?: string;
}

export interface CommitmentConfiguration extends DateInfo {
  id: string;
  currencyId: string | null;
  amountFrom: number;
  /** Null when the band is open-ended — see `applyAboveAmount`. */
  amountTo: number | null;
  /** When true the band covers every amount at or above `amountFrom`. */
  applyAboveAmount: boolean;
  commitmentInDays: number;
  tenantId?: string;
}

/** Human-readable band, e.g. "1,000 – 5,000" or "5,000 and above". */
export const formatCommitmentBand = (
  configuration?: Partial<CommitmentConfiguration> | null,
): string => {
  if (!configuration) return '-';

  const from = Number(configuration.amountFrom ?? 0).toLocaleString();

  if (
    configuration.applyAboveAmount ||
    configuration.amountTo === null ||
    configuration.amountTo === undefined
  ) {
    return `${from} and above`;
  }

  return `${from} – ${Number(configuration.amountTo).toLocaleString()}`;
};

/**
 * Reduces the request flags to the single stage worth showing. Order matters:
 * a terminal approval outcome wins, then the outstanding pre-condition that
 * blocks confirmation.
 */
export const getTrainingRequestStage = (
  request?: Partial<TrainingRequest> | null,
): TrainingRequestStage => {
  if (!request) return TrainingRequestStage.PENDING_APPROVAL;

  if (request.approvalStatus === TrainingRequestApprovalStatus.REJECTED) {
    return TrainingRequestStage.REJECTED;
  }
  if (request.approvalStatus === TrainingRequestApprovalStatus.CANCELLED) {
    return TrainingRequestStage.CANCELLED;
  }
  if (request.approvalStatus !== TrainingRequestApprovalStatus.APPROVED) {
    return TrainingRequestStage.PENDING_APPROVAL;
  }
  if (request.isConfirmed) {
    return TrainingRequestStage.CONFIRMED;
  }
  if (
    !request.endDate ||
    (!request.certificatePath && !request.failureFilePath)
  ) {
    return TrainingRequestStage.AWAITING_OUTCOME;
  }
  if (!request.isPaid) {
    return TrainingRequestStage.AWAITING_PAYMENT;
  }

  return TrainingRequestStage.AWAITING_CONFIRMATION;
};

/** Mirrors the backend's `assertConfirmable` so the UI can gate the button. */
export const isTrainingRequestConfirmable = (
  request?: Partial<TrainingRequest> | null,
): boolean =>
  Boolean(
    request &&
    !request.isConfirmed &&
    request.approvalStatus === TrainingRequestApprovalStatus.APPROVED &&
    request.endDate &&
    (request.certificatePath || request.failureFilePath) &&
    request.isPaid,
  );

/** Share of the commitment already served, from the persisted counters. */
export const getCommitmentProgress = (
  commitment?: Partial<UserTrainingCommitment> | null,
): number => {
  if (!commitment) return 0;
  if (commitment.completedCommitment) return 100;

  const start = commitment.startDate
    ? new Date(commitment.startDate).getTime()
    : null;
  const end = commitment.endDate
    ? new Date(commitment.endDate).getTime()
    : null;

  if (start === null || end === null || end <= start) return 0;

  const totalDays = Math.max(
    1,
    Math.round((end - start) / (24 * 60 * 60 * 1000)),
  );
  const daysLeft = Math.max(0, Number(commitment.daysLeft ?? 0));

  return Math.min(
    100,
    Math.max(0, Math.round(((totalDays - daysLeft) / totalDays) * 100)),
  );
};
