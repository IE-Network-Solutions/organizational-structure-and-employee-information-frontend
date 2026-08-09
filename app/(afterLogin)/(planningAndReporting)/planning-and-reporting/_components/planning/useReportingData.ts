import { useMemo } from 'react';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetReporting,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { resolveActivePlanningPeriodId } from '@/utils/resolveActivePlanningPeriodId';
import { transformReportToPlanSummary } from '../dataTransformer/vamp';
import { Cadence, PlanSummary } from '../types';

/** Fetches reports only when enabled (e.g. Reports tab active). */
export function useReportingData(enabled = true) {
  const {
    selectedUser,
    activePlanPeriod,
    pageReporting,
    pageSizeReporting,
    activePlanPeriodId,
    selectedSessionIds,
    allSessionsOfYear,
  } = PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();

  const planningPeriodId = resolveActivePlanningPeriodId(
    activePlanPeriodId,
    userPlanningPeriods,
    activePlanPeriod,
  );

  const { data: allReporting } = useGetReporting(
    {
      userId: selectedUser,
      planPeriodId: planningPeriodId ?? '',
      pageReporting,
      pageSizeReporting,
      sessionId:
        selectedSessionIds.length > 0
          ? selectedSessionIds
          : allSessionsOfYear.length > 0
            ? allSessionsOfYear
            : [],
    },
    { enabled: enabled && !!planningPeriodId },
  );

  const getPlanningPeriodDetail = (id: string) => {
    return planningPeriods?.items?.find((p: any) => p?.id === id) || {};
  };

  const activeTabName = getPlanningPeriodDetail(planningPeriodId ?? '')?.name;
  const cadence = (activeTabName?.toLowerCase() as Cadence) || 'weekly';

  const reportSummaries: PlanSummary[] = useMemo(() => {
    if (!allReporting?.items) return [];
    return allReporting.items.map((dataItem: any) =>
      transformReportToPlanSummary(dataItem, cadence, employeeData),
    );
  }, [allReporting?.items, cadence, employeeData]);

  return {
    reportSummaries,
    reportingItems: allReporting?.items ?? [],
  };
}
