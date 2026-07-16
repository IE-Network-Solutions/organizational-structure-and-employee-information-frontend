import { groupParentTasks } from '../dataTransformer/plan';
import {
  getKeyResultProgressPercent,
  isKeyResultFullyCompletedForPlanning,
  isMilestoneCompleted,
  isMilestoneKeyResult,
  mergeKeyResultWithUserApi,
  resolveKrPlanningBlocked,
} from '@/utils/okrKeyResultProgressDisplay';

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

/** Weekly / monthly: one row per KR, or per milestone when KR has milestones. */
export function buildPlanningTargetsFromObjectives(
  objective: any,
): PlanningTarget[] {
  const out: PlanningTarget[] = [];
  if (!objective?.items?.length) return out;

  objective.items.forEach((obj: any) => {
    if (obj.deletedAt) return;
    obj.keyResults?.forEach((kr: any) => {
      if (kr.deletedAt) return;
      const krTitle = kr.title || kr.name || 'Key result';
      const metricTypeName = kr.metricType?.name ?? null;

      if (isMilestoneKeyResult(kr)) {
        if (isKeyResultFullyCompletedForPlanning(kr)) return;
        kr.milestones?.forEach((ms: any) => {
          if (ms.deletedAt) return;
          const completed = isMilestoneCompleted(ms);
          out.push({
            id: `okr-kr-${kr.id}-ms-${ms.id}`,
            keyResultId: String(kr.id),
            keyResultTitle: krTitle,
            milestoneId: String(ms.id),
            milestoneTitle: ms.title || 'Milestone',
            parentTaskId: null,
            isDailySlot: false,
            metricTypeName,
            isCompleted: completed,
          });
        });
        return;
      }

      if (isKeyResultFullyCompletedForPlanning(kr)) return;

      out.push({
        id: `okr-kr-${kr.id}`,
        keyResultId: String(kr.id),
        keyResultTitle: krTitle,
        milestoneId: null,
        parentTaskId: null,
        isDailySlot: false,
        metricTypeName,
      });
    });
  });

  return out;
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
  const source = mergeKeyResultWithUserApi(kr, userKeyResultItems);
  const msList = source.milestones ?? source.Milestones ?? [];
  const resolved =
    msList.find((m: any) => String(m?.id) === String(milestone?.id)) ??
    milestone;
  return isMilestoneCompleted(resolved);
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

  if (!apiKr) return false;

  if (target.milestoneId) {
    const ms = findMilestoneInKeyResult(apiKr, target.milestoneId);
    if (ms && isMilestoneCompleted(ms)) return true;
  }

  return false;
}

/**
 * Drop slots for fully blocked KRs. Completed milestones are kept (marked
 * `isCompleted`) so the pick menu can show them disabled/greyed out.
 */
export function filterPlanningTargetsByBlockedKeyResults(
  targets: PlanningTarget[],
  userKeyResultItems: any[],
): PlanningTarget[] {
  if (!targets.length) return targets;

  return targets
    .filter((t) => {
      const apiKr = userKeyResultItems.find(
        (k) =>
          k &&
          k.deletedAt == null &&
          String(k.id) === String(t.keyResultId),
      );
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
        return false;
      }
      // Non-milestone KR slots: drop if blocked (no milestone list to grey out)
      if (!t.milestoneId && isPlanningTargetBlocked(t, userKeyResultItems)) {
        return false;
      }
      return true;
    })
    .map((t) => {
      if (!t.milestoneId) return t;
      const apiKr = userKeyResultItems.find(
        (k) =>
          k &&
          k.deletedAt == null &&
          String(k.id) === String(t.keyResultId),
      );
      const ms = apiKr
        ? findMilestoneInKeyResult(apiKr, t.milestoneId)
        : null;
      const completed =
        t.isCompleted === true ||
        (ms != null && isMilestoneCompleted(ms));
      return completed === t.isCompleted ? t : { ...t, isCompleted: completed };
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
