import {
  GrowthPlanCategory,
  GrowthPlanConfig,
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

/** A dated note on a skill (the only activity type the API stores). */
export interface AddGoalActivityPayload {
  planId: string;
  goalId: string;
  type: 'note';
  title?: string;
  body?: string;
}

export interface SaveGoalMaterialPayload {
  planId: string;
  goalId: string;
  type?: GrowthPlanMaterialType;
  title: string;
  /** YouTube / Vimeo / web link. Omit when uploading a file. */
  url?: string;
  /** File to upload (video, document or image). */
  file?: File;
}

export interface DeleteGoalMaterialPayload {
  planId: string;
  goalId: string;
  materialId: string;
}

/** Marks a recommended TNA course completed on the skill. */
export interface ApplyCourseEvidencePayload {
  planId: string;
  goalId: string;
  /** Recommended-course resource id from the skill page. */
  resourceId: string;
  courseId?: string | null;
  courseTitle?: string;
  isCompleted?: boolean;
}

/** Enrols the employee in a recommended TNA course. */
export interface EnrollGoalCoursePayload {
  planId: string;
  goalId: string;
  resourceId: string;
}

export interface CreateGrowthPlanPayload {
  fiscalYearId: string;
  categoryId: string;
  shortlistSkillIds: string[];
  /** When true, plan stays editable draft; otherwise it becomes active immediately. */
  asDraft?: boolean;
  goals: Array<{
    /** Existing goal (plan skill) id when updating. */
    id?: string;
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

export interface GrowthPlanListParams {
  userId?: string;
  fiscalYearId?: string;
  status?: string;
}
