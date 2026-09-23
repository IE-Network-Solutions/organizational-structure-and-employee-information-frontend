export type GrowthPlanStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'partially_approved';

export type GrowthPlanGoalStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completion_requested'
  | 'complete';

export type GrowthPlanProgressStatus =
  | 'not_started'
  | 'in_progress'
  | 'blocked'
  | 'ready_for_review';

export interface GrowthPlanConfig {
  id?: string;
  /** When false, quarter/shortlist caps are not enforced. */
  enforceCapacityLimits: boolean;
  minSkillsPerQuarter: number | null;
  maxSkillsPerQuarter: number | null;
  minSkillsInPlanShortlist: number | null;
  maxSkillsInPlanShortlist: number | null;
}

export interface GrowthPlanSkill {
  id: string;
  name: string;
  requiresEvidence: boolean;
  categoryId?: string;
  resources?: GrowthPlanSkillResource[];
}

export type GrowthPlanResourceType = 'link' | 'youtube' | 'document' | 'course';

export interface GrowthPlanSkillResource {
  id: string;
  title: string;
  type: GrowthPlanResourceType;
  /** External URL, or deep link to `/tna/management/[courseId]` for courses. */
  url: string;
  videoId?: string | null;
  /** TNA course id when type === 'course'. */
  courseId?: string | null;
  courseName?: string | null;
}

export type GrowthPlanActivityType = 'note' | 'link' | 'youtube' | 'file';

export interface GrowthPlanActivity {
  id: string;
  planId: string;
  goalId: string;
  userId?: string;
  type: GrowthPlanActivityType;
  title?: string;
  body?: string;
  url?: string | null;
  videoId?: string | null;
  fileName?: string | null;
  courseId?: string | null;
  createdAt: string;
}

/** Employee-owned materials attached to a skill/goal. */
export type GrowthPlanMaterialType =
  | 'youtube'
  | 'vimeo'
  | 'video'
  | 'document'
  | 'image'
  | 'link';

export type GrowthPlanMaterialCategory =
  | 'video'
  | 'document'
  | 'image'
  | 'link';

export interface GrowthPlanMaterial {
  id: string;
  planId: string;
  goalId: string;
  userId?: string;
  type: GrowthPlanMaterialType;
  category: GrowthPlanMaterialCategory;
  title: string;
  url?: string | null;
  videoId?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  mimeType?: string | null;
  tags?: string[];
  createdAt: string;
}

export interface GrowthPlanReflection {
  id: string;
  planId: string;
  quarterId: string;
  quarterLabel?: string;
  whatWentWell: string;
  whatBlocked: string;
  nextFocus: string;
  createdAt: string;
}

export interface GrowthPlanTeamMemberProgress {
  userId: string;
  userName: string;
  planId: string;
  categoryName?: string;
  status: GrowthPlanStatus;
  completedGoals: number;
  totalGoals: number;
  percent: number;
  overdueGoals: number;
}

export interface GrowthPlanCategory {
  id: string;
  name: string;
  description: string;
  /** True when the category has skills and is selectable in planning. */
  isMapped: boolean;
  skills: GrowthPlanSkill[];
}

export interface GrowthPlanConfigSnapshot {
  enforceCapacityLimits: boolean;
  minSkillsPerQuarter: number | null;
  maxSkillsPerQuarter: number | null;
  minSkillsInPlanShortlist: number | null;
  maxSkillsInPlanShortlist: number | null;
}

export interface GrowthPlanChecklistItem {
  id: string;
  label: string;
  done: boolean;
  /** Relative weight for progress (e.g. 40). Defaults to 1 when omitted. */
  weight?: number;
  doneAt?: string | null;
}

export interface GrowthPlanEvidenceAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType?: string;
}

export interface GrowthPlanGoal {
  id: string;
  skillId?: string | null;
  skillName: string;
  isCustom: boolean;
  measurableOutcome: string;
  targetDeadline: string;
  quarterId: string;
  quarterLabel?: string;
  status: GrowthPlanGoalStatus;
  progressStatus?: GrowthPlanProgressStatus;
  /** 0–100; when omitted, derived from checklist when present. */
  progressPercent?: number | null;
  feedback?: string | null;
  revisionDeadline?: string | null;
  evidenceUrl?: string | null;
  evidenceFileName?: string | null;
  evidenceVideoId?: string | null;
  evidenceAttachments?: GrowthPlanEvidenceAttachment[];
  checklist?: GrowthPlanChecklistItem[];
  activities?: GrowthPlanActivity[];
  /** Employee-attached learning materials for this skill. */
  materials?: GrowthPlanMaterial[];
  proposedChanges?: Partial<
    Pick<
      GrowthPlanGoal,
      | 'skillName'
      | 'measurableOutcome'
      | 'targetDeadline'
      | 'quarterId'
      | 'quarterLabel'
    >
  > | null;
}

export interface GrowthPlan {
  id: string;
  userId: string;
  userName?: string;
  fiscalYearId: string;
  fiscalYearName?: string;
  categoryId: string;
  categoryName?: string;
  status: GrowthPlanStatus;
  configSnapshot: GrowthPlanConfigSnapshot;
  goals: GrowthPlanGoal[];
  shortlistSkillIds: string[];
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string | null;
}

export interface GrowthPlanProgressYear {
  fiscalYearId: string;
  fiscalYearName: string;
  isActive: boolean;
  completedGoals: number;
  totalGoals: number;
}

export interface GrowthPlanProgress {
  planId?: string;
  categoryId?: string;
  categoryName?: string;
  completedGoals: number;
  totalGoals: number;
  generalTrainingComplete: boolean;
  activeGoals: GrowthPlanGoal[];
  years: GrowthPlanProgressYear[];
  reflections?: GrowthPlanReflection[];
}

/** Defaults: limits off until an admin opts in. */
export const DEFAULT_GROWTH_PLAN_CONFIG: GrowthPlanConfig = {
  enforceCapacityLimits: false,
  minSkillsPerQuarter: null,
  maxSkillsPerQuarter: null,
  minSkillsInPlanShortlist: null,
  maxSkillsInPlanShortlist: null,
};

export const SUGGESTED_CAPACITY_LIMITS = {
  minSkillsPerQuarter: 1,
  maxSkillsPerQuarter: 2,
  minSkillsInPlanShortlist: 4,
  maxSkillsInPlanShortlist: null as number | null,
};

export const DEFAULT_GOAL_CHECKLIST_LABELS: string[] = [];

/** Employees add weighted checklist items on the skill page — no wizard defaults. */
export const buildDefaultChecklist = (): GrowthPlanChecklistItem[] => [];

export const GROWTH_PLAN_PROGRESS_STATUS_OPTIONS: Array<{
  value: GrowthPlanProgressStatus;
  label: string;
}> = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'ready_for_review', label: 'Done' },
];

export const isCategorySelectable = (category: GrowthPlanCategory) =>
  category.isMapped && (category.skills?.length ?? 0) > 0;

export const normalizeChecklist = (
  items?: GrowthPlanChecklistItem[] | string[] | null,
): GrowthPlanChecklistItem[] => {
  if (!items?.length) return [];
  if (typeof items[0] === 'string') {
    return (items as string[]).map((label, idx) => ({
      id: `cl-legacy-${idx}`,
      label,
      done: false,
      weight: 1,
    }));
  }
  const raw = items as GrowthPlanChecklistItem[];
  const defaultLabels = new Set(DEFAULT_GOAL_CHECKLIST_LABELS);
  // Drop prototype seed items (no explicit weight).
  const onlyLegacyDefaults = raw.every(
    (item) => defaultLabels.has(item.label) && typeof item.weight !== 'number',
  );
  if (onlyLegacyDefaults) return [];

  return raw.map((item) => ({
    ...item,
    weight:
      typeof item.weight === 'number' && item.weight > 0 ? item.weight : 1,
  }));
};

export const checklistItemWeight = (item: GrowthPlanChecklistItem): number =>
  typeof item.weight === 'number' && item.weight > 0 ? item.weight : 1;

export const checklistProgressPercent = (
  checklist?: GrowthPlanChecklistItem[] | null,
): number => {
  const items = checklist ?? [];
  if (!items.length) return 0;
  const total = items.reduce((sum, i) => sum + checklistItemWeight(i), 0);
  if (!total) return 0;
  const done = items
    .filter((i) => i.done)
    .reduce((sum, i) => sum + checklistItemWeight(i), 0);
  return Math.round((done / total) * 100);
};

export const goalDisplayProgress = (goal: GrowthPlanGoal): number => {
  if (goal.status === 'complete') return 100;
  if (typeof goal.progressPercent === 'number') return goal.progressPercent;
  return checklistProgressPercent(goal.checklist);
};

/** Extract YouTube video id from common URL forms. */
export const parseYouTubeId = (url: string): string | null => {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id || null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      const embed = u.pathname.match(/\/embed\/([^/]+)/);
      if (embed?.[1]) return embed[1];
      const shorts = u.pathname.match(/\/shorts\/([^/]+)/);
      if (shorts?.[1]) return shorts[1];
    }
    return null;
  } catch {
    return null;
  }
};

export type VideoEmbedKind = 'iframe' | 'video';

export interface VideoEmbedInfo {
  kind: VideoEmbedKind;
  src: string;
}

/** Resolve an embeddable video from a resource URL (YouTube, Vimeo, or direct file). */
export const resolveVideoEmbed = (
  url?: string | null,
  videoId?: string | null,
): VideoEmbedInfo | null => {
  const ytId = videoId || (url ? parseYouTubeId(url) : null);
  if (ytId) {
    return {
      kind: 'iframe',
      src: `https://www.youtube.com/embed/${ytId}`,
    };
  }
  if (!url?.trim()) return null;

  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const parts = u.pathname.split('/').filter(Boolean);
      const id =
        host === 'player.vimeo.com' && parts[0] === 'video'
          ? parts[1]
          : parts[0];
      if (id && /^\d+$/.test(id)) {
        return {
          kind: 'iframe',
          src: `https://player.vimeo.com/video/${id}`,
        };
      }
    }

    if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(u.pathname)) {
      return { kind: 'video', src: u.toString() };
    }
  } catch {
    return null;
  }

  return null;
};

export const materialCategoryForType = (
  type: GrowthPlanMaterialType,
): GrowthPlanMaterialCategory => {
  if (type === 'youtube' || type === 'vimeo' || type === 'video')
    return 'video';
  if (type === 'document') return 'document';
  if (type === 'image') return 'image';
  return 'link';
};

/** Infer material type from a URL (YouTube / Vimeo / media / else link). */
export const inferMaterialTypeFromUrl = (
  url: string,
): GrowthPlanMaterialType => {
  if (parseYouTubeId(url)) return 'youtube';
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'vimeo.com' || host === 'player.vimeo.com') return 'vimeo';
    if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(u.pathname)) return 'video';
    if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)(\?|$)/i.test(u.pathname)) {
      return 'document';
    }
    if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(u.pathname)) return 'image';
  } catch {
    /* ignore */
  }
  return 'link';
};

export const inferMaterialTypeFromMime = (
  mime?: string | null,
  fileName?: string | null,
): GrowthPlanMaterialType => {
  const m = (mime || '').toLowerCase();
  const name = (fileName || '').toLowerCase();
  if (m.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(name)) {
    return 'image';
  }
  if (m.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(name)) {
    return 'video';
  }
  if (
    m.includes('pdf') ||
    m.includes('document') ||
    m.includes('msword') ||
    m.includes('sheet') ||
    m.includes('presentation') ||
    /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i.test(name)
  ) {
    return 'document';
  }
  return 'document';
};

export const MATERIAL_CATEGORY_LABEL: Record<
  GrowthPlanMaterialCategory,
  string
> = {
  video: 'Videos',
  document: 'Documents',
  image: 'Images',
  link: 'Links',
};

/** True when text looks like a URL / embeddable video (hide from outcome subtitle). */
export const isUrlLikeOutcome = (text?: string | null): boolean => {
  const t = (text || '').trim();
  if (!t) return false;
  if (/^https?:\/\//i.test(t)) return true;
  if (resolveVideoEmbed(t)) return true;
  try {
    if (inferMaterialTypeFromUrl(t) !== 'link') return true;
  } catch {
    /* ignore */
  }
  return false;
};
