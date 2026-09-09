'use client';

import classNames from 'classnames';
import { DatePicker, Select } from 'antd';
import dayjs from 'dayjs';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  defaultHistoryRange,
  isPlanHistoryFilter,
  PLAN_FILTER_OPTIONS,
  planFilterValueToActivePeriod,
  type PlanFilterValue,
} from './durationFilter';

const durationSelectClass =
  '[&_.ant-select-selector]:!h-9 [&_.ant-select-selector]:!min-h-9 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!bg-white [&_.ant-select-selection-item]:!text-[13px] [&_.ant-select-selection-item]:!leading-9';

export default function PlanningDurationFilter() {
  const {
    planningDurationFilter,
    setPlanningDurationFilter,
    planningHistoryRange,
    setPlanningHistoryRange,
    setActivePlanPeriod,
    setPage,
  } = PlanningAndReportingStore();

  const isHistory = isPlanHistoryFilter(planningDurationFilter);

  const handleDurationChange = (value: PlanFilterValue) => {
    setPlanningDurationFilter(value);
    if (!isPlanHistoryFilter(value)) {
      setActivePlanPeriod(planFilterValueToActivePeriod(value));
    }
    setPage(1);
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-cy="planning-duration-filter"
    >
      <Select
        size="middle"
        value={planningDurationFilter}
        onChange={handleDurationChange}
        options={PLAN_FILTER_OPTIONS.map(({ value, label }) => ({
          value,
          label,
        }))}
        aria-label="Plan duration"
        className={classNames(durationSelectClass, 'min-w-[128px]')}
        popupMatchSelectWidth={false}
      />
      {isHistory ? (
        <DatePicker.RangePicker
          size="middle"
          allowClear={false}
          value={[
            dayjs(planningHistoryRange.from),
            dayjs(planningHistoryRange.to),
          ]}
          onChange={(values) => {
            if (!values?.[0] || !values?.[1]) return;
            setPlanningHistoryRange({
              from: values[0].format('YYYY-MM-DD'),
              to: values[1].format('YYYY-MM-DD'),
            });
            setPage(1);
          }}
          className="max-w-[240px]"
          data-cy="planning-history-range"
        />
      ) : null}
    </div>
  );
}
