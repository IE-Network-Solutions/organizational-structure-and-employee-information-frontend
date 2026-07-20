import type { QueryClient } from 'react-query';
import { rememberAchievedMilestones } from '@/utils/recentlyAchievedMilestones';

const REFETCH_OPTS = { refetchActive: true, refetchInactive: true } as const;

/** Query keys that carry per-milestone Completed status for the plan + modal. */
const MILESTONE_STATUS_QUERY_KEYS = [
  ['fetchObjectives'],
  ['ObjectiveInformation'],
] as const;

/**
 * Invalidate every query that feeds OKR objectives and Plan & Report KR progress.
 * Plan/report edits update backend KR metrics; without ObjectiveInformation invalidation
 * the Plan & Report left panel keeps stale progress until an unrelated action refetches.
 *
 * Use array prefixes so react-query matches `['fetchObjectives', userId]` etc.
 */
export function invalidateOkrPlanningCaches(
  queryClient: QueryClient,
): Promise<unknown[]> {
  return Promise.all([
    queryClient.invalidateQueries(['okrPlans'], REFETCH_OPTS),
    queryClient.invalidateQueries(['okrUserPlans'], REFETCH_OPTS),
    queryClient.invalidateQueries(['okrReports'], REFETCH_OPTS),
    queryClient.invalidateQueries(['okrReport'], REFETCH_OPTS),
    queryClient.invalidateQueries(['okrPlan'], REFETCH_OPTS),
    queryClient.invalidateQueries(['okrPlannedData'], REFETCH_OPTS),
    queryClient.invalidateQueries(['planningPeriodsHierarchy'], REFETCH_OPTS),
    queryClient.invalidateQueries(['fetchObjectives'], REFETCH_OPTS),
    queryClient.invalidateQueries(['ObjectiveInformation'], REFETCH_OPTS),
    queryClient.invalidateQueries(['teamObjectiveInformation'], REFETCH_OPTS),
    queryClient.invalidateQueries(
      ['companyObjectiveInformation'],
      REFETCH_OPTS,
    ),
    queryClient.invalidateQueries(['keyResult'], REFETCH_OPTS),
    queryClient.invalidateQueries(['keyResultForEdit'], REFETCH_OPTS),
  ]);
}

/**
 * Report/OKR updates sometimes land milestone `Completed` a beat after the first
 * refetch. Re-pull status-bearing queries so the + pick menu disables newly
 * achieved milestones without requiring a re-login.
 */
export function refetchOkrMilestoneStatusCaches(
  queryClient: QueryClient,
): Promise<unknown[]> {
  return Promise.all(
    MILESTONE_STATUS_QUERY_KEYS.map((key) =>
      queryClient.invalidateQueries(key, REFETCH_OPTS),
    ),
  );
}

/** Schedule a follow-up status refetch after mutations that complete milestones. */
export function scheduleOkrMilestoneStatusRefetch(
  queryClient: QueryClient,
  delayMs = 750,
): void {
  if (typeof window === 'undefined') return;
  window.setTimeout(() => {
    void refetchOkrMilestoneStatusCaches(queryClient);
  }, delayMs);
}

function patchOkrCachesForCompletedMilestones(
  queryClient: QueryClient,
  ids: Set<string>,
): void {
  const patchMilestoneList = (list: any[]): any[] =>
    list.map((m) => {
      if (!m || m.id == null || !ids.has(String(m.id))) return m;
      return { ...m, status: 'Completed', isAchieved: true };
    });

  const patchKr = (kr: any): any => {
    if (!kr || typeof kr !== 'object') return kr;
    const milestones = kr.milestones ?? kr.Milestones;
    if (!Array.isArray(milestones)) return kr;
    const next = patchMilestoneList(milestones);
    return {
      ...kr,
      milestones: next,
      Milestones: kr.Milestones ? next : undefined,
    };
  };

  const patchPayload = (data: unknown): unknown => {
    if (data == null) return data;
    if (Array.isArray(data)) {
      return data.map(patchKr);
    }
    if (typeof data !== 'object') return data;
    const obj = data as Record<string, any>;
    if (Array.isArray(obj.items)) {
      // ObjectiveInformation: { items: KeyResult[] }
      // fetchObjectives: { items: Objective[] } with nested keyResults
      const items = obj.items.map((item: any) => {
        if (Array.isArray(item?.keyResults)) {
          return {
            ...item,
            keyResults: item.keyResults.map(patchKr),
          };
        }
        return patchKr(item);
      });
      return { ...obj, items };
    }
    if (Array.isArray(obj.keyResults)) {
      return { ...obj, keyResults: obj.keyResults.map(patchKr) };
    }
    return patchKr(obj);
  };

  for (const key of MILESTONE_STATUS_QUERY_KEYS) {
    const entries = queryClient.getQueriesData(key);
    for (const [queryKey, data] of entries) {
      if (data == null) continue;
      queryClient.setQueryData(queryKey, patchPayload(data));
    }
  }
}

/**
 * Optimistically mark milestones Completed in cached OKR payloads so the pick
 * menu disables them immediately after achieve/report, before refetch returns.
 * Also re-applies after the delayed status refetch, which can briefly overwrite
 * with stale API data.
 */
export function markMilestonesCompletedInOkrCaches(
  queryClient: QueryClient,
  milestoneIds: Array<string | number | null | undefined>,
): void {
  rememberAchievedMilestones(milestoneIds);

  const ids = new Set(
    milestoneIds
      .filter((id) => id != null && String(id).length > 0)
      .map((id) => String(id)),
  );
  if (ids.size === 0) return;

  patchOkrCachesForCompletedMilestones(queryClient, ids);

  // Delayed refetch can land stale status after this patch — re-stamp Completed
  // so the UI stays disabled without a hard refresh.
  if (typeof window !== 'undefined') {
    window.setTimeout(() => {
      patchOkrCachesForCompletedMilestones(queryClient, ids);
    }, 1100);
  }
}
