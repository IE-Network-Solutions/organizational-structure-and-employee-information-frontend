import { Col, Input, Row, Select } from 'antd';
import React from 'react';

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
  return (
    <div className="mb-6">
      <Row gutter={[16, 24]} justify="space-between">
        <Col lg={18} sm={24} xs={24}>
          <div className="w-full">
            <Input
              placeholder="Search by Department"
              className="w-full h-14"
              allowClear
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </Col>

        <Col lg={4} sm={24} xs={24}>
          <Select
            placeholder="All Types"
            onChange={(value) => onTypeChange(value)}
            allowClear
            className="w-full h-14"
          >
            {targetNames?.map((name) => (
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

export default TargetFilters;
