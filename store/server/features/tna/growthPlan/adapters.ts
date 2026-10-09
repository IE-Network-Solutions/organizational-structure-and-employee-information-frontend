/**
 * Maps the Training & Learning growth-plan API to the UI's growth-plan types
 * (and back), so pages keep working with `GrowthPlan`, `GrowthPlanGoal`, etc.
 *
 * Backend vocabulary → UI vocabulary:
 *   plan skill      → goal
 *   checklist title → label, isDone → done
 *   deadline        → targetDeadline
 *   own resource    → material, note → activity of type `note`
 */
import {
  DEFAULT_GROWTH_PLAN_CONFIG,
  GrowthPlan,
  GrowthPlanActivity,
  GrowthPlanCategory,
  GrowthPlanChecklistItem,
  GrowthPlanConfig,
  GrowthPlanGoal,
  GrowthPlanGoalStatus,
  GrowthPlanMaterial,
  GrowthPlanMaterialType,
  GrowthPlanProgressStatus,
  GrowthPlanResourceType,
  GrowthPlanSkill,
  GrowthPlanSkillResource,
  GrowthPlanStatus,
  materialCategoryForType,
  parseYouTubeId,
} from '@/types/tna/growthPlan';
import {
  CreateGrowthPlanPayload,
  SaveGrowthPlanCategoryPayload,
  SaveGrowthPlanSkillPayload,
  UpdateGrowthPlanPayload,
} from '@/store/server/features/tna/growthPlan/interface';

// ---------------------------------------------------------------------------
// Backend shapes
// ---------------------------------------------------------------------------

export type ApiResourceType =
  | 'youtube'
  | 'vimeo'
  | 'video_upload'
  | 'document'
  | 'link'
  | 'tna_course';

export type ApiPlanStatus = 'draft' | 'active' | 'completed';
export type ApiPlanSkillStatus = 'not_started' | 'in_progress' | 'completed';

export interface ApiSkillResource {
  id: string;
  skillId: string;
  type: ApiResourceType;
  title: string;
  description: string | null;
  url: string | null;
  courseId: string | null;
  course?: { id: string; title: string } | null;
  order: number;
}

export interface ApiSkill {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  order: number;
  resources?: ApiSkillResource[];
}

export interface ApiCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface ApiPlanSkill {
  id: string;
  planId: string;
  skillId: string | null;
  skill?: { id: string; name: string } | null;
  isCustom: boolean;
  customSkillName: string | null;
  skillName?: string | null;
  quarterId: string;
  deadline: string;
  measurableOutcome: string;
  status: ApiPlanSkillStatus;
  progressPercent: number;
  completedAt: string | null;
  order: number;
  resourceCount?: number;
  noteCount?: number;
}

export interface ApiPlan {
  id: string;
  userId: string;
  categoryId: string;
  category?: { id: string; name: string } | null;
  fiscalYearId: string;
  status: ApiPlanStatus;
  activatedAt: string | null;
  completedAt: string | null;
  totalSkills: number;
  completedSkills: number;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
  planSkills?: ApiPlanSkill[];
}

export interface ApiChecklistItem {
  id: string;
  title: string;
  weight: number;
  isDone: boolean;
  completedAt: string | null;
  order: number;
}

export interface ApiNote {
  id: string;
  title: string | null;
  body: string;
  createdAt: string;
}

export interface ApiWorkspaceResource {
  id: string;
  source: 'recommended' | 'own';
  type: ApiResourceType;
  title: string;
  description: string | null;
  url: string;
  fileName: string | null;
  mimeType: string | null;
  order: number;
  createdAt: string;
}

export interface ApiWorkspaceCourse {
  resourceId: string;
  courseId: string | null;
  title: string;
  description: string | null;
  course: { id: string; title: string } | null;
  enrolled: boolean;
  enrolledAt: string | null;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface ApiWorkspace {
  plan: {
    id: string;
    userId: string;
    categoryId: string;
    categoryName: string | null;
    fiscalYearId: string;
    status: ApiPlanStatus;
    progressPercent: number;
    totalSkills: number;
    completedSkills: number;
  };
  planSkill: Omit<ApiPlanSkill, 'planId' | 'skill' | 'order'> & {
    skillName: string | null;
  };
  learning: {
    playlist: ApiWorkspaceResource[];
    documents: ApiWorkspaceResource[];
    links: ApiWorkspaceResource[];
    courses: ApiWorkspaceCourse[];
  };
  notes: ApiNote[];
  checklist: ApiChecklistItem[];
}

export interface ApiLimits {
  maxSkillsPerQuarter: number | null;
  maxShortlistedSkills: number | null;
}

/** Resolves org-service names the growth-plan API only references by id. */
export interface GrowthPlanNameLookup {
  fiscalYearName: (id?: string | null) => string | undefined;
  quarterLabel: (id?: string | null) => string | undefined;
}

/** What the skill page needs: the plan, the goal with its log, and learning. */
export interface GrowthPlanSkillWorkspace {
  plan: GrowthPlan;
  goal: GrowthPlanGoal;
  /** Recommended learning (videos, documents, links and TNA courses). */
  resources: GrowthPlanSkillResource[];
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

/** Writes answer `{ item }`; reads answer the entity itself. */
export const unwrapItem = <T>(data: any): T => (data?.item ?? data) as T;

/** Lists answer `{ items, meta }` (paginated) or a bare array. */
export const unwrapItems = <T>(data: any): T[] =>
  Array.isArray(data) ? data : (data?.items ?? []);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Client-made ids (e.g. `res-171…`) must not be sent as existing ids. */
export const isUuid = (value?: string | null): value is string =>
  !!value && UUID.test(value);

// ---------------------------------------------------------------------------
// Type maps
// ---------------------------------------------------------------------------

const RESOURCE_TYPE_FROM_API: Record<ApiResourceType, GrowthPlanResourceType> =
  {
    youtube: 'youtube',
    vimeo: 'vimeo',
    video_upload: 'video',
    document: 'document',
    link: 'link',
    tna_course: 'course',
  };

const RESOURCE_TYPE_TO_API: Record<GrowthPlanResourceType, ApiResourceType> = {
  youtube: 'youtube',
  vimeo: 'vimeo',
  video: 'video_upload',
  document: 'document',
  link: 'link',
  course: 'tna_course',
};

/**
 * Employee materials: the API has no image type, so uploaded images are stored
 * as documents (their mime type brings them back as images) and image URLs as
 * links.
 */
export const materialTypeToApi = (
  type: GrowthPlanMaterialType,
  isUpload: boolean,
): ApiResourceType => {
  switch (type) {
    case 'youtube':
      return 'youtube';
    case 'vimeo':
      return 'vimeo';
    case 'video':
      return 'video_upload';
    case 'document':
      return 'document';
    case 'image':
      return isUpload ? 'document' : 'link';
    default:
      return 'link';
  }
};

const materialTypeFromApi = (
  type: ApiResourceType,
  mimeType?: string | null,
): GrowthPlanMaterialType => {
  switch (type) {
    case 'youtube':
      return 'youtube';
    case 'vimeo':
      return 'vimeo';
    case 'video_upload':
      return 'video';
    case 'document':
      return mimeType?.toLowerCase().startsWith('image/')
        ? 'image'
        : 'document';
    default:
      return 'link';
  }
};

const goalStatusFromApi = (
  planStatus: ApiPlanStatus,
  skillStatus: ApiPlanSkillStatus,
): GrowthPlanGoalStatus => {
  if (planStatus === 'draft') return 'draft';
  return skillStatus === 'completed' ? 'complete' : 'active';
};

const progressStatusFromApi = (
  status: ApiPlanSkillStatus,
): GrowthPlanProgressStatus => {
  if (status === 'completed') return 'ready_for_review';
  if (status === 'in_progress') return 'in_progress';
  return 'not_started';
};

const courseLink = (courseId?: string | null) =>
  courseId ? `/tna/management/${courseId}` : '';

// ---------------------------------------------------------------------------
// API → UI
// ---------------------------------------------------------------------------

export const toSkillResource = (
  resource: ApiSkillResource,
): GrowthPlanSkillResource => {
  const type = RESOURCE_TYPE_FROM_API[resource.type] ?? 'link';
  const url =
    type === 'course' ? courseLink(resource.courseId) : (resource.url ?? '');

  return {
    id: resource.id,
    title: resource.title,
    type,
    url,
    videoId: type === 'youtube' ? parseYouTubeId(url) : null,
    courseId: resource.courseId,
    courseName: resource.course?.title ?? null,
  };
};

export const toSkill = (skill: ApiSkill): GrowthPlanSkill => ({
  id: skill.id,
  name: skill.name,
  requiresEvidence: false,
  categoryId: skill.categoryId,
  resources: [...(skill.resources ?? [])]
    .sort((a, b) => a.order - b.order)
    .map(toSkillResource),
});

/** Category with its skills; selectable once it is active and has skills. */
export const toCategory = (
  category: ApiCategory,
  skills: ApiSkill[],
): GrowthPlanCategory => {
  const own = skills
    .filter((skill) => skill.categoryId === category.id)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  return {
    id: category.id,
    name: category.name,
    description: category.description ?? '',
    isMapped: category.isActive && own.length > 0,
    skills: own.map(toSkill),
  };
};

export const toConfig = (limits?: ApiLimits | null): GrowthPlanConfig => {
  const maxSkillsPerQuarter = limits?.maxSkillsPerQuarter ?? null;
  const maxShortlistedSkills = limits?.maxShortlistedSkills ?? null;

  return {
    ...DEFAULT_GROWTH_PLAN_CONFIG,
    enforceCapacityLimits:
      maxSkillsPerQuarter !== null || maxShortlistedSkills !== null,
    maxSkillsPerQuarter,
    maxSkillsInPlanShortlist: maxShortlistedSkills,
  };
};

export const toGoal = (
  planSkill: Omit<ApiPlanSkill, 'planId' | 'order'> & { order?: number },
  planStatus: ApiPlanStatus,
  lookup?: GrowthPlanNameLookup,
): GrowthPlanGoal => ({
  id: planSkill.id,
  skillId: planSkill.skillId,
  skillName:
    planSkill.skillName ??
    (planSkill.isCustom ? planSkill.customSkillName : planSkill.skill?.name) ??
    'Skill',
  isCustom: planSkill.isCustom,
  measurableOutcome: planSkill.measurableOutcome,
  targetDeadline: planSkill.deadline,
  quarterId: planSkill.quarterId,
  quarterLabel: lookup?.quarterLabel(planSkill.quarterId),
  status: goalStatusFromApi(planStatus, planSkill.status),
  progressStatus: progressStatusFromApi(planSkill.status),
  progressPercent: Math.round(Number(planSkill.progressPercent) || 0),
  materialCount: planSkill.resourceCount,
  noteCount: planSkill.noteCount,
});

export const toPlan = (
  plan: ApiPlan,
  lookup?: GrowthPlanNameLookup,
): GrowthPlan => {
  const planSkills = [...(plan.planSkills ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  return {
    id: plan.id,
    userId: plan.userId,
    fiscalYearId: plan.fiscalYearId,
    fiscalYearName: lookup?.fiscalYearName(plan.fiscalYearId),
    categoryId: plan.categoryId,
    categoryName: plan.category?.name,
    status: plan.status as GrowthPlanStatus,
    configSnapshot: toConfig(null),
    goals: planSkills.map((planSkill) =>
      toGoal(planSkill, plan.status, lookup),
    ),
    shortlistSkillIds: planSkills
      .filter((planSkill) => !planSkill.isCustom && planSkill.skillId)
      .map((planSkill) => planSkill.skillId as string),
    completedAt: plan.completedAt,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    submittedAt: plan.activatedAt,
  };
};

export const toChecklistItem = (
  item: ApiChecklistItem,
): GrowthPlanChecklistItem => ({
  id: item.id,
  label: item.title,
  done: item.isDone,
  weight: Number(item.weight) || 1,
  doneAt: item.completedAt,
});

export const toNoteActivity = (
  note: ApiNote,
  planId: string,
  goalId: string,
): GrowthPlanActivity => ({
  id: note.id,
  planId,
  goalId,
  type: 'note',
  title: note.title ?? undefined,
  body: note.body,
  createdAt: note.createdAt,
});

export const toMaterial = (
  resource: ApiWorkspaceResource,
  planId: string,
  goalId: string,
): GrowthPlanMaterial => {
  const type = materialTypeFromApi(resource.type, resource.mimeType);
  const isUpload = !!resource.fileName;

  return {
    id: resource.id,
    planId,
    goalId,
    type,
    category: materialCategoryForType(type),
    title: resource.title,
    url: isUpload ? null : resource.url,
    videoId: type === 'youtube' ? parseYouTubeId(resource.url) : null,
    fileName: resource.fileName,
    fileUrl: isUpload ? resource.url : null,
    mimeType: resource.mimeType,
    createdAt: resource.createdAt,
  };
};

export const toWorkspace = (
  workspace: ApiWorkspace,
  lookup?: GrowthPlanNameLookup,
): GrowthPlanSkillWorkspace => {
  const { plan: apiPlan, planSkill, learning } = workspace;
  const goalId = planSkill.id;
  const all = [...learning.playlist, ...learning.documents, ...learning.links];

  const recommended = all
    .filter((item) => item.source === 'recommended')
    .sort((a, b) => a.order - b.order)
    .map((item) =>
      toSkillResource({
        id: item.id,
        skillId: planSkill.skillId ?? '',
        type: item.type,
        title: item.title,
        description: item.description,
        url: item.url,
        courseId: null,
        order: item.order,
      }),
    );

  const courses: GrowthPlanSkillResource[] = learning.courses.map((course) => ({
    id: course.resourceId,
    title: course.course?.title || course.title,
    type: 'course',
    url: courseLink(course.courseId),
    videoId: null,
    courseId: course.courseId,
    courseName: course.course?.title ?? course.title,
    enrolled: course.enrolled,
    isCompleted: course.isCompleted,
  }));

  const goal: GrowthPlanGoal = {
    ...toGoal(planSkill, apiPlan.status, lookup),
    checklist: workspace.checklist
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(toChecklistItem),
    activities: workspace.notes.map((note) =>
      toNoteActivity(note, apiPlan.id, goalId),
    ),
    materials: all
      .filter((item) => item.source === 'own')
      .map((item) => toMaterial(item, apiPlan.id, goalId)),
  };

  const plan: GrowthPlan = {
    id: apiPlan.id,
    userId: apiPlan.userId,
    fiscalYearId: apiPlan.fiscalYearId,
    fiscalYearName: lookup?.fiscalYearName(apiPlan.fiscalYearId),
    categoryId: apiPlan.categoryId,
    categoryName: apiPlan.categoryName ?? undefined,
    status: apiPlan.status as GrowthPlanStatus,
    configSnapshot: toConfig(null),
    goals: [goal],
    shortlistSkillIds: [],
  };

  return { plan, goal, resources: [...recommended, ...courses] };
};

// ---------------------------------------------------------------------------
// UI → API
// ---------------------------------------------------------------------------

type GoalInput = CreateGrowthPlanPayload['goals'][number] & { id?: string };

const toPlanSkillInput = (goal: GoalInput, index: number) => ({
  ...(isUuid(goal.id) ? { id: goal.id } : {}),
  ...(goal.isCustom
    ? { isCustom: true, skillName: goal.skillName }
    : { skillId: goal.skillId }),
  quarterId: goal.quarterId,
  deadline: goal.targetDeadline,
  measurableOutcome: goal.measurableOutcome,
  order: index,
});

export const toCreatePlanBody = (payload: CreateGrowthPlanPayload) => ({
  categoryId: payload.categoryId,
  fiscalYearId: payload.fiscalYearId,
  status: payload.asDraft ? 'draft' : 'active',
  skills: payload.goals.map(toPlanSkillInput),
});

export const toUpdatePlanBody = (
  payload: Omit<UpdateGrowthPlanPayload, 'id'>,
) => ({
  ...(payload.categoryId ? { categoryId: payload.categoryId } : {}),
  ...(payload.fiscalYearId ? { fiscalYearId: payload.fiscalYearId } : {}),
  ...(payload.goals ? { skills: payload.goals.map(toPlanSkillInput) } : {}),
});

export const toCategoryBody = (payload: SaveGrowthPlanCategoryPayload) => ({
  ...(isUuid(payload.id) ? { id: payload.id } : {}),
  name: payload.name,
  description: payload.description ?? null,
});

export const toSkillBody = (payload: SaveGrowthPlanSkillPayload) => ({
  ...(isUuid(payload.id) ? { id: payload.id } : {}),
  categoryId: payload.categoryId,
  name: payload.name,
  ...(payload.resources !== undefined
    ? {
        resources: (payload.resources ?? []).map((resource, index) => ({
          ...(isUuid(resource.id) ? { id: resource.id } : {}),
          type: RESOURCE_TYPE_TO_API[resource.type] ?? 'link',
          title: resource.title,
          ...(resource.type === 'course'
            ? { courseId: resource.courseId }
            : { url: resource.url }),
          order: index,
        })),
      }
    : {}),
});
