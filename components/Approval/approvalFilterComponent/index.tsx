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
    <Row gutter={[16, 24]} justify="space-between">
      <Col xl={10} lg={12} md={24}>
        <div className="w-full">
          <Input
            id={`inputEmployeeNames${searchParams.name}`}
            placeholder="Search workflow name"
            onChange={(e) => handleSearchInput(e.target.value, 'name')}
            className="w-full h-14"
            allowClear
          />
        </div>
      </Col>

      <Col xl={8} lg={12} md={24}>
        <Select
          id={`selectDepartment${searchParams.entityType}`}
          placeholder="Applied For"
          onChange={handleDepartmentChange}
          allowClear
          className="w-full h-14"
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
