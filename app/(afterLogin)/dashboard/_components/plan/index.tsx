import {
  useDefaultPlanningPeriods,
  useGetPlannedTaskForReport,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { Card, Select } from 'antd';
import React, { useEffect } from 'react';
import { useDashboardPlanStore } from '@/store/uistate/features/dashboard/plan';
import Weekly from './Weekly';
import { MdAppRegistration } from 'react-icons/md';

const Plan = () => {
  const { planType, setPlanType } = useDashboardPlanStore();

  const { data: defaultPlanningPeriods, refetch: planingPeriodRefetch } =
    useDefaultPlanningPeriods();
  const handleChange = (value: string) => {
    setPlanType(value);
  };

  const planningPeriodOptions =
    defaultPlanningPeriods?.items?.map((item: any) => ({
      value: item?.name,
      label: `${item?.name} Plans`,
    })) ?? [];

  // Ensure selected planType always exists in fetched planning periods
  useEffect(() => {
    if (!defaultPlanningPeriods?.items?.length) return;

    const hasCurrent = defaultPlanningPeriods.items.some(
      (item: any) => item?.name === planType,
    );

    if (!hasCurrent) {
      setPlanType(defaultPlanningPeriods.items[0]?.name ?? null);
    }
  }, [defaultPlanningPeriods?.items, planType, setPlanType]);

  const activePlanPeriodId = defaultPlanningPeriods?.items?.find(
    (item: any) => item?.name === planType,
  );

  const {
    data: allPlannedTaskForReport,
    isLoading: plannedTaskForReportLoading,
    refetch: plannedTaskRefetch,
  } = useGetPlannedTaskForReport(activePlanPeriodId?.id);

  useEffect(() => {
    plannedTaskRefetch();
    planingPeriodRefetch();
  }, [planType, planingPeriodRefetch, plannedTaskRefetch]);

  return (
    <Card
      bodyStyle={{ padding: 0 }}
      loading={plannedTaskForReportLoading}
      className="bg-white border h-[272px] border-gray-200 shadow-sm rounded-lg overflow-hidden"
    >
      <div
        className="flex justify-between items-center px-4 pt-4 "
        data-cy="plan-header"
      >
        <div className="flex items-center gap-2" data-cy="plan-title">
          <MdAppRegistration size={24} />
          <span
            className="text-[16px] font-bold text-gray-900"
            data-cy="plan-title-text"
          >
            Planning
          </span>
        </div>
        <div data-cy="plan-selector">
          <Select
            value={planType}
            className="w-[140px] min-w-[140px] text-sm rounded-md border-gray-200 [&_.ant-select-selector]:rounded-md [&_.ant-select-selector]:border-gray-200"
            onChange={handleChange}
            options={planningPeriodOptions}
          />
        </div>
      </div>
      <div
        className="px-4 pb-4 pt-2 h-[220px] overflow-y-auto scrollbar-none"
        data-cy="plan-body"
      >
        <Weekly allPlannedTaskForReport={allPlannedTaskForReport} />
      </div>
    </Card>
  );
};

export default Plan;
