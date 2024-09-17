import { DateInfo } from '@/types/commons/dateInfo';

export enum TrainingNeedAssessmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export enum TrainingNeedAssessmentCertStatus {
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  NOT_COMPLETED = 'not-completed',
}

export interface TrainingNeedCategory extends DateInfo {
  id: string;
  name: string;
  description: string | null;
  tenantId: string;
}

export interface TrainingNeedAssessment extends DateInfo {
  id: string;
  title: string;
  trainingPrice: number;
  assignedUserId: string;
  trainingNeedCategoryId: string;
  trainingNeedCategory: TrainingNeedCategory;
  trainingProofs: TrainingProof[];
  reason: string | null;
  details: string;
  status: TrainingNeedAssessmentStatus;
  certStatus: TrainingNeedAssessmentCertStatus;
  tenantId: string;
  completedAt: string;
}

export interface TrainingProof extends DateInfo {
  id: string;
  trainingNeedAssessmentId: string;
  link: string | null;
  attachmentFile: string | null;
  tenantId: string;
}

export interface CommitmentRule extends DateInfo {
  id: string;
  name: string;
  description: string;
  amountMin: number;
  amountMax: number;
  commitmentPeriodDays: number;
  tenantId: string;
}
