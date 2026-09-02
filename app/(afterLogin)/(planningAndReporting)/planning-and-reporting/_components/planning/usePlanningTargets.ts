import { useEffect, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import {
  rememberAchievedMilestones,
  useRecentlyAchievedMilestones,
} from '@/utils/recentlyAchievedMilestones';
import { restampSessionAchievedMilestonesInCaches } from '@/utils/invalidateOkrPlanningCaches';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import { useGetPlanningPeriodsHierarchy } from '@/store/server/features/okrPlanningAndReporting/queries';
import { isDeadlinePlanningMockEnabled } from '@/utils/deadlinePlanningMocks';
import {
  buildDeadlineCreatePlanningTargets,
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
  /** True only on first load (no cached data yet) — not background refetch. */
  isLoading: boolean;
  isFetching: boolean;
  isDailyPeriod: boolean;
  /** Refresh objective milestone Completed status (e.g. when opening + menu). */
  refetchObjectives: () => void;
} {
  const mockEnabled = isDeadlinePlanningMockEnabled();
  const queryClient = useQueryClient();
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
    refetchOnWindowFocus: false,
    enabled: !mockEnabled && !!userId,
  });
  const { data: hierarchy, isFetching: hierFetching } =
    useGetPlanningPeriodsHierarchy(
      mockEnabled ? '' : userId,
      mockEnabled ? '' : planningPeriodId || '',
    );

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
    const raw = buildDeadlineCreatePlanningTargets(
      objective,
      userKeyResultItems,
      planKeyResults,
      hierarchy,
    );
    return filterPlanningTargetsByBlockedKeyResults(raw, userKeyResultItems);
  }, [
    hierarchy,
    objective,
    userKeyResultItems,
    planKeyResults,
    recentlyAchievedIds,
    reopenedMilestoneIds,
    reopenedKeyResultIds,
  ]);

  // Seed session memory from authoritative objective/API completed rows so a
  // later stale refetch cannot flip achieved milestones back to selectable.
  useEffect(() => {
    const ids = targets
      .filter((t) => t.milestoneId && t.isCompleted)
      .map((t) => t.milestoneId);
    if (ids.length > 0) rememberAchievedMilestones(ids);
  }, [targets]);

  // After browser refresh, re-stamp Completed onto RQ caches from persisted IDs
  // so stale Incomplete API rows cannot re-enable the pick menu.
  useEffect(() => {
    if (!recentlyAchievedIds || recentlyAchievedIds.size === 0) return;
    if (objective == null && userKeyResultItems.length === 0) return;
    restampSessionAchievedMilestonesInCaches(queryClient);
  }, [recentlyAchievedIds, objective, userKeyResultItems, queryClient]);

  // KR + comes from objectives; hierarchy is optional (daily-under-weekly slots).
  const isInitialLoading = objLoading && objective == null;

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
