import { Col, Input, Row, Select } from 'antd';
import React from 'react';

const TargetFilters = () => {
  const { Option } = Select;
  return (
    <div className="mb-6">
      <Row gutter={[16, 24]} justify="space-between">
        <Col lg={18} sm={24} xs={24}>
          <div className="w-full">
            <Input
              placeholder="Search"
              onChange={() => {}}
              className="w-full h-14"
              allowClear
            />
          </div>
        </Col>

        <Col lg={4} sm={24} xs={24}>
          <Select
            placeholder="All Types"
            onChange={() => {}}
            allowClear
            className="w-full h-14"
          >
            <Option value="all">All types</Option>
            <Option value="type1">Type 1</Option>
            <Option value="type2">Type 2</Option>
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default TargetFilters;
