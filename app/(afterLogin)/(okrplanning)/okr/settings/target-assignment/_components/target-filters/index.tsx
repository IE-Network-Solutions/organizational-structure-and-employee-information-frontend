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
    <div className="mb-6">
      {isMobile ? (
        <Row gutter={16}>
          <Col md={18} sm={16} xs={16}>
            <Input
              placeholder="Search by Department"
              className="w-full h-10"
              allowClear
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </Col>

          <Col lg={6} sm={8} xs={8} md={6}>
            <Select
              placeholder=""
              onChange={(value) => onTypeChange(value)}
              allowClear
              className=" control m-0 w-[48px] h-10 mx-auto p-0 pl-2"
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ left: '50%', transform: 'translateX(-50%)' }}
              suffixIcon={
                <div className="flex items-center justify-center w-full h-full text-black">
                  <IoMdSwitch size={20} />
                </div>
              }
            >
              {targetNames?.map((name) => (
                <Option key={name} value={name}>
                  {name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      ) : (
        <Row gutter={16} justify="space-between">
          <Col lg={18} sm={24} xs={24}>
            <Input
              placeholder="Search by Department"
              className="w-full h-10"
              allowClear
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </Col>

          <Col lg={6} sm={24} xs={24} md={6}>
            <Select
              placeholder="All Types"
              onChange={(value) => onTypeChange(value)}
              allowClear
              className="w-full h-10"
            >
              {targetNames?.map((name) => (
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

export default TargetFilters;
