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
    <div className="flex items-center justify-between">
      <div>Select Employee</div>
      <div>
        <Input
          allowClear
          placeholder="Search user"
          onChange={(e) => handleSearchInput(e.target.value, 'user_name')}
          prefix={<SearchOutlined className="text-gray-400" />}
          className="w-full h-12"
        />
      </div>
    </div>
  );
};

export default SelectEmployeeSearch;
