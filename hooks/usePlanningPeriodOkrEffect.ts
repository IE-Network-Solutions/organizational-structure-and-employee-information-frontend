'use client';

import { useMemo } from 'react';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import {
  doesPlanningPeriodAffectOkr,
  getOkrCountingPeriodName,
  planningPeriodIntervalRank,
  resolveAssignedPlanningPeriods,
} from '@/utils/okrCountingPlanningPeriod';

/**
 * Whether the active planning period should write OKR for the logged-in user.
 * Lower assigned cadences are tracking-only reports.
 */
export function usePlanningPeriodOkrEffect(
  planningPeriodId?: string | null,
): {
  affectsOkr: boolean;
  countingPeriodName: string;
  isAssignmentReady: boolean;
} {
  const { data: assignments, isFetched: assignmentsFetched } =
    AllPlanningPeriods();
  const { data: catalog, isFetched: catalogFetched } =
    useDefaultPlanningPeriods();

  const resolvedAssignments = useMemo(
    () => resolveAssignedPlanningPeriods(assignments, catalog?.items),
    [assignments, catalog?.items],
  );

  const ranksReady = useMemo(() => {
    if (resolvedAssignments.length === 0) return true;
    return resolvedAssignments.some(
      (item) => planningPeriodIntervalRank(item.planningPeriod) > 0,
    );
  }, [resolvedAssignments]);

  const isAssignmentReady =
    assignmentsFetched && (catalogFetched || ranksReady);

  return useMemo(
    () => ({
      affectsOkr:
        isAssignmentReady &&
        doesPlanningPeriodAffectOkr(planningPeriodId, resolvedAssignments),
      countingPeriodName: getOkrCountingPeriodName(resolvedAssignments),
      isAssignmentReady,
    }),
    [planningPeriodId, resolvedAssignments, isAssignmentReady],
  );
}
