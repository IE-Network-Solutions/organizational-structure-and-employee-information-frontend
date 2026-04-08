import { useMemo } from 'react';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import { useGetPlanningPeriodsHierarchy } from '@/store/server/features/okrPlanningAndReporting/queries';
import {
  buildPlanningTargetsFromObjectives,
  buildPlanningTargetsFromDailyHierarchy,
  type PlanningTarget,
} from './buildPlanningTargets';

export function usePlanningTargets(
  userId: string,
  planningPeriodId: string | undefined,
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
    if (isDailyPeriod) {
      return buildPlanningTargetsFromDailyHierarchy(hierarchy);
    }
    return buildPlanningTargetsFromObjectives(objective);
  }, [planningPeriodId, isDailyPeriod, hierarchy, objective]);

  return {
    targets,
    isLoading: objLoading || hierLoading,
    isDailyPeriod,
  };
}
