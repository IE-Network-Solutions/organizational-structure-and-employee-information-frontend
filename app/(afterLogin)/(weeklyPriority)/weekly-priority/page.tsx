'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { Radio, Tabs } from 'antd';
import { RadioChangeEvent } from 'antd/lib';
import { AllPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAssignedPlanningPeriodForUserId } from '@/store/server/features/employees/planning/planningPeriod/queries';
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
      children: activeTab === 1 ? "test one" : "test two",
    }));
  };

  return (
    <div>
      <div className="h-full min-h-screen w-auto p-4">
        <div className="flex flex-wrap justify-between items-center">
          <CustomBreadcrumb
            className="text-sm"
            title="Weekly Priority"
            subtitle="OKR"
          />
        </div>
        <div className="w-full h-auto space-y-4">
          <Radio.Group
            className="flex justify-center  font-semibold"
            onChange={onChange}
            value={activeTab}
          >
            <Radio value={1}>Department</Radio>
            <Radio value={2}>Team</Radio>
          </Radio.Group>
         
        </div>
      </div>
    </div>
  );
}

export default Page;
