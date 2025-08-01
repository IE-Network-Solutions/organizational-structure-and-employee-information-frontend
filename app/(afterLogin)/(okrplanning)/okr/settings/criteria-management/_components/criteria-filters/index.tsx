import { Col, Input, Row, Select } from 'antd';
import React from 'react';
import { useIsMobile } from '@/components/common/hooks/useIsMobile';
import { VscSettings } from 'react-icons/vsc';

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
  const { isMobile } = useIsMobile();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleTypeChange = (value: string) => {
    onTypeChange(value);
  };

  return (
    <div className="mb-6">
      {isMobile ? (
        <Row>
          <Col xs={20} sm={20} md={18}>
            <Input
              placeholder="Search by Name"
              onChange={handleSearch}
              allowClear
              className="w-full h-10"
            />
          </Col>

          <Col xs={4} sm={4} md={6} lg={6}>
            <Select
              placeholder=""
              onChange={handleTypeChange}
              allowClear
              dropdownMatchSelectWidth={false}
              className=" control m-0 w-[48px] h-10 mx-auto p-0 pl-2"
              dropdownStyle={{ left: '50%', transform: 'translateX(-50%)' }}
              suffixIcon={
                <div className="flex items-center justify-center w-full h-full text-black">
                  <VscSettings size={20} />
                </div>
              }
            >
              {criteriaNames?.map((name) => (
                <Option key={name} value={name}>
                  {name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      ) : (
        <Row gutter={16}>
          <Col xs={24} sm={24} md={18} lg={18}>
            <Input
              placeholder="Search by Name"
              onChange={handleSearch}
              allowClear
              className="w-full h-10"
            />
          </Col>

          <Col xs={24} sm={24} md={6} lg={6}>
            <Select
              placeholder="All Types"
              onChange={handleTypeChange}
              allowClear
              className="w-full h-10"
            >
              {criteriaNames?.map((name) => (
                <Option key={name} value={name}>
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

export default CriteriaFilters;
