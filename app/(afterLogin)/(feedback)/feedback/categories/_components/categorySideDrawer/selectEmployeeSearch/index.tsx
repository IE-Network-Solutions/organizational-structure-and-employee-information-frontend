import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { useDebounce } from '@/utils/useDebounce';
import { Input } from 'antd';
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';

const SelectEmployeeSearch: React.FC = () => {
  const { searchUserParams, setSearchUserParams } = CategoriesManagementStore();

  const handleSearchUsers = async (
    value: string,
    keyValue: keyof typeof searchUserParams,
  ) => {
    setSearchUserParams(keyValue, value);
  };

  const onSearchChange = useDebounce(handleSearchUsers, 2000);

  const handleSearchInput = (
    value: string,
    keyValue: keyof typeof searchUserParams,
  ) => {
    const trimmedValue = value.trim();
    onSearchChange(trimmedValue, keyValue);
  };

  return (
    <div
      className="flex items-center justify-between"
      data-cy="feedback-categories-components-categorysidedrawer-selectemployeesearch-div"
      id="feedback-categories-components-categorysidedrawer-selectemployeesearch-div"
    >
      <div
        data-cy="feedback-categories-components-categorysidedrawer-selectemployeesearch-div-label"
        id="feedback-categories-components-categorysidedrawer-selectemployeesearch-div-label"
      >
        Select Employee
      </div>
      <div
        data-cy="feedback-categories-components-categorysidedrawer-selectemployeesearch-div-input-container"
        id="feedback-categories-components-categorysidedrawer-selectemployeesearch-div-input-container"
      >
        <Input
          allowClear
          placeholder="Search user"
          onChange={(e) => handleSearchInput(e.target.value, 'user_name')}
          prefix={
            <SearchOutlined
              className="text-gray-400"
              data-cy="feedback-categories-components-categorysidedrawer-selectemployeesearch-icon-search"
              id="feedback-categories-components-categorysidedrawer-selectemployeesearch-icon-search"
            />
          }
          className="w-full h-12"
          data-cy="feedback-categories-components-categorysidedrawer-selectemployeesearch-input"
          id="feedback-categories-components-categorysidedrawer-selectemployeesearch-input"
        />
      </div>
    </div>
  );
};

export default SelectEmployeeSearch;
