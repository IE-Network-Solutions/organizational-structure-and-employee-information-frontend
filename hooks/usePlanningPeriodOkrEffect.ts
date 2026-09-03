'use client';

import { useMemo } from 'react';
import { AllPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/queries';
import {
  doesPlanningPeriodAffectOkr,
  getOkrCountingPeriodName,
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

  return useMemo(
    () => ({
      affectsOkr: doesPlanningPeriodAffectOkr(planningPeriodId, assignments),
      countingPeriodName: getOkrCountingPeriodName(assignments),
    }),
    [planningPeriodId, assignments],
  );
}
