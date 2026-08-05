import {
  ExternalTrainingStatus,
  TrainingCommitmentStatus,
} from '@/types/tna/externalTna';

export interface ExternalTrainingRequestBody {
  filter?: {
    id?: string[];
    requestedBy?: string[];
    managerId?: string[];
    departmentId?: string[];
    status?: ExternalTrainingStatus[];
    isPaymentConfirmed?: boolean;
    createdAt?: {
      from?: string;
      to?: string;
    };
  };
  modifiers?: {
    search?: string;
  };
}

export interface TrainingCommitmentRequestBody {
  filter?: {
    id?: string[];
    userId?: string[];
    departmentId?: string[];
    status?: TrainingCommitmentStatus[];
  };
  modifiers?: {
    search?: string;
  };
}

export interface SaveExternalTrainingRequestPayload {
  id?: string;
  courseName: string;
  cost: number;
  currencyId?: string | null;
  trainingProvider?: string | null;
  courseLink?: string | null;
  businessJustification?: string | null;
  trainingNeedCategoryId?: string | null;
  trainingStartDate?: string | null;
  trainingEndDate?: string | null;
  requestedBy?: string;
  departmentId?: string | null;
  managerId?: string | null;
  resubmit?: boolean;
}

export type ApprovalDecision = 'approve' | 'reject';

export interface ManagerDecisionPayload {
  id: string;
  decision: ApprovalDecision;
  remark?: string;
  actedBy?: string;
}

export interface TnaOfficerDecisionPayload {
  id: string;
  decision: ApprovalDecision;
  remark?: string;
  actedBy?: string;
  isPaymentConfirmed?: boolean;
  paymentReference?: string;
  paidAmount?: number;
  commitmentPeriodDays?: number;
  commitmentStartDate?: string;
}
