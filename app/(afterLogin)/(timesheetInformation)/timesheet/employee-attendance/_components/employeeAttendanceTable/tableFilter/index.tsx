import React, { FC } from 'react';
import { Button, Col, DatePicker, Form, Row, Select } from 'antd';
import { attendanceRecordTypeOption } from '@/types/timesheet/attendance';
import { DATE_FORMAT } from '@/utils/constants';
import { CommonObject } from '@/types/commons/commonObject';

interface TableFilterProps {
  onChange: (val: CommonObject) => void;
}

const TableFilter: FC<TableFilterProps> = ({ onChange }) => {
  const [form] = Form.useForm();

  return (
    <Form form={form} onFieldsChange={() => onChange(form.getFieldsValue())}>
      <Row gutter={[40, 10]} align="middle">
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
          <Form.Item name="type">
            <Select
              placeholder="Select Status"
              allowClear={true}
              className="w-full h-[54px]"
              options={attendanceRecordTypeOption}
            />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Button
            className="w-full"
            disabled={true}
            size="large"
            type="primary"
            htmlType="button"
          >
            Approve
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default TableFilter;
