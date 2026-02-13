'use client';
import React, { useEffect, useMemo } from 'react';
import { Tabs, Segmented } from 'antd';
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
          <span
            data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-span-110"
            className="font-semibold text-sm"
          >
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
    <div
      data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-130"
      className="min-h-screen w-full bg-gray-100 px-4 md:px-6"
    >
      <div
        data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-131"
        className="h-full w-auto"
      >
        <div
          data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-132"
          className="flex flex-col gap-4"
        >
          <div
            data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-133"
            className="flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div
              data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-134"
              className="w-full md:w-auto flex justify-start"
            >
              <CustomBreadcrumb
                className="text-xs md:text-sm scale-90 md:scale-100 origin-left"
                title="Planning & Reporting"
                subtitle="OKR Settings"
              />
            </div>
            <Segmented
              size="large"
              value={activeTab}
              onChange={(value) => setActiveTab(Number(value))}
              options={[
                { label: 'Planning', value: 1 },
                { label: 'Reporting', value: 2 },
              ]}
              className="bg-[#F5F5F7] p-1 md:p-1.5 rounded-lg shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-[#E5E7EB] [&_.ant-segmented-item]:transition-all [&_.ant-segmented-item]:rounded-md [&_.ant-segmented-item]:px-3 md:[&_.ant-segmented-item]:px-4 [&_.ant-segmented-item]:py-0.5 md:[&_.ant-segmented-item]:py-1.5 [&_.ant-segmented-item]:text-xs md:[&_.ant-segmented-item]:text-sm [&_.ant-segmented-item]:font-medium [&_.ant-segmented-item]:h-auto [&_.ant-segmented-item]:leading-normal [&_.ant-segmented-item-selected]:!bg-white [&_.ant-segmented-item-selected]:shadow-sm [&_.ant-segmented-item-selected]:text-[#161A2C] [&_.ant-segmented-item-label]:!text-[#161A2C] [&_.ant-segmented-item-selected_.ant-segmented-item-label]:!text-[#161A2C]"
            />
          </div>
        </div>
        <div
          data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-153"
          className="w-full h-auto mt-4"
        >
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
            <div
              data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-167"
              className="w-full h-auto space-y-4 flex justify-center font-semibold"
            >
              There is no Assigned Plan, please assign a Plan for a User first
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
