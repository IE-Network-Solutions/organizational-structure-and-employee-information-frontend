import { useMemo } from 'react';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetAllReportingForKrPanel,
  useGetReporting,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAllUsersData } from '@/store/server/features/employees/employeeManagment/queries';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { transformReportToPlanSummary } from '../dataTransformer/vamp';
import { Cadence, PlanSummary } from '../types';
import { getEmployeeItems } from './departmentUsers';
import {
  useEffectivePlanUserIds,
  usePlanningFilterScopeReady,
} from './usePlanningData';

/** Fetches reports only when enabled (e.g. Reports tab active). */
export function useReportingData(enabled = true) {
  const {
    activePlanPeriod,
    pageReporting,
    pageSizeReporting,
    activePlanPeriodId,
    selectedSessionIds,
    allSessionsOfYear,
    planningDefaultFilterApplied,
  } = PlanningAndReportingStore();
  const { data: allEmployeesRaw } = useGetAllUsersData();
  const employeeData = useMemo(
    () => ({ items: getEmployeeItems(allEmployeesRaw) }),
    [allEmployeesRaw],
  );
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();
  const { isFilterScopePending } = usePlanningFilterScopeReady();
  const effectiveSelectedUsers = useEffectivePlanUserIds();

  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;

  const sessionId =
    selectedSessionIds.length > 0
      ? selectedSessionIds
      : allSessionsOfYear.length > 0
        ? allSessionsOfYear
        : [];

  const listQueryEnabled =
    enabled &&
    !!planningPeriodId &&
    planningDefaultFilterApplied &&
    effectiveSelectedUsers.length > 0;

  const {
    data: allReporting,
    isLoading: isReportingQueryLoading,
    isFetching: isReportingQueryFetching,
  } = useGetReporting(
    {
      userId: effectiveSelectedUsers,
      planPeriodId: planningPeriodId ?? '',
      pageReporting,
      pageSizeReporting,
      sessionId,
    },
    { enabled: listQueryEnabled },
  );

  const { data: allReportingForKrPanel } = useGetAllReportingForKrPanel(
    {
      userId: effectiveSelectedUsers,
      planPeriodId: planningPeriodId ?? '',
      sessionId,
    },
    { enabled: listQueryEnabled },
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

  const krReportSummaries: PlanSummary[] = useMemo(() => {
    return (allReportingForKrPanel?.items ?? []).map((dataItem: any) =>
      transformReportToPlanSummary(dataItem, cadence, employeeData),
    );
  }, [allReportingForKrPanel?.items, cadence, employeeData]);

  const isLoading =
    isFilterScopePending ||
    (listQueryEnabled &&
      (isReportingQueryLoading ||
        (isReportingQueryFetching && allReporting === undefined)));

  return {
    reportSummaries,
    reportingItems: allReporting?.items ?? [],
    krReportSummaries,
    krReportingItems: allReportingForKrPanel?.items ?? [],
    isLoading,
    isFilterScopePending,
  };
}
