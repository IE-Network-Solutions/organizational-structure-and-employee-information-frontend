import React from 'react';
import { Col, DatePicker, Row, Select } from 'antd';

const AttendanceTableFilter = () => {
  return (
    <Row gutter={16}>
      <Col span={14}>
        <DatePicker.RangePicker
          className="w-full h-[54px]"
          separator={'-'}
          format="DD MMM YYYY"
        />
      </Col>
      <Col span={5}>
        <Select placeholder="Select area" className="w-full h-[54px]">
          <Select.Option value="all">Allowed Areas</Select.Option>
        </Select>
      </Col>
      <Col span={5}>
        <Select placeholder="Select Status" className="w-full h-[54px]">
          <Select.Option value="all">All Statuses</Select.Option>
        </Select>
      </Col>
    </Row>
  );
};

export default AttendanceTableFilter;
