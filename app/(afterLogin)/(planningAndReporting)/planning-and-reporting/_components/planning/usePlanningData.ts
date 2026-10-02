import { useEffect, useMemo } from 'react';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetAllPlanningForKrPanel,
  useGetPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAllUsersData } from '@/store/server/features/employees/employeeManagment/queries';
import { groupPlanTasksByKeyResultAndMilestone } from '../dataTransformer/plan';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { transformToPlanSummary } from '../dataTransformer/vamp';
import { ViewMode, Cadence, PlanSummary } from '../types';
import {
  getEmployeeDepartmentId,
  getEmployeeItems,
  getSubordinateIds,
  resolveDefaultPlanScope,
} from './departmentUsers';
import {
  buildPrototypeQuarterlyPlans,
  isPrototypeQuarterlyPeriodId,
} from '@/app/(afterLogin)/(okrplanning)/okr/_constants/prototypeMockObjectives';
import { useObjectiveTypesStore } from '@/store/uistate/features/okrplanning/okrSetting/objectiveTypesStore';

function buildActivePlanningItems(items: any[], userId: string) {
  const activeOnly = (items ?? []).filter(
    (item: any) => item?.isReported !== true,
  );
  const currentUserId = String(userId ?? '');
  return [...activeOnly].sort((a: any, b: any) => {
    const aMine = String(a?.userId ?? '') === currentUserId ? 0 : 1;
    const bMine = String(b?.userId ?? '') === currentUserId ? 0 : 1;
    if (aMine !== bMine) return aMine - bMine;
    const ta = new Date(a?.createdAt || 0).getTime();
    const tb = new Date(b?.createdAt || 0).getTime();
    return tb - ta;
  });
}

/** True once employee list is loaded and the initial My/Subordinate default is applied. */
export function usePlanningFilterScopeReady() {
  const { userId } = useAuthenticationStore();
  const planningDefaultFilterApplied = PlanningAndReportingStore(
    (s) => s.planningDefaultFilterApplied,
  );
  const { isFetched: employeesFetched } = useGetAllUsersData();

  const isFilterScopeReady =
    !!userId && employeesFetched && planningDefaultFilterApplied;
  const isFilterScopePending = !!userId && !isFilterScopeReady;

  return { isFilterScopeReady, isFilterScopePending };
}

/** Same team/default scope as Planning list — one shared plan fetch. */
export function useEffectivePlanUserIds() {
  const { selectedUser, planningFilterPlanType, planningFilterDepartment } =
    PlanningAndReportingStore();
  const { data: allEmployeesRaw } = useGetAllUsersData();
  const employeeData = useMemo(
    () => ({ items: getEmployeeItems(allEmployeesRaw) }),
    [allEmployeesRaw],
  );
  const { userId } = useAuthenticationStore();

  return useMemo(() => {
    if (planningFilterPlanType === 'myPlan') {
      return userId ? [userId] : [];
    }

    const employees = employeeData.items;
    if (planningFilterPlanType === 'subordinatePlan') {
      const storedIds = selectedUser.filter(
        (id) => id && id !== 'subordinate' && id !== 'all',
      );
      if (storedIds.length > 0) return storedIds;
      return getSubordinateIds({ items: employees }, userId);
    }

    const isDefaultMyPlanScope =
      selectedUser.length === 1 && selectedUser[0] === userId;
    const shouldUseTeamDefault =
      isDefaultMyPlanScope &&
      planningFilterPlanType === 'all' &&
      !planningFilterDepartment;

    if (!shouldUseTeamDefault) return selectedUser;

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
    const myDepartmentId = getEmployeeDepartmentId(currentUser);
    const myManagerId =
      currentUser?.delegatedTo?.id || currentUser?.reportingTo?.id || null;

    const teammates = employees
      .filter((employee: any) => {
        if (employee?.id === userId) return false;
        const employeeDepartmentId = getEmployeeDepartmentId(employee);
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
    employeeData.items,
    planningFilterPlanType,
    planningFilterDepartment,
  ]);
}

/** Single plan-list source for page KR panel + Planning list. */
export function usePlanningData(enabled = true) {
  const {
    activePlanPeriod,
    page,
    pageSize,
    activePlanPeriodId,
    selectedSessionIds,
    allSessionsOfYear,
    planningDefaultFilterApplied,
    setPage,
  } = PlanningAndReportingStore();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();
  const { data: allEmployeesRaw, isFetched: employeesFetched } =
    useGetAllUsersData();
  const employeeData = useMemo(
    () => ({ items: getEmployeeItems(allEmployeesRaw) }),
    [allEmployeesRaw],
  );
  const { userId } = useAuthenticationStore();
  const { isFilterScopePending } = usePlanningFilterScopeReady();
  const effectiveSelectedUsers = useEffectivePlanUserIds();

  useEffect(() => {
    if (!userId || !employeesFetched) return;
    const {
      planningDefaultFilterApplied: alreadyApplied,
      setPlanningFilterPlanType,
      setPlanningFilterEmployee,
      setSelectedUser,
      setPlanningDefaultFilterApplied,
    } = PlanningAndReportingStore.getState();
    if (alreadyApplied) return;

    const subordinateIds = getSubordinateIds(employeeData, userId);
    const defaults = resolveDefaultPlanScope(userId, subordinateIds);
    setPlanningFilterPlanType(defaults.planningFilterPlanType);
    setPlanningFilterEmployee('all');
    setSelectedUser(defaults.selectedUser);
    setPlanningDefaultFilterApplied(true);
  }, [userId, employeesFetched, employeeData]);

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
    !isPrototypeQuarterlyPeriodId(planningPeriodId) &&
    planningDefaultFilterApplied &&
    effectiveSelectedUsers.length > 0;

  const {
    data: allPlanning,
    isLoading: isPlanningQueryLoading,
    isFetching: isPlanningQueryFetching,
  } = useGetPlanning(
    {
      userId: effectiveSelectedUsers,
      planPeriodId: planningPeriodId ?? '',
      page,
      pageSize,
      sessionId,
    },
    { enabled: listQueryEnabled },
  );

  const {
    data: allPlanningForKrPanel,
    isLoading: isKrPanelQueryLoading,
    isFetching: isKrPanelQueryFetching,
  } = useGetAllPlanningForKrPanel(
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

  const isQuarterlyPrototype = isPrototypeQuarterlyPeriodId(planningPeriodId);
  const objectiveTypes = useObjectiveTypesStore((s) => s.types);

  const activeTabName = isQuarterlyPrototype
    ? 'Quarterly'
    : getPlanningPeriodDetail(planningPeriodId ?? '')?.name;

  const prototypeQuarterlyPlans = useMemo(() => {
    if (!isQuarterlyPrototype || !userId) return [];
    return buildPrototypeQuarterlyPlans({ userId, types: objectiveTypes });
  }, [isQuarterlyPrototype, userId, objectiveTypes]);

  const activePlanningItems = useMemo(() => {
    if (isQuarterlyPrototype) {
      return buildActivePlanningItems(prototypeQuarterlyPlans, userId);
    }
    return buildActivePlanningItems(allPlanning?.items ?? [], userId);
  }, [
    isQuarterlyPrototype,
    prototypeQuarterlyPlans,
    allPlanning?.items,
    userId,
  ]);

  const krActivePlanningItems = useMemo(() => {
    if (isQuarterlyPrototype) {
      return buildActivePlanningItems(prototypeQuarterlyPlans, userId);
    }
    return buildActivePlanningItems(allPlanningForKrPanel?.items ?? [], userId);
  }, [
    isQuarterlyPrototype,
    prototypeQuarterlyPlans,
    allPlanningForKrPanel?.items,
    userId,
  ]);

  const isKrPanelReady = isQuarterlyPrototype
    ? true
    : allPlanningForKrPanel !== undefined;
  const totalItems = isKrPanelReady
    ? krActivePlanningItems.length
    : (allPlanning?.meta?.totalItems ?? 0);

  useEffect(() => {
    if (!isKrPanelReady) return;
    const maxPage = Math.max(
      1,
      Math.ceil(krActivePlanningItems.length / pageSize),
    );
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [isKrPanelReady, krActivePlanningItems.length, page, pageSize, setPage]);

  const pagedActivePlanningItems = useMemo(() => {
    if (!isKrPanelReady) return activePlanningItems;
    const start = (page - 1) * pageSize;
    return krActivePlanningItems.slice(start, start + pageSize);
  }, [
    isKrPanelReady,
    activePlanningItems,
    krActivePlanningItems,
    page,
    pageSize,
  ]);

  const transformedData = groupPlanTasksByKeyResultAndMilestone(
    pagedActivePlanningItems,
  );
  const krTransformedData = groupPlanTasksByKeyResultAndMilestone(
    krActivePlanningItems,
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

  const krPlanSummaries: PlanSummary[] = useMemo(() => {
    return (
      krTransformedData?.map((dataItem: any) => {
        const cadence = (activeTabName?.toLowerCase() as Cadence) || 'weekly';
        return transformToPlanSummary(
          dataItem,
          'planning' as ViewMode,
          cadence,
          employeeData,
        );
      }) || []
    );
  }, [krTransformedData, employeeData, activeTabName]);

  const isLoading =
    isFilterScopePending ||
    (listQueryEnabled &&
      (isPlanningQueryLoading ||
        (isPlanningQueryFetching && allPlanning === undefined) ||
        (page > 1 &&
          (isKrPanelQueryLoading ||
            (isKrPanelQueryFetching && allPlanningForKrPanel === undefined)))));

  return {
    planSummaries,
    transformedData,
    krPlanSummaries,
    krTransformedData,
    activePlanningItems,
    isLoading,
    isFilterScopePending,
    userId,
    planningPeriodId,
    allPlanning,
    totalItems,
  };
}
