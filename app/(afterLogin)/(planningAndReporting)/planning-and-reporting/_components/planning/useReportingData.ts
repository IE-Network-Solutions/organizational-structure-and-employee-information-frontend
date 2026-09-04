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
import { activePlanPeriodToKind } from './durationFilter';
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
  const filterKind = activePlanPeriodToKind(activePlanPeriod);

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
    return mockPlansToReportingItems(plans, filterKind);
  }, [mockEnabled, mockUserIds, mockPlansByUserId, filterKind]);

  const reportingItems = mockEnabled
    ? mockReportingItems
    : (allReporting?.items ?? []);

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
          );
          return {
            ...summary,
            ownerUserId: planUserId,
            summary: title,
            owner: {
              ...summary.owner,
              name: title,
              role: mockRoleForUserId(planUserId, currentUserId),
            },
          };
        }),
      );
    }
    if (!allReporting?.items) return [];
    return putMineFirst(
      allReporting.items.map((dataItem: any) =>
        transformReportToPlanSummary(dataItem, cadence, mockEmployeeData),
      ),
    );
  }, [
    mockEnabled,
    mockReportingItems,
    allReporting?.items,
    cadence,
    mockEmployeeData,
    userId,
  ]);

  return {
    reportSummaries,
    reportingItems,
  };
}
