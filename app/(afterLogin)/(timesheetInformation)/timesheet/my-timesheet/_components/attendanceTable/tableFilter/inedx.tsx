import React, { FC } from 'react';
import { Col, DatePicker, Form, Row, Select } from 'antd';
import { CommonObject } from '@/types/commons/commonObject';
import { formatToOptions } from '@/helpers/formatTo';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { attendanceRecordTypeOption } from '@/types/timesheet/attendance';
import { DATE_FORMAT } from '@/utils/constants';
import { MdKeyboardArrowDown } from 'react-icons/md';

interface AttendanceTableFilterProps {
  onChange: (val: CommonObject) => void;
}

const AttendanceTableFilter: FC<AttendanceTableFilterProps> = ({
  onChange,
}) => {
  const { allowedAreas } = useMyTimesheetStore();
  const [form] = Form.useForm();

  return (
    <Form form={form} onFieldsChange={() => onChange(form.getFieldsValue())}>
      <Row gutter={16}>
        <Col span={14}>
          <Form.Item name="date">
            <DatePicker.RangePicker
              className="w-full h-[54px]"
              separator={'-'}
              format={DATE_FORMAT}
            />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item name="location">
            <Select
              placeholder="Select area"
              allowClear={true}
              className="w-full h-[54px]"
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              options={formatToOptions(allowedAreas, 'title', 'id')}
            />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item name="type">
            <Select
              placeholder="Select Status"
              allowClear={true}
              className="w-full h-[54px]"
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              options={attendanceRecordTypeOption}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default AttendanceTableFilter;
