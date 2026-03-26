import {
  useDefaultPlanningPeriods,
  useGetPlannedTaskForReport,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { Card, Select, Skeleton } from 'antd';
import React, { useEffect, useMemo } from 'react';
import { useDashboardPlanStore } from '@/store/uistate/features/dashboard/plan';
import Daily from './Daily';
import Weekly from './Weekly';
import { MdAppRegistration } from 'react-icons/md';

const PlanCardSkeleton = () => (
  <>
    <div
      className="flex justify-between items-center px-4 pt-4"
      data-cy="dashboard-plan-card-skeleton-header"
    >
      <div
        className="flex items-center gap-2"
        data-cy="dashboard-plan-card-skeleton-header-left"
      >
        <Skeleton.Avatar active shape="circle" size={24} />
        <Skeleton.Input active size="small" className="!h-5 !w-24 !min-w-0" />
      </div>
      <Skeleton.Input
        active
        size="small"
        className="!h-8 !w-[140px] !min-w-0"
      />
    </div>
    <div
      className="px-4 pb-4 pt-2 h-[220px] overflow-y-auto scrollbar-none"
      data-cy="dashboard-plan-card-skeleton-body"
    >
      <div
        className="flex flex-col gap-3"
        data-cy="dashboard-plan-card-skeleton-body-lines"
      >
        {Array.from({ length: 5 }).map((unusedValue, index) => {
          // `unusedValue` is intentionally ignored.
          void unusedValue;
          return (
            <Skeleton.Input
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              active
              size="small"
              className="!h-4 !w-full !min-w-0"
            />
          );
        })}
      </div>
    </div>
  </>
);

const Plan = () => {
  const { planType, setPlanType } = useDashboardPlanStore();

  const { data: defaultPlanningPeriods, isLoading: planningPeriodsLoading } =
    useDefaultPlanningPeriods();
  const handleChange = (value: string) => {
    setPlanType(value);
  };

  const dailyPlanPeriodId = defaultPlanningPeriods?.items?.find(
    (item: any) => item?.name === 'Daily',
  )?.id;
  const weeklyPlanPeriodId = defaultPlanningPeriods?.items?.find(
    (item: any) => item?.name === 'Weekly',
  )?.id;
  const monthlyPlanPeriodId = defaultPlanningPeriods?.items?.find(
    (item: any) => item?.name === 'Monthly',
  )?.id;

  const { data: dailyAllPlannedTaskForReport, isLoading: dailyLoading } =
    useGetPlannedTaskForReport(dailyPlanPeriodId);

  const { data: weeklyAllPlannedTaskForReport, isLoading: weeklyLoading } =
    useGetPlannedTaskForReport(weeklyPlanPeriodId);

  const { data: monthlyAllPlannedTaskForReport, isLoading: monthlyLoading } =
    useGetPlannedTaskForReport(monthlyPlanPeriodId);

  const availability = useMemo(() => {
    const dailyTasks = dailyAllPlannedTaskForReport ?? [];
    const weeklyTasks = weeklyAllPlannedTaskForReport ?? [];
    const monthlyTasks = monthlyAllPlannedTaskForReport ?? [];

    const hasDailyData = dailyTasks.some(
      (item: any) => item?.keyResult?.id || item?.keyResultId,
    );
    const hasWeeklyData = weeklyTasks.some(
      (item: any) => item?.keyResultId || item?.keyResult?.id,
    );
    const hasMonthlyData = monthlyTasks.some(
      (item: any) => item?.keyResultId || item?.keyResult?.id,
    );

    const ordered = [
      {
        key: 'Daily' as const,
        id: dailyPlanPeriodId,
        has: hasDailyData,
        tasks: dailyTasks,
        loading: dailyLoading,
      },
      {
        key: 'Weekly' as const,
        id: weeklyPlanPeriodId,
        has: hasWeeklyData,
        tasks: weeklyTasks,
        loading: weeklyLoading,
      },
      {
        key: 'Monthly' as const,
        id: monthlyPlanPeriodId,
        has: hasMonthlyData,
        tasks: monthlyTasks,
        loading: monthlyLoading,
      },
    ];

    return ordered.filter((p) => p.id && p.has);
  }, [
    dailyAllPlannedTaskForReport,
    weeklyAllPlannedTaskForReport,
    monthlyAllPlannedTaskForReport,
    dailyPlanPeriodId,
    weeklyPlanPeriodId,
    monthlyPlanPeriodId,
    dailyLoading,
    weeklyLoading,
    monthlyLoading,
  ]);

  const availablePlanTypes: string[] = availability.map((p) => p.key);
  const suggestedPlanType = availablePlanTypes[0] ?? null;
  const selectValue =
    planType && availablePlanTypes.includes(planType)
      ? planType
      : suggestedPlanType;

  // Auto-select the first period (Daily -> Weekly -> Monthly) that has data.
  // Do not override user's selection if it's still valid.
  useEffect(() => {
    if (!defaultPlanningPeriods?.items?.length) return;

    const hasSelected = planType && availablePlanTypes.includes(planType);

    if (!availablePlanTypes.length) {
      if (planType !== null) setPlanType(null);
      return;
    }

    if (!hasSelected) {
      setPlanType(suggestedPlanType);
    }
  }, [
    availablePlanTypes.join('|'),
    suggestedPlanType,
    planType,
    setPlanType,
    defaultPlanningPeriods?.items?.length,
  ]);

  const isDeterminingAvailability =
    planningPeriodsLoading ||
    (dailyPlanPeriodId ? dailyLoading : false) ||
    (weeklyPlanPeriodId ? weeklyLoading : false) ||
    (monthlyPlanPeriodId ? monthlyLoading : false);

  const planningPeriodOptions = availability.map((p) => ({
    value: p.key,
    label: `${p.key} Plans`,
  }));

  return (
    <Card
      bodyStyle={{ padding: 0 }}
      className="bg-white p-3 border h-[272px] border-gray-200  rounded-lg overflow-hidden"
    >
      {isDeterminingAvailability ? (
        <PlanCardSkeleton />
      ) : (
        <>
          <div
            className="flex justify-between items-center pb-3"
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
              {planningPeriodOptions.length > 0 ? (
                <Select
                  value={selectValue}
                  className="w-[140px] min-w-[140px] text-sm rounded-md border-gray-200 [&_.ant-select-selector]:rounded-md [&_.ant-select-selector]:border-gray-200"
                  onChange={handleChange}
                  options={planningPeriodOptions}
                />
              ) : null}
            </div>
          </div>
          <div
            className=" h-[220px] overflow-y-auto scrollbar-none"
            data-cy="plan-body"
          >
            {selectValue === 'Daily' ? (
              <Daily
                allPlannedTaskForReport={dailyAllPlannedTaskForReport ?? []}
              />
            ) : selectValue === 'Weekly' ? (
              <Weekly
                allPlannedTaskForReport={weeklyAllPlannedTaskForReport ?? []}
              />
            ) : selectValue === 'Monthly' ? (
              <Weekly
                allPlannedTaskForReport={monthlyAllPlannedTaskForReport ?? []}
              />
            ) : (
              <div
                className="text-lg font-light flex min-h-[190px] justify-center items-center "
                data-cy="dashboard-plan-empty"
              >
                <span data-cy="dashboard-plan-empty-text">
                  Add your plans to view them here
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default Plan;
