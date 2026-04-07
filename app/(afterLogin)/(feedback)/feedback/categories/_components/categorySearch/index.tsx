'use client';
import { Col, Input, Row } from 'antd';
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { useDebounce } from '@/utils/useDebounce';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';

const CategorySearch = () => {
  const { searchParams, setSearchParams } = CategoriesManagementStore();

  const handleSearchCategory = async (
    value: string | boolean,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };

  const onSearchChange = useDebounce(handleSearchCategory, 2000);

  const handleSearchInput = (
    value: string,
    keyValue: keyof typeof searchParams,
  ) => {
    const trimmedValue = value.trim();
    onSearchChange(trimmedValue, keyValue);
  };

  return (
    <div
      className="my-2"
      data-cy="feedback-categories-components-categorysearch-div"
      id="feedback-categories-components-categorysearch-div"
    >
      <Row
        gutter={[16, 24]}
        justify="space-between"
        className="py-4"
        data-cy="feedback-categories-components-categorysearch-row"
        id="feedback-categories-components-categorysearch-row"
      >
        <Col
          lg={12}
          md={10}
          xs={24}
          data-cy="feedback-categories-components-categorysearch-col"
          id="feedback-categories-components-categorysearch-col"
        >
          <Input
            allowClear
            placeholder="Search Categories"
            onChange={(e) => handleSearchInput(e.target.value, 'category_name')}
            prefix={
              <SearchOutlined
                className="text-gray-400"
                data-cy="feedback-categories-components-categorysearch-icon-search"
                id="feedback-categories-components-categorysearch-icon-search"
              />
            }
            className="w-full h-12"
            data-cy="feedback-categories-components-categorysearch-input"
            id="feedback-categories-components-categorysearch-input"
          />
        </Col>
      </Row>
    </div>
  );
};

export default CategorySearch;
