import { useMemo } from 'react';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { groupPlanTasksByKeyResultAndMilestone } from '../dataTransformer/plan';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { transformToPlanSummary } from '../dataTransformer/vamp';
import { ViewMode, Cadence, PlanSummary } from '../types';

export function usePlanningData() {
  const { selectedUser, activePlanPeriod, page, pageSize, activePlanPeriodId } =
    PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { userId } = useAuthenticationStore();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();

  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;

  const { data: allPlanning, isLoading } = useGetPlanning({
    userId: selectedUser,
    planPeriodId: planningPeriodId ?? '',
    page,
    pageSize,
    sessionId: [],
  });

  const getPlanningPeriodDetail = (id: string) => {
    return planningPeriods?.items?.find((p: any) => p?.id === id) || {};
  };

  const activeTabName = getPlanningPeriodDetail(planningPeriodId ?? '')?.name;

  const transformedData = groupPlanTasksByKeyResultAndMilestone(
    allPlanning?.items ?? [],
  );

  const planSummaries: PlanSummary[] = useMemo(() => {
    return (
      transformedData?.map((dataItem: any) => {
        const cadence = (activeTabName?.toLowerCase() as Cadence) || 'weekly';
        return transformToPlanSummary(
          dataItem,
          'planning' as ViewMode,
          cadence,
          employeeData,
        );
      }) || []
    );
  }, [transformedData, employeeData, activeTabName]);

  return {
    planSummaries,
    transformedData,
    isLoading,
    userId,
  };
}
