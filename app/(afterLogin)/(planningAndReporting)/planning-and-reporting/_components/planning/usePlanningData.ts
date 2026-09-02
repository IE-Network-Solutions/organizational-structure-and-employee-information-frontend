import { useEffect, useMemo } from 'react';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import {
  useGetAllUsers,
  useGetAllUsersData,
} from '@/store/server/features/employees/employeeManagment/queries';
import { groupPlanTasksByKeyResultAndMilestone } from '../dataTransformer/plan';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { usePlanTaskDatesStore } from '@/store/uistate/features/planningAndReporting/taskDates';
import { useUserPlanRepositoryMock } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import { isDeadlinePlanningMockEnabled } from '@/utils/deadlinePlanningMocks';
import { transformToPlanSummary } from '../dataTransformer/vamp';
import { ViewMode, Cadence, PlanSummary } from '../types';
import { todayIso } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import {
  activePlanPeriodToKind,
  cadenceAssignmentByKind,
  periodNameToKind,
  planItemMatchesDurationFilter,
} from './durationFilter';
import {
  getEmployeeDepartmentId,
  getEmployeeItems,
  getSubordinateIds,
  resolveDefaultPlanScope,
} from './departmentUsers';
import {
  mockDisplayNameForUserId,
  mockRoleForUserId,
  resolveMockScopeUserIds,
} from '../prototype/mockPlanningConstants';
import {
  mockPlansToActivePlanningItems,
  userPlanDisplayTitle,
} from '../prototype/mockPlanAdapter';

function realUserIdsFromSelection(selectedUser: string[]): string[] {
  return selectedUser.filter(
    (id) => id && id !== 'all' && id !== 'subordinate',
  );
}

/** Same team/default scope as Planning list — one shared plan fetch. */
export function useEffectivePlanUserIds() {
  const mockEnabled = isDeadlinePlanningMockEnabled();
  const { selectedUser, planningFilterPlanType, planningFilterDepartment } =
    PlanningAndReportingStore();
  const { data: allEmployeesRaw } = useGetAllUsersData();
  const employeeData = useMemo(
    () => ({ items: getEmployeeItems(allEmployeesRaw) }),
    [allEmployeesRaw],
  );
  const { userId } = useAuthenticationStore();

  return useMemo(() => {
    // Full mock roster — never expand to live employee directories.
    if (mockEnabled) {
      return resolveMockScopeUserIds({
        currentUserId: userId,
        planType: planningFilterPlanType || 'all',
        selectedUser,
      });
    }

    const employees = employeeData.items;
    const allEmployeeIds = employees
      .map((employee: any) => employee?.id)
      .filter(Boolean) as string[];

    if (planningFilterPlanType === 'myPlan') {
      return userId ? [userId] : [];
    }

    if (planningFilterPlanType === 'subordinatePlan') {
      const storedIds = realUserIdsFromSelection(selectedUser);
      if (storedIds.length > 0) return storedIds;
      return getSubordinateIds({ items: employees }, userId);
    }

    const storedIds = realUserIdsFromSelection(selectedUser);
    const putMineFirst = (ids: string[]) => {
      if (!userId) return ids;
      const rest = ids.filter((id) => String(id) !== String(userId));
      return [userId, ...rest];
    };

    if (storedIds.length > 0) return putMineFirst(storedIds);

    if (selectedUser.includes('all') || selectedUser.length === 0) {
      if (planningFilterDepartment) {
        const inDepartment = employees
          .filter(
            (employee: any) =>
              getEmployeeDepartmentId(employee) === planningFilterDepartment,
          )
          .map((employee: any) => employee.id)
          .filter(Boolean);
        return putMineFirst(
          inDepartment.length > 0 ? inDepartment : userId ? [userId] : [],
        );
      }
      if (allEmployeeIds.length > 0) {
        return putMineFirst(Array.from(new Set(allEmployeeIds)));
      }
      return userId ? [userId] : [];
    }

    const isDefaultMyPlanScope =
      selectedUser.length === 1 && selectedUser[0] === userId;
    const shouldUseTeamDefault =
      isDefaultMyPlanScope &&
      planningFilterPlanType === 'all' &&
      !planningFilterDepartment;

    if (!shouldUseTeamDefault) {
      return putMineFirst(
        storedIds.length > 0 ? storedIds : userId ? [userId] : [],
      );
    }

    const directReports = getSubordinateIds({ items: employees }, userId);
    if (directReports.length > 0) {
      return putMineFirst(Array.from(new Set([userId, ...directReports])));
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

    return putMineFirst(
      Array.from(new Set([userId, ...teammates].filter(Boolean))),
    );
  }, [
    mockEnabled,
    selectedUser,
    userId,
    employeeData.items,
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
  const mockEnabled = isDeadlinePlanningMockEnabled();
  const {
    activePlanPeriod,
    pageSize,
    activePlanPeriodId,
    planningDefaultFilterApplied,
    planningFilterPlanType,
    selectedUser,
    setPlanningFilterPlanType,
    setPlanningFilterEmployee,
    setSelectedUser,
    setPlanningDefaultFilterApplied,
  } = PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { data: allEmployeesRaw, isFetched: employeesFetched } =
    useGetAllUsersData();
  const employeesForDefaults = useMemo(
    () => ({ items: getEmployeeItems(allEmployeesRaw) }),
    [allEmployeesRaw],
  );
  const { userId } = useAuthenticationStore();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();
  const effectiveSelectedUsers = useEffectivePlanUserIds();
  const datesByTaskId = usePlanTaskDatesStore((s) => s.datesByTaskId);
  const mockPlansByUserId = useUserPlanRepositoryMock((s) => s.plansByUserId);
  const ensurePlan = useUserPlanRepositoryMock((s) => s.ensurePlan);

  useEffect(() => {
    if (!userId) return;

    if (mockEnabled) {
      // Drop live employee ids from prior sessions; keep mock roster only.
      const hasLiveSelection = selectedUser.some(
        (id) =>
          id &&
          id !== 'all' &&
          id !== 'subordinate' &&
          String(id) !== String(userId) &&
          !String(id).startsWith('mock-'),
      );
      if (!planningDefaultFilterApplied || hasLiveSelection) {
        setPlanningFilterPlanType('all');
        setPlanningFilterEmployee('all');
        setSelectedUser(['all']);
        setPlanningDefaultFilterApplied(true);
      }
      return;
    }

    if (planningDefaultFilterApplied) return;
    if (!employeesFetched) return;
    const subordinateIds = getSubordinateIds(employeesForDefaults, userId);
    const defaults = resolveDefaultPlanScope(userId, subordinateIds);
    setPlanningFilterPlanType(defaults.planningFilterPlanType);
    setPlanningFilterEmployee('all');
    setSelectedUser(defaults.selectedUser);
    setPlanningDefaultFilterApplied(true);
  }, [
    mockEnabled,
    userId,
    employeesFetched,
    employeesForDefaults,
    planningDefaultFilterApplied,
    selectedUser,
    setPlanningFilterPlanType,
    setPlanningFilterEmployee,
    setSelectedUser,
    setPlanningDefaultFilterApplied,
  ]);

  const mockUserIds = useMemo(() => {
    if (!mockEnabled) return [];
    return resolveMockScopeUserIds({
      currentUserId: userId,
      planType: planningFilterPlanType || 'all',
      selectedUser:
        effectiveSelectedUsers.length > 0
          ? effectiveSelectedUsers
          : selectedUser,
    });
  }, [
    mockEnabled,
    userId,
    planningFilterPlanType,
    selectedUser,
    effectiveSelectedUsers,
  ]);

  useEffect(() => {
    if (!mockEnabled) return;
    mockUserIds.forEach((uid) => {
      const displayName = mockDisplayNameForUserId(uid, userId);
      ensurePlan(uid, displayName);
    });
  }, [mockEnabled, mockUserIds, ensurePlan, userId]);

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
    { enabled: !mockEnabled && enabled && !!dailyId },
  );
  const { data: weeklyPlanning, isLoading: loadingWeekly } = useGetPlanning(
    { ...listParams, planPeriodId: weeklyId || '' },
    { enabled: !mockEnabled && enabled && !!weeklyId },
  );
  const { data: monthlyPlanning, isLoading: loadingMonthly } = useGetPlanning(
    { ...listParams, planPeriodId: monthlyId || '' },
    { enabled: !mockEnabled && enabled && !!monthlyId },
  );

  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;

  const filterKind = activePlanPeriodToKind(activePlanPeriod);
  const isLoading = mockEnabled
    ? false
    : loadingDaily || loadingWeekly || loadingMonthly;

  const mockPlanningItems = useMemo(() => {
    if (!mockEnabled) return [];
    // Preserve mockUserIds order (self first). Full task set — duration filtered per card.
    const plans = mockUserIds
      .map((uid) => mockPlansByUserId[uid])
      .filter(Boolean);
    return mockPlansToActivePlanningItems(plans);
  }, [mockEnabled, mockUserIds, mockPlansByUserId]);

  const mergedPlanningItems = useMemo(() => {
    if (mockEnabled) return mockPlanningItems;
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
  }, [
    mockEnabled,
    mockPlanningItems,
    dailyPlanning?.items,
    weeklyPlanning?.items,
    monthlyPlanning?.items,
  ]);

  const activePlanningItems = useMemo(() => {
    const today = todayIso();
    const currentUserId = String(userId ?? '');
    const activeOnly = mergedPlanningItems.filter(
      (item: any) => item?.isReported !== true,
    );
    const filtered = mockEnabled
      ? activeOnly
      : activeOnly.filter((item: any) =>
          planItemMatchesDurationFilter(
            item,
            filterKind,
            today,
            datesByTaskId,
            periodNameToKind(item?._periodName),
          ),
        );
    return [...filtered].sort((a: any, b: any) => {
      const aMine = String(a?.userId ?? '') === currentUserId ? 0 : 1;
      const bMine = String(b?.userId ?? '') === currentUserId ? 0 : 1;
      if (aMine !== bMine) return aMine - bMine;
      const ta = new Date(a?.createdAt || 0).getTime();
      const tb = new Date(b?.createdAt || 0).getTime();
      return tb - ta;
    });
  }, [mergedPlanningItems, mockEnabled, userId, filterKind, datesByTaskId]);

  const transformedData =
    groupPlanTasksByKeyResultAndMilestone(activePlanningItems);

  const planSummaries: PlanSummary[] = useMemo(() => {
    const currentUserId = String(userId ?? '');
    const mockEmployeeData = mockEnabled
      ? {
          items: [
            ...(userId
              ? [
                  {
                    id: userId,
                    firstName: 'My',
                    middleName: '',
                    lastName: '',
                    profileImage: undefined,
                    employeeJobInformation: [{ department: { name: 'Plan' } }],
                  },
                ]
              : []),
            ...[
              { id: 'mock-alice', firstName: 'Alice', role: 'Engineering' },
              { id: 'mock-bob', firstName: 'Bob', role: 'Product' },
              { id: 'mock-cara', firstName: 'Cara', role: 'Design' },
              { id: 'mock-dan', firstName: 'Dan', role: 'Ops' },
            ].map((m) => ({
              id: m.id,
              firstName: m.firstName,
              middleName: '',
              lastName: '',
              profileImage: undefined,
              employeeJobInformation: [
                { department: { name: (m as any).role || 'Plan' } },
              ],
            })),
          ],
        }
      : employeeData;

    const summaries =
      transformedData?.map((dataItem: any) => {
        const cadence = cadenceFromKind(
          periodNameToKind(dataItem?._periodName),
        );
        const summary = transformToPlanSummary(
          dataItem,
          'planning' as ViewMode,
          cadence,
          mockEmployeeData,
        );
        if (!mockEnabled) return summary;
        const planUserId = String(
          dataItem?.userId ?? summary.ownerUserId ?? '',
        );
        const title = userPlanDisplayTitle(
          planUserId,
          currentUserId,
          undefined,
          mockDisplayNameForUserId(planUserId, currentUserId),
        );
        return {
          ...summary,
          ownerUserId: planUserId,
          summary: title,
          owner: {
            ...summary.owner,
            name: title,
            role: mockRoleForUserId(planUserId, currentUserId),
            avatarInitials:
              title === 'My Plan'
                ? 'MP'
                : title.slice(0, 2).toUpperCase().replace(/[^A-Z]/g, 'U') ||
                  'PL',
          },
        };
      }) || [];

    return [...summaries].sort((a, b) => {
      const aMine = String(a.ownerUserId ?? '') === currentUserId ? 0 : 1;
      const bMine = String(b.ownerUserId ?? '') === currentUserId ? 0 : 1;
      if (aMine !== bMine) return aMine - bMine;
      return 0;
    });
  }, [transformedData, employeeData, mockEnabled, userId]);

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
