import type { QueryClient } from 'react-query';
import {
  isRecentlyAchievedMilestone,
  rememberAchievedMilestones,
  rememberReopenedPlanningTargets,
  useRecentlyAchievedMilestones,
} from '@/utils/recentlyAchievedMilestones';
import { isMilestoneAchievedForPlanning } from '@/utils/okrKeyResultProgressDisplay';

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

/**
 * After status queries settle, re-stamp session-achieved milestones if the API
 * is still stale — or forget session entries once the API confirms Completed.
 * Replaces blind setTimeout re-patches that caused Incomplete↔Completed flicker.
 */
export function reconcileAchievedMilestonesAfterStatusRefetch(
  queryClient: QueryClient,
  milestoneIds: Array<string | number | null | undefined>,
): void {
  const ids = milestoneIds
    .filter((id) => id != null && String(id).length > 0)
    .map((id) => String(id));
  if (ids.length === 0) return;

  const stillNeedPatch: string[] = [];

  for (const id of ids) {
    if (!isRecentlyAchievedMilestone(id)) continue;
    if (!isMilestoneCompletedInOkrCaches(queryClient, id)) {
      stillNeedPatch.push(id);
    }
  }

  if (stillNeedPatch.length > 0) {
    patchOkrCachesForCompletedMilestones(queryClient, new Set(stillNeedPatch));
  }
  // Keep session achieved for the whole page session — forgetting here caused
  // achieved milestones to flip back to selectable when a follow-up refetch
  // briefly returned stale Incomplete rows.
}

/** Re-stamp Completed in cache for session-achieved ids (after stale refetch). */
export function restampSessionAchievedMilestonesInCaches(
  queryClient: QueryClient,
): void {
  const ids = useRecentlyAchievedMilestones.getState().ids;
  if (!ids || ids.size === 0) return;
  patchOkrCachesForCompletedMilestones(queryClient, new Set(ids));
}

/** Schedule a follow-up status refetch, then reconcile session vs cache. */
export function scheduleOkrMilestoneStatusRefetch(
  queryClient: QueryClient,
  delayMs = 750,
  milestoneIds: Array<string | number | null | undefined> = [],
): void {
  if (typeof window === 'undefined') return;
  window.setTimeout(() => {
    void refetchOkrMilestoneStatusCaches(queryClient).then(() => {
      reconcileAchievedMilestonesAfterStatusRefetch(queryClient, milestoneIds);
      restampSessionAchievedMilestonesInCaches(queryClient);
    });
  }, delayMs);
}

function findMilestoneInPayload(
  data: unknown,
  milestoneId: string,
): any | null {
  if (data == null) return null;
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findMilestoneInPayload(item, milestoneId);
      if (found) return found;
    }
    return null;
  }
  if (typeof data !== 'object') return null;
  const obj = data as Record<string, any>;
  const lists = [obj.milestones, obj.Milestones].filter(Array.isArray);
  for (const list of lists) {
    const hit = list.find((m: any) => m && String(m.id) === milestoneId);
    if (hit) return hit;
  }
  if (Array.isArray(obj.items)) {
    return findMilestoneInPayload(obj.items, milestoneId);
  }
  if (Array.isArray(obj.keyResults)) {
    return findMilestoneInPayload(obj.keyResults, milestoneId);
  }
  return null;
}

function isMilestoneCompletedInOkrCaches(
  queryClient: QueryClient,
  milestoneId: string,
): boolean {
  for (const key of MILESTONE_STATUS_QUERY_KEYS) {
    const entries = queryClient.getQueriesData(key);
    for (const [, data] of entries) {
      const ms = findMilestoneInPayload(data, milestoneId);
      if (ms && isMilestoneAchievedForPlanning(ms)) return true;
    }
  }
  return false;
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
 * Session store is the sticky authority until
 * `scheduleOkrMilestoneStatusRefetch` / reconcile confirms API status.
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

  // After stale refetch lands, re-stamp any session-achieved ids still pending API.
  if (typeof window !== 'undefined') {
    window.setTimeout(() => {
      restampSessionAchievedMilestonesInCaches(queryClient);
    }, 1100);
  }
}

function patchOkrCachesForReopenedMilestones(
  queryClient: QueryClient,
  ids: Set<string>,
): void {
  const patchMilestoneList = (list: any[]): any[] =>
    list.map((m) => {
      if (!m || m.id == null || !ids.has(String(m.id))) return m;
      return {
        ...m,
        status: 'In Progress',
        isAchieved: false,
        isCompleted: false,
        completed: false,
      };
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
 * Re-enable milestones after report reject / cancel / Done→Not so the + pick
 * menu makes them selectable again (clears persisted achieved sticky state).
 */
export function markMilestonesReopenedInOkrCaches(
  queryClient: QueryClient,
  payload: {
    milestoneIds?: Array<string | number | null | undefined>;
    keyResultIds?: Array<string | number | null | undefined>;
  },
): void {
  const milestoneIds = payload.milestoneIds ?? [];
  const keyResultIds = payload.keyResultIds ?? [];
  rememberReopenedPlanningTargets({ milestoneIds, keyResultIds });

  const ids = new Set(
    milestoneIds
      .filter((id) => id != null && String(id).length > 0)
      .map((id) => String(id)),
  );
  if (ids.size === 0) return;

  patchOkrCachesForReopenedMilestones(queryClient, ids);
}
