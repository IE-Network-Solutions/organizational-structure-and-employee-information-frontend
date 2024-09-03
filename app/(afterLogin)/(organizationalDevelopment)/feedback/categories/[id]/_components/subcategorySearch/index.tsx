'use client';
import { Col, Input, Row, Select } from 'antd';
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

const SubcategorySearch: React.FC = () => {
  return (
    <div className="my-2">
      <Row gutter={[16, 24]} justify="space-between" className="bg-white py-4">
        <Col xs={24} sm={24} lg={10}>
          <Input
            allowClear
            placeholder="Search Subcategory"
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-full h-12"
          />
        </Col>
        <Col xs={24} sm={24} lg={12}>
          <Row gutter={[16, 24]} justify="end">
            <Col xs={24} sm={12} lg={8}>
              <Select
                allowClear
                placeholder="Select department"
                defaultValue="all-department"
                className="w-full h-12"
              >
                <Option value="all-department">All Department</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Select
                allowClear
                placeholder="Select status"
                defaultValue="all-status"
                className="w-full h-12"
              >
                <Option value="all-status">All Status</Option>
              </Select>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default SubcategorySearch;
