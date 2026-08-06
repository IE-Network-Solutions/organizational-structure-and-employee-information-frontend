import type { QueryClient } from 'react-query';
import {
  isRecentlyAchievedMilestone,
  rememberAchievedMilestones,
  rememberReopenedPlanningTargets,
  useRecentlyAchievedMilestones,
} from '@/utils/recentlyAchievedMilestones';
import {
  getKeyResultProgressPercent,
  isMilestoneAchievedForPlanning,
} from '@/utils/okrKeyResultProgressDisplay';
import {
  rememberReportTaskStatuses,
  reconcileReportTaskStatusOverrides,
  useRecentReportTaskStatuses,
  type ReportTaskStatusOverride,
} from '@/utils/recentReportTaskStatuses';
import {
  rememberOkrCurrentValue,
  useRecentOkrMetricOverrides,
} from '@/utils/recentOkrMetricOverrides';

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

type ReportTaskStatusPatch = ReportTaskStatusOverride;

/**
 * Optimistically update reportTask rows in okrReports / okrReport caches so
 * the report card progress bar reflects Done→Not (or Not→Done) before refetch.
 * Sticky overrides survive stale refetch until the API catches up.
 * Also adjusts OKR key-result currentValue (absolute sticky) so the left
 * panel progress % updates when Achieved is edited (e.g. 9 → 5).
 */
export function patchReportTaskStatusesInCaches(
  queryClient: QueryClient,
  reportId: string,
  statusByPlanTaskId: Record<string, ReportTaskStatusPatch>,
): void {
  if (!reportId || !statusByPlanTaskId) return;
  const keys = Object.keys(statusByPlanTaskId);
  if (keys.length === 0) return;

  rememberReportTaskStatuses(reportId, statusByPlanTaskId);
  const krDeltas = applyReportTaskStatusPatchesToQueryCaches(
    queryClient,
    reportId,
    statusByPlanTaskId,
  );
  if (Object.keys(krDeltas).length > 0) {
    applyOkrCurrentValueDeltasAsAbsolute(queryClient, krDeltas);
  }

  // Refetch often returns stale Done/isAchieved / currentValue — restamp.
  if (typeof window !== 'undefined') {
    for (const delay of [400, 1000, 2000, 4000]) {
      window.setTimeout(() => {
        restampStickyReportTaskStatuses(queryClient, reportId);
      }, delay);
    }
  }
}

/** Read a KR's currentValue from any OKR-bearing query cache. */
function readOkrCurrentValueFromCaches(
  queryClient: QueryClient,
  krId: string,
): number | undefined {
  let found: number | undefined;
  const visit = (kr: any) => {
    if (!kr || String(kr.id) !== krId) return;
    if (kr.currentValue === undefined || kr.currentValue === null) return;
    const n = Number(kr.currentValue);
    if (Number.isFinite(n)) found = n;
  };
  const walk = (data: unknown): void => {
    if (data == null || found !== undefined) return;
    if (Array.isArray(data)) {
      data.forEach((item) => {
        visit(item);
        if (Array.isArray(item?.keyResults)) item.keyResults.forEach(visit);
      });
      return;
    }
    if (typeof data !== 'object') return;
    const obj = data as Record<string, any>;
    if (Array.isArray(obj.items)) walk(obj.items);
    if (Array.isArray(obj.keyResults)) obj.keyResults.forEach(visit);
    visit(obj);
  };

  for (const key of [
    ...MILESTONE_STATUS_QUERY_KEYS,
    ['keyResult'] as const,
    ['ObjectiveInformation'] as const,
    ['teamObjectiveInformation'] as const,
    ['companyObjectiveInformation'] as const,
  ]) {
    for (const [, data] of queryClient.getQueriesData(key)) {
      walk(data);
      if (found !== undefined) return found;
    }
  }
  return found;
}

/**
 * Apply deltas once, store absolute sticky currentValue, write absolute into caches.
 * Restamp always re-writes the absolute sticky value (never re-applies deltas).
 */
function applyOkrCurrentValueDeltasAsAbsolute(
  queryClient: QueryClient,
  deltasByKrId: Record<string, number>,
): void {
  const absoluteByKrId: Record<string, number> = {};
  for (const [krId, delta] of Object.entries(deltasByKrId)) {
    if (!delta || !Number.isFinite(delta)) continue;
    const sticky = useRecentOkrMetricOverrides.getState().get(krId);
    const cached = readOkrCurrentValueFromCaches(queryClient, krId);
    const baseline =
      sticky !== undefined
        ? sticky
        : cached !== undefined
          ? cached
          : 0;
    const next = baseline + delta;
    absoluteByKrId[krId] = next;
    rememberOkrCurrentValue(krId, next);
  }
  if (Object.keys(absoluteByKrId).length > 0) {
    applyAbsoluteOkrCurrentValuesToCaches(queryClient, absoluteByKrId);
  }
}

/** Set absolute currentValue (+ recomputed progress) on cached OKR key results. */
function applyAbsoluteOkrCurrentValuesToCaches(
  queryClient: QueryClient,
  currentByKrId: Record<string, number>,
): void {
  const ids = Object.keys(currentByKrId);
  if (ids.length === 0) return;

  const patchKr = (kr: any): any => {
    if (!kr || kr.id == null) return kr;
    const nextCurrent = currentByKrId[String(kr.id)];
    if (nextCurrent === undefined || !Number.isFinite(nextCurrent)) return kr;
    const next = {
      ...kr,
      currentValue: nextCurrent,
    };
    return {
      ...next,
      progress: getKeyResultProgressPercent(next),
    };
  };

  const patchPayload = (data: unknown): unknown => {
    if (data == null) return data;
    if (Array.isArray(data)) return data.map(patchKr);
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

  for (const key of [
    ...MILESTONE_STATUS_QUERY_KEYS,
    ['keyResult'] as const,
    ['ObjectiveInformation'] as const,
    ['teamObjectiveInformation'] as const,
    ['companyObjectiveInformation'] as const,
  ]) {
    const entries = queryClient.getQueriesData(key);
    for (const [queryKey, data] of entries) {
      if (data == null) continue;
      queryClient.setQueryData(queryKey, patchPayload(data));
    }
  }
}

/** Re-apply absolute sticky OKR metrics after stale ObjectiveInformation refetch. */
export function restampStickyOkrMetricOverrides(
  queryClient: QueryClient,
): void {
  const currentByKrId = useRecentOkrMetricOverrides.getState().currentByKrId;
  if (!currentByKrId || Object.keys(currentByKrId).length === 0) return;
  // Always re-write absolute sticky values — do not clear on API match.
  // Clearing raced with a later stale refetch and snapped progress back.
  applyAbsoluteOkrCurrentValuesToCaches(queryClient, currentByKrId);
}

function applyReportTaskStatusPatchesToQueryCaches(
  queryClient: QueryClient,
  reportId: string,
  statusByPlanTaskId: Record<string, ReportTaskStatusPatch>,
): Record<string, number> {
  const krDeltas: Record<string, number> = {};

  const findPatch = (task: any): ReportTaskStatusPatch | null => {
    for (const id of [
      task?.planTaskId,
      task?.planTask?.id,
      task?.taskId,
      task?.id,
    ]) {
      if (id == null) continue;
      const patch = statusByPlanTaskId[String(id)];
      if (patch?.status) return patch;
    }
    return null;
  };

  const patchTask = (task: any): any => {
    if (!task) return task;
    const patch = findPatch(task);
    if (!patch?.status) return task;
    const nextStatus = patch.status;
    const normalized = String(nextStatus ?? '')
      .trim()
      .toLowerCase();
    const isDone =
      normalized === 'done' ||
      normalized === 'completed' ||
      normalized === 'complete' ||
      normalized === 'achieved';
    const isNot =
      normalized === 'not' ||
      normalized === 'failed' ||
      normalized === 'not_done' ||
      normalized === 'unachieved';

    const nextActual =
      patch.actualValue !== undefined ? patch.actualValue : task.actualValue;

    if (patch.actualValue !== undefined) {
      const newVal = Number(patch.actualValue);
      if (Number.isFinite(newVal)) {
        const planTaskKey = String(
          task?.planTaskId ??
            task?.planTask?.id ??
            task?.taskId ??
            task?.id ??
            '',
        );
        const store = useRecentReportTaskStatuses.getState();
        const prevApplied =
          planTaskKey.length > 0
            ? store.getOkrAppliedActual(planTaskKey)
            : undefined;
        const oldVal =
          prevApplied !== undefined
            ? prevApplied
            : Number(task.actualValue ?? 0);
        const delta = newVal - (Number.isFinite(oldVal) ? oldVal : 0);
        const planTask = task?.planTask ?? task;
        const rawKrId =
          patch.keyResultId ??
          planTask?.keyResultId ??
          planTask?.keyResult?.id ??
          task?.keyResultId ??
          task?.keyResult?.id ??
          task?.planTask?.keyResultId ??
          task?.planTask?.keyResult?.id;
        const krId =
          rawKrId != null && String(rawKrId) !== '' ? String(rawKrId) : null;
        if (krId && delta !== 0) {
          krDeltas[krId] = (krDeltas[krId] ?? 0) + delta;
          // Only mark applied when OKR sticky can be updated — otherwise a
          // missing keyResultId permanently burns the delta to 0.
          if (planTaskKey.length > 0) {
            store.markOkrActualApplied(planTaskKey, newVal);
          }
        }
      }
    }

    return {
      ...task,
      status: nextStatus,
      isAchieved: isDone ? true : isNot ? false : task.isAchieved,
      actualValue: nextActual,
      customReason:
        patch.customReason !== undefined
          ? patch.customReason
          : task.customReason,
    };
  };

  const patchReport = (report: any): any => {
    if (!report || String(report.id) !== String(reportId)) return report;
    const reportTask = report.reportTask ?? report.reportTasks;
    if (!Array.isArray(reportTask)) return report;
    const nextTasks = reportTask.map(patchTask);
    return {
      ...report,
      reportTask: nextTasks,
      reportTasks: report.reportTasks ? nextTasks : undefined,
    };
  };

  const patchPayload = (data: unknown): unknown => {
    if (data == null) return data;
    if (Array.isArray(data)) return data.map(patchReport);
    if (typeof data !== 'object') return data;
    const obj = data as Record<string, any>;
    if (Array.isArray(obj.items)) {
      return { ...obj, items: obj.items.map(patchReport) };
    }
    return patchReport(obj);
  };

  for (const key of [['okrReports'], ['okrReport']] as const) {
    const entries = queryClient.getQueriesData(key);
    for (const [queryKey, data] of entries) {
      if (data == null) continue;
      queryClient.setQueryData(queryKey, patchPayload(data));
    }
  }

  return krDeltas;
}

/** Re-apply session overrides after a stale okrReports refetch. */
export function restampStickyReportTaskStatuses(
  queryClient: QueryClient,
  reportId?: string,
): void {
  const byReport = useRecentReportTaskStatuses.getState().byReport;
  const reportIds = reportId ? [reportId] : Object.keys(byReport);
  for (const id of reportIds) {
    const overrides = byReport[id];
    if (!overrides || Object.keys(overrides).length === 0) continue;

    // Reconcile against current cache (API may have caught up).
    const entries = [
      ...queryClient.getQueriesData(['okrReports']),
      ...queryClient.getQueriesData(['okrReport']),
    ];
    for (const [, data] of entries) {
      const reports = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.items)
          ? (data as any).items
          : data
            ? [data]
            : [];
      for (const report of reports) {
        if (!report || String(report.id) !== String(id)) continue;
        const tasks = report.reportTask ?? report.reportTasks ?? [];
        if (Array.isArray(tasks)) {
          reconcileReportTaskStatusOverrides(id, tasks);
        }
      }
    }

    const still = useRecentReportTaskStatuses.getState().byReport[id];
    if (still && Object.keys(still).length > 0) {
      // Report rows only — OKR metrics use absolute sticky restamp below.
      applyReportTaskStatusPatchesToQueryCaches(queryClient, id, still);
    }
  }

  restampStickyOkrMetricOverrides(queryClient);
}
