import { Input, Select } from 'antd';
import React from 'react';
import { LuFilter } from 'react-icons/lu';
import { SearchOutlined } from '@ant-design/icons';

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleTypeChange = (value: string) => {
    onTypeChange(value);
  };

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
        {/* Search Input on the Left */}
        <div
          className="w-full max-w-md"
          data-cy="okr-criteria-filters-search-wrapper"
        >
          <Input
            placeholder="Search Name"
            onChange={handleSearch}
            allowClear
            addonAfter={<SearchOutlined />}
            className="w-full h-11 custom-search-input-v2"
            id="okr-criteria-filters-search-input"
            data-cy="okr-criteria-filters-search-input"
          />
        </div>

        {/* Filter Select on the Right */}
        <div
          className="flex-shrink-0"
          data-cy="okr-criteria-filters-select-wrapper"
        >
          <Select
            placeholder={
              <div
                className="flex items-center gap-2 text-[#595959]"
                data-cy="okr-criteria-filters-select-placeholder"
              >
                <LuFilter
                  className="text-[16px]"
                  data-cy="okr-criteria-filters-select-placeholder-icon"
                />
                <span
                  className="text-[14px] hidden sm:inline"
                  data-cy="okr-criteria-filters-select-placeholder-text"
                >
                  Filter
                </span>
              </div>
            }
            onChange={handleTypeChange}
            allowClear
            className="h-11 min-w-fit custom-filter-select-v3"
            suffixIcon={null}
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
      <style jsx global data-cy="okr-criteria-filters-styles">{`
        /* Filter v3 - Wrap Around Design */
        .custom-filter-select-v3.ant-select {
          width: auto !important;
          min-width: 44px !important;
        }
        @media (min-width: 640px) {
          .custom-filter-select-v3.ant-select {
            min-width: 90px !important;
          }
        }
        .custom-filter-select-v3 .ant-select-selector {
          height: 44px !important;
          border-radius: 6px !important;
          border-color: #d9d9d9 !important;
          padding-left: 12px !important;
          padding-right: 12px !important;
          background-color: white !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .custom-filter-select-v3 .ant-select-selection-placeholder {
          inset-inline-start: 12px !important;
          inset-inline-end: 12px !important;
          position: static !important;
          transform: none !important;
          opacity: 1 !important;
        }
        .custom-filter-select-v3 .ant-select-selection-search {
          display: none !important;
        }
        .custom-filter-select-v3:hover .ant-select-selector {
          border-color: #bfbfbf !important;
        }

        /* Search v2 - Matching Filter Height and Icon Box */
        .custom-search-input-v2.ant-input-group-wrapper {
          height: 44px !important;
        }
        .custom-search-input-v2.ant-input-group-wrapper .ant-input-wrapper {
          display: flex !important;
          align-items: center !important;
          border: 1px solid #d9d9d9 !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          background-color: white !important;
          height: 44px !important;
        }
        .custom-search-input-v2.ant-input-group-wrapper .ant-input {
          border: none !important;
          box-shadow: none !important;
          height: 44px !important;
          padding-left: 12px !important;
          font-size: 14px !important;
          color: #262626 !important;
        }
        .custom-search-input-v2.ant-input-group-wrapper
          .ant-input::placeholder {
          color: #bfbfbf !important;
        }
        .custom-search-input-v2.ant-input-group-wrapper .ant-input-group-addon {
          background-color: white !important;
          border: none !important;
          border-left: 1px solid #f0f0f0 !important;
          padding: 0 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          height: 44px !important;
        }
        .custom-search-input-v2.ant-input-group-wrapper
          .ant-input-group-addon
          .anticon {
          font-size: 18px !important;
          color: #595959 !important;
        }
        .custom-search-input-v2.ant-input-group-wrapper:hover {
          border-color: #bfbfbf !important;
        }
      `}</style>
    </div>
  );
};

export default CriteriaFilters;
