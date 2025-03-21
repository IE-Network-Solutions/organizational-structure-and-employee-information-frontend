import { useVariablePayStore } from '@/store/uistate/features/okrplanning/VP';
import { FilterOptions } from '@/types/enumTypes';
import { Select } from 'antd';
import React from 'react';

const CriteriaFilter: React.FC = () => {
  const { searchParams, setSearchParams } = useVariablePayStore();

  const handleFilterCriteria = async (
    value: string | boolean,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };
  const onselectionchange = handleFilterCriteria;

  const handleCriteriaFilter = (value: string) => {
    onselectionchange(value, 'selectedRange');
  };
  return (
    <div className="flex items-center justify-end">
      <Select
        id={`selectedRange${searchParams?.selectedRange}`}
        placeholder="Select Filter"
        defaultValue="monthly"
        allowClear
        onChange={handleCriteriaFilter}
      >
        {FilterOptions.map((option) => (
          <Select.Option
            id={`selectedRange${searchParams?.selectedRange}`}
            key={option.key}
            value={option.value}
          >
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default CriteriaFilter;
