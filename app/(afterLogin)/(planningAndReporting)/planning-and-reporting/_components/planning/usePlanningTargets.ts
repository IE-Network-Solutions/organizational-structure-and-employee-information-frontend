import { useMemo } from 'react';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import { useGetPlanningPeriodsHierarchy } from '@/store/server/features/okrPlanningAndReporting/queries';
import {
  buildPlanningTargetsFromObjectives,
  buildPlanningTargetsFromDailyHierarchy,
  filterPlanningTargetsByBlockedKeyResults,
  indexObjectiveMilestonesByKrId,
  type PlanningTarget,
} from './buildPlanningTargets';

export function usePlanningTargets(
  userId: string,
  planningPeriodId: string | undefined,
  userKeyResultItems: any[] = [],
  /** Plan/panel KRs — often hold milestone titles when objectives omit them */
  planKeyResults: any[] = [],
): {
  targets: PlanningTarget[];
  /** Same milestone rows createPlanObjective uses, keyed by KR id */
  objectiveMilestonesByKrId: Map<string, any[]>;
  isLoading: boolean;
  isDailyPeriod: boolean;
} {
  const { data: objective, isLoading: objLoading } = useFetchObjectives(userId);
  const { data: hierarchy, isLoading: hierLoading } =
    useGetPlanningPeriodsHierarchy(userId, planningPeriodId || '');

  const isDailyPeriod = !!hierarchy?.parentPlan;

  const objectiveMilestonesByKrId = useMemo(
    () => indexObjectiveMilestonesByKrId(objective),
    [objective],
  );

  const targets = useMemo(() => {
    if (!planningPeriodId) return [];
    const raw = isDailyPeriod
      ? buildPlanningTargetsFromDailyHierarchy(hierarchy)
      : buildPlanningTargetsFromObjectives(
          objective,
          userKeyResultItems,
          planKeyResults,
        );
    return filterPlanningTargetsByBlockedKeyResults(raw, userKeyResultItems);
  }, [
    planningPeriodId,
    isDailyPeriod,
    hierarchy,
    objective,
    userKeyResultItems,
    planKeyResults,
  ]);

  return {
    targets,
    objectiveMilestonesByKrId,
    isLoading: objLoading || hierLoading,
    isDailyPeriod,
  };
}
