'use client';
import { Col, Input, Row, Select } from 'antd';
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { useFetchUsers } from '@/store/server/features/feedback/category/queries';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { useDebounce } from '@/utils/useDebounce';

const { Option } = Select;

const FormSearch: React.FC = () => {
  const { searchFormParams, setSearchFormParams } = CategoriesManagementStore();

  const { data: users } = useFetchUsers();
  const handleSearchForms = async (
    value: string | boolean,
    keyValue: keyof typeof searchFormParams,
  ) => {
    setSearchFormParams(keyValue, value);
  };
  const onSearchChange = useDebounce(handleSearchForms, 2000);
  const onSelectChange = handleSearchForms;

  const handleSearchInput = (
    value: string,
    keyValue: keyof typeof searchFormParams,
  ) => {
    const trimmedValue = value.trim();
    onSearchChange(trimmedValue, keyValue);
  };
  const handleCreatedBySearch = (value: string) => {
    onSelectChange(value, 'createdBy');
  };

  return (
    <div className="my-2">
      <Row gutter={[16, 24]} justify="space-between" className="bg-white py-4">
        <Col xs={24} sm={24} lg={10}>
          <Input
            allowClear
            placeholder="Search Subcategory"
            onChange={(e) => handleSearchInput(e.target.value, 'form_name')}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-full h-12"
          />
        </Col>
        <Col lg={8} md={14} xs={24}>
          <Select
            allowClear
            placeholder="Select Users"
            className="w-full h-12"
            onChange={handleCreatedBySearch}
          >
            {users?.items?.map((item: any) => (
              <Option key={item?.id} value={item?.id}>
                {item?.firstName + ' ' + item?.middleName}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default FormSearch;
