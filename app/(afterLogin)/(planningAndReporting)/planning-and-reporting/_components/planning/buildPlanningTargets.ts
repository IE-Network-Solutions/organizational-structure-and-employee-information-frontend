import { groupParentTasks } from '../dataTransformer/plan';

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
      if (kr.milestones?.length) {
        kr.milestones.forEach((ms: any) => {
          if (ms.deletedAt) return;
          out.push({
            id: `okr-kr-${kr.id}-ms-${ms.id}`,
            keyResultId: String(kr.id),
            keyResultTitle: krTitle,
            milestoneId: String(ms.id),
            milestoneTitle: ms.title || 'Milestone',
            parentTaskId: null,
            isDailySlot: false,
            metricTypeName,
          });
        });
      } else {
        out.push({
          id: `okr-kr-${kr.id}`,
          keyResultId: String(kr.id),
          keyResultTitle: krTitle,
          milestoneId: null,
          parentTaskId: null,
          isDailySlot: false,
          metricTypeName,
        });
      }
    });
  });

  return out;
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
      const krTitle = kr.title || kr.name || 'Key result';
      const metricTypeName = kr.metricType?.name ?? null;
      kr.milestones?.forEach((ms: any) => {
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
