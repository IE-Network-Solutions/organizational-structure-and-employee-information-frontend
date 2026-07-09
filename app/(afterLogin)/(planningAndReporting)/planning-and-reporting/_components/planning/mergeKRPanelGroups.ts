import type { PlanOwner, PlanSummary } from '../types';
import {
  buildKrPlanningSource,
  countKeyResultMilestones,
  countKeyResultPlanTasks,
  enrichKeyResultWithUserApi,
  getKeyResultProgressPercent,
  getKeyResultProgressRatioText,
  isKeyResultFullyCompletedForPlanning,
  mergeKeyResultWithUserApi,
  resolveKrPanelMetricType,
  resolveKrPlanningBlocked,
  isKnownKrMetricTypeLabel,
} from '@/utils/okrKeyResultProgressDisplay';

export { mergeKeyResultWithUserApi };

/** Matches AggregatedKR in PlanningPanelView (structural merge). */
export interface KRPanelAggregatedKR {
  id: string;
  title: string;
  progress: number;
  taskCount: number;
  metricType: string;
  targetValue: string | number;
  currentValue: string | number;
  progressLabel: string;
  isDeleted: boolean;
  planningBlocked: boolean;
  milestones?: Array<{ status?: string; deletedAt?: string | null }>;
  milestoneCount?: number;
}

export interface KRPanelOwnerGroup {
  ownerKey: string;
  owner: PlanOwner;
  krs: KRPanelAggregatedKR[];
  avgProgress: number;
}

export function normalizeUserKeyResultItems(data: unknown): any[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (
    typeof data === 'object' &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: any[] }).items;
  }
  return [];
}

/**
 * Apply OKR user-KR API data (metric type, milestones, progress) to plan summaries.
 */
export function enrichPlanSummariesWithUserKeyResults(
  plans: PlanSummary[],
  userKeyResultItems: any[],
): PlanSummary[] {
  if (!plans?.length || !userKeyResultItems?.length) return plans;
  return plans.map((plan) => ({
    ...plan,
    keyResults: (plan.keyResults ?? []).map((kr) =>
      enrichKeyResultWithUserApi(kr, userKeyResultItems),
    ),
  }));
}

/** Normalize any KR payload (plan, report, or user API) for the left KR panel cards. */
export function aggregateKeyResultForPanel(
  kr: any,
  taskCount = 0,
  userKeyResultItems: any[] = [],
): KRPanelAggregatedKR {
  const apiKr = userKeyResultItems.find(
    (k) => k && k.deletedAt == null && String(k.id) === String(kr?.id),
  );
  const mergedKr = mergeKeyResultWithUserApi(kr, userKeyResultItems);
  const metricType =
    resolveKrPanelMetricType(mergedKr, apiKr) ||
    resolveKrPanelMetricType(kr, apiKr) ||
    (apiKr ? resolveKrPanelMetricType(apiKr) : '');
  const linkedTaskCount = Math.max(
    taskCount,
    countKeyResultPlanTasks(mergedKr),
    countKeyResultPlanTasks(kr),
  );
  const milestoneCount = countKeyResultMilestones(kr, apiKr ?? undefined);
  return {
    id: String(mergedKr.id ?? kr.id),
    title:
      (mergedKr.title || mergedKr.name || 'Untitled KR').trim() ||
      'Untitled KR',
    progress: getKeyResultProgressPercent(mergedKr),
    taskCount: linkedTaskCount,
    metricType,
    targetValue: mergedKr.targetValue ?? 0,
    currentValue: mergedKr.currentValue ?? 0,
    progressLabel: getKeyResultProgressRatioText(mergedKr),
    isDeleted: mergedKr.deletedAt != null,
    planningBlocked: isKeyResultFullyCompletedForPlanning(mergedKr),
    milestones: mergedKr.milestones ?? mergedKr.Milestones ?? [],
    milestoneCount,
  };
}

function apiKRToAggregated(
  kr: any,
  userKeyResultItems: any[] = [],
): KRPanelAggregatedKR {
  return aggregateKeyResultForPanel(
    kr,
    countKeyResultPlanTasks(kr),
    userKeyResultItems,
  );
}

function recalcAvgProgress(krs: KRPanelAggregatedKR[]): number {
  if (krs.length === 0) return 0;
  return Math.round(krs.reduce((s, k) => s + k.progress, 0) / krs.length);
}

function isGroupForCurrentUser(
  group: KRPanelOwnerGroup,
  plans: PlanSummary[],
  transformedData: any[] | undefined,
  userId: string,
): boolean {
  if (!transformedData?.length || !plans.length) return false;
  return transformedData.some((d: any) => {
    if (d.userId !== userId) return false;
    const p = plans.find((pl) => pl.id === d.id);
    if (!p) return false;
    const key = p.owner?.name || p.id;
    return key === group.ownerKey;
  });
}

/**
 * Appends KRs from GET …/key-results/user/:id that are not already present
 * in plan-backed groups (deduped by KR id). Plan-backed rows win on conflict.
 */
export function mergeUserKeyResultsIntoOwnerGroups(
  groups: KRPanelOwnerGroup[],
  userKeyResultItems: any[],
  plans: PlanSummary[],
  transformedData: any[] | undefined,
  userId: string,
): KRPanelOwnerGroup[] {
  const merged: KRPanelOwnerGroup[] = groups.map((g) => ({
    ...g,
    krs: [...g.krs],
  }));

  const seen = new Set<string>();
  for (const g of merged) {
    for (const kr of g.krs) {
      seen.add(String(kr.id));
    }
  }

  const orphans: KRPanelAggregatedKR[] = [];
  for (const raw of userKeyResultItems) {
    if (!raw || raw.deletedAt != null) continue;
    const id = String(raw.id);
    if (seen.has(id)) continue;
    seen.add(id);
    orphans.push(apiKRToAggregated(raw, userKeyResultItems));
  }

  if (orphans.length === 0) {
    return merged;
  }

  const targetIdx = merged.findIndex((g) =>
    isGroupForCurrentUser(g, plans, transformedData, userId),
  );

  if (targetIdx >= 0) {
    const g = merged[targetIdx]!;
    const nextKrs = [...g.krs, ...orphans];
    merged[targetIdx] = {
      ...g,
      krs: nextKrs,
      avgProgress: recalcAvgProgress(nextKrs),
    };
    return merged;
  }

  merged.unshift({
    ownerKey: `__user_key_results_${userId}`,
    owner: {
      name: 'Your key results',
      role: '',
      avatarInitials: 'KR',
      avatar: undefined,
    },
    krs: orphans,
    avgProgress: recalcAvgProgress(orphans),
  });

  return merged;
}

/** KR ids that must not show a planning + (all cadences: daily / weekly / monthly). */
export function buildBlockedKeyResultIdSet(
  userKeyResultItems: any[],
  panelKrs: Pick<
    KRPanelAggregatedKR,
    'id' | 'metricType' | 'progress' | 'currentValue' | 'targetValue'
  >[] = [],
): Set<string> {
  const ids = new Set<string>();

  const apiById = new Map(
    userKeyResultItems
      .filter((kr) => kr && kr.deletedAt == null)
      .map((kr) => [String(kr.id), kr]),
  );

  for (const panelKr of panelKrs) {
    const apiKr = apiById.get(String(panelKr.id));
    if (resolveKrPlanningBlocked(panelKr, apiKr)) {
      ids.add(String(panelKr.id));
    }
  }

  for (const raw of userKeyResultItems) {
    if (!raw || raw.deletedAt != null) continue;
    const id = String(raw.id);
    if (ids.has(id)) continue;
    if (isKeyResultFullyCompletedForPlanning(raw)) {
      ids.add(id);
    }
  }

  return ids;
}

/** Reconcile plan-panel display with user KR API (status, milestones) for pick blocking. */
export function enrichOwnerGroupsPlanningBlocked(
  groups: KRPanelOwnerGroup[],
  userKeyResultItems: any[],
): KRPanelOwnerGroup[] {
  const apiById = new Map(
    userKeyResultItems
      .filter((kr) => kr && kr.deletedAt == null)
      .map((kr) => [String(kr.id), kr]),
  );

  return groups.map((group) => ({
    ...group,
    krs: group.krs.map((panelKr) => {
      const apiKr = apiById.get(String(panelKr.id));
      const planningSource = buildKrPlanningSource(panelKr, apiKr);
      const planningBlocked = resolveKrPlanningBlocked(panelKr, apiKr);
      const progress =
        planningSource.progress ?? getKeyResultProgressPercent(planningSource);
      const progressLabel = getKeyResultProgressRatioText(planningSource);
      const metricType =
        (apiKr ? resolveKrPanelMetricType(apiKr) : '') ||
        resolveKrPanelMetricType(planningSource, apiKr) ||
        resolveKrPanelMetricType(panelKr, apiKr) ||
        (isKnownKrMetricTypeLabel(panelKr.metricType)
          ? panelKr.metricType
          : '');
      const milestoneCount =
        countKeyResultMilestones(planningSource, apiKr ?? undefined) ||
        panelKr.milestoneCount ||
        0;
      const linkedTaskCount = Math.max(
        panelKr.taskCount,
        countKeyResultPlanTasks(planningSource),
        apiKr ? countKeyResultPlanTasks(apiKr) : 0,
      );

      if (
        planningBlocked === panelKr.planningBlocked &&
        progress === panelKr.progress &&
        progressLabel === panelKr.progressLabel &&
        metricType === panelKr.metricType &&
        linkedTaskCount === panelKr.taskCount &&
        milestoneCount === panelKr.milestoneCount
      ) {
        return panelKr;
      }
      return {
        ...panelKr,
        planningBlocked,
        progress,
        progressLabel,
        metricType,
        taskCount: linkedTaskCount,
        milestoneCount,
        milestones: planningSource.milestones ?? panelKr.milestones,
        currentValue: planningSource.currentValue ?? panelKr.currentValue,
        targetValue: planningSource.targetValue ?? panelKr.targetValue,
      };
    }),
  }));
}

export type ParentPlanContext = {
  planId: string;
  /** e.g. "Your weekly plan" — parent period name lowercased after "Your ". */
  title: string;
};

/** Active unreported parent plan for the current cadence (from planning-period hierarchy). */
export function getActiveUnreportedParentPlanContext(
  hierarchy: unknown,
): ParentPlanContext | null {
  const h = hierarchy as {
    parentPlan?: {
      name?: string;
      plans?: Array<{ id?: string; isReported?: boolean }>;
    };
  } | null;
  if (!h?.parentPlan) return null;
  const plan = h.parentPlan.plans?.find((p) => p.isReported === false);
  if (!plan?.id) return null;
  const periodName = (h.parentPlan.name || 'Parent').trim() || 'Parent';
  const base = periodName.replace(/\s+plan\s*$/i, '').trim() || 'Parent';
  const title = `Your ${base.toLowerCase()} plan`;
  return {
    planId: String(plan.id),
    title,
  };
}
