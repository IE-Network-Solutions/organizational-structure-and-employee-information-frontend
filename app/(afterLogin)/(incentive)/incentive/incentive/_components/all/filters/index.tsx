import { Col, Input, Row, Select } from 'antd';
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { useDebounce } from '@/utils/useDebounce';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';

const IncentiveFilter: React.FC = () => {
  const { searchParams, setSearchParams } = useIncentiveStore();
  const handleSearchCategory = async (
    value: string | boolean,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };

  const onSearchChange = useDebounce(handleSearchCategory, 2000);
  const onSelectChange = handleSearchCategory;

  const handleSearchInput = (
    value: string,
    keyValue: keyof typeof searchParams,
  ) => {
    const trimmedValue = value.trim();
    onSearchChange(trimmedValue, keyValue);
  };

  const handleCreatedByMonth = (value: string) => {
    onSelectChange(value, 'byMonth');
  };
  const handleCreatedByYear = (value: string) => {
    onSelectChange(value, 'byYear');
  };
  const handleCreatedBySession = (value: string) => {
    onSelectChange(value, 'bySession');
  };
  return (
    <div className="my-4">
      <Row gutter={[16, 10]}>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Input
            allowClear
            placeholder="Search Employee"
            onChange={(e) => handleSearchInput(e.target.value, 'employee_name')}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-full h-12"
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={5} xl={5}>
          <Select
            allowClear
            placeholder="Select Year "
            className="w-full h-12"
            onChange={handleCreatedByYear}
          >
            <Select.Option value="1">Option 1</Select.Option>
            <Select.Option value="2">Option 2</Select.Option>
            <Select.Option value="3">Option 3</Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={24} lg={5} xl={5}>
          <Select
            allowClear
            placeholder="Select Session "
            className="w-full h-12"
            onChange={handleCreatedBySession}
          >
            <Select.Option value="1">Option 1</Select.Option>
            <Select.Option value="2">Option 2</Select.Option>
            <Select.Option value="3">Option 3</Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={24} lg={5} xl={5}>
          <Select
            allowClear
            placeholder="Select Month "
            className="w-full h-12"
            onChange={handleCreatedByMonth}
          >
            <Select.Option value="1">Option 1</Select.Option>
            <Select.Option value="2">Option 2</Select.Option>
            <Select.Option value="3">Option 3</Select.Option>
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default IncentiveFilter;
