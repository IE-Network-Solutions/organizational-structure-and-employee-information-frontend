import {
  checklistProgressPercent,
  DEFAULT_GROWTH_PLAN_CONFIG,
  GrowthPlan,
  GrowthPlanCategory,
  GrowthPlanConfig,
  GrowthPlanGoal,
  GrowthPlanProgress,
  GrowthPlanReflection,
  GrowthPlanSkill,
  GrowthPlanTeamMemberProgress,
  normalizeChecklist,
  parseYouTubeId,
  materialCategoryForType,
  inferMaterialTypeFromUrl,
  inferMaterialTypeFromMime,
  GrowthPlanMaterial,
} from '@/types/tna/growthPlan';
import { GROWTH_PLAN_TAXONOMY_SEED } from '@/store/server/features/tna/growthPlan/taxonomySeed';
import {
  AddGoalActivityPayload,
  AddGoalChecklistItemPayload,
  CreateGrowthPlanPayload,
  DeleteGoalChecklistItemPayload,
  DeleteGoalMaterialPayload,
  ProposeEditPayload,
  RejectGoalPayload,
  RequestCompletionPayload,
  SaveGoalMaterialPayload,
  SaveGoalReflectionPayload,
  SaveGrowthPlanCategoryPayload,
  SaveGrowthPlanConfigPayload,
  SaveGrowthPlanSkillPayload,
  ToggleGoalChecklistPayload,
  UpdateGoalProgressPayload,
  UpdateGrowthPlanPayload,
} from '@/store/server/features/tna/growthPlan/interface';

const STORAGE_KEY = 'pgp-mock-prototype-v5';

/** Prototype mode — all PGP reads/writes use in-browser fake data. */
export const USE_GROWTH_PLAN_MOCK = true;

const DEMO_PLAN_ID = 'plan-demo-resource-types';

const buildDemoPlan = (userId = 'mock-user', userName = 'You'): GrowthPlan => {
  const now = new Date().toISOString();
  const deadline = new Date();
  deadline.setMonth(deadline.getMonth() + 3);

  const makeGoal = (
    id: string,
    skillId: string,
    skillName: string,
    outcome: string,
    quarterId: string,
    quarterLabel: string,
  ): GrowthPlanGoal => ({
    id,
    skillId,
    skillName,
    isCustom: false,
    measurableOutcome: outcome,
    targetDeadline: deadline.toISOString(),
    quarterId,
    quarterLabel,
    status: 'approved',
    progressStatus: 'not_started',
    progressPercent: 0,
    checklist: [],
    evidenceAttachments: [],
    activities: [],
    materials: [],
  });

  return {
    id: DEMO_PLAN_ID,
    userId,
    userName,
    fiscalYearId: 'fy-demo',
    fiscalYearName: 'FY Demo',
    categoryId: 'cat-product',
    categoryName: 'Product & Project Management',
    status: 'approved',
    configSnapshot: {
      enforceCapacityLimits: DEFAULT_GROWTH_PLAN_CONFIG.enforceCapacityLimits,
      minSkillsPerQuarter: DEFAULT_GROWTH_PLAN_CONFIG.minSkillsPerQuarter,
      maxSkillsPerQuarter: DEFAULT_GROWTH_PLAN_CONFIG.maxSkillsPerQuarter,
      minSkillsInPlanShortlist:
        DEFAULT_GROWTH_PLAN_CONFIG.minSkillsInPlanShortlist,
      maxSkillsInPlanShortlist:
        DEFAULT_GROWTH_PLAN_CONFIG.maxSkillsInPlanShortlist,
    },
    goals: [
      makeGoal(
        'goal-demo-youtube',
        'pm-f-1',
        'Product management fundamentals',
        'Complete the suggested YouTube discovery intro and summarize key takeaways.',
        'q1',
        'Q1',
      ),
      makeGoal(
        'goal-demo-vimeo',
        'pm-f-2',
        'Project management fundamentals',
        'Watch the Vimeo kickoff walkthrough and note three practices to apply.',
        'q1',
        'Q1',
      ),
      makeGoal(
        'goal-demo-course',
        'pm-f-3',
        'Agile principles',
        'Enroll in the TNA Agile delivery essentials course and finish module 1.',
        'q2',
        'Q2',
      ),
      makeGoal(
        'goal-demo-document',
        'pm-f-9',
        'Documentation',
        'Read the documentation best-practices PDF and draft a sample one-pager.',
        'q2',
        'Q2',
      ),
    ],
    shortlistSkillIds: ['pm-f-1', 'pm-f-2', 'pm-f-3', 'pm-f-9'],
    createdAt: now,
    updatedAt: now,
    submittedAt: now,
  };
};

const ensureDemoPlan = (userId?: string, userName?: string) => {
  const uid = userId || 'mock-user';
  const existing = db.plans.find((p) => p.id === DEMO_PLAN_ID);
  if (existing) {
    const changed =
      existing.userId !== uid ||
      (Boolean(userName) && existing.userName !== userName);
    existing.userId = uid;
    if (userName) existing.userName = userName;
    if (changed) persist();
    return;
  }
  db.plans = [buildDemoPlan(uid, userName || 'You'), ...db.plans];
  persist();
};

interface MockDb {
  config: GrowthPlanConfig;
  taxonomy: GrowthPlanCategory[];
  plans: GrowthPlan[];
  reflections: GrowthPlanReflection[];
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const newId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms));

const loadDb = (): MockDb => {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MockDb;
        if (parsed?.taxonomy?.length) {
          if (!parsed.reflections) parsed.reflections = [];
          return parsed;
        }
      }
    } catch {
      /* ignore */
    }
  }
  return {
    config: { ...DEFAULT_GROWTH_PLAN_CONFIG },
    taxonomy: clone(GROWTH_PLAN_TAXONOMY_SEED),
    plans: [buildDemoPlan()],
    reflections: [],
  };
};

let db: MockDb = loadDb();

const persist = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* ignore quota */
  }
};

const syncCategoryMapped = (category: GrowthPlanCategory) => {
  category.isMapped =
    category.isMapped !== false && (category.skills?.length ?? 0) > 0
      ? category.isMapped
      : category.isMapped;
  // Keep explicit isMapped from admin; selectable = mapped && has skills
};

export const mockGetConfig = async (): Promise<GrowthPlanConfig> => {
  await delay();
  return clone(db.config);
};

export const mockPutConfig = async (
  data: SaveGrowthPlanConfigPayload,
): Promise<GrowthPlanConfig> => {
  await delay();
  db.config = { ...db.config, ...data, id: data.id ?? db.config.id ?? 'cfg-1' };
  persist();
  return clone(db.config);
};

export const mockGetTaxonomy = async (): Promise<GrowthPlanCategory[]> => {
  await delay();
  return clone(db.taxonomy);
};

export const mockSaveCategory = async (
  data: SaveGrowthPlanCategoryPayload,
): Promise<GrowthPlanCategory> => {
  await delay();

  const appendSkills = (cat: GrowthPlanCategory) => {
    const names = (data.skills ?? [])
      .map((s) => s.name?.trim())
      .filter(Boolean) as string[];
    if (!names.length) return;
    for (const name of names) {
      cat.skills.push({
        id: newId('skill'),
        name,
        requiresEvidence: false,
        categoryId: cat.id,
      });
    }
    if (cat.skills.length > 0) cat.isMapped = true;
    syncCategoryMapped(cat);
  };

  if (data.id) {
    const idx = db.taxonomy.findIndex((c) => c.id === data.id);
    if (idx >= 0) {
      db.taxonomy[idx] = {
        ...db.taxonomy[idx],
        name: data.name,
        description: data.description ?? db.taxonomy[idx].description,
        isMapped:
          data.isMapped !== undefined
            ? data.isMapped
            : db.taxonomy[idx].isMapped,
      };
      appendSkills(db.taxonomy[idx]);
      persist();
      return clone(db.taxonomy[idx]);
    }
  }
  const created: GrowthPlanCategory = {
    id: newId('cat'),
    name: data.name,
    description: data.description ?? '',
    isMapped: data.isMapped !== false,
    skills: [],
  };
  appendSkills(created);
  db.taxonomy = [created, ...db.taxonomy];
  persist();
  return clone(created);
};

export const mockDeleteCategory = async (
  id: string,
): Promise<{ id: string }> => {
  await delay();
  db.taxonomy = db.taxonomy.filter((c) => c.id !== id);
  persist();
  return { id };
};

export const mockSaveSkill = async (
  data: SaveGrowthPlanSkillPayload,
): Promise<GrowthPlanSkill> => {
  await delay();
  const cat = db.taxonomy.find((c) => c.id === data.categoryId);
  if (!cat) throw new Error('Category not found');

  if (data.id) {
    const idx = cat.skills.findIndex((s) => s.id === data.id);
    if (idx >= 0) {
      cat.skills[idx] = {
        ...cat.skills[idx],
        name: data.name,
        requiresEvidence: Boolean(data.requiresEvidence),
        categoryId: data.categoryId,
        resources: data.resources ?? cat.skills[idx].resources ?? [],
      };
      persist();
      return clone(cat.skills[idx]);
    }
  }

  const skill: GrowthPlanSkill = {
    id: newId('skill'),
    name: data.name,
    requiresEvidence: Boolean(data.requiresEvidence),
    categoryId: data.categoryId,
    resources: data.resources ?? [],
  };
  cat.skills = [...cat.skills, skill];
  if (cat.skills.length > 0) cat.isMapped = true;
  syncCategoryMapped(cat);
  persist();
  return clone(skill);
};

export const mockDeleteSkill = async (id: string): Promise<{ id: string }> => {
  await delay();
  for (const cat of db.taxonomy) {
    const before = cat.skills.length;
    cat.skills = cat.skills.filter((s) => s.id !== id);
    if (cat.skills.length !== before) {
      persist();
      return { id };
    }
  }
  return { id };
};

export const mockGetPlans = async (params: {
  userId?: string;
}): Promise<GrowthPlan[]> => {
  await delay();
  ensureDemoPlan(params.userId);
  let plans = db.plans;
  if (params.userId) {
    plans = plans.filter((p) => p.userId === params.userId);
  }
  return clone(plans);
};

export const mockGetPlanById = async (
  id: string,
): Promise<GrowthPlan | null> => {
  await delay();
  if (id === DEMO_PLAN_ID) ensureDemoPlan();
  return clone(db.plans.find((p) => p.id === id) ?? null);
};

export const mockGetPendingApprovals = async (): Promise<GrowthPlan[]> => {
  await delay();
  return clone(
    db.plans.filter(
      (p) =>
        p.status === 'pending_approval' ||
        p.status === 'partially_approved' ||
        p.goals.some(
          (g) =>
            g.status === 'completion_requested' || Boolean(g.proposedChanges),
        ),
    ),
  );
};

export const mockCreatePlan = async (
  data: CreateGrowthPlanPayload,
  userId = 'mock-user',
  userName = 'You',
): Promise<GrowthPlan> => {
  await delay();
  const category = db.taxonomy.find((c) => c.id === data.categoryId);
  const asDraft = Boolean(data.asDraft);
  const goalStatus = asDraft ? 'draft' : 'approved';
  const goals: GrowthPlanGoal[] = data.goals.map((g) => ({
    id: newId('goal'),
    skillId: g.skillId,
    skillName: g.skillName,
    isCustom: g.isCustom,
    measurableOutcome: g.measurableOutcome,
    targetDeadline: g.targetDeadline,
    quarterId: g.quarterId,
    quarterLabel: g.quarterLabel,
    status: goalStatus,
    progressStatus: 'not_started',
    progressPercent: 0,
    checklist: [],
    evidenceAttachments: [],
    activities: [],
    materials: [],
  }));

  const now = new Date().toISOString();
  const plan: GrowthPlan = {
    id: newId('plan'),
    userId,
    userName,
    fiscalYearId: data.fiscalYearId,
    fiscalYearName: 'Active fiscal year',
    categoryId: data.categoryId,
    categoryName: category?.name,
    status: asDraft ? 'draft' : 'approved',
    configSnapshot: {
      enforceCapacityLimits: db.config.enforceCapacityLimits,
      minSkillsPerQuarter: db.config.minSkillsPerQuarter,
      maxSkillsPerQuarter: db.config.maxSkillsPerQuarter,
      minSkillsInPlanShortlist: db.config.minSkillsInPlanShortlist,
      maxSkillsInPlanShortlist: db.config.maxSkillsInPlanShortlist,
    },
    goals,
    shortlistSkillIds: data.shortlistSkillIds,
    createdAt: now,
    updatedAt: now,
    submittedAt: asDraft ? null : now,
  };
  db.plans = [plan, ...db.plans];
  persist();
  return clone(plan);
};

export const mockUpdatePlan = async (
  data: UpdateGrowthPlanPayload,
): Promise<GrowthPlan> => {
  await delay();
  const idx = db.plans.findIndex((p) => p.id === data.id);
  if (idx < 0) throw new Error('Plan not found');
  const existing = db.plans[idx];
  const category = data.categoryId
    ? db.taxonomy.find((c) => c.id === data.categoryId)
    : undefined;

  if (data.goals) {
    existing.goals = data.goals.map((g) => ({
      id: newId('goal'),
      skillId: g.skillId,
      skillName: g.skillName,
      isCustom: g.isCustom,
      measurableOutcome: g.measurableOutcome,
      targetDeadline: g.targetDeadline,
      quarterId: g.quarterId,
      quarterLabel: g.quarterLabel,
      status: 'draft',
    }));
  }
  if (data.categoryId) {
    existing.categoryId = data.categoryId;
    existing.categoryName = category?.name ?? existing.categoryName;
  }
  if (data.shortlistSkillIds) {
    existing.shortlistSkillIds = data.shortlistSkillIds;
  }
  if (data.fiscalYearId) existing.fiscalYearId = data.fiscalYearId;
  existing.updatedAt = new Date().toISOString();
  persist();
  return clone(existing);
};

export const mockSubmitPlan = async (id: string): Promise<GrowthPlan> => {
  await delay();
  const plan = db.plans.find((p) => p.id === id);
  if (!plan) throw new Error('Plan not found');
  const now = new Date().toISOString();
  plan.status = 'approved';
  plan.submittedAt = now;
  plan.goals = plan.goals.map((g) => ({
    ...g,
    status: g.status === 'rejected' ? g.status : 'approved',
    progressStatus: g.progressStatus ?? 'not_started',
    checklist: normalizeChecklist(g.checklist as any),
  }));
  plan.updatedAt = now;
  persist();
  return clone(plan);
};

export const mockApprovePlan = async (id: string): Promise<GrowthPlan> => {
  await delay();
  const plan = db.plans.find((p) => p.id === id);
  if (!plan) throw new Error('Plan not found');
  plan.status = 'approved';
  plan.goals = plan.goals.map((g) => {
    if (g.proposedChanges) {
      return {
        ...g,
        ...g.proposedChanges,
        proposedChanges: null,
        status: 'approved',
      };
    }
    if (g.status === 'rejected') return g;
    return {
      ...g,
      status: 'approved',
      progressStatus: g.progressStatus ?? 'not_started',
      checklist: normalizeChecklist(g.checklist as any),
    };
  });
  plan.updatedAt = new Date().toISOString();
  persist();
  return clone(plan);
};

export const mockRejectGoal = async (
  data: RejectGoalPayload,
): Promise<GrowthPlan> => {
  await delay();
  const plan = db.plans.find((p) => p.id === data.planId);
  if (!plan) throw new Error('Plan not found');
  plan.goals = plan.goals.map((g) =>
    g.id === data.goalId
      ? {
          ...g,
          status: 'rejected',
          feedback: data.feedback,
          revisionDeadline: data.revisionDeadline,
        }
      : g,
  );
  const allRejected = plan.goals.every((g) => g.status === 'rejected');
  const someApproved = plan.goals.some((g) => g.status === 'approved');
  plan.status = allRejected
    ? 'rejected'
    : someApproved
      ? 'partially_approved'
      : 'pending_approval';
  plan.updatedAt = new Date().toISOString();
  persist();
  return clone(plan);
};

export const mockRequestCompletion = async (
  data: RequestCompletionPayload,
): Promise<GrowthPlan> => {
  await delay();
  const plan = db.plans.find((p) => p.id === data.planId);
  if (!plan) throw new Error('Plan not found');
  plan.goals = plan.goals.map((g) =>
    g.id === data.goalId
      ? {
          ...g,
          status: 'completion_requested',
          progressStatus: 'ready_for_review',
          evidenceUrl: data.evidenceUrl,
          evidenceFileName: data.evidenceFileName,
          evidenceVideoId: data.evidenceVideoId ?? null,
          evidenceAttachments: (data.evidenceAttachments ?? []).map((a) => ({
            id: a.id ?? newId('att'),
            fileName: a.fileName,
            fileUrl: a.fileUrl,
            mimeType: a.mimeType,
          })),
        }
      : g,
  );
  plan.updatedAt = new Date().toISOString();
  persist();
  return clone(plan);
};

export const mockUpdateGoalProgress = async (
  data: UpdateGoalProgressPayload,
): Promise<GrowthPlan> => {
  await delay();
  const plan = db.plans.find((p) => p.id === data.planId);
  if (!plan) throw new Error('Plan not found');
  plan.goals = plan.goals.map((g) => {
    if (g.id !== data.goalId) return g;
    return {
      ...g,
      progressStatus: data.progressStatus ?? g.progressStatus,
      progressPercent:
        data.progressPercent !== undefined
          ? data.progressPercent
          : g.progressPercent,
    };
  });
  plan.updatedAt = new Date().toISOString();
  persist();
  return clone(plan);
};

export const mockToggleGoalChecklist = async (
  data: ToggleGoalChecklistPayload,
): Promise<GrowthPlan> => {
  await delay();
  const plan = db.plans.find((p) => p.id === data.planId);
  if (!plan) throw new Error('Plan not found');
  plan.goals = plan.goals.map((g) => {
    if (g.id !== data.goalId) return g;
    const checklist = normalizeChecklist(g.checklist as any).map((item) =>
      item.id === data.checklistItemId
        ? {
            ...item,
            done: data.done,
            doneAt: data.done ? new Date().toISOString() : null,
          }
        : item,
    );
    const percent = checklistProgressPercent(checklist);
    return {
      ...g,
      checklist,
      progressPercent: percent,
      progressStatus:
        percent === 0
          ? 'not_started'
          : percent === 100
            ? g.progressStatus === 'ready_for_review'
              ? 'ready_for_review'
              : 'in_progress'
            : 'in_progress',
    };
  });
  plan.updatedAt = new Date().toISOString();
  persist();
  return clone(plan);
};

export const mockAddGoalChecklistItem = async (
  data: AddGoalChecklistItemPayload,
): Promise<GrowthPlan> => {
  await delay();
  const plan = db.plans.find((p) => p.id === data.planId);
  if (!plan) throw new Error('Plan not found');
  const weight =
    typeof data.weight === 'number' && data.weight > 0
      ? Math.round(data.weight)
      : 1;
  const item = {
    id: newId('cl'),
    label: data.label.trim(),
    done: false,
    weight,
  };
  plan.goals = plan.goals.map((g) => {
    if (g.id !== data.goalId) return g;
    const checklist = [...normalizeChecklist(g.checklist as any), item];
    const percent = checklistProgressPercent(checklist);
    return {
      ...g,
      checklist,
      progressPercent: percent,
      progressStatus:
        percent === 0
          ? 'not_started'
          : percent === 100
            ? 'ready_for_review'
            : 'in_progress',
    };
  });
  plan.updatedAt = new Date().toISOString();
  persist();
  return clone(plan);
};

export const mockDeleteGoalChecklistItem = async (
  data: DeleteGoalChecklistItemPayload,
): Promise<GrowthPlan> => {
  await delay();
  const plan = db.plans.find((p) => p.id === data.planId);
  if (!plan) throw new Error('Plan not found');
  plan.goals = plan.goals.map((g) => {
    if (g.id !== data.goalId) return g;
    const checklist = normalizeChecklist(g.checklist as any).filter(
      (item) => item.id !== data.checklistItemId,
    );
    const percent = checklistProgressPercent(checklist);
    return {
      ...g,
      checklist,
      progressPercent: percent,
      progressStatus:
        percent === 0
          ? 'not_started'
          : percent === 100
            ? 'ready_for_review'
            : 'in_progress',
    };
  });
  plan.updatedAt = new Date().toISOString();
  persist();
  return clone(plan);
};

export const mockSignOffGoal = async ({
  planId,
  goalId,
}: {
  planId: string;
  goalId: string;
}): Promise<GrowthPlan> => {
  await delay();
  const plan = db.plans.find((p) => p.id === planId);
  if (!plan) throw new Error('Plan not found');
  plan.goals = plan.goals.map((g) =>
    g.id === goalId ? { ...g, status: 'complete' } : g,
  );
  if (plan.goals.every((g) => g.status === 'complete')) {
    plan.completedAt = new Date().toISOString();
  }
  plan.updatedAt = new Date().toISOString();
  persist();
  return clone(plan);
};

export const mockProposeEdit = async (
  data: ProposeEditPayload,
): Promise<GrowthPlan> => {
  await delay();
  const plan = db.plans.find((p) => p.id === data.planId);
  if (!plan) throw new Error('Plan not found');
  plan.goals = plan.goals.map((g) =>
    g.id === data.goalId
      ? { ...g, proposedChanges: data.changes, status: 'pending' }
      : g,
  );
  plan.status = 'pending_approval';
  plan.updatedAt = new Date().toISOString();
  persist();
  return clone(plan);
};

export const mockGetMyProgress = async (
  userId = 'mock-user',
): Promise<GrowthPlanProgress | null> => {
  await delay();
  ensureDemoPlan(userId);
  const plan =
    db.plans.find(
      (p) =>
        p.userId === userId &&
        (p.status === 'approved' || p.status === 'partially_approved'),
    ) ??
    db.plans.find(
      (p) => p.status === 'approved' || p.status === 'partially_approved',
    );
  if (!plan) return null;

  const completedGoals = plan.goals.filter(
    (g) => g.status === 'complete',
  ).length;
  const totalGoals = plan.goals.length;

  return {
    planId: plan.id,
    categoryId: plan.categoryId,
    categoryName: plan.categoryName,
    completedGoals,
    totalGoals,
    generalTrainingComplete: false,
    activeGoals: plan.goals
      .filter(
        (g) => g.status === 'approved' || g.status === 'completion_requested',
      )
      .map((g) => ({
        ...g,
        checklist: normalizeChecklist(g.checklist as any),
        activities: g.activities ?? [],
        materials: g.materials ?? [],
        progressStatus: g.progressStatus ?? 'not_started',
        progressPercent:
          typeof g.progressPercent === 'number'
            ? g.progressPercent
            : checklistProgressPercent(normalizeChecklist(g.checklist as any)),
      })),
    years: [
      {
        fiscalYearId: plan.fiscalYearId,
        fiscalYearName: plan.fiscalYearName || 'Current',
        isActive: true,
        completedGoals,
        totalGoals,
      },
    ],
    reflections: (db.reflections ?? []).filter((r) => r.planId === plan.id),
  };
};

export const mockAddGoalActivity = async (
  data: AddGoalActivityPayload,
  userId = 'mock-user',
): Promise<GrowthPlan> => {
  await delay();
  const plan = db.plans.find((p) => p.id === data.planId);
  if (!plan) throw new Error('Plan not found');
  const videoId =
    data.videoId ??
    (data.url && data.type === 'youtube' ? parseYouTubeId(data.url) : null);
  const activity = {
    id: newId('act'),
    planId: data.planId,
    goalId: data.goalId,
    userId,
    type: data.type,
    title: data.title,
    body: data.body,
    url: data.url ?? null,
    videoId: videoId ?? null,
    fileName: data.fileName ?? null,
    courseId: data.courseId ?? null,
    createdAt: new Date().toISOString(),
  };
  plan.goals = plan.goals.map((g) =>
    g.id === data.goalId
      ? { ...g, activities: [activity, ...(g.activities ?? [])] }
      : g,
  );
  plan.updatedAt = new Date().toISOString();
  persist();
  return clone(plan);
};

export const mockSaveGoalMaterial = async (
  data: SaveGoalMaterialPayload,
  userId = 'mock-user',
): Promise<GrowthPlan> => {
  await delay();
  const plan = db.plans.find((p) => p.id === data.planId);
  if (!plan) throw new Error('Plan not found');

  const fromFile = Boolean(data.fileUrl || data.fileName);
  const type =
    data.type ??
    (fromFile
      ? inferMaterialTypeFromMime(data.mimeType, data.fileName)
      : data.url
        ? inferMaterialTypeFromUrl(data.url)
        : 'link');
  const category = materialCategoryForType(type);
  const videoId =
    data.videoId ??
    (data.url && type === 'youtube' ? parseYouTubeId(data.url) : null);

  const material: GrowthPlanMaterial = {
    id: data.id ?? newId('mat'),
    planId: data.planId,
    goalId: data.goalId,
    userId,
    type,
    category,
    title: data.title.trim() || data.fileName || 'Untitled material',
    url: data.url ?? null,
    videoId: videoId ?? null,
    fileName: data.fileName ?? null,
    fileUrl: data.fileUrl ?? null,
    mimeType: data.mimeType ?? null,
    tags: data.tags ?? [],
    createdAt: new Date().toISOString(),
  };

  plan.goals = plan.goals.map((g) => {
    if (g.id !== data.goalId) return g;
    const list = g.materials ?? [];
    if (data.id) {
      return {
        ...g,
        materials: list.map((m) => (m.id === data.id ? material : m)),
      };
    }
    return { ...g, materials: [material, ...list] };
  });
  plan.updatedAt = new Date().toISOString();
  persist();
  return clone(plan);
};

export const mockDeleteGoalMaterial = async (
  data: DeleteGoalMaterialPayload,
): Promise<GrowthPlan> => {
  await delay();
  const plan = db.plans.find((p) => p.id === data.planId);
  if (!plan) throw new Error('Plan not found');
  plan.goals = plan.goals.map((g) =>
    g.id === data.goalId
      ? {
          ...g,
          materials: (g.materials ?? []).filter(
            (m) => m.id !== data.materialId,
          ),
        }
      : g,
  );
  plan.updatedAt = new Date().toISOString();
  persist();
  return clone(plan);
};

export const mockApplyCourseEvidence = async (
  data: {
    planId: string;
    goalId: string;
    courseId: string;
    courseTitle: string;
    requestCompletion?: boolean;
  },
  userId = 'mock-user',
): Promise<GrowthPlan> => {
  await delay();
  const courseUrl = `/tna/management/${data.courseId}`;
  await mockAddGoalActivity(
    {
      planId: data.planId,
      goalId: data.goalId,
      type: 'link',
      title: `Completed TNA course: ${data.courseTitle}`,
      body: 'Applied course completion as learning evidence from Training Management.',
      url: courseUrl,
      courseId: data.courseId,
    },
    userId,
  );
  if (data.requestCompletion) {
    return mockRequestCompletion({
      planId: data.planId,
      goalId: data.goalId,
      evidenceUrl: courseUrl,
      evidenceFileName: data.courseTitle,
    });
  }
  const plan = db.plans.find((p) => p.id === data.planId);
  if (!plan) throw new Error('Plan not found');
  return clone(plan);
};

export const mockSaveReflection = async (
  data: SaveGoalReflectionPayload,
): Promise<GrowthPlanReflection> => {
  await delay();
  if (!db.reflections) db.reflections = [];
  const reflection: GrowthPlanReflection = {
    id: newId('ref'),
    planId: data.planId,
    quarterId: data.quarterId,
    quarterLabel: data.quarterLabel,
    whatWentWell: data.whatWentWell,
    whatBlocked: data.whatBlocked,
    nextFocus: data.nextFocus,
    createdAt: new Date().toISOString(),
  };
  db.reflections = [
    reflection,
    ...db.reflections.filter(
      (r) => !(r.planId === data.planId && r.quarterId === data.quarterId),
    ),
  ];
  persist();
  return clone(reflection);
};

export const mockGetTeamProgress = async (): Promise<
  GrowthPlanTeamMemberProgress[]
> => {
  await delay();
  const today = new Date().toISOString().slice(0, 10);
  return clone(
    db.plans
      .filter(
        (p) =>
          p.status === 'approved' ||
          p.status === 'partially_approved' ||
          p.status === 'pending_approval',
      )
      .map((p) => {
        const completedGoals = p.goals.filter(
          (g) => g.status === 'complete',
        ).length;
        const totalGoals = p.goals.length || 1;
        const overdueGoals = p.goals.filter(
          (g) =>
            g.status !== 'complete' &&
            g.targetDeadline &&
            g.targetDeadline < today,
        ).length;
        return {
          userId: p.userId,
          userName: p.userName || 'Employee',
          planId: p.id,
          categoryName: p.categoryName,
          status: p.status,
          completedGoals,
          totalGoals: p.goals.length,
          percent: Math.round((completedGoals / totalGoals) * 100),
          overdueGoals,
        };
      }),
  );
};

/** Reset prototype data back to seed taxonomy. */
export const mockResetPrototype = () => {
  db = {
    config: { ...DEFAULT_GROWTH_PLAN_CONFIG },
    taxonomy: clone(GROWTH_PLAN_TAXONOMY_SEED),
    plans: [buildDemoPlan()],
    reflections: [],
  };
  persist();
};
