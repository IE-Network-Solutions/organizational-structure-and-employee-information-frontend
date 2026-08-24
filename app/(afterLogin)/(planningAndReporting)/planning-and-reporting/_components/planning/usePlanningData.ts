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
import { usePlanTaskDatesStore } from '@/store/uistate/features/planningAndReporting/taskDates';
import { transformToPlanSummary } from '../dataTransformer/vamp';
import { ViewMode, Cadence, PlanSummary } from '../types';
import { todayIso } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import {
  cadenceAssignmentByKind,
  periodNameToKind,
  planItemMatchesDurationFilter,
} from './durationFilter';

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

const cadenceFromKind = (kind: string): Cadence => {
  if (kind === 'daily') return 'daily';
  if (kind === 'month' || kind === 'monthly') return 'monthly';
  return 'weekly';
};

const ALL_CADENCE_PAGE_SIZE = 100;

/** Plan-list source for page KR panel + Planning list (all cadences, filtered by duration). */
export function usePlanningData(enabled = true) {
  const { activePlanPeriod, pageSize, activePlanPeriodId } =
    PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { userId } = useAuthenticationStore();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();
  const effectiveSelectedUsers = useEffectivePlanUserIds();
  const datesByTaskId = usePlanTaskDatesStore((s) => s.datesByTaskId);

  const assignments = useMemo(
    () =>
      cadenceAssignmentByKind(
        planningPeriods?.items,
        Array.isArray(userPlanningPeriods) ? userPlanningPeriods : [],
      ),
    [planningPeriods?.items, userPlanningPeriods],
  );

  const dailyId = assignments.daily.periodId;
  const weeklyId = assignments.week.periodId;
  const monthlyId = assignments.month.periodId;

  const listParams = {
    userId: effectiveSelectedUsers,
    page: 1,
    pageSize: ALL_CADENCE_PAGE_SIZE,
    sessionId: [] as string[],
  };

  const { data: dailyPlanning, isLoading: loadingDaily } = useGetPlanning(
    { ...listParams, planPeriodId: dailyId || '' },
    { enabled: enabled && !!dailyId },
  );
  const { data: weeklyPlanning, isLoading: loadingWeekly } = useGetPlanning(
    { ...listParams, planPeriodId: weeklyId || '' },
    { enabled: enabled && !!weeklyId },
  );
  const { data: monthlyPlanning, isLoading: loadingMonthly } = useGetPlanning(
    { ...listParams, planPeriodId: monthlyId || '' },
    { enabled: enabled && !!monthlyId },
  );

  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;

  const getPlanningPeriodDetail = (id: string) => {
    return planningPeriods?.items?.find((p: any) => p?.id === id) || {};
  };

  const activeTabName = getPlanningPeriodDetail(planningPeriodId ?? '')?.name;
  const filterKind = periodNameToKind(activeTabName);
  const isLoading = loadingDaily || loadingWeekly || loadingMonthly;

  const mergedPlanningItems = useMemo(() => {
    const stamp = (items: any[] | undefined, periodName: string) =>
      (items ?? []).map((item) => ({ ...item, _periodName: periodName }));
    const combined = [
      ...stamp(dailyPlanning?.items, 'Daily'),
      ...stamp(weeklyPlanning?.items, 'Weekly'),
      ...stamp(monthlyPlanning?.items, 'Monthly'),
    ];
    const byId = new Map<string, any>();
    combined.forEach((item) => {
      const id = String(item?.id ?? '');
      if (!id || byId.has(id)) return;
      byId.set(id, item);
    });
    return Array.from(byId.values());
  }, [dailyPlanning?.items, weeklyPlanning?.items, monthlyPlanning?.items]);

  const activePlanningItems = useMemo(() => {
    const today = todayIso();
    const activeOnly = mergedPlanningItems.filter(
      (item: any) => item?.isReported !== true,
    );
    const filtered = activeOnly.filter((item: any) =>
      planItemMatchesDurationFilter(
        item,
        filterKind,
        today,
        datesByTaskId,
        periodNameToKind(item?._periodName),
      ),
    );
    const currentUserId = String(userId ?? '');
    return [...filtered].sort((a: any, b: any) => {
      const aMine = String(a?.userId ?? '') === currentUserId ? 0 : 1;
      const bMine = String(b?.userId ?? '') === currentUserId ? 0 : 1;
      if (aMine !== bMine) return aMine - bMine;
      const ta = new Date(a?.createdAt || 0).getTime();
      const tb = new Date(b?.createdAt || 0).getTime();
      return tb - ta;
    });
  }, [mergedPlanningItems, userId, filterKind, datesByTaskId]);

  const transformedData =
    groupPlanTasksByKeyResultAndMilestone(activePlanningItems);

  const planSummaries: PlanSummary[] = useMemo(() => {
    return (
      transformedData?.map((dataItem: any) => {
        const cadence = cadenceFromKind(
          periodNameToKind(dataItem?._periodName || activeTabName),
        );
        return transformToPlanSummary(
          dataItem,
          'planning' as ViewMode,
          cadence,
          employeeData,
        );
      }) || []
    );
  }, [transformedData, employeeData, activeTabName]);

  const allPlanning = {
    items: activePlanningItems,
    meta: {
      totalItems: activePlanningItems.length,
      totalPages: Math.max(1, Math.ceil(activePlanningItems.length / pageSize)),
    },
  };

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
