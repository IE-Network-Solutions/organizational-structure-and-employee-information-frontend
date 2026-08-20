'use client';

import { useEffect } from 'react';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { useGetFiscalYearById } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import type { Session } from '@/store/server/features/organizationStructure/fiscalYear/interface';
import { reconcileSelectedSessionIds } from './sessionSelection';

/** Keeps allSessionsOfYear in sync when fiscal year changes (SessionFilter may be unmounted). */
export function useFiscalYearSessionSync() {
  const {
    selectedFiscalYearId,
    setAllSessionsOfYear,
    setSelectedSessionIds,
    setPage,
    setPageReporting,
  } = PlanningAndReportingStore();
  const { data: selectedFiscalYearData } = useGetFiscalYearById(
    selectedFiscalYearId || '',
  );

  useEffect(() => {
    if (selectedFiscalYearData?.sessions) {
      const allSessionIds = selectedFiscalYearData.sessions.map(
        (s: Session) => s.id,
      );
      const selectedSessionIds =
        PlanningAndReportingStore.getState().selectedSessionIds;
      const nextSelectedSessionIds = reconcileSelectedSessionIds(
        selectedSessionIds,
        allSessionIds,
      );
      setAllSessionsOfYear(allSessionIds);
      setSelectedSessionIds(nextSelectedSessionIds);
      setPage(1);
      setPageReporting(1);
      return;
    }

    if (!selectedFiscalYearId) {
      setAllSessionsOfYear([]);
      setSelectedSessionIds([]);
    }
  }, [
    selectedFiscalYearId,
    selectedFiscalYearData,
    setAllSessionsOfYear,
    setSelectedSessionIds,
    setPage,
    setPageReporting,
  ]);
}
