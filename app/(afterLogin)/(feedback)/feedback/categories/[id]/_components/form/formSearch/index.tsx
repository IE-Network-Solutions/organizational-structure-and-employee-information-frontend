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
    <div id="form-search-container" data-cy="form-search-container" className="my-2">
      <Row
        id="form-search-row"
        data-cy="form-search-row"
        gutter={[16, 24]}
        justify="space-between"
        className="bg-white py-4"
      >
        <Col id="form-search-input-col" data-cy="form-search-input-col" xs={24} sm={24} lg={10}>
          <Input
            id="form-search-input"
            data-cy="form-search-input"
            allowClear
            placeholder="Search Forms"
            onChange={(e) => handleSearchInput(e.target.value, 'form_name')}
            prefix={
              <SearchOutlined
                id="form-search-icon"
                data-cy="form-search-icon"
                className="text-gray-400"
              />
            }
            className="w-full h-12"
          />
        </Col>
      </Row>
    </div>
  );
};

export default FormSearch;
