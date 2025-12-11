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
    <div
      className="flex items-center justify-end"
      id="okr-criteriafilter-container-display-div"
      data-cy="okr-criteriafilter-container-display-div"
    >
      <Select
        id={`okr-criteriafilter-select-display-select-${searchParams?.selectedRange || 'default'}`}
        placeholder="Select Filter"
        defaultValue="monthly"
        allowClear
        onChange={handleCriteriaFilter}
        data-cy={`okr-criteriafilter-select-display-select-${searchParams?.selectedRange || 'default'}`}
      >
        {FilterOptions.map((option) => (
          <Select.Option
            id={`okr-criteriafilter-option-display-option-${option.key}`}
            key={option.key}
            value={option.value}
            data-cy={`okr-criteriafilter-option-display-option-${option.key}`}
          >
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default CriteriaFilter;
