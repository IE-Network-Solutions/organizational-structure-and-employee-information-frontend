'use client';

import { FC, ReactNode, useEffect, useMemo } from 'react';
import { Col, DatePicker, Form, Row, Select } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { MdKeyboardArrowDown } from 'react-icons/md';
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

const mobileSelectFieldClassName =
  'h-11 w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!min-h-11 [&_.ant-select-selector]:rounded-lg [&_.ant-select-selector]:border-gray-200 [&_.ant-select-selector]:bg-white [&_.ant-select-selection-placeholder]:text-gray-500 [&_.ant-select-selection-item]:text-gray-700';

const desktopSelectClassName =
  'h-8 w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!min-h-8 [&_.ant-select-selector]:!rounded-lg focus-within:[&_.ant-select-selector]:!bg-blue-50';

const desktopMonthPickerClassName =
  'h-8 w-full rounded-lg border-gray-200 bg-white [&_.ant-picker-input>input]:text-gray-700 [&_.ant-picker-input>input::placeholder]:text-gray-500';

const mobileMonthPickerClassName =
  'h-11 w-full rounded-lg border-gray-200 bg-white [&_.ant-picker]:!h-11 [&_.ant-picker-input>input]:text-gray-700';

const suffixIcon = (
  <MdKeyboardArrowDown size={18} className="text-gray-500" aria-hidden />
);

export function getWeeksInMonth(month: Dayjs) {
  const monthStart = month.startOf('month');
  const monthEnd = month.endOf('month');
  let cursor = monthStart.startOf('isoWeek');
  const last = monthEnd.endOf('isoWeek');
  const weeks: Array<{ value: string; label: string }> = [];
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
  const [form] = Form.useForm();
  const weekOptions = useMemo(
    () => getWeeksInMonth(value.month),
    [value.month],
  );
  const selectedWeek = Form.useWatch('weekStart', form) ?? value.weekStart;

  useEffect(() => {
    form.setFieldsValue({
      month: value.month,
      weekStart: value.weekStart,
    });
  }, [form, value.month, value.weekStart]);

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

  const renderWeekOption = (option: {
    data: { label?: ReactNode; value?: string | number };
  }) => {
    const { label, value: optionValue } = option.data;
    const isSelected = optionValue === selectedWeek;
    const optKey = String(optionValue ?? 'option');
    return (
      <div
        className="flex items-center justify-between rounded px-2 py-1"
        style={isSelected ? { backgroundColor: '#E6F4FF' } : undefined}
        data-cy={`time-attendance-my-schedule-filter-week-option-${optKey}`}
      >
        <span
          data-cy={`time-attendance-my-schedule-filter-week-option-label-${optKey}`}
        >
          {label}
        </span>
        {isSelected ? <CheckOutlined style={{ color: '#1E40AF' }} /> : null}
      </div>
    );
  };

  return (
    <div
      id="time-attendance-my-schedule-filter-container"
      data-cy="time-attendance-my-schedule-filter-container"
      className="w-full px-0 sm:w-auto sm:min-w-0"
    >
      <Form
        form={form}
        initialValues={{
          month: value.month,
          weekStart: value.weekStart,
        }}
        id="time-attendance-my-schedule-filter-form"
        data-cy="time-attendance-my-schedule-filter-form"
      >
        <Row
          gutter={[0, 16]}
          className="sm:hidden w-full"
          id="time-attendance-my-schedule-filter-row-mobile"
          data-cy="time-attendance-my-schedule-filter-row-mobile"
        >
          <Col span={24}>
            <Form.Item
              name="month"
              className="mb-0 w-full"
              data-cy="time-attendance-my-schedule-filter-month-mobile"
            >
              <DatePicker
                picker="month"
                allowClear={false}
                className={mobileMonthPickerClassName}
                format="MMMM YYYY"
                onChange={handleMonthChange}
                data-cy="time-attendance-my-schedule-filter-month-picker-mobile"
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="weekStart"
              className="mb-0 w-full"
              data-cy="time-attendance-my-schedule-filter-week-mobile"
            >
              <Select
                placeholder="Select week"
                className={mobileSelectFieldClassName}
                suffixIcon={suffixIcon}
                options={weekOptions}
                onChange={handleWeekChange}
                optionRender={renderWeekOption}
                data-cy="time-attendance-my-schedule-filter-week-select-mobile"
              />
            </Form.Item>
          </Col>
        </Row>

        <div
          id="time-attendance-my-schedule-filter-row"
          data-cy="time-attendance-my-schedule-filter-row"
          className="hidden sm:flex sm:w-auto sm:flex-nowrap sm:items-end sm:gap-4"
        >
          <Form.Item
            name="month"
            className="mb-0 w-[220px] shrink-0"
            data-cy="time-attendance-my-schedule-filter-month"
          >
            <DatePicker
              picker="month"
              allowClear={false}
              className={desktopMonthPickerClassName}
              style={{ width: '100%' }}
              format="MMMM YYYY"
              onChange={handleMonthChange}
              data-cy="time-attendance-my-schedule-filter-month-picker"
            />
          </Form.Item>

          <Form.Item
            name="weekStart"
            className="mb-0 w-[360px] shrink-0 md:w-[376px]"
            data-cy="time-attendance-my-schedule-filter-week"
          >
            <Select
              placeholder="Select week"
              className={desktopSelectClassName}
              style={{ width: '100%' }}
              suffixIcon={
                <MdKeyboardArrowDown
                  size={16}
                  className="text-gray-900"
                  data-cy="time-attendance-my-schedule-filter-week-select-icon"
                />
              }
              options={weekOptions}
              onChange={handleWeekChange}
              optionRender={renderWeekOption}
              data-cy="time-attendance-my-schedule-filter-week-select"
            />
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default ScheduleTableFilter;
