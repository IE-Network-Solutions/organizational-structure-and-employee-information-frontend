import {
  buildKrPlanningSource,
  enrichKeyResultWithUserApi,
  formatKrMetricTypeDisplayName,
  getKeyResultProgressPercent,
  getKeyResultProgressRatioText,
  getMetricTypeName,
  isKeyResultFullyCompletedForPlanning,
  mergeKeyResultWithUserApi,
  mergeMilestonesForProgressDisplay,
  resolveKrPanelMetricType,
  resolveKrPlanningBlocked,
  withResolvedMetricForDisplay,
} from '@/utils/okrKeyResultProgressDisplay';
import type { PlanOwner, PlanSummary } from '../types';

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
  milestones?: Array<{
    id?: string | number;
    title?: string | null;
    name?: string | null;
    status?: string | null;
    deletedAt?: string | null;
    isAchieved?: boolean | null;
    progress?: number | string | null;
  }>;
}

export interface KRPanelOwnerGroup {
  ownerKey: string;
  owner: PlanOwner;
  krs: KRPanelAggregatedKR[];
  avgProgress: number;
}

function findUserApiKeyResult(
  userKeyResultItems: any[],
  id: string | number | null | undefined,
): any | undefined {
  if (id == null || id === '') return undefined;
  const needle = String(id);
  return userKeyResultItems.find(
    (k) => k && k.deletedAt == null && String(k.id) === needle,
  );
}

function hasExplicitMetricMetadata(kr: any): boolean {
  if (!kr) return false;
  return Boolean(
    getMetricTypeName(kr) ||
    resolveKrPanelMetricType(kr) ||
    (kr.metricTypeId != null && String(kr.metricTypeId).trim() !== ''),
  );
}

function scoreKeyResultRichness(kr: any): number {
  if (!kr) return 0;
  let score = 0;
  if (hasExplicitMetricMetadata(kr)) score += 4;
  if (Array.isArray(kr.milestones) && kr.milestones.length > 0) score += 2;
  if (Array.isArray(kr.Milestones) && kr.Milestones.length > 0) score += 2;
  if (kr.progress !== undefined && kr.progress !== null && kr.progress !== '') {
    score += 1;
  }
  if (kr.targetValue !== undefined && kr.targetValue !== null) score += 1;
  if (kr.currentValue !== undefined && kr.currentValue !== null) score += 1;
  if (kr.initialValue !== undefined && kr.initialValue !== null) score += 1;
  return score;
}

/**
 * Prefer the richer OKR-shaped row when the same KR id appears in multiple sources
 * (key-results/user API vs objective nested keyResults from the OKR page).
 */
export function preferRicherKeyResult(a: any, b: any): any {
  if (!a) return b;
  if (!b) return a;
  const scoreA = scoreKeyResultRichness(a);
  const scoreB = scoreKeyResultRichness(b);
  if (scoreB > scoreA) {
    return {
      ...a,
      ...b,
      metricType: b.metricType ?? a.metricType,
      key_type: b.key_type ?? a.key_type,
      metricTypeName: b.metricTypeName ?? a.metricTypeName,
      milestones: b.milestones ?? b.Milestones ?? a.milestones ?? a.Milestones,
    };
  }
  if (scoreA > scoreB) {
    return {
      ...b,
      ...a,
      metricType: a.metricType ?? b.metricType,
      key_type: a.key_type ?? b.key_type,
      metricTypeName: a.metricTypeName ?? b.metricTypeName,
      milestones: a.milestones ?? a.Milestones ?? b.milestones ?? b.Milestones,
    };
  }
  // Equal richness: keep API-first merge fields from `a`, fill gaps from `b`.
  return {
    ...b,
    ...a,
    metricType: a.metricType ?? b.metricType,
    key_type: a.key_type ?? b.key_type,
    metricTypeName: a.metricTypeName ?? b.metricTypeName,
    milestones: a.milestones ?? a.Milestones ?? b.milestones ?? b.Milestones,
    progress: a.progress ?? b.progress,
    currentValue: a.currentValue ?? b.currentValue,
    initialValue: a.initialValue ?? b.initialValue,
    targetValue: a.targetValue ?? b.targetValue,
    thresholdValue: a.thresholdValue ?? b.thresholdValue,
    stretchValue: a.stretchValue ?? b.stretchValue,
  };
}

/** Flatten objective[].keyResults (same payload shape the OKR dashboard uses). */
export function flattenObjectiveKeyResults(objectives: unknown): any[] {
  const list = Array.isArray(objectives)
    ? objectives
    : Array.isArray((objectives as { items?: unknown } | null)?.items)
      ? ((objectives as { items: any[] }).items ?? [])
      : [];

  const out: any[] = [];
  for (const obj of list) {
    if (!obj) continue;
    const nested = obj.keyResults ?? obj.keyResultValue;
    if (Array.isArray(nested) && nested.length > 0) {
      for (const kr of nested) {
        if (kr && kr.deletedAt == null) out.push(kr);
      }
      continue;
    }
    // Already a flat key-result row
    if (obj.id != null && (hasExplicitMetricMetadata(obj) || obj.title)) {
      if (obj.deletedAt == null) out.push(obj);
    }
  }
  return out;
}

/**
 * Merge key-results/user items with objective nested KRs (OKR page source).
 * Dedupes by id and keeps the richer metric/progress payload.
 */
export function mergeUserKeyResultSources(
  primary: any[] = [],
  secondary: any[] = [],
): any[] {
  const byId = new Map<string, any>();

  const ingest = (items: any[]) => {
    for (const raw of items) {
      if (!raw || raw.deletedAt != null) continue;
      const id = String(raw.id ?? '');
      if (!id) continue;
      const existing = byId.get(id);
      byId.set(id, existing ? preferRicherKeyResult(existing, raw) : raw);
    }
  };

  ingest(primary);
  ingest(secondary);
  return Array.from(byId.values());
}

export function normalizeUserKeyResultItems(data: unknown): any[] {
  if (data == null) return [];
  let items: any[] = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (
    typeof data === 'object' &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    items = (data as { items: any[] }).items;
  } else {
    return [];
  }

  // If the payload is objective-shaped, flatten nested keyResults.
  const looksLikeObjectives = items.some(
    (item) =>
      item &&
      Array.isArray(item.keyResults) &&
      item.keyResults.length > 0 &&
      !hasExplicitMetricMetadata(item),
  );
  if (looksLikeObjectives) {
    return flattenObjectiveKeyResults(items);
  }

  return items.filter((item) => item && item.deletedAt == null);
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

/**
 * Normalize any KR payload (plan, report, or user/objective API) for left KR panel cards.
 * Always prefers matched OKR key-result metadata for metric type + progress (all cadences).
 */
export function aggregateKeyResultForPanel(
  kr: any,
  taskCount = 0,
  userKeyResultItems: any[] = [],
  objectiveMilestones: any[] = [],
): KRPanelAggregatedKR {
  const apiKr = findUserApiKeyResult(userKeyResultItems, kr?.id);
  const mergedKr = mergeKeyResultWithUserApi(kr, userKeyResultItems);
  const withObjectiveMilestones =
    objectiveMilestones.length > 0
      ? {
          ...mergedKr,
          milestones: mergeMilestonesForProgressDisplay(
            mergedKr,
            objectiveMilestones,
          ),
        }
      : mergedKr;
  const displayKr = withResolvedMetricForDisplay(
    withObjectiveMilestones,
    apiKr,
  );

  const metricType =
    resolveKrPanelMetricType(kr, apiKr) ||
    resolveKrPanelMetricType(displayKr, apiKr) ||
    formatKrMetricTypeDisplayName(getMetricTypeName(displayKr));

  // Re-inject resolved metric so ratio/percent match OKR dashboard helpers.
  const progressSource = metricType
    ? {
        ...displayKr,
        metricType: { name: metricType },
        key_type: metricType,
        metricTypeName: metricType,
      }
    : displayKr;

  return {
    id: String(progressSource.id ?? kr.id),
    title:
      (progressSource.title || progressSource.name || 'Untitled KR').trim() ||
      'Untitled KR',
    progress: getKeyResultProgressPercent(progressSource),
    taskCount,
    metricType,
    targetValue: progressSource.targetValue ?? 0,
    currentValue: progressSource.currentValue ?? 0,
    progressLabel: getKeyResultProgressRatioText(progressSource),
    isDeleted: progressSource.deletedAt != null,
    planningBlocked: isKeyResultFullyCompletedForPlanning(progressSource),
    milestones: progressSource.milestones ?? progressSource.Milestones ?? [],
  };
}

function apiKRToAggregated(
  kr: any,
  userKeyResultItems: any[] = [],
): KRPanelAggregatedKR {
  return aggregateKeyResultForPanel(kr, 0, userKeyResultItems);
}

export function recalcPanelKrAvgProgress(
  krs: KRPanelAggregatedKR[],
  userKeyResultItems: any[] = [],
): number {
  if (krs.length === 0) return 0;

  let weightSum = 0;
  let weightedTotal = 0;
  let hasKrWeight = false;
  for (const k of krs) {
    const apiKr = findUserApiKeyResult(userKeyResultItems, k.id);
    const w = Number(apiKr?.weight ?? 0);
    if (Number.isFinite(w) && w > 0) {
      hasKrWeight = true;
      weightSum += w;
      weightedTotal += k.progress * w;
    }
  }
  if (hasKrWeight && weightSum > 0) {
    return Math.round(weightedTotal / weightSum);
  }

  return Math.round(krs.reduce((s, k) => s + k.progress, 0) / krs.length);
}

function objectiveIdsFromPlansForOwner(
  plans: PlanSummary[],
  ownerKey: string,
): Set<string> {
  const ids = new Set<string>();
  for (const plan of plans) {
    const key = plan.owner?.name || plan.id;
    if (key !== ownerKey) continue;
    for (const kr of plan.keyResults ?? []) {
      const oid = kr?.objectiveId ?? kr?.objective?.id;
      if (oid != null && String(oid).trim() !== '') {
        ids.add(String(oid));
      }
    }
  }
  return ids;
}

function orphanMatchesPlanObjectiveScope(
  raw: any,
  scopedObjectiveIds: Set<string>,
): boolean {
  if (scopedObjectiveIds.size === 0) return true;
  const oid = raw?.objectiveId ?? raw?.objective?.id;
  if (oid == null || String(oid).trim() === '') return false;
  return scopedObjectiveIds.has(String(oid));
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
    const scopedObjectiveIds = objectiveIdsFromPlansForOwner(plans, g.ownerKey);
    const scopedOrphans = orphans.filter((panelKr) => {
      const raw = findUserApiKeyResult(userKeyResultItems, panelKr.id);
      return orphanMatchesPlanObjectiveScope(raw, scopedObjectiveIds);
    });
    const nextKrs = [...g.krs, ...scopedOrphans];
    merged[targetIdx] = {
      ...g,
      krs: nextKrs,
      avgProgress: recalcPanelKrAvgProgress(nextKrs, userKeyResultItems),
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
    avgProgress: recalcPanelKrAvgProgress(orphans, userKeyResultItems),
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

/** Reconcile plan-panel display with OKR KR sources (status, milestones) for pick blocking. */
export function enrichOwnerGroupsPlanningBlocked(
  groups: KRPanelOwnerGroup[],
  userKeyResultItems: any[],
  objectiveMilestonesByKrId?: Map<string, any[]>,
): KRPanelOwnerGroup[] {
  return groups.map((group) => {
    const krs = group.krs.map((panelKr) => {
      const apiKr = findUserApiKeyResult(userKeyResultItems, panelKr.id);
      const objectiveMilestones =
        objectiveMilestonesByKrId?.get(String(panelKr.id)) ?? [];
      // Always rebuild from OKR sources when available so cancelled-report → restored-plan
      // cards never keep stale plan-task progress (e.g. 100% / 0/0).
      const planningSource = buildKrPlanningSource(
        {
          ...panelKr,
          stretchValue:
            apiKr?.stretchValue ?? (panelKr as { stretchValue?: unknown }).stretchValue,
          thresholdValue:
            apiKr?.thresholdValue ??
            (panelKr as { thresholdValue?: unknown }).thresholdValue,
          initialValue:
            apiKr?.initialValue ??
            (panelKr as { initialValue?: unknown }).initialValue,
        },
        apiKr,
        objectiveMilestones,
      );
      const metricType =
        resolveKrPanelMetricType(panelKr, apiKr) ||
        formatKrMetricTypeDisplayName(
          getMetricTypeName(planningSource) || panelKr.metricType,
        );

      const displaySource = metricType
        ? {
            ...planningSource,
            metricType: { name: metricType },
            key_type: metricType,
            metricTypeName: metricType,
          }
        : planningSource;

      const planningBlocked = resolveKrPlanningBlocked(panelKr, apiKr);
      const progress = Math.max(
        panelKr.progress,
        getKeyResultProgressPercent(displaySource),
      );
      const progressLabel = getKeyResultProgressRatioText({
        ...displaySource,
        progress,
        currentValue: Math.max(
          Number(panelKr.currentValue ?? 0),
          Number(displaySource.currentValue ?? 0),
        ),
      });

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
        milestones: displaySource.milestones ?? panelKr.milestones,
        currentValue: displaySource.currentValue ?? panelKr.currentValue,
        targetValue: displaySource.targetValue ?? panelKr.targetValue,
      };
    });

    return {
      ...group,
      krs,
      avgProgress: recalcPanelKrAvgProgress(krs, userKeyResultItems),
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
