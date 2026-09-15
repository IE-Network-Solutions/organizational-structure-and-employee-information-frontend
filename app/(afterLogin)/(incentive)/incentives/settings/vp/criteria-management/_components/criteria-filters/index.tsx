'use client';

import React from 'react';
import { Input, Select } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

interface CriteriaFiltersProps {
  onSearch: (value: string) => void;
  onTypeChange: (value: string) => void;
  criteriaNames: string[];
}

const CriteriaFilters: React.FC<CriteriaFiltersProps> = ({
  onSearch,
  onTypeChange,
  criteriaNames,
}) => {
  const { Option } = Select;

  return (
    <div
      className="mb-5 w-full"
      id="okr-criteria-filters-container"
      data-cy="okr-criteria-filters-container"
    >
      <div
        className="flex items-center justify-between w-full gap-3"
        data-cy="okr-criteria-filters-row"
      >
        {/* Search */}
        <div
          className="w-full max-w-md"
          data-cy="okr-criteria-filters-search-wrapper"
        >
          <Input.Search
            placeholder="Search Name"
            onChange={(e) => onSearch(e.target.value)}
            allowClear
            size="large"
            id="okr-criteria-filters-search-input"
            data-cy="okr-criteria-filters-search-input"
          />
        </div>

        {/* Filter Select */}
        <div
          className="flex-shrink-0"
          data-cy="okr-criteria-filters-select-wrapper"
        >
          <Select
            placeholder={
              <div
                className="flex items-center gap-2"
                data-cy="okr-criteria-filters-select-placeholder"
              >
                <FilterOutlined data-cy="okr-criteria-filters-select-placeholder-icon" />
                <span
                  className="hidden sm:inline"
                  data-cy="okr-criteria-filters-select-placeholder-text"
                >
                  Filter
                </span>
              </div>
            }
            onChange={onTypeChange}
            allowClear
            size="large"
            suffixIcon={null}
            style={{ minWidth: 44 }}
            className="[&_.ant-select-selection-placeholder]:!text-gray-600 [&_.ant-select-selection-placeholder]:!opacity-100"
            id="okr-criteria-filters-select"
            data-cy="okr-criteria-filters-select"
            dropdownMatchSelectWidth={false}
          >
            {criteriaNames?.map((name) => (
              <Option
                key={name}
                value={name}
                id={`okr-criteria-filters-select-option-${name}`}
                data-cy={`okr-criteria-filters-select-option-${name}`}
              >
                {name}
              </Option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CriteriaFilters;
