'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { Radio, Tabs } from 'antd';
import { RadioChangeEvent } from 'antd/lib';
import Planning from './_components/planning';
import { AllPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAssignedPlanningPeriodForUserId } from '@/store/server/features/employees/planning/planningPeriod/queries';
import CreatePlan from './_components/createPlan';
import EditPlan from './_components/editPlan';
import Reporting from './_components/reporting';
import CreateReport from './_components/createReport';

function Page() {
  const { setActiveTab, activeTab, setActivePlanPeriod } =
    PlanningAndReportingStore();
  const { data: planningPeriods } = AllPlanningPeriods();
  const { data: planningPeriodForUserId } =
    useGetAssignedPlanningPeriodForUserId();

  const onChange = (e: RadioChangeEvent) => {
    setActiveTab(e.target.value);
  };

  const TabsContent = () => {
    const safePlanningPeriods = Array.isArray(planningPeriods)
      ? planningPeriods
      : [];

    return safePlanningPeriods.map((item: any, index: number) => ({
      label: (
        <span className="font-semibold text-sm">
          {item?.planningPeriod?.name || 'No name available'}
        </span>
      ),
      key: String(index + 1),
      children: activeTab === 1 ? <Planning /> : <Reporting />,
    }));
  };

  return (
    <div>
      <div className="h-full min-h-screen w-auto p-4">
        <div className="flex flex-wrap justify-between items-center">
          <CustomBreadcrumb
            className="text-sm"
            title="Planning & Reporting"
            subtitle="OKR setting"
          />
        </div>
        <div className="w-full h-auto space-y-4">
          <Radio.Group
            className="flex justify-center  font-semibold"
            onChange={onChange}
            value={activeTab}
          >
            <Radio value={1}>Planning</Radio>
            <Radio value={2}>Reporting</Radio>
          </Radio.Group>
          <Tabs
            defaultActiveKey="1"
            onChange={(e: any) => setActivePlanPeriod(e)}
            centered
            items={TabsContent() ?? []}
          />
          <CreatePlan />
          <EditPlan />
          <CreateReport />
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
