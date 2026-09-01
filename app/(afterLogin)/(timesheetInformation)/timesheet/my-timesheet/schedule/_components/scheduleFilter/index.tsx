'use client';

import { FC, useMemo } from 'react';
import { DatePicker, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { DATE_FORMAT } from '@/store/server/features/timesheet/workSchedule/helpers';

dayjs.extend(isoWeek);

export type ScheduleWeekFilterValue = {
  month: Dayjs;
  weekStart: string;
};

interface ScheduleTableFilterProps {
  value: ScheduleWeekFilterValue;
  onChange: (value: ScheduleWeekFilterValue) => void;
}

export function getWeeksInMonth(month: Dayjs) {
  const monthStart = month.startOf('month');
  const monthEnd = month.endOf('month');
  let cursor = monthStart.startOf('isoWeek');
  const last = monthEnd.endOf('isoWeek');
  const weeks: Array<{ value: string; label: string; shortLabel: string }> = [];
  const seen = new Set<string>();

  while (cursor.isBefore(last) || cursor.isSame(last, 'day')) {
    const weekStart = cursor.startOf('isoWeek');
    const weekEnd = cursor.endOf('isoWeek');
    const value = weekStart.format(DATE_FORMAT);
    if (!seen.has(value)) {
      seen.add(value);
      weeks.push({
        value,
        label: `Week ${weekStart.isoWeek()} · ${weekStart.format('MMM D')} – ${weekEnd.format('MMM D')}`,
        shortLabel: `Week ${weekStart.isoWeek()}`,
      });
    }
    cursor = cursor.add(1, 'week');
  }

  return weeks;
}

export function resolveDefaultWeekStart(month: Dayjs, preferred?: Dayjs) {
  const weeks = getWeeksInMonth(month);
  if (!weeks.length) return dayjs().startOf('isoWeek').format(DATE_FORMAT);

  const anchor = preferred ?? dayjs();
  if (anchor.isSame(month, 'month')) {
    const preferredWeek = anchor.startOf('isoWeek').format(DATE_FORMAT);
    if (weeks.some((week) => week.value === preferredWeek)) {
      return preferredWeek;
    }
  }

  return weeks[0].value;
}

const desktopSelectClassName =
  'h-8 w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!min-h-8 [&_.ant-select-selector]:!rounded-lg focus-within:[&_.ant-select-selector]:!bg-blue-50';

const desktopMonthPickerClassName =
  'h-8 w-full rounded-lg border-gray-200 bg-white [&_.ant-picker-input>input]:text-gray-700 [&_.ant-picker-input>input::placeholder]:text-gray-500';

const ScheduleTableFilter: FC<ScheduleTableFilterProps> = ({
  value,
  onChange,
}) => {
  const weekOptions = useMemo(
    () => getWeeksInMonth(value.month),
    [value.month],
  );

  const handleMonthChange = (month: Dayjs | null) => {
    if (!month) return;
    onChange({
      month: month.startOf('month'),
      weekStart: resolveDefaultWeekStart(month, dayjs()),
    });
  };

  const handleWeekChange = (weekStart: string) => {
    onChange({ ...value, weekStart });
  };

  return (
    <div
      className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-nowrap sm:items-end sm:gap-4"
      id="time-attendance-my-schedule-filter-row"
      data-cy="time-attendance-my-schedule-filter-row"
    >
      <div
        className="w-full sm:w-[220px] sm:shrink-0"
        data-cy="time-attendance-my-schedule-filter-month"
      >
        <DatePicker
          picker="month"
          allowClear={false}
          value={value.month}
          format="MMMM YYYY"
          className={desktopMonthPickerClassName}
          style={{ width: '100%' }}
          onChange={handleMonthChange}
          data-cy="time-attendance-my-schedule-filter-month-picker"
        />
      </div>
      <div
        className="w-full sm:w-[360px] sm:shrink-0 md:w-[376px]"
        data-cy="time-attendance-my-schedule-filter-week"
      >
        <Select
          className={desktopSelectClassName}
          style={{ width: '100%' }}
          value={value.weekStart}
          options={weekOptions.map((week) => ({
            value: week.value,
            label: week.label,
          }))}
          onChange={handleWeekChange}
          data-cy="time-attendance-my-schedule-filter-week-select"
        />
      </div>
    </div>
  );
};

export default ScheduleTableFilter;
