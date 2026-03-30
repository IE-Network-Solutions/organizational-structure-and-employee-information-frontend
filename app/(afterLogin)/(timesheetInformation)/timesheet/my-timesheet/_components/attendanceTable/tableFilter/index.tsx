import React, { FC } from 'react';
import { Col, DatePicker, Form, Row, Select } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { CommonObject } from '@/types/commons/commonObject';
import { attendanceRecordTypeOption } from '@/types/timesheet/attendance';
import { DATE_FORMAT } from '@/utils/constants';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { Dayjs } from 'dayjs';

interface AttendanceTableFilterProps {
  onChange: (val: CommonObject) => void;
}

const selectFieldClassName =
  'w-full [&_.ant-select-selector]:min-h-[44px] [&_.ant-select-selector]:rounded-lg [&_.ant-select-selector]:border-gray-200 [&_.ant-select-selector]:bg-white [&_.ant-select-selection-placeholder]:text-gray-500 [&_.ant-select-selection-item]:text-gray-700';

const rangePickerClassName =
  'w-full min-h-[44px] rounded-lg border-gray-200 bg-white [&_.ant-picker-input>input]:text-gray-700 [&_.ant-picker-input>input::placeholder]:text-gray-500';

/** Inside composite “range” row: no outer border on each picker (wrapper supplies one ring). */
const compositeSegmentPickerClassName =
  'w-full min-h-[44px] border-0 bg-transparent shadow-none rounded-none [&_.ant-picker]:border-0 [&_.ant-picker]:shadow-none [&_.ant-picker-input>input]:text-gray-700 [&_.ant-picker-input>input::placeholder]:text-gray-500';

const suffixIcon = (
  <MdKeyboardArrowDown size={18} className="text-gray-500" aria-hidden />
);

const AttendanceTableFilter: FC<AttendanceTableFilterProps> = ({
  onChange,
}) => {
  const [form] = Form.useForm();
  const selectedType = Form.useWatch('type', form);

  /* eslint-disable @typescript-eslint/naming-convention */
  const validateDateRange = (_: unknown, value: [Dayjs, Dayjs]) => {
    /* eslint-enable @typescript-eslint/naming-convention */

    if (value && value[0].isAfter(value[1])) {
      return Promise.reject('End date must be after start date');
    }
    return Promise.resolve();
  };

  return (
    <div
      id="time-attendance-attendance-table-filter-container"
      data-cy="time-attendance-attendance-table-filter-container"
      className="w-full sm:w-auto sm:min-w-0"
    >
      <Form
        form={form}
        onFieldsChange={() => onChange(form.getFieldsValue())}
        id="time-attendance-attendance-table-filter-form"
        data-cy="time-attendance-attendance-table-filter-form"
      >
        {/* Mobile: inline stacked filters (match leave-history / design reference) */}
        <Row
          gutter={[12, 12]}
          className="sm:hidden w-full"
          id="time-attendance-attendance-table-filter-row-mobile"
          data-cy="time-attendance-attendance-table-filter-row-mobile"
        >
          <Col span={24}>
            <Form.Item
              name="type"
              className="mb-0 w-full"
              id="time-attendance-attendance-table-filter-type-mobile"
              data-cy="time-attendance-attendance-table-filter-type-mobile"
            >
              <Select
                placeholder="Filter Status"
                allowClear
                className={selectFieldClassName}
                suffixIcon={suffixIcon}
                options={attendanceRecordTypeOption}
                optionRender={(option) => {
                  const { label, value } = option.data;
                  const isSelected = value === selectedType;
                  const optKey = String(value ?? 'option');
                  return (
                    <div
                      className="flex items-center justify-between rounded px-2 py-1"
                      style={
                        isSelected ? { backgroundColor: '#E6F4FF' } : undefined
                      }
                      data-cy={`time-attendance-attendance-table-filter-type-option-${optKey}`}
                    >
                      <span
                        data-cy={`time-attendance-attendance-table-filter-type-option-label-${optKey}`}
                      >
                        {label}
                      </span>
                      {isSelected ? (
                        <CheckOutlined style={{ color: '#1E40AF' }} />
                      ) : null}
                    </div>
                  );
                }}
                id="time-attendance-attendance-table-filter-type-select-mobile"
                data-cy="time-attendance-attendance-table-filter-type-select-mobile"
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <div
              className="flex w-full min-h-[44px] items-stretch overflow-hidden rounded-lg border border-gray-200 bg-white"
              id="time-attendance-attendance-table-filter-date-range-mobile-shell"
              data-cy="time-attendance-attendance-table-filter-date-range-mobile-shell"
            >
              <div
                className="flex min-w-0 flex-1 border-r border-gray-200"
                data-cy="time-attendance-attendance-table-filter-date-from-mobile-segment"
              >
                <Form.Item
                  className="mb-0 w-full [&_.ant-form-item-row]:h-full [&_.ant-form-item-control-input]:min-h-[44px] [&_.ant-form-item-control-input-content]:flex [&_.ant-form-item-control-input-content]:h-full [&_.ant-form-item-control-input-content]:items-center"
                  id="time-attendance-attendance-table-filter-date-from-mobile"
                  data-cy="time-attendance-attendance-table-filter-date-from-mobile"
                  name={['date', 0]}
                  dependencies={[['date', 1]]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(rule, value: Dayjs | null | undefined) {
                        void rule;
                        const end = getFieldValue(['date', 1]) as
                          | Dayjs
                          | null
                          | undefined;
                        if (value && end && value.isAfter(end, 'day')) {
                          return Promise.reject(
                            new Error(
                              'Start date must be on or before end date',
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    className={compositeSegmentPickerClassName}
                    style={{ width: '100%' }}
                    format={DATE_FORMAT}
                    placeholder="Start date"
                    allowClear
                    id="time-attendance-attendance-table-filter-date-start-mobile"
                    data-cy="time-attendance-attendance-table-filter-date-start-mobile"
                  />
                </Form.Item>
              </div>
              <span
                className="flex shrink-0 items-center px-1.5 text-sm text-gray-400"
                aria-hidden
                data-cy="time-attendance-attendance-table-filter-date-range-separator-mobile"
              >
                →
              </span>
              <div
                className="flex min-w-0 flex-1"
                data-cy="time-attendance-attendance-table-filter-date-to-mobile-segment"
              >
                <Form.Item
                  className="mb-0 w-full [&_.ant-form-item-row]:h-full [&_.ant-form-item-control-input]:min-h-[44px] [&_.ant-form-item-control-input-content]:flex [&_.ant-form-item-control-input-content]:h-full [&_.ant-form-item-control-input-content]:items-center"
                  id="time-attendance-attendance-table-filter-date-to-mobile"
                  data-cy="time-attendance-attendance-table-filter-date-to-mobile"
                  name={['date', 1]}
                  dependencies={[['date', 0]]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(rule, value: Dayjs | null | undefined) {
                        void rule;
                        const start = getFieldValue(['date', 0]) as
                          | Dayjs
                          | null
                          | undefined;
                        if (start && value && value.isBefore(start, 'day')) {
                          return Promise.reject(
                            new Error(
                              'End date must be on or after start date',
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    className={compositeSegmentPickerClassName}
                    style={{ width: '100%' }}
                    format={DATE_FORMAT}
                    placeholder="End date"
                    allowClear
                    id="time-attendance-attendance-table-filter-date-end-mobile"
                    data-cy="time-attendance-attendance-table-filter-date-end-mobile"
                  />
                </Form.Item>
              </div>
            </div>
          </Col>
        </Row>

        {/* Desktop: fixed-width group so Export can sit at the far right with space between */}
        <div
          id="time-attendance-attendance-table-filter-row"
          data-cy="time-attendance-attendance-table-filter-row"
          className="hidden sm:flex sm:w-auto sm:flex-nowrap sm:items-end sm:gap-4"
        >
          <Form.Item
            name="type"
            className="mb-0 w-[220px] shrink-0"
            id="time-attendance-attendance-table-filter-type"
            data-cy="time-attendance-attendance-table-filter-type"
          >
            <Select
              placeholder="Filter Status"
              allowClear={true}
              className="h-9 w-full [&_.ant-select-selector]:!h-9 [&_.ant-select-selector]:!rounded-lg focus-within:[&_.ant-select-selector]:!bg-blue-50"
              style={{ width: '100%' }}
              suffixIcon={
                <MdKeyboardArrowDown
                  data-cy="time-attendance-attendance-table-filter-type-select-icon"
                  size={16}
                  className="text-gray-900"
                />
              }
              options={attendanceRecordTypeOption}
              optionRender={(option) => {
                const { label, value } = option.data;
                const isSelected = value === selectedType;
                const optKey = String(value ?? 'option');
                return (
                  <div
                    className="flex items-center justify-between rounded px-2 py-1"
                    style={
                      isSelected ? { backgroundColor: '#E6F4FF' } : undefined
                    }
                    data-cy={`time-attendance-attendance-table-filter-type-option-${optKey}`}
                  >
                    <span
                      data-cy={`time-attendance-attendance-table-filter-type-option-label-${optKey}`}
                    >
                      {label}
                    </span>
                    {isSelected ? (
                      <CheckOutlined style={{ color: '#1E40AF' }} />
                    ) : null}
                  </div>
                );
              }}
              id="time-attendance-attendance-table-filter-type-select"
              data-cy="time-attendance-attendance-table-filter-type-select"
            />
          </Form.Item>

          <Form.Item
            name="date"
            className="mb-0 w-[360px] shrink-0 md:w-[376px]"
            rules={[{ validator: validateDateRange }]}
            id="time-attendance-attendance-table-filter-date"
            data-cy="time-attendance-attendance-table-filter-date"
          >
            <DatePicker.RangePicker
              className={`h-9 ${rangePickerClassName}`}
              style={{ width: '100%' }}
              separator={'→'}
              format={DATE_FORMAT}
              placeholder={['Start date', 'End date']}
              id="time-attendance-attendance-table-filter-date-picker"
              data-cy="time-attendance-attendance-table-filter-date-picker"
            />
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default AttendanceTableFilter;
