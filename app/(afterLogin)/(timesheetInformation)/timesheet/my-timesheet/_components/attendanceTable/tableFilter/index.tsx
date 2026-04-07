import React, { useState } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import type { RangePickerProps } from 'antd/es/date-picker';

type DateRangeValue = [dayjs.Dayjs, dayjs.Dayjs] | null;

interface AttendanceTableFilterProps {
  onChange: (val: DateRangeValue) => void;
  onClose?: () => void;
}

const AttendanceTableFilter = ({
  onChange,
  onClose,
}: AttendanceTableFilterProps) => {
  const [dateRange, setDateRange] = useState<DateRangeValue>(null);

  const handleChange: RangePickerProps['onChange'] = (dates) => {
    const value = dates as DateRangeValue;
    setDateRange(value);
    onChange(value);
    if (value && onClose) {
      onClose();
    }
  };

  return (
    <div
      id="time-attendance-my-timesheet-attendance-table-filter-container"
      data-cy="time-attendance-my-timesheet-attendance-table-filter-container"
      className="flex flex-col sm:flex-row gap-4"
    >
      <DatePicker.RangePicker
        id="time-attendance-my-timesheet-attendance-table-filter-date-picker"
        data-cy="time-attendance-my-timesheet-attendance-table-filter-date-picker"
        size="large"
        value={dateRange}
        onChange={handleChange}
        allowClear
        className="w-full sm:w-auto"
      />
    </div>
  );
};

export default AttendanceTableFilter;
