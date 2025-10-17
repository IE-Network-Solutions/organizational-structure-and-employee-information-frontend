'use client';
import React, { useEffect, useMemo } from 'react';
import { Tabs } from 'antd';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
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

interface PlanningPeriod {
  id: string;
  userId: string;
  planningPeriod: {
    id: string;
    name: string;
    intervalLength: any;
  };
}

interface TabItem {
  label: React.ReactNode;
  id: string;
  key: string;
  children: React.ReactNode;
}

function Page() {
  const {
    setActiveTab,
    activeTab,
    activePlanPeriod,
    setActivePlanPeriod,
    setActivePlanPeriodId,
  } = PlanningAndReportingStore();
  const { data: planningPeriods } = AllPlanningPeriods();
  const { data: defaultPlanningPeriods } = useDefaultPlanningPeriods();

  const { data: planningPeriodForUserId } =
    useGetAssignedPlanningPeriodForUserId();

  const hasPermission = AccessGuard.checkAccess({
    permissions: [
      Permissions.ViewDailyPlan,
      Permissions.ViewWeeklyPlan,
      Permissions.ViewMonthlyPlan,
    ],
  });

  const processedPlanningPeriods = useMemo(() => {
    const safePlanningPeriods = Array.isArray(planningPeriods)
      ? planningPeriods
      : [];
    const safeDefaultPlanningPeriods = Array.isArray(
      defaultPlanningPeriods?.items,
    )
      ? defaultPlanningPeriods.items
      : [];

    if (safePlanningPeriods.length === 0) return [];

    const existingUserId = safePlanningPeriods[0]?.userId || 'N/A';
    const existingPlanningPeriodIds = new Set(
      safePlanningPeriods.map(
        (item: PlanningPeriod) => item?.planningPeriod?.id,
      ),
    );

    const missingPlanningPeriods = safeDefaultPlanningPeriods
      .filter((item: any) => !existingPlanningPeriodIds.has(item.id))
      .map((item: any) => ({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: 'system',
        updatedBy: 'system',
        userId: existingUserId,
        tenantId: item.tenantId,
        planningPeriodId: item.id,
        planningPeriod: item,
      }));

    const mergedPlanningPeriods = [
      ...safePlanningPeriods,
      ...missingPlanningPeriods,
    ];

    mergedPlanningPeriods.sort(
      (a, b) =>
        a.planningPeriod.intervalLength - b.planningPeriod.intervalLength,
    );

    return hasPermission ? mergedPlanningPeriods : safePlanningPeriods;
  }, [planningPeriods, defaultPlanningPeriods, hasPermission]);

  const tabItems: TabItem[] = useMemo(() => {
    return processedPlanningPeriods.map(
      (item: PlanningPeriod, index: number) => ({
        label: (
          <span className="font-semibold text-sm">
            {item.planningPeriod.name || 'No name available'}
          </span>
        ),
        id: item.planningPeriod.id,
        key: String(index + 1),
        children: activeTab === 1 ? <Planning /> : <Reporting />,
      }),
    );
  }, [processedPlanningPeriods, activeTab]);

  const selectedTab = tabItems.find(
    (item) => item.key === String(activePlanPeriod),
  );

  useEffect(() => {
    setActivePlanPeriodId(selectedTab?.id || '');
  }, [selectedTab?.id, setActivePlanPeriodId]);

  return (
    <div>
      <div className="h-full min-h-screen w-auto p-4">
        <div className="flex flex-col md:flex-row md:justify-between">
          <CustomBreadcrumb
            className="text-sm"
            title="Planning and Reporting"
            subtitle="OKR Settings"
          />
          <div className="flex items-center bg-[#f5f5f5] shadow-md rounded-lg w-fit h-10 sm:h-12 py-[5px] px-[6px] gap-[14px] mx-auto border-1">
            <button
              onClick={() => setActiveTab(1)}
              className={`px-4 h-full text-black text-sm transition-all duration-300 ${
                activeTab === 1
                  ? 'bg-white rounded-md shadow-sm border-1'
                  : 'bg-transparent'
              }`}
            >
              Planning
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={`px-4 h-full text-black text-sm transition-all duration-300 ${
                activeTab === 2
                  ? 'bg-white rounded-md shadow-sm border-1'
                  : 'bg-transparent'
              }`}
            >
              Reporting
            </button>
          </div>
        </div>
        <div className="w-full h-auto mt-4">
          <Tabs
            tabBarGutter={50}
            defaultActiveKey={selectedTab?.id}
            onChange={(key: any) => setActivePlanPeriod(key)}
            centered
            items={tabItems}
          />
          <CreatePlan />
          <EditPlan />
          <CreateReport />
          <EditReport />

          {planningPeriodForUserId?.length === 0 && (
            <div className="w-full h-auto space-y-4 flex justify-center font-semibold">
              There is no Assigned Plan, please assign a Plan for a User first
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
