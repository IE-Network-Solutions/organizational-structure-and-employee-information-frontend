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
import { resolveActivePlanningPeriodId } from '@/utils/resolveActivePlanningPeriodId';
import { transformToPlanSummary } from '../dataTransformer/vamp';
import { ViewMode, Cadence, PlanSummary } from '../types';

/** Same team/default scope as Planning list — one shared plan fetch. */
export function useEffectivePlanUserIds() {
  const { selectedUser, planningFilterPlanType, planningFilterDepartment } =
    PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { userId } = useAuthenticationStore();

  return useMemo(() => {
    const isDefaultMyPlanScope =
      selectedUser.length === 1 && selectedUser[0] === userId;
    const shouldUseTeamDefault =
      isDefaultMyPlanScope &&
      planningFilterPlanType === 'all' &&
      !planningFilterDepartment;

    if (!shouldUseTeamDefault) return selectedUser;

    const employees = employeeData?.items ?? [];
    const directReports = employees
      .filter(
        (employee: any) =>
          (employee?.delegatedTo?.id || employee?.reportingTo?.id) === userId,
      )
      .map((employee: any) => employee.id);

    if (directReports.length > 0) {
      return Array.from(new Set([userId, ...directReports]));
    }

    const currentUser = employees.find(
      (employee: any) => employee?.id === userId,
    );
    const myDepartmentId =
      currentUser?.employeeJobInformation?.[0]?.department?.id ||
      currentUser?.employeeJobInformation?.[0]?.departmentId ||
      currentUser?.department?.id ||
      currentUser?.departmentId;
    const myManagerId =
      currentUser?.delegatedTo?.id || currentUser?.reportingTo?.id || null;

    const teammates = employees
      .filter((employee: any) => {
        if (employee?.id === userId) return false;
        const employeeDepartmentId =
          employee?.employeeJobInformation?.[0]?.department?.id ||
          employee?.employeeJobInformation?.[0]?.departmentId ||
          employee?.department?.id ||
          employee?.departmentId;
        const employeeManagerId =
          employee?.delegatedTo?.id || employee?.reportingTo?.id || null;
        const sameDepartment =
          !!myDepartmentId &&
          !!employeeDepartmentId &&
          employeeDepartmentId === myDepartmentId;
        const sameManager =
          !!myManagerId &&
          !!employeeManagerId &&
          employeeManagerId === myManagerId;
        return sameDepartment || sameManager;
      })
      .map((employee: any) => employee.id);

    return Array.from(new Set([userId, ...teammates]));
  }, [
    selectedUser,
    userId,
    employeeData?.items,
    planningFilterPlanType,
    planningFilterDepartment,
  ]);
}

/** Single plan-list source for page KR panel + Planning list. */
export function usePlanningData(enabled = true) {
  const { activePlanPeriod, page, pageSize, activePlanPeriodId } =
    PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { userId } = useAuthenticationStore();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();
  const effectiveSelectedUsers = useEffectivePlanUserIds();

  const planningPeriodId = resolveActivePlanningPeriodId(
    activePlanPeriodId,
    userPlanningPeriods,
    activePlanPeriod,
  );

  const { data: allPlanning, isLoading } = useGetPlanning(
    {
      userId: effectiveSelectedUsers,
      planPeriodId: planningPeriodId ?? '',
      page,
      pageSize,
      sessionId: [],
    },
    { enabled: enabled && !!planningPeriodId },
  );

  const getPlanningPeriodDetail = (id: string) => {
    return planningPeriods?.items?.find((p: any) => p?.id === id) || {};
  };

  const activeTabName = getPlanningPeriodDetail(planningPeriodId ?? '')?.name;

  const activePlanningItems = useMemo(() => {
    const items = allPlanning?.items ?? [];
    const activeOnly = items.filter((item: any) => item?.isReported !== true);
    const currentUserId = String(userId ?? '');
    return [...activeOnly].sort((a: any, b: any) => {
      const aMine = String(a?.userId ?? '') === currentUserId ? 0 : 1;
      const bMine = String(b?.userId ?? '') === currentUserId ? 0 : 1;
      if (aMine !== bMine) return aMine - bMine;
      const ta = new Date(a?.createdAt || 0).getTime();
      const tb = new Date(b?.createdAt || 0).getTime();
      return tb - ta;
    });
  }, [allPlanning?.items, userId]);

  const transformedData =
    groupPlanTasksByKeyResultAndMilestone(activePlanningItems);

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
    activePlanningItems,
    isLoading,
    userId,
    planningPeriodId,
    allPlanning,
  };
}
