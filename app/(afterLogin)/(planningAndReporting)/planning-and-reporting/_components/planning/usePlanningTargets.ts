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
import { useRecentlyAchievedMilestones } from '@/utils/recentlyAchievedMilestones';

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
  /** True only on first load (no cached data yet) — not background refetch. */
  isLoading: boolean;
  isFetching: boolean;
  isDailyPeriod: boolean;
  /** Refresh objective milestone Completed status (e.g. when opening + menu). */
  refetchObjectives: () => void;
} {
  const {
    data: objective,
    isLoading: objLoading,
    isFetching: objFetching,
    refetch: refetchObjectives,
  } = useFetchObjectives(userId, {
    // Keep prior rows while refetching so + / pick / composer do not blank.
    refetchOnMount: true,
    staleTime: 30_000,
    keepPreviousData: true,
    refetchOnWindowFocus: true,
  });
  const {
    data: hierarchy,
    isLoading: hierLoading,
    isFetching: hierFetching,
  } = useGetPlanningPeriodsHierarchy(userId, planningPeriodId || '');

  // Rebuild targets when session achieve/reopen changes (not only when RQ data changes).
  const recentlyAchievedIds = useRecentlyAchievedMilestones((s) => s.ids);
  const reopenedMilestoneIds = useRecentlyAchievedMilestones(
    (s) => s.reopenedMilestoneIds,
  );
  const reopenedKeyResultIds = useRecentlyAchievedMilestones(
    (s) => s.reopenedKeyResultIds,
  );

  const isDailyPeriod = !!hierarchy?.parentPlan;

  const objectiveMilestonesByKrId = useMemo(
    () => indexObjectiveMilestonesByKrId(objective, userKeyResultItems),
    [objective, userKeyResultItems],
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
    recentlyAchievedIds,
    reopenedMilestoneIds,
    reopenedKeyResultIds,
  ]);

  // Background invalidation/refetch must not flip buttons or panels into loading.
  const isInitialLoading =
    (objLoading && objective == null) ||
    (!!planningPeriodId && hierLoading && hierarchy == null);

  return {
    targets,
    objectiveMilestonesByKrId,
    isLoading: isInitialLoading,
    isFetching: objFetching || hierFetching,
    isDailyPeriod,
    refetchObjectives: () => {
      void refetchObjectives();
    },
  };
}
