'use client';
import { Input } from 'antd';
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
      className="w-[299px] h-8"
      data-cy="feedback-categories-components-categorysearch-div"
      id="feedback-categories-components-categorysearch-div"
    >
      <Input
        allowClear
        placeholder="Search Category..."
        onChange={(e) => handleSearchInput(e.target.value, 'category_name')}
        className="h-8 rounded-md [&_.ant-input]:h-8 [&_.ant-input]:text-[12px] [&_.ant-input-group-addon]:p-0 [&_.ant-input-group-addon]:bg-white [&_.ant-input-group-addon]:border-l-0"
        addonAfter={
          <button
            type="button"
            className="h-8 w-8 flex items-center justify-center border-l border-[#E5E7EB] text-gray-500 hover:text-gray-700"
            aria-label="Search"
            data-cy="feedback-categories-components-categorysearch-btn-search"
            id="feedback-categories-components-categorysearch-btn-search"
          >
            <SearchOutlined
              data-cy="feedback-categories-components-categorysearch-icon-search"
              id="feedback-categories-components-categorysearch-icon-search"
            />
          </button>
        }
        data-cy="feedback-categories-components-categorysearch-input"
        id="feedback-categories-components-categorysearch-input"
      />
    </div>
  );
};

export default CategorySearch;
