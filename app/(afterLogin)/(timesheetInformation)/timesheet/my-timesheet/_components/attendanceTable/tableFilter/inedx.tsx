import React, { FC } from 'react';
import { Button, Col, DatePicker, Form, Modal, Row, Select } from 'antd';
import { CommonObject } from '@/types/commons/commonObject';
import { formatToOptions } from '@/helpers/formatTo';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { attendanceRecordTypeOption } from '@/types/timesheet/attendance';
import { DATE_FORMAT } from '@/utils/constants';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { LuSettings2 } from 'react-icons/lu';
import { Dayjs } from 'dayjs';

interface AttendanceTableFilterProps {
  onChange: (val: CommonObject) => void;
}

const AttendanceTableFilter: FC<AttendanceTableFilterProps> = ({
  onChange,
}) => {
  const { allowedAreas } = useMyTimesheetStore();
  const [form] = Form.useForm();
  const [mobileForm] = Form.useForm();
  const { showLeaveHistoryFilter, setShowLeaveHistoryFilter } =
    useMyTimesheetStore();

  const handleSubmit = () => {
    const values = mobileForm.getFieldsValue();
    if (values.startDate && values.endDate) {
      values.date = [values.startDate, values.endDate];
    }
    onChange(values);
    form.setFieldsValue(values); // Sync with desktop form
    setShowLeaveHistoryFilter(false);
  };

  const handleReset = () => {
    mobileForm.resetFields();
    form.resetFields();
    onChange({});
    setShowLeaveHistoryFilter(false);
  };
  /* eslint-disable @typescript-eslint/naming-convention */
  const validateDateRange = (_: any, value: [Dayjs, Dayjs]) => {
    /* eslint-enable @typescript-eslint/naming-convention */

    if (value && value[0].isAfter(value[1])) {
      return Promise.reject('End date must be after start date');
    }
    return Promise.resolve();
  };

  return (
    <div>
      {/* Desktop Filters */}
      <Form form={form} onFieldsChange={() => onChange(form.getFieldsValue())}>
        <Row gutter={16} align="middle">
          <Col className="block sm:hidden">
            <Button
              type="default"
              className="flex justify-center w-10 h-10 hover:bg-gray-100 border-gray-200"
              icon={<LuSettings2 className="text-gray-600" />}
              onClick={() => {
                mobileForm.setFieldsValue(form.getFieldsValue());
                setShowLeaveHistoryFilter(true);
              }}
            />
          </Col>

          <Col className="hidden sm:block" span={14}>
            <Form.Item name="date" rules={[{ validator: validateDateRange }]}>
              <DatePicker.RangePicker
                className="w-full h-[40px]"
                separator={'-'}
                format={DATE_FORMAT}
              />
            </Form.Item>
          </Col>

          <Col className="hidden sm:block" span={5}>
            <Form.Item name="location">
              <Select
                placeholder="Select area"
                allowClear={true}
                className="w-full h-[40px]"
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={formatToOptions(allowedAreas, 'title', 'id')}
              />
            </Form.Item>
          </Col>
          <Col className="hidden sm:block" span={5}>
            <Form.Item name="type">
              <Select
                placeholder="Select Status"
                allowClear={true}
                className="w-full h-[40px]"
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={attendanceRecordTypeOption}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {/* Mobile Filter Modal */}
      <Modal
        centered
        title="Filter Employees"
        open={showLeaveHistoryFilter}
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
        <Form form={mobileForm} layout="vertical">
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

          <Form.Item label="Area" name="location">
            <Select
              placeholder="Select area"
              allowClear={true}
              className="w-full h-[40px]"
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              options={formatToOptions(allowedAreas, 'title', 'id')}
            />
          </Form.Item>

          <Form.Item label="Status" name="type">
            <Select
              placeholder="Select Status"
              allowClear={true}
              className="w-full h-[40px]"
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              options={attendanceRecordTypeOption}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttendanceTableFilter;
