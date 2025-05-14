import { EntityTypeList } from '@/store/server/features/approver/interface';
import { Col, Input, Row, Select } from 'antd';
import React from 'react';

const ApprovalFilterComponent = ({
  searchParams,
  handleSearchInput,
  handleDepartmentChange,
}: {
  searchParams: any;
  handleSearchInput: (value: string, keyValue: any) => void;

  handleDepartmentChange: (value: string) => void;
}) => {
  const EntityType: EntityTypeList[] = [
    {
      name: 'Department',
    },
    {
      name: 'Hierarchy',
    },
    {
      name: 'User',
    },
  ];
  const { Option } = Select;

  return (
    <Row gutter={16} justify="space-between">
      <Col xl={18} lg={18} md={18} sm={16} xs={16}>
        <Input
          id={`inputEmployeeNames${searchParams.name}`}
          placeholder="Search workflow name"
          onChange={(e) => handleSearchInput(e.target.value, 'name')}
          className="w-full h-10"
          allowClear
        />
      </Col>

      <Col xl={6} lg={6} md={6} sm={8} xs={8}>
        <Select
          id={`selectDepartment${searchParams.entityType}`}
          placeholder="Applied For"
          onChange={handleDepartmentChange}
          allowClear
          className="w-full h-10"
        >
          {EntityType?.map((item: any, index) => (
            <Option key={index} value={item?.name}>
              {item?.name}
            </Option>
          ))}
        </Select>
      </Col>
    </Row>
  );
};

export default ApprovalFilterComponent;
