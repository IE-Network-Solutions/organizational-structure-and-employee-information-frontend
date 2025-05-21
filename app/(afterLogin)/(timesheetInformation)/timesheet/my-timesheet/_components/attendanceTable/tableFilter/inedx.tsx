import React, { FC } from 'react';
import { Button, Col, DatePicker, Form, Modal, Row, Select } from 'antd';
import { CommonObject } from '@/types/commons/commonObject';
import { formatToOptions } from '@/helpers/formatTo';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { attendanceRecordTypeOption } from '@/types/timesheet/attendance';
import { DATE_FORMAT } from '@/utils/constants';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { LuSettings2 } from 'react-icons/lu';

interface AttendanceTableFilterProps {
  onChange: (val: CommonObject) => void;
}

const AttendanceTableFilter: FC<AttendanceTableFilterProps> = ({
  onChange,
}) => {
  const { allowedAreas } = useMyTimesheetStore();
  const [form] = Form.useForm();
  const { isMobileFilterVisible, setIsMobileFilterVisible } =
    useEmployeeManagementStore();

  return (
    <div>
      <Form form={form} onFieldsChange={() => onChange(form.getFieldsValue())}>
        <Row gutter={16}>
          <Col className="block sm:hidden">
            <Button
              type="default"
              className="sm:hidden flex justify-center w-10 h-10 hover:bg-gray-100 border-gray-200"
              icon={<LuSettings2 className="text-gray-600" />}
              onClick={() => setIsMobileFilterVisible(!isMobileFilterVisible)}
            />
          </Col>

          <Col className="hidden sm:block" span={14}>
            <Form.Item name="date">
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
                className="w-full h-[40px] "
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={attendanceRecordTypeOption}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Modal
        centered
        title="Filter Employees"
        open={isMobileFilterVisible}
        onCancel={() => setIsMobileFilterVisible(false)}
        width="85%"
        footer={
          <div className="flex justify-center items-center space-x-4">
            <Button
              type="default"
              className="px-3"
              onClick={() => setIsMobileFilterVisible(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setIsMobileFilterVisible(false)}
              type="primary"
              className="px-3"
            >
              Filter
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          onFieldsChange={() => onChange(form.getFieldsValue())}
        >
          <Form.Item name="startDate">
            <DatePicker
              className="w-full sm:w-auto h-[40px]"
              placeholder="Start Date"
              format={DATE_FORMAT}
              size="small"
              onChange={(startDate) => {
                const endDate = form.getFieldValue('endDate');
                if (startDate && endDate) {
                  form.setFieldsValue({ date: [startDate, endDate] });
                }
              }}
            />
          </Form.Item>

          <Form.Item name="endDate">
            <DatePicker
              className="w-full sm:w-auto h-[40px]"
              placeholder="End Date"
              format={DATE_FORMAT}
              size="small"
              onChange={(endDate) => {
                const startDate = form.getFieldValue('startDate');
                if (startDate && endDate) {
                  form.setFieldsValue({ date: [startDate, endDate] });
                }
              }}
            />
          </Form.Item>
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
          <Form.Item name="type">
            <Select
              placeholder="Select Status"
              allowClear={true}
              className="w-full h-[40px] "
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
