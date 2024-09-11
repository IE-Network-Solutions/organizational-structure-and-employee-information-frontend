import React, { FC } from 'react';
import { Col, DatePicker, Form, Row, Select } from 'antd';
import { DATE_FORMAT } from '@/utils/constants';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { formatToOptions } from '@/helpers/formatTo';
import { CommonObject } from '@/types/commons/commonObject';
import { LeaveRequestStatusOption } from '@/types/timesheet/settings';
import { MdKeyboardArrowDown } from 'react-icons/md';

interface HistoryTableFilterProps {
  onChange: (val: CommonObject) => void;
}

const HistoryTableFilter: FC<HistoryTableFilterProps> = ({ onChange }) => {
  const { leaveTypes } = useMyTimesheetStore();
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFieldsChange={() => {
        onChange(form.getFieldsValue());
      }}
    >
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="dateRange">
            <DatePicker.RangePicker
              className="w-full h-[54px]"
              separator={'-'}
              format={DATE_FORMAT}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="type">
            <Select
              placeholder="Select Type"
              className="w-full h-[54px]"
              allowClear={true}
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              options={formatToOptions(leaveTypes ?? [], 'title', 'id')}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="status">
            <Select
              placeholder="Select Status"
              className="w-full h-[54px]"
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
};

export default HistoryTableFilter;
