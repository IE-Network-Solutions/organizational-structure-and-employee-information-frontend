import { FC } from 'react';
import { DatePicker, Form, Select, Row, Col, Button, Modal } from 'antd';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { LuSettings2 } from 'react-icons/lu';

import { LeaveRequestStatusOption } from '@/types/timesheet/settings';
import { formatToOptions } from '@/helpers/formatTo';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { DATE_FORMAT } from '@/utils/constants';
import { useState } from 'react';
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
  const [mobileForm] = Form.useForm();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSubmit = () => {
    const values = mobileForm.getFieldsValue();
    if (values.startDate && values.endDate) {
      values.dateRange = [values.startDate, values.endDate];
    }
    onChange(values);
    form.setFieldsValue(values); // Sync with desktop form
    setIsFilterOpen(false);
  };

  const handleReset = () => {
    mobileForm.resetFields();
    form.resetFields();
    onChange({});
    setIsFilterOpen(false);
  };

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
              placeholder="Select Type"
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
        <Col xs={24} md={8}>
          <Form.Item
            id="time-attendance-history-table-filter-status"
            data-cy="time-attendance-history-table-filter-status"
            name="status"
            className="mb-0"
          >
            <Select
              placeholder="Select Status"
              className="w-full h-[40px]"
              allowClear={true}
              suffixIcon={
                <MdKeyboardArrowDown
                  data-cy="time-attendance-history-table-filter-status-select-icon"
                  size={16}
                  className="text-gray-900"
                />
              }
              options={LeaveRequestStatusOption}
              id="time-attendance-history-table-filter-status-select"
              data-cy="time-attendance-history-table-filter-status-select"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div
        id="time-attendance-history-table-filter-desktop-container"
        data-cy="time-attendance-history-table-filter-desktop-container"
        className="hidden sm:block"
      >
        <FilterContent data-cy="time-attendance-history-table-filter-desktop-content" />
      </div>

      {/* Mobile Filter Button */}
      <div
        className="sm:hidden mb-4"
        id="time-attendance-history-table-filter-mobile-container"
        data-cy="time-attendance-history-table-filter-mobile-container"
      >
        <Button
          type="default"
          icon={
            <LuSettings2
              data-cy="time-attendance-history-table-filter-mobile-button-icon"
              className="text-gray-600"
            />
          }
          onClick={() => {
            mobileForm.setFieldsValue(form.getFieldsValue());
            setIsFilterOpen(true);
          }}
          className="flex justify-center w-10 h-10 hover:bg-gray-50 border-gray-200"
          id="time-attendance-history-table-filter-mobile-button"
          data-cy="time-attendance-history-table-filter-mobile-button"
        />
        <Modal
          centered
          title="Filter Employees"
          open={isFilterOpen}
          onCancel={handleReset}
          width="85%"
          data-cy="time-attendance-history-table-filter-mobile-modal"
          footer={
            <div
              className="flex justify-center items-center space-x-4"
              id="time-attendance-history-table-filter-mobile-modal-footer"
              data-cy="time-attendance-history-table-filter-mobile-modal-footer"
            >
              <Button
                type="default"
                className="px-3"
                onClick={handleReset}
                id="time-attendance-history-table-filter-mobile-reset-button"
                data-cy="time-attendance-history-table-filter-mobile-reset-button"
              >
                Reset
              </Button>
              <Button
                onClick={handleSubmit}
                type="primary"
                className="px-3"
                id="time-attendance-history-table-filter-mobile-filter-button"
                data-cy="time-attendance-history-table-filter-mobile-filter-button"
              >
                Filter
              </Button>
            </div>
          }
        >
          <Form<FilterFormValues>
            form={mobileForm}
            className="w-full"
            layout="vertical"
            id="time-attendance-history-table-filter-mobile-form"
            data-cy="time-attendance-history-table-filter-mobile-form"
          >
            <Form.Item
              label="Start Date"
              name="startDate"
              id="time-attendance-history-table-filter-mobile-start-date"
              data-cy="time-attendance-history-table-filter-mobile-start-date"
              rules={[
                ({ getFieldValue }) => ({
                  /* eslint-disable @typescript-eslint/naming-convention */
                  validator(_, value) {
                    /* eslint-enable @typescript-eslint/naming-convention */
                    if (
                      !value ||
                      !getFieldValue('endDate') ||
                      value.isBefore(getFieldValue('endDate'))
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Start date must be before end date');
                  },
                }),
              ]}
            >
              <DatePicker
                className="w-full h-[40px]"
                placeholder="Start Date"
                format={DATE_FORMAT}
                id="time-attendance-history-table-filter-mobile-start-date-picker"
                data-cy="time-attendance-history-table-filter-mobile-start-date-picker"
              />
            </Form.Item>

            <Form.Item
              label="End Date"
              name="endDate"
              id="time-attendance-history-table-filter-mobile-end-date"
              data-cy="time-attendance-history-table-filter-mobile-end-date"
              rules={[
                ({ getFieldValue }) => ({
                  /* eslint-disable @typescript-eslint/naming-convention */
                  validator(_, value) {
                    /* eslint-enable @typescript-eslint/naming-convention */

                    if (
                      !value ||
                      !getFieldValue('startDate') ||
                      value.isAfter(getFieldValue('startDate'))
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject('End date must be after start date');
                  },
                }),
              ]}
            >
              <DatePicker
                className="w-full h-[40px]"
                placeholder="End Date"
                format={DATE_FORMAT}
                id="time-attendance-history-table-filter-mobile-end-date-picker"
                data-cy="time-attendance-history-table-filter-mobile-end-date-picker"
              />
            </Form.Item>

            <Form.Item
              label="Type"
              name="type"
              id="time-attendance-history-table-filter-mobile-type"
              data-cy="time-attendance-history-table-filter-mobile-type"
            >
              <Select
                placeholder="Select Type"
                className="w-full h-[40px]"
                allowClear={true}
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={formatToOptions(leaveTypes ?? [], 'title', 'id')}
                id="time-attendance-history-table-filter-mobile-type-select"
                data-cy="time-attendance-history-table-filter-mobile-type-select"
              />
            </Form.Item>
            <Form.Item
              label="Status"
              name="status"
              id="time-attendance-history-table-filter-mobile-status"
              data-cy="time-attendance-history-table-filter-mobile-status"
            >
              <Select
                placeholder="Select Status"
                className="w-full h-[40px]"
                allowClear={true}
                suffixIcon={
                  <MdKeyboardArrowDown
                    data-cy="time-attendance-history-table-filter-mobile-status-select-icon"
                    size={16}
                    className="text-gray-900"
                  />
                }
                options={LeaveRequestStatusOption}
                id="time-attendance-history-table-filter-mobile-status-select"
                data-cy="time-attendance-history-table-filter-mobile-status-select"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default HistoryTableFilter;
