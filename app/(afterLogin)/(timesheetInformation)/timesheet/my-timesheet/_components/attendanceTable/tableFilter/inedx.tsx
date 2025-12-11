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
    <div
      id="time-attendance-attendance-table-filter-container"
      data-cy="time-attendance-attendance-table-filter-container"
    >
      {/* Desktop Filters */}
      <Form
        form={form}
        onFieldsChange={() => onChange(form.getFieldsValue())}
        id="time-attendance-attendance-table-filter-form"
        data-cy="time-attendance-attendance-table-filter-form"
      >
        <Row id="time-attendance-attendance-table-filter-row" data-cy="time-attendance-attendance-table-filter-row" gutter={16} align="middle">
          <Col id="time-attendance-attendance-table-filter-mobile-button-col" data-cy="time-attendance-attendance-table-filter-mobile-button-col" className="block sm:hidden">
            <Button
              type="default"
              className="flex justify-center w-10 h-10 hover:bg-gray-100 border-gray-200"
              icon={<LuSettings2 data-cy="time-attendance-attendance-table-filter-mobile-button-icon" className="text-gray-600" />}
              onClick={() => {
                mobileForm.setFieldsValue(form.getFieldsValue());
                setShowLeaveHistoryFilter(true);
              }}
              id="time-attendance-attendance-table-filter-mobile-button"
              data-cy="time-attendance-attendance-table-filter-mobile-button"
            />
          </Col>

          <Col className="hidden sm:block" span={14}>
            <Form.Item
              name="date"
              rules={[{ validator: validateDateRange }]}
              id="time-attendance-attendance-table-filter-date"
              data-cy="time-attendance-attendance-table-filter-date"
            >
              <DatePicker.RangePicker
                className="w-full h-[40px]"
                separator={'-'}
                format={DATE_FORMAT}
                id="time-attendance-attendance-table-filter-date-picker"
                data-cy="time-attendance-attendance-table-filter-date-picker"
              />
            </Form.Item>
          </Col>

          <Col className="hidden sm:block" span={5}>
            <Form.Item
              name="location"
              id="time-attendance-attendance-table-filter-location"
              data-cy="time-attendance-attendance-table-filter-location"
            >
              <Select
                placeholder="Select area"
                allowClear={true}
                className="w-full h-[40px]"
                suffixIcon={
                  <MdKeyboardArrowDown data-cy="time-attendance-attendance-table-filter-location-select-icon" size={16} className="text-gray-900" />
                }
                options={formatToOptions(allowedAreas, 'title', 'id')}
                id="time-attendance-attendance-table-filter-location-select"
                data-cy="time-attendance-attendance-table-filter-location-select"
              />
            </Form.Item>
          </Col>
          <Col className="hidden sm:block" span={5}>
            <Form.Item
              name="type"
              id="time-attendance-attendance-table-filter-type"
              data-cy="time-attendance-attendance-table-filter-type"
            >
              <Select
                placeholder="Select Status"
                allowClear={true}
                className="w-full h-[40px]"
                suffixIcon={
                  <MdKeyboardArrowDown data-cy="time-attendance-attendance-table-filter-type-select-icon" size={16} className="text-gray-900" />
                }
                options={attendanceRecordTypeOption}
                id="time-attendance-attendance-table-filter-type-select"
                data-cy="time-attendance-attendance-table-filter-type-select"
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
        data-cy="time-attendance-attendance-table-filter-mobile-modal"
        footer={
          <div
            className="flex justify-center items-center space-x-4"
            id="time-attendance-attendance-table-filter-mobile-modal-footer"
            data-cy="time-attendance-attendance-table-filter-mobile-modal-footer"
          >
            <Button
              type="default"
              className="px-3"
              onClick={handleReset}
              id="time-attendance-attendance-table-filter-mobile-reset-button"
              data-cy="time-attendance-attendance-table-filter-mobile-reset-button"
            >
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              type="primary"
              className="px-3"
              id="time-attendance-attendance-table-filter-mobile-filter-button"
              data-cy="time-attendance-attendance-table-filter-mobile-filter-button"
            >
              Filter
            </Button>
          </div>
        }
      >
        <Form
          form={mobileForm}
          layout="vertical"
          id="time-attendance-attendance-table-filter-mobile-form"
          data-cy="time-attendance-attendance-table-filter-mobile-form"
        >
          <Form.Item
            label="Start Date"
            name="startDate"
            id="time-attendance-attendance-table-filter-mobile-start-date"
            data-cy="time-attendance-attendance-table-filter-mobile-start-date"
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
              id="time-attendance-attendance-table-filter-mobile-start-date-picker"
              data-cy="time-attendance-attendance-table-filter-mobile-start-date-picker"
            />
          </Form.Item>

          <Form.Item
            label="End Date"
            name="endDate"
            id="time-attendance-attendance-table-filter-mobile-end-date"
            data-cy="time-attendance-attendance-table-filter-mobile-end-date"
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
              id="time-attendance-attendance-table-filter-mobile-end-date-picker"
              data-cy="time-attendance-attendance-table-filter-mobile-end-date-picker"
            />
          </Form.Item>

          <Form.Item
            label="Area"
            name="location"
            id="time-attendance-attendance-table-filter-mobile-location"
            data-cy="time-attendance-attendance-table-filter-mobile-location"
          >
            <Select
              placeholder="Select area"
              allowClear={true}
              className="w-full h-[40px]"
              suffixIcon={
                <MdKeyboardArrowDown data-cy="time-attendance-attendance-table-filter-mobile-location-select-icon" size={16} className="text-gray-900" />
              }
              options={formatToOptions(allowedAreas, 'title', 'id')}
              id="time-attendance-attendance-table-filter-mobile-location-select"
              data-cy="time-attendance-attendance-table-filter-mobile-location-select"
            />
          </Form.Item>

          <Form.Item
            label="Status"
            name="type"
            id="time-attendance-attendance-table-filter-mobile-type"
            data-cy="time-attendance-attendance-table-filter-mobile-type"
          >
            <Select
              placeholder="Select Status"
              allowClear={true}
              className="w-full h-[40px]"
              suffixIcon={
                <MdKeyboardArrowDown data-cy="time-attendance-attendance-table-filter-mobile-type-select-icon" size={16} className="text-gray-900" />
              }
              options={attendanceRecordTypeOption}
              id="time-attendance-attendance-table-filter-mobile-type-select"
              data-cy="time-attendance-attendance-table-filter-mobile-type-select"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttendanceTableFilter;
