'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React, { useEffect } from 'react';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { Tabs } from 'antd';
import Planning from './_components/planning';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAssignedPlanningPeriodForUserId } from '@/store/server/features/employees/planning/planningPeriod/queries';
import CreatePlan from './_components/createPlan';
import EditPlan from './_components/editPlan';
import Reporting from './_components/reporting';
import CreateReport from './_components/createReport';
import EditReport from './_components/editReport';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

function Page() {
  const {
    setActiveTab,
    activeTab,
    activePlanPeriod,
    setActivePlanPeriod,
    setActivePlanPeriodId,
  } = PlanningAndReportingStore();
  const { data: planningPeriods, isLoading } = AllPlanningPeriods();
  const { data: defaultPlanningPeriods } = useDefaultPlanningPeriods();

  const { data: planningPeriodForUserId } =
    useGetAssignedPlanningPeriodForUserId();

  // Check if user has permission
  const hasPermission = AccessGuard.checkAccess({
    permissions: [
      Permissions.ViewDailyPlan,
      Permissions.ViewWeeklyPlan,
      Permissions.ViewMonthlyPlan,
    ],
  });

  const TabsContent = () => {
    const safePlanningPeriods = Array.isArray(planningPeriods)
      ? planningPeriods
      : [];
    const safeDefaultPlanningPeriods = Array.isArray(
      defaultPlanningPeriods?.items,
    )
      ? defaultPlanningPeriods.items
      : [];

    const existingUserId = safePlanningPeriods[0]?.userId || 'N/A'; // Get userId from first entry
    const existingPlanningPeriodIds = new Set(
      safePlanningPeriods.map((item: any) => item?.planningPeriod?.id),
    );

    // Find missing planning periods from defaultPlanningPeriods
    const missingPlanningPeriods = safeDefaultPlanningPeriods
      .filter((item: any) => !existingPlanningPeriodIds.has(item.id))
      .map((item: any) => ({
        id: crypto.randomUUID(), // Generate a temporary unique ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: 'system',
        updatedBy: 'system',
        userId: existingUserId, // Use the same userId as existing entries
        tenantId: item.tenantId,
        planningPeriodId: item.id,
        planningPeriod: item,
      }));

    // Merge existing and missing planning periods
    const mergedPlanningPeriods = [
      ...safePlanningPeriods,
      ...missingPlanningPeriods,
    ];

    // Sort by intervalLength for logical order (Daily → Weekly → Monthly)
    mergedPlanningPeriods.sort(
      (a, b) =>
        a.planningPeriod.intervalLength - b.planningPeriod.intervalLength,
    );

    // If user has permission, return mergedPlanningPeriods; otherwise, return safePlanningPeriods
    const finalPlanningPeriods = hasPermission
      ? mergedPlanningPeriods
      : safePlanningPeriods;

    return finalPlanningPeriods.map((item: any, index: number) => ({
      label: (
        <span className="font-semibold text-sm">
          {item.planningPeriod.name || 'No name available'}
        </span>
      ),
      id: item.planningPeriod.id,
      key: String(index + 1),
      children: activeTab === 1 ? <Planning /> : <Reporting />,
    }));
  };

  useEffect(() => {
    const TabsContentData = TabsContent();
    const selectedTab = TabsContentData?.find(
      (item) => item.key === String(activePlanPeriod),
    );
    setActivePlanPeriodId(selectedTab?.id || '');
  }, [activePlanPeriod, planningPeriods, defaultPlanningPeriods, isLoading]);

  const TabsContentData = TabsContent();
  const selectedTab = TabsContentData?.find(
    (item) => item.key === String(activePlanPeriod),
  );

  return (
    <div>
      <div className="h-full min-h-screen w-auto p-4">
        <div className="flex flex-wrap justify-between items-center">
          <CustomBreadcrumb
            className="text-sm"
            title="Planning & Reporting"
            subtitle="OKR setting"
          />
          <div className="flex items-center bg-gray-50 shadow-md rounded-lg w-fit h-12 p-1 gap-3">
            <button
              onClick={() => setActiveTab(1)}
              className={
                activeTab === 1
                  ? ' px-4  h-full bg-white text-black text-sm rounded-md transition-all duration-300 shadow-sm'
                  : ' px-4 h-full bg-transparent text-black text-sm transition-all duration-300'
              }
            >
              Planning
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={
                activeTab === 2
                  ? ' px-4 h-full bg-white text-black text-sm rounded-md transition-all duration-300 shadow-sm'
                  : ' px-4  h-full bg-transparent text-black text-sm transition-all duration-300'
              }
            >
              Reporting
            </button>
          </div>
        </div>
        <div className="w-full h-auto space-y-4">
          <Tabs
            defaultActiveKey={selectedTab?.id}
            onChange={(key: any) => setActivePlanPeriod(key)}
            centered
            items={TabsContent() ?? []}
          />
          <CreatePlan />
          <EditPlan />
          <CreateReport />
          <EditReport />

          {planningPeriodForUserId?.length === 0 ? (
            <div className="w-full h-auto space-y-4 flex justify-center font-semibold">
              There is no Assigned Plan, please assign a Plan for a User first
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
