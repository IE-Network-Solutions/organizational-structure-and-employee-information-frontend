import { useMemo } from 'react';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import { useGetPlanningPeriodsHierarchy } from '@/store/server/features/okrPlanningAndReporting/queries';
import {
  buildPlanningTargetsFromObjectives,
  buildPlanningTargetsFromDailyHierarchy,
  filterPlanningTargetsByBlockedKeyResults,
  type PlanningTarget,
} from './buildPlanningTargets';

export function usePlanningTargets(
  userId: string,
  planningPeriodId: string | undefined,
  userKeyResultItems: any[] = [],
): {
  targets: PlanningTarget[];
  isLoading: boolean;
  isDailyPeriod: boolean;
} {
  const { data: objective, isLoading: objLoading } = useFetchObjectives(userId);
  const { data: hierarchy, isLoading: hierLoading } =
    useGetPlanningPeriodsHierarchy(userId, planningPeriodId || '');

  const isDailyPeriod = !!hierarchy?.parentPlan;

  const targets = useMemo(() => {
    if (!planningPeriodId) return [];
    const raw = isDailyPeriod
      ? buildPlanningTargetsFromDailyHierarchy(hierarchy)
      : buildPlanningTargetsFromObjectives(objective);
    return filterPlanningTargetsByBlockedKeyResults(raw, userKeyResultItems);
  }, [
    planningPeriodId,
    isDailyPeriod,
    hierarchy,
    objective,
    userKeyResultItems,
  ]);

  return {
    targets,
    isLoading: objLoading || hierLoading,
    isDailyPeriod,
  };
}
