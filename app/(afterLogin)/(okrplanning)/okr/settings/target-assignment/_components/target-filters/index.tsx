import { Input, Select } from 'antd';
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { MdOutlineFilterAlt } from 'react-icons/md';

interface TargetFiltersProps {
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  targetNames: string[];
}

const TargetFilters: React.FC<TargetFiltersProps> = ({
  onSearchChange,
  onTypeChange,
  targetNames,
}) => {
  const { Option } = Select;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleTypeChange = (value: string) => {
    onTypeChange(value);
  };

  return (
    <div
      className="mb-5 w-full"
      id="okr-target-filters-container"
      data-cy="okr-target-filters-container"
    >
      <div
        className="flex items-center justify-between w-full gap-3"
        data-cy="okr-target-filters-row"
      >
        {/* Search Input on the Left */}
        <div
          className="w-full max-w-md"
          data-cy="okr-target-filters-search-wrapper"
        >
          <Input
            placeholder="Search Employee"
            onChange={handleSearch}
            allowClear
            addonAfter={<SearchOutlined />}
            className="w-full h-8 custom-search-input-v2"
            id="okr-target-filters-search-input"
            data-cy="okr-target-filters-search-input"
          />
        </div>

        {/* Filter Select on the Right */}
        <div
          className="flex-shrink-0"
          data-cy="okr-target-filters-select-wrapper"
        >
          <Select
            placeholder={
              <div
                className="flex items-center gap-2 text-[rgba(0,0,0,0.7)]"
                data-cy="okr-target-filters-select-placeholder"
              >
                <MdOutlineFilterAlt
                  className="text-[14px]"
                  data-cy="okr-target-filters-select-placeholder-icon"
                />
                <span
                  className="text-[14px] font-normal hidden sm:inline"
                  data-cy="okr-target-filters-select-placeholder-text"
                >
                  Filter
                </span>
              </div>
            }
            onChange={handleTypeChange}
            allowClear
            className="h-8 min-w-fit custom-filter-select-v3"
            suffixIcon={null}
            id="okr-target-filters-select"
            data-cy="okr-target-filters-select"
            dropdownMatchSelectWidth={false}
          >
            {targetNames?.map((name) => (
              <Option
                key={name}
                value={name}
                id={`okr-target-filters-select-option-${name}`}
                data-cy={`okr-target-filters-select-option-${name}`}
              >
                {name}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      <style jsx global data-cy="okr-target-filters-styles">{`
        /* Filter v3 - Wrap Around Design */
        .custom-filter-select-v3.ant-select {
          width: 84px !important;
          min-width: 84px !important;
        }
        .custom-filter-select-v3 .ant-select-selector {
          height: 32px !important;
          border-radius: 6px !important;
          border: 1px solid #d9d9d9 !important;
          padding-left: 15px !important;
          padding-right: 15px !important;
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

        @media (max-width: 640px) {
          /* On mobile the filter button should shrink to its content */
          .custom-filter-select-v3.ant-select {
            width: auto !important;
            min-width: unset !important;
          }
        }

        /* Search v2 - Matching Filter Height and Icon Box */
        .custom-search-input-v2.ant-input-group-wrapper {
          height: 32px !important;
        }
        .custom-search-input-v2.ant-input-group-wrapper .ant-input-wrapper {
          display: flex !important;
          align-items: center !important;
          border: 1px solid #d9d9d9 !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          background-color: white !important;
          height: 32px !important;
        }
        .custom-search-input-v2.ant-input-group-wrapper .ant-input {
          border: none !important;
          box-shadow: none !important;
          height: 32px !important;
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
          height: 32px !important;
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

export default TargetFilters;
