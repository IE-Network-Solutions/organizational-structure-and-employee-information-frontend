import {
  useDefaultPlanningPeriods,
  useGetPlannedTaskForReport,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { Card, Select } from 'antd';
import React, { useEffect } from 'react';
import { useDashboardPlanStore } from '@/store/uistate/features/dashboard/plan';
import Daily from './Daily';
import Weekly from './Weekly';

const Plan = () => {
  const { planType, setPlanType } = useDashboardPlanStore();

  const { data: defaultPlanningPeriods, refetch: planingPeriodRefetch } =
    useDefaultPlanningPeriods();
  const handleChange = (value: string) => {
    setPlanType(value);
  };

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
  }, [planType]);

  return (
    <Card
      loading={plannedTaskForReportLoading}
      className="bg-white  rounded-lg p-1 "
    >
      <div className="flex justify-between p-2 items-center ">
        <div className="text-lg  font-bold ">My Plans</div>
        <div className="pl-2 ">
          <Select
            defaultValue={planType}
            className="w-32 text-gray-400 text-sm"
            onChange={handleChange}
            options={[
              { value: 'Daily', label: 'Daily Task' },
              { value: 'Weekly', label: 'Weekly Task' },
            ]}
          />
        </div>
      </div>
      {planType === 'Daily' ? (
        <Daily allPlannedTaskForReport={allPlannedTaskForReport} />
      ) : planType === 'Weekly' ? (
        <Weekly allPlannedTaskForReport={allPlannedTaskForReport} />
      ) : (
        'null'
      )}
    </Card>
  );
};

export default Plan;
