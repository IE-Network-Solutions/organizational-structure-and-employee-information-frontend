'use client';

import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';

/**
 * Shared fiscal year / session scope for Plan & Report KR API calls.
 * Falls back to OKR dashboard filters so sidebar navigation keeps the same KR context.
 */
export function useOkrPlanningScope() {
  const { selectedFiscalYearId, selectedSessionIds } =
    PlanningAndReportingStore();
  const { fiscalYearId: okrFiscalYearId, sessionIds: okrSessionIds } =
    useOKRStore();
  const { data: activeFiscalYear } = useGetActiveFiscalYears();

  const fiscalYearId =
    selectedFiscalYearId ||
    okrFiscalYearId ||
    activeFiscalYear?.id ||
    undefined;

  const sessionId = selectedSessionIds[0] || okrSessionIds?.[0] || undefined;

  return { fiscalYearId, sessionId };
}
