'use client';
import { Col, Input, Row, Select } from 'antd';
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { useDebounce } from '@/utils/useDebounce';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { useFetchUsers } from '@/store/server/features/feedback/category/queries';

const { Option } = Select;

const CategorySearch = () => {
  const { searchParams, setSearchParams } = CategoriesManagementStore();
  const { data: users } = useFetchUsers();
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

  const handleCreatedBySearch = (value: string) => {
    onSelectChange(value, 'createdBy');
  };

  return (
    <div className="my-2">
      <Row gutter={[16, 24]} justify="space-between" className="py-4">
        <Col lg={12} md={10} xs={24}>
          <Input
            allowClear
            placeholder="Search Categories"
            onChange={(e) => handleSearchInput(e.target.value, 'category_name')}
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

export default CategorySearch;
