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
    >
      <Row gutter={[16, 16]} className="w-full">
        <Col xs={24} md={8}>
          <Form.Item
            id="historyDateRangeId"
            name="dateRange"
            className="mb-0"
            rules={[{ validator: validateDateRange }]}
          >
            <DatePicker.RangePicker
              className="w-full h-[40px]"
              separator={'-'}
              format={DATE_FORMAT}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item id="historyType" name="type" className="mb-0">
            <Select
              placeholder="Select Type"
              className="w-full h-[40px]"
              allowClear={true}
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              options={formatToOptions(leaveTypes ?? [], 'title', 'id')}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item id="historyStatus" name="status" className="mb-0">
            <Select
              placeholder="Select Status"
              className="w-full h-[40px]"
              allowClear={true}
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              options={LeaveRequestStatusOption}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden sm:block">
        <FilterContent />
      </div>

      {/* Mobile Filter Button */}
      <div className="sm:hidden mb-4">
        <Button
          type="default"
          icon={<LuSettings2 className="text-gray-600" />}
          onClick={() => {
            mobileForm.setFieldsValue(form.getFieldsValue());
            setIsFilterOpen(true);
          }}
          className="flex justify-center w-10 h-10 hover:bg-gray-50 border-gray-200"
        />
        <Modal
          centered
          title="Filter Employees"
          open={isFilterOpen}
          onCancel={handleReset}
          width="85%"
          footer={
            <div className="flex justify-center items-center space-x-4">
              <Button type="default" className="px-3" onClick={handleReset}>
                Reset
              </Button>
              <Button onClick={handleSubmit} type="primary" className="px-3">
                Filter
              </Button>
            </div>
          }
        >
          <Form<FilterFormValues>
            form={mobileForm}
            className="w-full"
            layout="vertical"
          >
            <Form.Item
              label="Start Date"
              name="startDate"
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
              />
            </Form.Item>

            <Form.Item
              label="End Date"
              name="endDate"
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
              />
            </Form.Item>

            <Form.Item label="Type" name="type">
              <Select
                placeholder="Select Type"
                className="w-full h-[40px]"
                allowClear={true}
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={formatToOptions(leaveTypes ?? [], 'title', 'id')}
              />
            </Form.Item>
            <Form.Item label="Status" name="status">
              <Select
                placeholder="Select Status"
                className="w-full h-[40px]"
                allowClear={true}
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={LeaveRequestStatusOption}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default HistoryTableFilter;
