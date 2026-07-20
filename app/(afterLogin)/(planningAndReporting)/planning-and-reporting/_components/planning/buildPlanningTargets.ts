import { groupParentTasks } from '../dataTransformer/plan';
import {
  getKeyResultProgressPercent,
  getMetricTypeName,
  isKeyResultFullyCompletedForPlanning,
  isMilestoneCompleted,
  mergeKeyResultWithUserApi,
  resolveKrPlanningBlocked,
  resolveOkrMilestones,
} from '@/utils/okrKeyResultProgressDisplay';
import { isRecentlyAchievedMilestone } from '@/utils/recentlyAchievedMilestones';

export { mergeKeyResultWithUserApi };
export type PlanningTarget = {
  id: string;
  keyResultId: string;
  keyResultTitle: string;
  milestoneId: string | null;
  milestoneTitle?: string | null;
  parentTaskId: string | null;
  parentTaskTitle?: string | null;
  parentPlanId?: string | null;
  targetValueHint?: number | null;
  /** Daily plan row under weekly parent */
  isDailySlot: boolean;
  /** KR metric name (e.g. Achieve) for inline achieveMK UX */
  metricTypeName?: string | null;
  /** Achieved/completed milestone — show in pick list but not selectable */
  isCompleted?: boolean;
};

/** Active OKR milestone rows from an objective KR (same source as createPlanObjective). */
function objectiveMilestoneRows(kr: any): any[] {
  const list = kr?.milestones ?? kr?.Milestones ?? [];
  if (!Array.isArray(list)) return [];
  return list.filter((m: any) => m && m.deletedAt == null && m.id != null);
}

/**
 * Merge milestone rows from objective / API / plan by id.
 * Prefer a real title; if any source is Completed, keep that status.
 */
function mergeMilestoneListsForPick(...lists: any[][]): any[] {
  const byId = new Map<string, any>();
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const m of list) {
      if (!m || m.deletedAt != null || m.id == null) continue;
      const id = String(m.id);
      const prev = byId.get(id);
      if (!prev) {
        byId.set(id, { ...m });
        continue;
      }
      const completed = isMilestoneCompleted(m) || isMilestoneCompleted(prev);
      byId.set(id, {
        ...prev,
        ...m,
        // Keep the first meaningful title; callers re-apply objective titles.
        title: prev.title || prev.name || m.title || m.name,
        name: prev.name || m.name,
        // Never let a later empty/In Progress status wipe Completed.
        status: completed ? 'Completed' : m.status || prev.status,
        isAchieved: completed
          ? true
          : m.isAchieved === true || prev.isAchieved === true
            ? true
            : (m.isAchieved ?? prev.isAchieved),
        progress: completed
          ? Math.max(Number(m.progress) || 0, Number(prev.progress) || 0, 100)
          : (m.progress ?? prev.progress),
      });
    }
  }
  return Array.from(byId.values());
}

/**
 * Resolve live completion for a milestone: prefer merged user-KR API status,
 * fall back to the objective milestone row (status: 'Completed' in OKR UI).
 */
function resolveMilestoneCompleted(
  objectiveMs: any,
  kr: any,
  userKeyResultItems: any[],
): boolean {
  if (isMilestoneCompleted(objectiveMs)) return true;

  const merged = mergeKeyResultWithUserApi(kr, userKeyResultItems);
  const mergedList = merged?.milestones ?? merged?.Milestones ?? [];
  const live =
    (Array.isArray(mergedList)
      ? mergedList.find((m: any) => String(m?.id) === String(objectiveMs?.id))
      : null) ?? null;

  if (live && isMilestoneCompleted(live)) return true;

  const apiKr = userKeyResultItems.find(
    (k) => k && k.deletedAt == null && String(k.id) === String(kr?.id),
  );
  const apiList = apiKr?.milestones ?? apiKr?.Milestones ?? [];
  const fromApi = Array.isArray(apiList)
    ? apiList.find((m: any) => String(m?.id) === String(objectiveMs?.id))
    : null;
  return fromApi != null && isMilestoneCompleted(fromApi);
}

function pushKeyResultPlanningTargets(
  out: PlanningTarget[],
  kr: any,
  userKeyResultItems: any[],
): void {
  if (!kr || kr.deletedAt != null || kr.id == null) return;

  const krTitle = kr.title || kr.name || 'Key result';
  const apiKr = userKeyResultItems.find(
    (k) => k && k.deletedAt == null && String(k.id) === String(kr.id),
  );
  const metricTypeName =
    getMetricTypeName(apiKr) ||
    getMetricTypeName(kr) ||
    kr.metricType?.name ||
    null;

  // Union of objective + API + plan-embedded milestones (createPlanObjective
  // uses objective titles; API carries Completed status).
  const milestonesForPick = mergeMilestoneListsForPick(
    objectiveMilestoneRows(kr),
    objectiveMilestoneRows(apiKr),
    resolveOkrMilestones(kr, apiKr),
  );

  const isMilestoneKr =
    metricTypeName === 'Milestone' ||
    String(metricTypeName).toLowerCase() === 'milestone' ||
    milestonesForPick.length > 0;

  if (isMilestoneKr && milestonesForPick.length > 0) {
    milestonesForPick.forEach((ms: any) => {
      if (ms?.deletedAt != null || ms?.id == null) return;
      out.push({
        id: `okr-kr-${kr.id}-ms-${ms.id}`,
        keyResultId: String(kr.id),
        keyResultTitle: krTitle,
        milestoneId: String(ms.id),
        milestoneTitle: ms.title || ms.name || 'Milestone',
        parentTaskId: null,
        isDailySlot: false,
        metricTypeName: metricTypeName ?? 'Milestone',
        isCompleted: resolveMilestoneCompleted(ms, kr, userKeyResultItems),
      });
    });
    return;
  }

  // Non-milestone KR: single KR-level slot (modal shows the key result title).
  const merged = mergeKeyResultWithUserApi(kr, userKeyResultItems);
  if (isKeyResultFullyCompletedForPlanning(merged)) return;

  out.push({
    id: `okr-kr-${kr.id}`,
    keyResultId: String(kr.id),
    keyResultTitle: krTitle,
    milestoneId: null,
    parentTaskId: null,
    isDailySlot: false,
    metricTypeName,
    isCompleted: false,
  });
}

/**
 * Build the + modal rows for one KR.
 * Same source as createPlanObjective: objective milestones (titles) + API status.
 * Never fall back to a KR-title-only row when any milestone exists.
 * Fully achieved KRs must not expose a selectable + slot.
 */
export function buildPickTargetsForKeyResult(params: {
  keyResultId: string;
  keyResultTitle: string;
  metricTypeName?: string | null;
  /** Objective / OKR milestone rows (preferred titles) */
  objectiveMilestones?: any[];
  /** Panel-aggregated milestones */
  panelMilestones?: any[];
  /** User KR API row for this KR */
  apiKr?: any | null;
  /** Existing planning targets for this KR */
  slots?: PlanningTarget[];
  userKeyResultItems?: any[];
  /** Panel already marked this KR fully blocked for planning */
  planningBlocked?: boolean;
}): PlanningTarget[] {
  const {
    keyResultId,
    keyResultTitle,
    metricTypeName,
    objectiveMilestones = [],
    panelMilestones = [],
    apiKr = null,
    slots = [],
    userKeyResultItems = [],
    planningBlocked = false,
  } = params;

  const itemsForMerge =
    userKeyResultItems.length > 0 ? userKeyResultItems : apiKr ? [apiKr] : [];

  const syntheticKr = {
    id: keyResultId,
    title: keyResultTitle,
    metricType: metricTypeName ? { name: metricTypeName } : apiKr?.metricType,
    milestones: objectiveMilestones.length
      ? objectiveMilestones
      : panelMilestones,
    progress: apiKr?.progress,
    currentValue: apiKr?.currentValue,
    targetValue: apiKr?.targetValue,
  };

  // Objective first (OKR titles + Completed status), then API/panel enrich.
  const milestones = mergeMilestoneListsForPick(
    objectiveMilestoneRows({ milestones: objectiveMilestones }),
    objectiveMilestoneRows(apiKr),
    resolveOkrMilestones(apiKr ?? syntheticKr, apiKr),
    objectiveMilestoneRows({ milestones: panelMilestones }),
    slots
      .filter((t) => t.milestoneId)
      .map((t) => ({
        id: t.milestoneId,
        title: t.milestoneTitle,
        status: t.isCompleted ? 'Completed' : undefined,
      })),
  );

  // Re-apply objective titles after API-first merge (API shells often reuse KR title).
  const titleById = new Map<string, string>();
  for (const m of objectiveMilestones) {
    if (m?.id == null) continue;
    const t = String(m.title || m.name || '').trim();
    if (t) titleById.set(String(m.id), t);
  }

  const krFullyDone =
    planningBlocked ||
    (apiKr != null &&
      isKeyResultFullyCompletedForPlanning(
        mergeKeyResultWithUserApi(apiKr, itemsForMerge),
      )) ||
    (milestones.length > 0 && milestones.every((m) => isMilestoneCompleted(m)));

  if (milestones.length > 0) {
    return milestones.map((ms: any) => {
      const id = String(ms.id);
      const preferredTitle = titleById.get(id);
      const fromObjective = objectiveMilestones.find(
        (m) => m && String(m.id) === id,
      );
      const fromPanel = panelMilestones.find((m) => m && String(m.id) === id);
      const fromApi = objectiveMilestoneRows(apiKr).find(
        (m) => m && String(m.id) === id,
      );
      const completed =
        krFullyDone ||
        isRecentlyAchievedMilestone(id) ||
        isMilestoneCompleted(ms) ||
        isMilestoneCompleted(fromObjective) ||
        isMilestoneCompleted(fromPanel) ||
        isMilestoneCompleted(fromApi) ||
        resolveMilestoneCompleted(ms, apiKr ?? syntheticKr, itemsForMerge);
      return {
        id: `okr-kr-${keyResultId}-ms-${id}`,
        keyResultId: String(keyResultId),
        keyResultTitle,
        milestoneId: id,
        milestoneTitle: String(
          preferredTitle || ms.title || ms.name || 'Untitled milestone',
        ).trim(),
        parentTaskId: null,
        isDailySlot: false,
        metricTypeName: metricTypeName ?? 'Milestone',
        isCompleted: completed,
      };
    });
  }

  // Fully achieved non-milestone KR: no + / no selectable KR-level slot.
  if (krFullyDone) return [];

  if (
    apiKr != null &&
    isKeyResultFullyCompletedForPlanning(
      mergeKeyResultWithUserApi(apiKr, itemsForMerge),
    )
  ) {
    return [];
  }

  // Non-milestone KR: keep existing KR-level slots only when still plan-eligible.
  return slots
    .filter((t) => !t.milestoneId && !t.isDailySlot)
    .map((t) => ({ ...t, isCompleted: false }));
}

/**
 * Index objective KR milestones the same way createPlanObjective reads them.
 * Enrich each row with Completed status from the user-KR API when the objective
 * payload omits it (common on /objective/:userId).
 */
export function indexObjectiveMilestonesByKrId(
  objective: any,
  userKeyResultItems: any[] = [],
): Map<string, any[]> {
  const map = new Map<string, any[]>();
  if (!objective?.items?.length) return map;
  objective.items.forEach((obj: any) => {
    if (obj?.deletedAt) return;
    obj.keyResults?.forEach((kr: any) => {
      if (!kr || kr.deletedAt != null || kr.id == null) return;
      const rows = objectiveMilestoneRows(kr);
      if (rows.length === 0) return;
      const apiKr = userKeyResultItems.find(
        (k) => k && k.deletedAt == null && String(k.id) === String(kr.id),
      );
      const apiRows = objectiveMilestoneRows(apiKr);
      if (apiRows.length === 0) {
        map.set(String(kr.id), rows);
        return;
      }
      const apiById = new Map(
        apiRows
          .filter((m) => m?.id != null)
          .map((m) => [String(m.id), m] as const),
      );
      map.set(
        String(kr.id),
        rows.map((m) => {
          const api = apiById.get(String(m.id));
          if (!api) return m;
          const completed =
            isMilestoneCompleted(m) || isMilestoneCompleted(api);
          return {
            ...m,
            status: completed ? 'Completed' : m.status || api.status,
            isAchieved: completed ? true : (m.isAchieved ?? api.isAchieved),
            progress: completed
              ? Math.max(
                  Number(m.progress) || 0,
                  Number(api.progress) || 0,
                  100,
                )
              : (m.progress ?? api.progress),
          };
        }),
      );
    });
  });
  return map;
}

/**
 * Weekly / monthly: one row per KR, or one row per milestone when the KR has
 * milestones. Achieved milestones stay listed but marked isCompleted.
 * @param extraKeyResults Optional plan/panel KRs (often carry milestone titles).
 */
export function buildPlanningTargetsFromObjectives(
  objective: any,
  userKeyResultItems: any[] = [],
  extraKeyResults: any[] = [],
): PlanningTarget[] {
  const out: PlanningTarget[] = [];
  const seenKrIds = new Set<string>();

  if (objective?.items?.length) {
    objective.items.forEach((obj: any) => {
      if (obj.deletedAt) return;
      obj.keyResults?.forEach((kr: any) => {
        if (kr.deletedAt) return;
        const id = String(kr.id);
        if (seenKrIds.has(id)) return;
        seenKrIds.add(id);
        // Attach plan/panel milestones onto the objective KR when missing.
        const extra = extraKeyResults.find((k) => k && String(k.id) === id);
        const enriched =
          extra &&
          objectiveMilestoneRows(kr).length === 0 &&
          objectiveMilestoneRows(extra).length > 0
            ? { ...kr, milestones: extra.milestones ?? extra.Milestones }
            : kr;
        pushKeyResultPlanningTargets(out, enriched, userKeyResultItems);
      });
    });
  }

  extraKeyResults.forEach((kr) => {
    if (!kr || kr.deletedAt != null || kr.id == null) return;
    const id = String(kr.id);
    if (seenKrIds.has(id)) return;
    seenKrIds.add(id);
    pushKeyResultPlanningTargets(out, kr, userKeyResultItems);
  });

  // Panel may show user-KR API rows not present on objectives/plans.
  userKeyResultItems.forEach((apiKr) => {
    if (!apiKr || apiKr.deletedAt != null || apiKr.id == null) return;
    const id = String(apiKr.id);
    if (seenKrIds.has(id)) return;
    seenKrIds.add(id);
    pushKeyResultPlanningTargets(out, apiKr, userKeyResultItems);
  });

  return out;
}

/** True when at least one planning slot can still be selected (+ should show). */
export function hasSelectablePlanningTargets(
  targets: PlanningTarget[] = [],
): boolean {
  return targets.some((t) => !t.isCompleted);
}

function findMilestoneInKeyResult(kr: any, milestoneId: string | null) {
  if (!milestoneId || !kr) return null;
  const list = kr.milestones ?? kr.Milestones ?? [];
  return list.find((m: any) => String(m?.id) === String(milestoneId)) ?? null;
}

/** True when the whole KR must not offer planning (+ hidden everywhere). */
export function isKeyResultBlockedForPlanning(
  kr: any,
  userKeyResultItems: any[] = [],
): boolean {
  const apiKr = userKeyResultItems.find(
    (k) => k && k.deletedAt == null && String(k.id) === String(kr?.id),
  );
  return resolveKrPlanningBlocked(
    {
      metricType: kr?.metricType?.name ?? kr?.key_type,
      progress: getKeyResultProgressPercent(kr),
      currentValue: kr?.currentValue,
      targetValue: kr?.targetValue,
      milestones: kr?.milestones ?? kr?.Milestones ?? [],
    },
    apiKr,
  );
}

/** True when a milestone row must not offer planning. */
export function isMilestoneBlockedForPlanning(
  kr: any,
  milestone: any,
  userKeyResultItems: any[] = [],
): boolean {
  if (isKeyResultBlockedForPlanning(kr, userKeyResultItems)) return true;
  return resolveMilestoneCompleted(milestone, kr, userKeyResultItems);
}

/** True when a planning target (KR / milestone / daily slot) must not show + or add UI. */
export function isPlanningTargetBlocked(
  target:
    | Pick<PlanningTarget, 'keyResultId' | 'milestoneId'>
    | null
    | undefined,
  userKeyResultItems: any[] = [],
): boolean {
  if (!target) return false;

  const apiKr = userKeyResultItems.find(
    (k) =>
      k && k.deletedAt == null && String(k.id) === String(target.keyResultId),
  );

  if (target.milestoneId) {
    const ms =
      findMilestoneInKeyResult(apiKr, target.milestoneId) ??
      findMilestoneInKeyResult(
        { milestones: apiKr?.milestones },
        target.milestoneId,
      );
    if (ms && isMilestoneCompleted(ms)) return true;
    // Partial milestone KR — never block the whole KR from progress alone.
    return false;
  }

  if (
    resolveKrPlanningBlocked(
      {
        metricType: apiKr?.metricType?.name ?? apiKr?.key_type,
        progress: apiKr ? getKeyResultProgressPercent(apiKr) : 0,
        currentValue: apiKr?.currentValue,
        targetValue: apiKr?.targetValue,
        milestones: apiKr?.milestones ?? apiKr?.Milestones ?? [],
      },
      apiKr,
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Keep milestone slots; refresh isCompleted from merged OKR status.
 * Drop only fully blocked non-milestone KR slots.
 */
export function filterPlanningTargetsByBlockedKeyResults(
  targets: PlanningTarget[],
  userKeyResultItems: any[],
): PlanningTarget[] {
  if (!targets.length) return targets;

  return targets
    .filter((t) => {
      if (t.milestoneId) return true;
      return !isPlanningTargetBlocked(t, userKeyResultItems);
    })
    .map((t) => {
      if (!t.milestoneId) return t;

      const apiKr = userKeyResultItems.find(
        (k) =>
          k && k.deletedAt == null && String(k.id) === String(t.keyResultId),
      );
      const syntheticKr = {
        id: t.keyResultId,
        milestones: apiKr?.milestones ?? [],
        metricType: apiKr?.metricType ?? { name: t.metricTypeName },
      };
      const objectiveLike = {
        id: t.keyResultId,
        title: t.keyResultTitle,
        milestones: [
          {
            id: t.milestoneId,
            title: t.milestoneTitle,
            status: t.isCompleted ? 'Completed' : undefined,
          },
        ],
      };
      const completed = resolveMilestoneCompleted(
        {
          id: t.milestoneId,
          title: t.milestoneTitle,
          status: t.isCompleted ? 'Completed' : undefined,
        },
        apiKr ?? syntheticKr ?? objectiveLike,
        userKeyResultItems,
      );
      return { ...t, isCompleted: completed || t.isCompleted === true };
    });
}

/** Daily: one row per weekly parent task (slot for daily sub-tasks). */
export function buildPlanningTargetsFromDailyHierarchy(
  hierarchy: any,
): PlanningTarget[] {
  const out: PlanningTarget[] = [];
  if (!hierarchy?.parentPlan) return out;

  const plan = hierarchy.parentPlan.plans?.find(
    (p: any) => p.isReported === false,
  );
  const tasks = plan?.tasks || [];
  if (!tasks.length) return out;

  const parentPlanId = plan?.id ? String(plan.id) : null;
  const groups = groupParentTasks(tasks);

  groups.forEach((objective: any) => {
    objective.keyResults?.forEach((kr: any) => {
      if (kr.deletedAt) return;
      if (isKeyResultFullyCompletedForPlanning(kr)) return;

      const krTitle = kr.title || kr.name || 'Key result';
      const metricTypeName = kr.metricType?.name ?? null;
      kr.milestones?.forEach((ms: any) => {
        if (ms.deletedAt) return;
        if (isMilestoneCompleted(ms)) return;
        ms.tasks?.forEach((t: any) => {
          out.push({
            id: `daily-${kr.id}-${ms.id}-${t.id}`,
            keyResultId: String(kr.id),
            keyResultTitle: krTitle,
            milestoneId: String(ms.id),
            milestoneTitle: ms.title || 'Milestone',
            parentTaskId: String(t.id),
            parentTaskTitle: t.task || 'Task',
            parentPlanId,
            targetValueHint: t.targetValue ?? null,
            isDailySlot: true,
            metricTypeName,
          });
        });
      });
      kr.tasks?.forEach((t: any) => {
        out.push({
          id: `daily-${kr.id}-t-${t.id}`,
          keyResultId: String(kr.id),
          keyResultTitle: krTitle,
          milestoneId: null,
          parentTaskId: String(t.id),
          parentTaskTitle: t.task || 'Task',
          parentPlanId,
          targetValueHint: t.targetValue ?? null,
          isDailySlot: true,
          metricTypeName,
        });
      });
    });
  });

  return out;
}
