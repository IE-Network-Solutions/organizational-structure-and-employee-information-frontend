import { Col, Input, Row, Select } from 'antd';
import React from 'react';

interface CriteriaFiltersProps {}

const Filters = () => {
  const { Option } = Select;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {};

  const handleTypeChange = (value: string) => {};

  return (
    <div className="mb-6">
      <Row
        gutter={[16, 16]}
        align="middle"
        justify="space-between"
        style={{ flexWrap: 'nowrap' }}
      >
        <Col lg={16} md={14} sm={24} xs={24}>
          <Input
            placeholder="Search Department"
            onChange={handleSearch}
            allowClear
            className="w-full h-14"
            style={{ height: '48px' }}
          />
        </Col>

        <Col lg={4} md={5} sm={24} xs={24}>
          <Select
            placeholder="All Departments"
            onChange={handleTypeChange}
            allowClear
            className="w-full h-14"
            style={{ height: '48px' }}
          >
            <Option value="product">Product</Option>
            <Option value="engineering">Engineering</Option>
          </Select>
        </Col>

        <Col lg={4} md={5} sm={24} xs={24}>
          <Select
            placeholder="Filters"
            onChange={handleTypeChange}
            allowClear
            className="w-full h-14"
            style={{ height: '48px' }}
          >
            <Option value="product">Product</Option>
            <Option value="engineering">Engineering</Option>
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default Filters;
