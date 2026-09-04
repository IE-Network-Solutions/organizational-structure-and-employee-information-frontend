'use client';

import { useMemo } from 'react';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import {
  doesPlanningPeriodAffectOkr,
  getOkrCountingPeriodName,
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
} {
  const { data: assignments } = AllPlanningPeriods();
  const { data: catalog } = useDefaultPlanningPeriods();

  const resolvedAssignments = useMemo(
    () => resolveAssignedPlanningPeriods(assignments, catalog?.items),
    [assignments, catalog?.items],
  );

  return useMemo(
    () => ({
      affectsOkr: doesPlanningPeriodAffectOkr(
        planningPeriodId,
        resolvedAssignments,
      ),
      countingPeriodName: getOkrCountingPeriodName(resolvedAssignments),
    }),
    [planningPeriodId, resolvedAssignments],
  );
}
