import {
  GrowthPlanCategory,
  GrowthPlanConfig,
  GrowthPlanGoal,
  GrowthPlanMaterialType,
  GrowthPlanSkill,
} from '@/types/tna/growthPlan';

export type SaveGrowthPlanConfigPayload = GrowthPlanConfig;

export type SaveGrowthPlanCategoryPayload = Omit<
  Partial<GrowthPlanCategory>,
  'skills'
> & {
  name: string;
  description?: string;
  isMapped?: boolean;
  /** Optional skills to create with the category (create or add-on edit). */
  skills?: Array<{ name: string }>;
};

export type SaveGrowthPlanSkillPayload = Partial<GrowthPlanSkill> & {
  categoryId: string;
  name: string;
  requiresEvidence?: boolean;
  resources?: GrowthPlanSkill['resources'];
};

export interface AddGoalActivityPayload {
  planId: string;
  goalId: string;
  type: 'note' | 'link' | 'youtube' | 'file';
  title?: string;
  body?: string;
  url?: string;
  videoId?: string;
  fileName?: string;
  courseId?: string;
}

export interface SaveGoalMaterialPayload {
  planId: string;
  goalId: string;
  id?: string;
  type?: GrowthPlanMaterialType;
  title: string;
  url?: string;
  videoId?: string;
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  tags?: string[];
}

export interface DeleteGoalMaterialPayload {
  planId: string;
  goalId: string;
  materialId: string;
}

export interface ApplyCourseEvidencePayload {
  planId: string;
  goalId: string;
  courseId: string;
  courseTitle: string;
  requestCompletion?: boolean;
}

export interface SaveGoalReflectionPayload {
  planId: string;
  quarterId: string;
  quarterLabel?: string;
  whatWentWell: string;
  whatBlocked: string;
  nextFocus: string;
}

export interface CreateGrowthPlanPayload {
  fiscalYearId: string;
  categoryId: string;
  shortlistSkillIds: string[];
  /** When true, plan stays editable draft; otherwise it becomes active immediately. */
  asDraft?: boolean;
  goals: Array<{
    skillId?: string | null;
    skillName: string;
    isCustom: boolean;
    measurableOutcome: string;
    targetDeadline: string;
    quarterId: string;
    quarterLabel?: string;
  }>;
}

export type UpdateGrowthPlanPayload = Partial<CreateGrowthPlanPayload> & {
  id: string;
};

export interface RejectGoalPayload {
  planId: string;
  goalId: string;
  feedback: string;
  revisionDeadline: string;
}

export interface RequestCompletionPayload {
  planId: string;
  goalId: string;
  evidenceUrl?: string;
  evidenceFileName?: string;
  evidenceVideoId?: string;
  evidenceAttachments?: Array<{
    id?: string;
    fileName: string;
    fileUrl: string;
    mimeType?: string;
  }>;
}

export interface UpdateGoalProgressPayload {
  planId: string;
  goalId: string;
  progressStatus?: GrowthPlanGoal['progressStatus'];
  progressPercent?: number | null;
}

export interface ToggleGoalChecklistPayload {
  planId: string;
  goalId: string;
  checklistItemId: string;
  done: boolean;
}

export interface AddGoalChecklistItemPayload {
  planId: string;
  goalId: string;
  label: string;
  weight: number;
}

export interface DeleteGoalChecklistItemPayload {
  planId: string;
  goalId: string;
  checklistItemId: string;
}

export interface ProposeEditPayload {
  planId: string;
  goalId: string;
  changes: Partial<
    Pick<
      GrowthPlanGoal,
      | 'skillName'
      | 'measurableOutcome'
      | 'targetDeadline'
      | 'quarterId'
      | 'quarterLabel'
    >
  >;
}

export interface GrowthPlanListParams {
  userId?: string;
  fiscalYearId?: string;
  status?: string;
}
