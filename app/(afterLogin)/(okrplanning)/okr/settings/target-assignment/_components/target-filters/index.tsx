import { Col, Input, Row, Select } from 'antd';
import React from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { IoMdSwitch } from 'react-icons/io';

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
  const { isMobile } = useIsMobile();

  return (
    <div
      className="mb-6"
      id="okr-target-filters-container"
      data-cy="okr-target-filters-container"
    >
      {isMobile ? (
        <Row
          gutter={16}
          id="okr-target-filters-mobile-row"
          data-cy="okr-target-filters-mobile-row"
        >
          <Col
            md={18}
            sm={16}
            xs={16}
            id="okr-target-filters-mobile-search-col"
            data-cy="okr-target-filters-mobile-search-col"
          >
            <Input
              placeholder="Search by Department"
              className="w-full h-10"
              allowClear
              onChange={(e) => onSearchChange(e.target.value)}
              id="okr-target-filters-mobile-search-input"
              data-cy="okr-target-filters-mobile-search-input"
            />
          </Col>

          <Col
            lg={6}
            sm={8}
            xs={8}
            md={6}
            id="okr-target-filters-mobile-select-col"
            data-cy="okr-target-filters-mobile-select-col"
          >
            <Select
              placeholder=""
              onChange={(value) => onTypeChange(value)}
              allowClear
              className=" control m-0 w-[48px] h-10 mx-auto p-0 pl-2"
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ left: '50%', transform: 'translateX(-50%)' }}
              suffixIcon={
                <div className="flex items-center justify-center w-full h-full text-black">
                  <IoMdSwitch size={20} data-cy="okr-target-filters-mobile-select-switch-icon" />
                </div>
              }
              id="okr-target-filters-mobile-select"
              data-cy="okr-target-filters-mobile-select"
            >
              {targetNames?.map((name) => (
                <Option
                  key={name}
                  value={name}
                  id={`okr-target-filters-mobile-select-option-${name}`}
                  data-cy={`okr-target-filters-mobile-select-option-${name}`}
                >
                  {name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      ) : (
        <Row
          gutter={16}
          justify="space-between"
          id="okr-target-filters-desktop-row"
          data-cy="okr-target-filters-desktop-row"
        >
          <Col
            lg={18}
            sm={24}
            xs={24}
            id="okr-target-filters-desktop-search-col"
            data-cy="okr-target-filters-desktop-search-col"
          >
            <Input
              placeholder="Search by Department"
              className="w-full h-10"
              allowClear
              onChange={(e) => onSearchChange(e.target.value)}
              id="okr-target-filters-desktop-search-input"
              data-cy="okr-target-filters-desktop-search-input"
            />
          </Col>

          <Col
            lg={6}
            sm={24}
            xs={24}
            md={6}
            id="okr-target-filters-desktop-select-col"
            data-cy="okr-target-filters-desktop-select-col"
          >
            <Select
              placeholder="All Types"
              onChange={(value) => onTypeChange(value)}
              allowClear
              className="w-full h-10"
              id="okr-target-filters-desktop-select"
              data-cy="okr-target-filters-desktop-select"
            >
              {targetNames?.map((name) => (
                <Option
                  key={name}
                  value={name}
                  id={`okr-target-filters-desktop-select-option-${name}`}
                  data-cy={`okr-target-filters-desktop-select-option-${name}`}
                >
                  {name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default TargetFilters;
