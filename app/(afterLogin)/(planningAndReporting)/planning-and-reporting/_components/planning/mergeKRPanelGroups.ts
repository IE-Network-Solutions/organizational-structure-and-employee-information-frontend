import type { PlanOwner, PlanSummary } from '../types';
import {
  getKeyResultProgressPercent,
  getKeyResultProgressRatioText,
  isKeyResultFullyCompletedForPlanning,
  isKeyResultReopenedForPlanning,
} from '@/utils/okrKeyResultProgressDisplay';

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

/** Normalize any KR payload (plan, report, or user API) for the left KR panel cards. */
export function aggregateKeyResultForPanel(
  kr: any,
  taskCount = 0,
): KRPanelAggregatedKR {
  const metricType =
    kr?.metricType?.name || kr?.key_type || kr?.metricType || 'N/A';
  return {
    id: String(kr.id),
    title: (kr.title || kr.name || 'Untitled KR').trim() || 'Untitled KR',
    progress: getKeyResultProgressPercent(kr),
    taskCount,
    metricType,
    targetValue: kr.targetValue ?? 0,
    currentValue: kr.currentValue ?? 0,
    progressLabel: getKeyResultProgressRatioText(kr),
    isDeleted: kr.deletedAt != null,
    planningBlocked: isKeyResultFullyCompletedForPlanning(kr),
  };
}

function apiKRToAggregated(kr: any): KRPanelAggregatedKR {
  return aggregateKeyResultForPanel(kr, 0);
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
    orphans.push(apiKRToAggregated(raw));
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
  panelKrs: Array<{ id: string; planningBlocked: boolean }> = [],
): Set<string> {
  const ids = new Set<string>();

  for (const raw of userKeyResultItems) {
    if (!raw || raw.deletedAt != null) continue;
    if (isKeyResultReopenedForPlanning(raw)) continue;
    if (isKeyResultFullyCompletedForPlanning(raw)) {
      ids.add(String(raw.id));
    }
  }

  for (const kr of panelKrs) {
    if (kr.planningBlocked) ids.add(String(kr.id));
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
      const apiKr = apiById.get(panelKr.id);
      const planningSource = apiKr
        ? {
            ...apiKr,
            metricType: apiKr.metricType ?? { name: panelKr.metricType },
            key_type: apiKr.key_type ?? panelKr.metricType,
            progress: panelKr.progress,
            currentValue: panelKr.currentValue ?? apiKr.currentValue,
            targetValue: panelKr.targetValue ?? apiKr.targetValue,
            milestones: apiKr.milestones ?? apiKr.Milestones,
          }
        : {
            metricType: { name: panelKr.metricType },
            key_type: panelKr.metricType,
            progress: panelKr.progress,
            currentValue: panelKr.currentValue,
            targetValue: panelKr.targetValue,
          };

      const planningBlocked = isKeyResultReopenedForPlanning(planningSource)
        ? false
        : isKeyResultFullyCompletedForPlanning(planningSource);

      if (planningBlocked === panelKr.planningBlocked) return panelKr;
      return { ...panelKr, planningBlocked };
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
