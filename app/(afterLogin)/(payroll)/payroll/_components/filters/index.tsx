import { Col, Input, Row, Select } from 'antd';
import React from 'react';

const { Option } = Select;

interface FiltersProps {
  onSearch: (value: string) => void;
}

const Filters: React.FC<FiltersProps> = ({ onSearch }) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleTypeChange = () => {};

  return (
    <div className="mb-6">
      <Row
        gutter={[16, 16]}
        align="middle"
        justify="space-between"
        style={{ flexWrap: 'wrap' }}
      >
        <Col xl={8} lg={10} md={12} sm={24} xs={24}>
          <Input
            placeholder="Search by Name"
            onChange={handleSearch}
            allowClear
            style={{ height: '48px' }}
          />
        </Col>

        <Col xl={4} lg={5} md={6} sm={12} xs={24}>
          <Select
            placeholder="Year"
            onChange={handleTypeChange}
            allowClear
            style={{ width: '100%', height: '48px' }}
          >
            <Option value="2024">2024</Option>
            <Option value="2023">2023</Option>
          </Select>
        </Col>

        <Col xl={4} lg={5} md={6} sm={12} xs={24}>
          <Select
            placeholder="Sessions"
            onChange={handleTypeChange}
            allowClear
            style={{ width: '100%', height: '48px' }}
          >
            <Option value="Q1">Q1</Option>
            <Option value="Q2">Q2</Option>
          </Select>
        </Col>

        <Col xl={4} lg={5} md={6} sm={12} xs={24}>
          <Select
            placeholder="Month"
            onChange={handleTypeChange}
            allowClear
            style={{ width: '100%', height: '48px' }}
          >
            <Option value="January">January</Option>
            <Option value="February">February</Option>
          </Select>
        </Col>

        <Col xl={4} lg={5} md={6} sm={12} xs={24}>
          <Select
            placeholder="Pay Period"
            onChange={handleTypeChange}
            allowClear
            style={{ width: '100%', height: '48px' }}
          >
            <Option value="Bi-Weekly">Bi-Weekly</Option>
            <Option value="Monthly">Monthly</Option>
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default Filters;
