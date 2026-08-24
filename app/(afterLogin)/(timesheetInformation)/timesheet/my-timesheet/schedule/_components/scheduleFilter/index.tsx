'use client';

import { FC, useMemo, useState } from 'react';
import { Button, DatePicker, Dropdown, Select, Tag } from 'antd';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useIsMobile } from '@/hooks/useIsMobile';
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

const ScheduleTableFilter: FC<ScheduleTableFilterProps> = ({
  value,
  onChange,
}) => {
  const { isMobile } = useIsMobile();
  const [open, setOpen] = useState(false);
  const weekOptions = useMemo(
    () => getWeeksInMonth(value.month),
    [value.month],
  );
  const selectedWeek = weekOptions.find(
    (week) => week.value === value.weekStart,
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

  const resetToCurrentWeek = () => {
    const month = dayjs().startOf('month');
    onChange({
      month,
      weekStart: resolveDefaultWeekStart(month, dayjs()),
    });
  };

  const filterPanel = (
    <div
      className="w-[300px] rounded-lg border border-gray-200 bg-white p-4 shadow-md"
      data-cy="time-attendance-my-schedule-filter-panel"
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className="mb-3 flex items-center justify-between"
        data-cy="time-attendance-my-schedule-filter-panel-header"
      >
        <p
          className="mb-0 text-sm font-medium text-[#4d4d4d]"
          data-cy="time-attendance-my-schedule-filter-panel-title"
        >
          Filters
        </p>
        <Button
          type="link"
          size="small"
          className="!px-0"
          onClick={() => {
            resetToCurrentWeek();
            setOpen(false);
          }}
          data-cy="time-attendance-my-schedule-filter-reset"
        >
          Reset
        </Button>
      </div>
      <div className="mb-3" data-cy="time-attendance-my-schedule-filter-month">
        <p
          className="mb-1 text-xs text-gray-500"
          data-cy="time-attendance-my-schedule-filter-month-label"
        >
          Month
        </p>
        <DatePicker
          picker="month"
          allowClear={false}
          value={value.month}
          format="MMMM YYYY"
          className="h-8 w-full rounded-lg"
          onChange={handleMonthChange}
          data-cy="time-attendance-my-schedule-filter-month-picker"
        />
      </div>
      <div data-cy="time-attendance-my-schedule-filter-week">
        <p
          className="mb-1 text-xs text-gray-500"
          data-cy="time-attendance-my-schedule-filter-week-label"
        >
          Week
        </p>
        <Select
          className="h-8 w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!min-h-8 [&_.ant-select-selector]:!rounded-lg"
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

  return (
    <div
      className="flex w-full justify-between gap-4"
      id="time-attendance-my-schedule-filter-row"
      data-cy="time-attendance-my-schedule-filter-row"
    >
      <div
        className="flex items-center gap-2 flex-wrap min-w-0"
        data-cy="time-attendance-my-schedule-active-filters"
      >
        <Tag
          className="bg-white text-primary border-primary rounded-md px-3 h-6 flex items-center text-xs font-normal"
          data-cy="time-attendance-my-schedule-filter-tag-month"
        >
          <span
            onClick={resetToCurrentWeek}
            className="text-primary hover:!text-[#FF8787] mr-2 text-lg cursor-pointer"
            data-cy="time-attendance-my-schedule-filter-tag-month-clear"
          >
            ×
          </span>
          {value.month.format('MMM YYYY')}
        </Tag>
        {selectedWeek && (
          <Tag
            className="bg-white text-primary border-primary rounded-md px-3 h-6 flex items-center text-xs font-normal"
            data-cy="time-attendance-my-schedule-filter-tag-week"
          >
            <span
              onClick={resetToCurrentWeek}
              className="text-primary hover:!text-[#FF8787] mr-2 text-lg cursor-pointer"
              data-cy="time-attendance-my-schedule-filter-tag-week-clear"
            >
              ×
            </span>
            {selectedWeek.shortLabel}
          </Tag>
        )}
      </div>

      <Dropdown
        placement="bottomRight"
        trigger={['click']}
        open={open}
        onOpenChange={setOpen}
        dropdownRender={() => filterPanel}
      >
        <Button
          type="default"
          className="border border-[#D9D9D9] font-normal text-[#4d4d4d]"
          icon={<FilterAltOutlinedIcon className="py-1" />}
          data-cy="time-attendance-my-schedule-filter-toggle-btn"
        >
          {!isMobile && 'Filter'}
        </Button>
      </Dropdown>
    </div>
  );
};

export default ScheduleTableFilter;
