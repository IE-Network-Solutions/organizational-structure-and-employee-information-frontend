import {
  buildKrPlanningSource,
  enrichKeyResultWithUserApi,
  getKeyResultProgressPercent,
  getKeyResultProgressRatioText,
  getMetricTypeName,
  isKeyResultFullyCompletedForPlanning,
  mergeKeyResultWithUserApi,
  mergeKrMetricRicher,
  resolveKrCardMetricLabel,
  resolveKrPanelMetricType,
  resolveKrPlanningBlocked,
} from '@/utils/okrKeyResultProgressDisplay';
import type { PlanOwner, PlanSummary } from '../types';

/** Matches AggregatedKR in PlanningPanelView (structural merge). */
export interface KRPanelAggregatedKR {
  id: string;
  title: string;
  progress: number;
  taskCount: number;
  metricType: string;
  key_type?: string;
  targetValue: string | number;
  currentValue: string | number;
  progressLabel: string;
  isDeleted: boolean;
  planningBlocked: boolean;
  milestones?: Array<{ status?: string; deletedAt?: string | null }>;
}

export interface KRPanelOwnerGroup {
  ownerKey: string;
  owner: PlanOwner;
  krs: KRPanelAggregatedKR[];
  avgProgress: number;
}

/** Distinct plan-owner user ids for panel OKR enrichment (includes logged-in user). */
export function collectPlanOwnerUserIds(
  plans: PlanSummary[],
  loggedInUserId?: string,
): string[] {
  const ids = new Set<string>();
  if (loggedInUserId) ids.add(String(loggedInUserId));
  for (const plan of plans ?? []) {
    const ownerId = plan.ownerUserId?.trim();
    if (ownerId) ids.add(ownerId);
  }
  return [...ids];
}

/** Every KR id referenced on visible plan/report summaries. */
export function collectPlanKeyResultIds(plans: PlanSummary[]): string[] {
  const ids = new Set<string>();
  for (const plan of plans ?? []) {
    for (const kr of plan.keyResults ?? []) {
      const id = kr?.id != null ? String(kr.id).trim() : '';
      if (id) ids.add(id);
    }
  }
  return [...ids];
}

function buildPlanKeyResultById(plans: PlanSummary[]): Map<string, any> {
  const map = new Map<string, any>();
  for (const plan of plans ?? []) {
    for (const kr of plan.keyResults ?? []) {
      if (kr?.id == null) continue;
      const id = String(kr.id);
      const prev = map.get(id);
      map.set(id, prev ? mergeKrMetricRicher(prev, kr) : kr);
    }
  }
  return map;
}

/** Richest KR row per id for panel metric labels (API + enriched plan payloads). */
export function buildKrMetricLookupMap(
  apiItems: any[],
  plans: PlanSummary[] = [],
): Map<string, any> {
  const map = new Map<string, any>();

  for (const kr of apiItems ?? []) {
    if (kr?.id == null || kr.deletedAt != null) continue;
    const id = String(kr.id);
    const prev = map.get(id);
    map.set(id, prev ? mergeKrMetricRicher(prev, kr) : kr);
  }

  for (const plan of plans ?? []) {
    for (const kr of plan.keyResults ?? []) {
      if (kr?.id == null) continue;
      const id = String(kr.id);
      const prev = map.get(id);
      map.set(id, prev ? mergeKrMetricRicher(prev, kr) : kr);
    }
  }

  return map;
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
 * Apply OKR API milestone/progress data to every KR inside plan summaries.
 * Used for daily, weekly, and monthly plan types alike.
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
  const mergedKr = mergeKeyResultWithUserApi(kr, userKeyResultItems);
  const metricType =
    resolveKrCardMetricLabel(kr, apiKr, kr) ||
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
    taskCount,
    metricType,
    key_type:
      mergedKr.key_type ??
      mergedKr.metricTypeName ??
      (typeof mergedKr.metricType === 'object'
        ? mergedKr.metricType?.name
        : mergedKr.metricType) ??
      metricType,
    targetValue: mergedKr.targetValue ?? 0,
    currentValue: mergedKr.currentValue ?? 0,
    progressLabel: getKeyResultProgressRatioText(mergedKr),
    isDeleted: mergedKr.deletedAt != null,
    planningBlocked: isKeyResultFullyCompletedForPlanning(mergedKr),
    milestones: mergedKr.milestones ?? mergedKr.Milestones ?? [],
  };
}

function apiKRToAggregated(
  kr: any,
  userKeyResultItems: any[] = [],
): KRPanelAggregatedKR {
  return aggregateKeyResultForPanel(kr, 0, userKeyResultItems);
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
 * Appends logged-in user's API KRs that are not already on a plan-backed panel row.
 * Uses {@link apiKeyResultItems} only for metric/progress resolution — not for orphan discovery.
 */
export function mergeUserKeyResultsIntoOwnerGroups(
  groups: KRPanelOwnerGroup[],
  orphanKeyResultItems: any[],
  apiKeyResultItems: any[],
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
  for (const raw of orphanKeyResultItems) {
    if (!raw || raw.deletedAt != null) continue;
    const id = String(raw.id);
    if (seen.has(id)) continue;
    seen.add(id);
    orphans.push(apiKRToAggregated(raw, apiKeyResultItems));
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

/**
 * Re-aggregate plan-backed rows that still lack a known metric label after the first pass.
 * Own KRs often miss session-scoped user API rows while teammate rows resolve from owner fetch.
 */
export function reconcileOwnerGroupMetrics(
  groups: KRPanelOwnerGroup[],
  plans: PlanSummary[],
  apiKeyResultItems: any[],
): KRPanelOwnerGroup[] {
  if (!groups.length) return groups;

  const planKrById = buildPlanKeyResultById(plans);
  const apiById = buildKrMetricLookupMap(apiKeyResultItems, plans);

  return groups.map((group) => ({
    ...group,
    krs: group.krs.map((panelKr) => {
      if (isKnownKrMetricTypeLabel(panelKr.metricType)) return panelKr;

      const planKr = planKrById.get(String(panelKr.id));
      const lookupKr = apiById.get(String(panelKr.id));
      const upgraded = aggregateKeyResultForPanel(
        planKr ?? panelKr,
        panelKr.taskCount,
        apiKeyResultItems,
      );
      const metricFromLookup = resolveKrCardMetricLabel(
        panelKr,
        lookupKr,
        planKr,
      );
      if (metricFromLookup && !isKnownKrMetricTypeLabel(upgraded.metricType)) {
        return { ...upgraded, metricType: metricFromLookup };
      }

      if (
        upgraded.metricType === panelKr.metricType &&
        upgraded.progressLabel === panelKr.progressLabel &&
        upgraded.taskCount === panelKr.taskCount
      ) {
        return panelKr;
      }

      return upgraded;
    }),
  }));
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

  return groups.map((group) => {
    const krs = group.krs.map((panelKr) => {
      const apiKr = apiById.get(panelKr.id);
      // Always rebuild from OKR API when available so cancelled-report → restored-plan
      // cards never keep stale plan-task progress (e.g. 100% / 0/0).
      const planningSource = buildKrPlanningSource(panelKr, apiKr);
      const planningBlocked = resolveKrPlanningBlocked(panelKr, apiKr);
      const progress = getKeyResultProgressPercent(planningSource);
      const progressLabel = getKeyResultProgressRatioText(planningSource);
      const metricType =
        resolveKrCardMetricLabel(panelKr, apiKr, planningSource) ||
        resolveKrPanelMetricType(planningSource, apiKr) ||
        resolveKrPanelMetricType(panelKr, apiKr) ||
        (apiKr ? resolveKrPanelMetricType(apiKr) : '') ||
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
        metricType === panelKr.metricType
      ) {
        return panelKr;
      }
      return {
        ...panelKr,
        planningBlocked,
        progress,
        progressLabel,
        metricType,
        key_type:
          apiKr?.key_type ??
          planningSource.key_type ??
          panelKr.key_type ??
          metricType,
        taskCount: linkedTaskCount,
        milestoneCount,
        milestones: planningSource.milestones ?? panelKr.milestones,
        currentValue: planningSource.currentValue ?? panelKr.currentValue,
        targetValue: planningSource.targetValue ?? panelKr.targetValue,
      };
    });

    return {
      ...group,
      krs,
      avgProgress: recalcAvgProgress(krs),
    };
  });
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
