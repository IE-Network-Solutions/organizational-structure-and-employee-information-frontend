'use client';
/* eslint-disable local-rules/data-cy-required, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */
import { Input } from 'antd';
import React, { useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { useDebounce } from '@/utils/useDebounce';

interface FormSearchProps {
  categoryId: string;
  'data-cy'?: string;
}

const FormSearch: React.FC<FormSearchProps> = ({
  categoryId,
  'data-cy': dataCy,
}) => {
  const {
    searchFormParams,
    setSearchFormParams,
    searchFormDraft,
    setSearchFormDraft,
  } = CategoriesManagementStore();

  const handleSearchForms = async (
    value: string | boolean,
    keyValue: keyof typeof searchFormParams,
  ) => {
    setSearchFormParams(keyValue, value);
  };
  const onSearchChange = useDebounce(handleSearchForms, 2000);

  useEffect(() => {
    CategoriesManagementStore.getState().setSearchFormDraft('');
    CategoriesManagementStore.getState().setSearchFormParams('form_name', '');
  }, [categoryId]);

  const handleSearchInput = (
    value: string,
    keyValue: keyof typeof searchFormParams,
  ) => {
    setSearchFormDraft(value);
    const trimmedValue = value.trim();
    onSearchChange(trimmedValue, keyValue);
  };

  return (
    <div
      id="form-search-container"
      data-cy={dataCy ?? 'form-search-container'}
      className="flex h-10 w-[300px] max-w-full shrink-0 items-stretch overflow-hidden rounded-md border border-gray-200 bg-white transition-colors focus-within:border-[#1e40af]/40"
    >
      <Input
        id="form-search-input"
        data-cy="form-search-input"
        allowClear
        variant="borderless"
        placeholder="Search Form"
        value={searchFormDraft}
        onChange={(e) => handleSearchInput(e.target.value, 'form_name')}
        className="min-w-0 flex-1 !bg-transparent px-3 text-sm shadow-none placeholder:text-gray-400"
        classNames={{
          input: '!shadow-none',
        }}
      />
      <div
        className="flex w-10 shrink-0 items-center justify-center border-l border-gray-200 bg-white"
        aria-hidden
      >
        <SearchOutlined
          id="form-search-icon"
          data-cy="form-search-icon"
          className="text-base text-gray-800"
        />
      </div>
    </div>
  );
};

export default FormSearch;
