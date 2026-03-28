import { FC } from 'react';
import { DatePicker, Form, Select, Row, Col } from 'antd';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { formatToOptions } from '@/helpers/formatTo';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { DATE_FORMAT } from '@/utils/constants';
import { Dayjs } from 'dayjs';

interface FilterFormValues {
  dateRange?: [Dayjs, Dayjs];
  type?: string;
  status?: string;
}

interface HistoryTableFilterProps {
  onChange: (val: FilterFormValues) => void;
}

const HistoryTableFilter: FC<HistoryTableFilterProps> = ({ onChange }) => {
  const { leaveTypes } = useMyTimesheetStore();
  const [form] = Form.useForm();

  /* eslint-disable @typescript-eslint/naming-convention */
  const validateDateRange = (_: any, value: [Dayjs, Dayjs]) => {
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
      <Row gutter={[16, 16]} className="w-full">
        <Col xs={24} md={8}>
          <Form.Item
            id="time-attendance-history-table-filter-date-range"
            data-cy="time-attendance-history-table-filter-date-range"
            name="dateRange"
            className="mb-0"
            rules={[{ validator: validateDateRange }]}
          >
            {/* <DatePicker.RangePicker
              className="w-full h-[40px]"
              separator={'-'}
              format={DATE_FORMAT}
              id="time-attendance-history-table-filter-date-range-picker"
              data-cy="time-attendance-history-table-filter-date-range-picker"
            /> */}
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            id="time-attendance-history-table-filter-type"
            data-cy="time-attendance-history-table-filter-type"
            name="type"
            className="mb-0"
          >
            <Select
              placeholder="Filter Type"
              className="w-full h-[40px]"
              allowClear={true}
              suffixIcon={
                <MdKeyboardArrowDown
                  data-cy="time-attendance-history-table-filter-type-select-icon"
                  size={16}
                  className="text-gray-900"
                />
              }
              options={formatToOptions(leaveTypes ?? [], 'title', 'id')}
              id="time-attendance-history-table-filter-type-select"
              data-cy="time-attendance-history-table-filter-type-select"
            />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={8}>
          <Form.Item
            id="time-attendance-history-table-filter-date-range"
            data-cy="time-attendance-history-table-filter-date-range"
            name="dateRange"
            className="mb-0"
            rules={[{ validator: validateDateRange }]}
          >
            <DatePicker.RangePicker
              className="w-full h-[40px]"
              separator="→"
              format={DATE_FORMAT}
              placeholder={['Start date', 'End date']}
              id="time-attendance-history-table-filter-date-range-picker"
              data-cy="time-attendance-history-table-filter-date-range-picker"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  return (
    <>
      <div
        id="time-attendance-history-table-filter-container"
        data-cy="time-attendance-history-table-filter-container"
      >
        <FilterContent data-cy="time-attendance-history-table-filter-content" />
      </div>
    </>
  );
};

export default HistoryTableFilter;
