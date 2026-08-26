import { TrainingRequestApprovalStatus } from '@/types/tna/externalTna';

export interface TrainingRequestBody {
  filter?: {
    id?: string[];
    userId?: string[];
    approvalStatus?: TrainingRequestApprovalStatus[];
    isPaid?: boolean;
    isConfirmed?: boolean;
    hasCompleted?: boolean;
    hasFailed?: boolean;
    /** Approved + paid + closed out + proof attached, but not yet confirmed. */
    awaitingConfirmation?: boolean;
    createdAt?: {
      from?: string;
      to?: string;
    };
  };
  modifiers?: {
    search?: string;
  };
}

export interface UserTrainingCommitmentBody {
  filter?: {
    id?: string[];
    userId?: string[];
    commitmentConfigurationId?: string[];
    completedCommitment?: boolean;
  };
}

export interface CommitmentConfigurationBody {
  filter?: {
    id?: string[];
    currencyId?: string[];
    /** Returns the band(s) covering this amount. */
    amount?: number;
  };
}

export interface SaveTrainingRequestPayload {
  id?: string;
  userId: string;
  courseName: string;
  amount: number;
  currencyId?: string;
  approvalWorkflowId?: string;
  startDate?: string;
  source?: string;
  reason?: string;
  description?: string;
}

/** One approver's decision on a step, posted to the shared approver service. */
export interface TrainingRequestApprovalLogPayload {
  approvalWorkflowId: string;
  stepOrder: number;
  requestId: string;
  approvedUserId: string;
  approverRoleId: string;
  action: 'Approved' | 'Rejected';
  tenantId: string;
  comment?: {
    comment: string;
    commentedBy: string;
    tenantId: string;
  };
}

/** Final status the approver service reports back once a workflow finishes. */
export interface TrainingRequestFinalStatusPayload {
  requestId: string;
  status: 'approved' | 'declined';
}

export interface TrainingRequestBulkApprovalPayload {
  userId: string;
  roleId: string;
  page: number;
  limit: number;
}

export interface TrainingRequestDecisionPayload {
  id: string;
  approvalStatus: TrainingRequestApprovalStatus;
  reason?: string;
}

export interface TrainingRequestPaymentPayload {
  id: string;
  isPaid?: boolean;
}

/** Closes a request as passed or failed; `file` is the proof document. */
export interface CloseTrainingRequestPayload {
  id: string;
  endDate: string;
  description?: string;
  file: File;
}

export interface SaveCommitmentConfigurationPayload {
  id?: string;
  currencyId?: string;
  amountFrom: number;
  /** Omitted when `applyAboveAmount` is true. */
  amountTo?: number;
  applyAboveAmount?: boolean;
  commitmentInDays: number;
}
