import React from 'react';
import { Col, DatePicker, Row, Select } from 'antd';

const HistoryTableFilter = () => {
  return (
    <Row gutter={16}>
      <Col span={8}>
        <DatePicker.RangePicker
          className="w-full h-[54px]"
          separator={'-'}
          format="DD MMM YYYY"
        />
      </Col>
      <Col span={8}>
        <Select placeholder="Select Type" className="w-full h-[54px]">
          <Select.Option value="all">All Type</Select.Option>
        </Select>
      </Col>
      <Col span={8}>
        <Select placeholder="Select Status" className="w-full h-[54px]">
          <Select.Option value="all">All Statuses</Select.Option>
        </Select>
      </Col>
    </Row>
  );
};

export default HistoryTableFilter;
