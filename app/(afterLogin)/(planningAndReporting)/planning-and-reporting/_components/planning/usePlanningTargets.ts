import { useEffect, useMemo } from 'react';
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
  isFetching: boolean;
  isDailyPeriod: boolean;
} {
  const {
    data: objective,
    isLoading: objLoading,
    isFetching: objFetching,
    refetch: refetchObjectives,
  } = useFetchObjectives(userId, {
    // Match user-KR freshness: milestone Completed status must not stick until re-login.
    refetchOnMount: 'always',
    staleTime: 0,
    keepPreviousData: false,
    refetchOnWindowFocus: true,
  });
  const { data: hierarchy, isLoading: hierLoading } =
    useGetPlanningPeriodsHierarchy(userId, planningPeriodId || '');

  // When the tab becomes visible again (e.g. after reporting/achieving on OKR),
  // pull fresh objective milestones without requiring a full re-login.
  useEffect(() => {
    if (!userId || typeof document === 'undefined') return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void refetchObjectives();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [userId, refetchObjectives]);

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
    isFetching: objFetching,
    isDailyPeriod,
  };
}
