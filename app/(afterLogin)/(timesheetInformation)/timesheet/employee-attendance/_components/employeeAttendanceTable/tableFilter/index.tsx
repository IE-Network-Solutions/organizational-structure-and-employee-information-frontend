import React from 'react';
import { Button, Col, DatePicker, Row, Select } from 'antd';

const TableFilter = () => {
  return (
    <Row gutter={[40, 10]} align="middle">
      <Col span={14}>
        <DatePicker.RangePicker
          className="w-full h-[54px]"
          separator={'-'}
          format="DD MMM YYYY"
        />
      </Col>
      <Col span={5}>
        <Select placeholder="Select Status" className="w-full h-[54px]">
          <Select.Option value="all">All Statuses</Select.Option>
        </Select>
      </Col>
      <Col span={5}>
        <Button className="w-full" disabled={true} size="large" type="primary">
          Approve
        </Button>
      </Col>
    </Row>
  );
};

export default TableFilter;
