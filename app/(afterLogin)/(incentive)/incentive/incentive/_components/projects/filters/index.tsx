import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { useDebounce } from '@/utils/useDebounce';
import { SearchOutlined } from '@ant-design/icons';
import { Col, Input, Row, Select } from 'antd';
import React from 'react';

const IncentiveProjectsFilter: React.FC = () => {
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

  const handleCreatedByRecognition = (value: string) => {
    onSelectChange(value, 'byMonth');
  };
  const handleCreatedByYear = (value: string) => {
    onSelectChange(value, 'byYear');
  };
  const handleCreatedBySession = (value: string) => {
    onSelectChange(value, 'bySession');
  };
  const handleCreatedByProject = (value: string) => {
    onSelectChange(value, 'byProject');
  };

  return (
    <div className="my-4 ">
      <Row gutter={[16, 10]} justify="space-between">
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Input
            allowClear
            placeholder="Search Employee"
            onChange={(e) => handleSearchInput(e.target.value, 'employee_name')}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-full h-12"
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Row gutter={[8, 16]}>
            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
              <Select
                allowClear
                placeholder="Select Project"
                className="w-full h-12"
                onChange={handleCreatedByProject}
              >
                <Select.Option value="1">Option 1</Select.Option>
                <Select.Option value="2">Option 2</Select.Option>
                <Select.Option value="3">Option 3</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
              <Select
                allowClear
                placeholder="Select Recognition"
                className="w-full h-12"
                onChange={handleCreatedByRecognition}
              >
                <Select.Option value="1">Option 1</Select.Option>
                <Select.Option value="2">Option 2</Select.Option>
                <Select.Option value="3">Option 3</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
              <Select
                allowClear
                placeholder="Select Year"
                className="w-full h-12"
                onChange={handleCreatedByYear}
              >
                <Select.Option value="1">Option 1</Select.Option>
                <Select.Option value="2">Option 2</Select.Option>
                <Select.Option value="3">Option 3</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
              <Select
                allowClear
                placeholder="Select Session"
                className="w-full h-12"
                onChange={handleCreatedBySession}
              >
                <Select.Option value="1">Option 1</Select.Option>
                <Select.Option value="2">Option 2</Select.Option>
                <Select.Option value="3">Option 3</Select.Option>
              </Select>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default IncentiveProjectsFilter;
