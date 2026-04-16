import { FC } from 'react';
import { DatePicker, Form, Row, Col, Select } from 'antd';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { formatToOptions } from '@/helpers/formatTo';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { DATE_FORMAT } from '@/utils/constants';
import { Dayjs } from 'dayjs';

interface FilterFormValues {
  dateRange?: [Dayjs, Dayjs];
  /** Mobile: separate start/end pickers (same API filter when both set). */
  date?: [Dayjs | null | undefined, Dayjs | null | undefined];
  type?: string;
}

interface HistoryTableFilterProps {
  onChange: (val: FilterFormValues) => void;
}

/** Mobile stacked row (matches attendance mobile treatment). */
const selectFieldClassName =
  'w-full [&_.ant-select-selector]:min-h-[44px] [&_.ant-select-selector]:rounded-lg [&_.ant-select-selector]:border-gray-200 [&_.ant-select-selector]:bg-white [&_.ant-select-selection-placeholder]:text-gray-500 [&_.ant-select-selection-item]:text-gray-700';

// const rangePickerClassName =
//   'w-full min-h-[44px] rounded-lg border-gray-200 bg-white [&_.ant-picker-input>input]:text-gray-700 [&_.ant-picker-input>input::placeholder]:text-gray-500';

const compositeSegmentPickerClassName =
  'w-full min-h-[44px] border-0 bg-transparent shadow-none rounded-none [&_.ant-picker]:border-0 [&_.ant-picker]:shadow-none [&_.ant-picker-input>input]:text-gray-700 [&_.ant-picker-input>input::placeholder]:text-gray-500';

const desktopSelectClassName =
  'h-8 w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!min-h-8 [&_.ant-select-selector]:!rounded-lg focus-within:[&_.ant-select-selector]:!bg-blue-50';

const desktopRangePickerClassName =
  'h-8 w-full rounded-lg border-gray-200 bg-white [&_.ant-picker-input>input]:text-gray-700 [&_.ant-picker-input>input::placeholder]:text-gray-500';

const desktopSuffixIcon = (
  <MdKeyboardArrowDown
    size={16}
    className="text-gray-900"
    data-cy="time-attendance-history-table-filter-type-select-icon"
    aria-hidden
  />
);

const HistoryTableFilter: FC<HistoryTableFilterProps> = ({ onChange }) => {
  const { leaveTypes } = useMyTimesheetStore();
  const [form] = Form.useForm();

  /* eslint-disable @typescript-eslint/naming-convention */
  const validateDateRange = (_: unknown, value: [Dayjs, Dayjs]) => {
    /* eslint-enable @typescript-eslint/naming-convention */

    if (value && value[0].isAfter(value[1])) {
      return Promise.reject('End date must be after start date');
    }
    return Promise.resolve();
  };

  const FilterContent = () => (
    <Form<FilterFormValues>
      form={form}
      onFieldsChange={() => {
        onChange(form.getFieldsValue());
      }}
      className="w-full"
      id="time-attendance-history-table-filter-form"
      data-cy="time-attendance-history-table-filter-form"
    >
      {/* Mobile */}
      <Row
        gutter={[0, 24]}
        className="w-full sm:hidden"
        id="time-attendance-history-table-filter-row-mobile"
        data-cy="time-attendance-history-table-filter-row-mobile"
      >
        <Col span={24}>
          <Form.Item
            id="time-attendance-history-table-filter-type-mobile"
            data-cy="time-attendance-history-table-filter-type-mobile"
            name="type"
            className="mb-0 w-full"
          >
            <Select
              placeholder="Filter Type"
              className={selectFieldClassName}
              allowClear
              suffixIcon={
                <MdKeyboardArrowDown
                  size={18}
                  className="text-gray-500"
                  aria-hidden
                />
              }
              options={formatToOptions(leaveTypes ?? [], 'title', 'id')}
              id="time-attendance-history-table-filter-type-select-mobile"
              data-cy="time-attendance-history-table-filter-type-select-mobile"
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <div
            className="flex w-full min-h-[44px] items-stretch overflow-hidden rounded-lg border border-gray-200 bg-white"
            id="time-attendance-history-table-filter-date-mobile-shell"
            data-cy="time-attendance-history-table-filter-date-mobile-shell"
          >
            <div
              className="flex min-w-0 flex-1 border-r border-gray-200"
              data-cy="time-attendance-history-table-filter-date-from-mobile-segment"
            >
              <Form.Item
                className="mb-0 w-full [&_.ant-form-item-row]:h-full [&_.ant-form-item-control-input]:min-h-[44px] [&_.ant-form-item-control-input-content]:flex [&_.ant-form-item-control-input-content]:h-full [&_.ant-form-item-control-input-content]:items-center"
                id="time-attendance-history-table-filter-date-from-mobile"
                data-cy="time-attendance-history-table-filter-date-from-mobile"
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
                          new Error('Start date must be on or before end date'),
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
                  id="time-attendance-history-table-filter-date-start-mobile"
                  data-cy="time-attendance-history-table-filter-date-start-mobile"
                />
              </Form.Item>
            </div>
            <span
              className="flex shrink-0 items-center px-1.5 text-sm text-gray-400"
              aria-hidden
              data-cy="time-attendance-history-table-filter-date-range-separator-mobile"
            >
              →
            </span>
            <div
              className="flex min-w-0 flex-1"
              data-cy="time-attendance-history-table-filter-date-to-mobile-segment"
            >
              <Form.Item
                className="mb-0 w-full [&_.ant-form-item-row]:h-full [&_.ant-form-item-control-input]:min-h-[44px] [&_.ant-form-item-control-input-content]:flex [&_.ant-form-item-control-input-content]:h-full [&_.ant-form-item-control-input-content]:items-center"
                id="time-attendance-history-table-filter-date-to-mobile"
                data-cy="time-attendance-history-table-filter-date-to-mobile"
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
                          new Error('End date must be on or after start date'),
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
                  id="time-attendance-history-table-filter-date-end-mobile"
                  data-cy="time-attendance-history-table-filter-date-end-mobile"
                />
              </Form.Item>
            </div>
          </div>
        </Col>
      </Row>

      {/* Desktop: fixed-width group — same pattern as attendance filters */}
      <div
        id="time-attendance-history-table-filter-row-desktop"
        data-cy="time-attendance-history-table-filter-row-desktop"
        className="hidden w-full sm:flex sm:w-auto sm:flex-nowrap sm:items-end sm:gap-4"
      >
        <Form.Item
          name="type"
          className="mb-0 w-[220px] shrink-0"
          id="time-attendance-history-table-filter-type"
          data-cy="time-attendance-history-table-filter-type"
        >
          <Select
            placeholder="Filter Type"
            allowClear
            className={desktopSelectClassName}
            style={{ width: '100%' }}
            suffixIcon={desktopSuffixIcon}
            options={formatToOptions(leaveTypes ?? [], 'title', 'id')}
            id="time-attendance-history-table-filter-type-select"
            data-cy="time-attendance-history-table-filter-type-select"
          />
        </Form.Item>

        <Form.Item
          name="dateRange"
          className="mb-0 w-[360px] shrink-0 md:w-[376px]"
          rules={[{ validator: validateDateRange }]}
          id="time-attendance-history-table-filter-date-range"
          data-cy="time-attendance-history-table-filter-date-range"
        >
          <DatePicker.RangePicker
            className={desktopRangePickerClassName}
            style={{ width: '100%' }}
            separator="→"
            format={DATE_FORMAT}
            placeholder={['Start date', 'End date']}
            id="time-attendance-history-table-filter-date-range-picker"
            data-cy="time-attendance-history-table-filter-date-range-picker"
          />
        </Form.Item>
      </div>
    </Form>
  );

  return (
    <div
      id="time-attendance-history-table-filter-container"
      data-cy="time-attendance-history-table-filter-container"
      className="w-full sm:w-auto sm:min-w-0"
    >
      <FilterContent />
    </div>
  );
};

export default HistoryTableFilter;
