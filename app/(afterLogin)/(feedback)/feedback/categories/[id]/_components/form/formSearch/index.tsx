'use client';
import { Col, Input, Row } from 'antd';
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { useDebounce } from '@/utils/useDebounce';



const FormSearch: React.FC = () => {
  const { searchFormParams, setSearchFormParams } = CategoriesManagementStore();
  const handleSearchForms = async (
    value: string | boolean,
    keyValue: keyof typeof searchFormParams,
  ) => {
    setSearchFormParams(keyValue, value);
  };
  const onSearchChange = useDebounce(handleSearchForms, 2000);

  const handleSearchInput = (
    value: string,
    keyValue: keyof typeof searchFormParams,
  ) => {
    const trimmedValue = value.trim();
    onSearchChange(trimmedValue, keyValue);
  };


  return (
    <div className="my-2">
      <Row gutter={[16, 24]} justify="space-between" className="bg-white py-4">
        <Col xs={24} sm={24} lg={10}>
          <Input
            allowClear
            placeholder="Search Forms"
            onChange={(e) => handleSearchInput(e.target.value, 'form_name')}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-full h-12"
          />
        </Col>
     
      </Row>
    </div>
  );
};

export default FormSearch;
