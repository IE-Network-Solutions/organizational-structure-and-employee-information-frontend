import { Col, Input, Row, Select } from 'antd';
import React from 'react';

interface CriteriaFiltersProps {
  onSearch: (value: string) => void;
  onTypeChange: (value: string) => void;
  criteriaNames: string[]; // Dynamic criteria names
}

const CriteriaFilters: React.FC<CriteriaFiltersProps> = ({
  onSearch,
  onTypeChange,
  criteriaNames,
}) => {
  const { Option } = Select;

  // Handles the search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  // Handles the type dropdown selection
  const handleTypeChange = (value: string) => {
    onTypeChange(value);
  };

  console.log('------criteriaNames--------', criteriaNames);

  return (
    <div className="mb-6">
      <Row gutter={[16, 24]} justify="space-between">
        {/* Search Input */}
        <Col lg={18} sm={24} xs={24}>
          <div className="w-full">
            <Input
              placeholder="Search by Name"
              onChange={handleSearch}
              className="w-full h-14"
              allowClear
            />
          </div>
        </Col>

        {/* Type Selector */}
        <Col lg={4} sm={24} xs={24}>
          <Select
            placeholder="All Types"
            onChange={handleTypeChange}
            allowClear
            className="w-full h-14"
          >
            {criteriaNames?.map((name) => (
              <Option key={name} value={name}>
                {name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default CriteriaFilters;
