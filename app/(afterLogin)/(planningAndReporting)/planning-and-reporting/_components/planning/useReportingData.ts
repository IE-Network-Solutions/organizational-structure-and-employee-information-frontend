import { useEffect, useMemo } from 'react';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetReporting,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { useUserPlanRepositoryMock } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import { isDeadlinePlanningMockEnabled } from '@/utils/deadlinePlanningMocks';
import { transformReportToPlanSummary } from '../dataTransformer/vamp';
import { Cadence, PlanSummary } from '../types';
import {
  isPlanHistoryFilter,
  reportedAtMatchesDurationFilter,
  type PlanFilterValue,
} from './durationFilter';
import { todayIso } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import {
  cadenceFromPeriodName,
  mockPlansToReportingItems,
  userPlanDisplayTitle,
} from '../prototype/mockPlanAdapter';
import {
  mockDisplayNameForUserId,
  mockRoleForUserId,
  resolveMockScopeUserIds,
} from '../prototype/mockPlanningConstants';
import { useEffectivePlanUserIds } from './usePlanningData';

/** Fetches reports only when enabled (e.g. Reports tab active). */
export function useReportingData(enabled = true) {
  const mockEnabled = isDeadlinePlanningMockEnabled();
  const {
    selectedUser,
    planningFilterPlanType,
    activePlanPeriod,
    pageReporting,
    pageSizeReporting,
    activePlanPeriodId,
    selectedSessionIds,
    allSessionsOfYear,
    planningDurationFilter,
    planningHistoryRange,
  } = PlanningAndReportingStore();
  const { userId } = useAuthenticationStore();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();
  const effectiveSelectedUsers = useEffectivePlanUserIds();
  const mockPlansByUserId = useUserPlanRepositoryMock((s) => s.plansByUserId);
  const ensurePlan = useUserPlanRepositoryMock((s) => s.ensurePlan);

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
      ensurePlan(uid, mockDisplayNameForUserId(uid, userId));
    });
  }, [mockEnabled, mockUserIds, ensurePlan, userId]);

  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;

  const { data: allReporting } = useGetReporting(
    {
      userId: effectiveSelectedUsers,
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
    {
      enabled:
        !mockEnabled &&
        enabled &&
        !!planningPeriodId &&
        effectiveSelectedUsers.length > 0,
    },
  );

  const getPlanningPeriodDetail = (id: string) => {
    return planningPeriods?.items?.find((p: any) => p?.id === id) || {};
  };

  const activeTabName = getPlanningPeriodDetail(planningPeriodId ?? '')?.name;
  const cadence = (activeTabName?.toLowerCase() as Cadence) || 'weekly';
  const durationFilter: PlanFilterValue = planningDurationFilter || 'daily';
  const today = todayIso();

  const mockEmployeeData = useMemo(
    () => ({
      items: [
        ...(userId
          ? [
              {
                id: userId,
                firstName: 'My',
                middleName: '',
                lastName: '',
                employeeJobInformation: [{ department: { name: 'Plan' } }],
              },
            ]
          : []),
        {
          id: 'mock-alice',
          firstName: 'Alice',
          employeeJobInformation: [{ department: { name: 'Engineering' } }],
        },
        {
          id: 'mock-bob',
          firstName: 'Bob',
          employeeJobInformation: [{ department: { name: 'Product' } }],
        },
        {
          id: 'mock-cara',
          firstName: 'Cara',
          employeeJobInformation: [{ department: { name: 'Design' } }],
        },
        {
          id: 'mock-dan',
          firstName: 'Dan',
          employeeJobInformation: [{ department: { name: 'Ops' } }],
        },
      ],
    }),
    [userId],
  );

  const mockReportingItems = useMemo(() => {
    if (!mockEnabled) return [];
    const plans = mockUserIds
      .map((uid) => mockPlansByUserId[uid])
      .filter(Boolean);
    return mockPlansToReportingItems(
      plans,
      durationFilter,
      today,
      isPlanHistoryFilter(durationFilter) ? planningHistoryRange : undefined,
    );
  }, [
    mockEnabled,
    mockUserIds,
    mockPlansByUserId,
    durationFilter,
    today,
    planningHistoryRange,
  ]);

  const reportingItems = useMemo(() => {
    if (mockEnabled) return mockReportingItems;
    const historyRange = isPlanHistoryFilter(durationFilter)
      ? planningHistoryRange
      : undefined;
    return (allReporting?.items ?? [])
      .map((item: any) => {
        const reportTasks = Array.isArray(item?.reportTask)
          ? item.reportTask
          : Array.isArray(item?.reportTasks)
            ? item.reportTasks
            : [];
        const filteredTasks = reportTasks.filter((task: any) =>
          reportedAtMatchesDurationFilter(
            task?.reportedAt ||
              task?.createdAt ||
              task?.updatedAt ||
              item?.createdAt,
            durationFilter,
            today,
            historyRange,
          ),
        );
        if (filteredTasks.length === 0) return null;
        const latest = filteredTasks
          .map(
            (t: any) =>
              t?.reportedAt || t?.createdAt || t?.updatedAt || item?.createdAt,
          )
          .filter(Boolean)
          .sort((a: string, b: string) =>
            String(b).localeCompare(String(a)),
          )[0];
        return {
          ...item,
          reportTask: filteredTasks,
          createdAt: latest || item?.createdAt,
        };
      })
      .filter(Boolean);
  }, [
    mockEnabled,
    mockReportingItems,
    allReporting?.items,
    durationFilter,
    today,
    planningHistoryRange,
  ]);

  const reportSummaries: PlanSummary[] = useMemo(() => {
    const currentUserId = String(userId ?? '');
    const putMineFirst = (items: PlanSummary[]) =>
      [...items].sort((a, b) => {
        const aMine = String(a.ownerUserId ?? '') === currentUserId ? 0 : 1;
        const bMine = String(b.ownerUserId ?? '') === currentUserId ? 0 : 1;
        if (aMine !== bMine) return aMine - bMine;
        return 0;
      });

    if (mockEnabled) {
      return putMineFirst(
        mockReportingItems.map((dataItem: any) => {
          const summary = transformReportToPlanSummary(
            dataItem,
            cadenceFromPeriodName(dataItem?._periodName) as Cadence,
            mockEmployeeData,
          );
          const planUserId = String(
            dataItem?.userId ?? summary.ownerUserId ?? '',
          );
          const title = userPlanDisplayTitle(
            planUserId,
            currentUserId,
            undefined,
            mockDisplayNameForUserId(planUserId, currentUserId),
            'report',
          );
          return {
            ...summary,
            ownerUserId: planUserId,
            summary: title,
            createdAt: dataItem?.createdAt || summary.createdAt,
            owner: {
              ...summary.owner,
              name: title,
              role: mockRoleForUserId(planUserId, currentUserId),
            },
          };
        }),
      );
    }
    if (!reportingItems.length) return [];
    return putMineFirst(
      reportingItems.map((dataItem: any) => {
        const summary = transformReportToPlanSummary(
          dataItem,
          cadence,
          mockEmployeeData,
        );
        const planUserId = String(
          dataItem?.userId ?? summary.ownerUserId ?? '',
        );
        const title = userPlanDisplayTitle(
          planUserId,
          currentUserId,
          summary.owner?.name,
          undefined,
          'report',
        );
        return {
          ...summary,
          ownerUserId: planUserId || summary.ownerUserId,
          summary: title,
          createdAt: dataItem?.createdAt || summary.createdAt,
          owner: {
            ...summary.owner,
            name: title,
          },
        };
      }),
    );
  }, [
    mockEnabled,
    mockReportingItems,
    reportingItems,
    cadence,
    mockEmployeeData,
    userId,
  ]);

  return {
    reportSummaries,
    reportingItems,
  };
}
