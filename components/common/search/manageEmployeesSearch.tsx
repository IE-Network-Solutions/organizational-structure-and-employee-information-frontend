import { useDebounce } from '@/utils/useDebounce';
import { Col, Input, Row, Select } from 'antd';
import React from 'react';

const { Option } = Select;

const ManageEmployeesSearch: React.FC = () => {
  const handleSearchEmployee = async (
    e: React.ChangeEvent<HTMLInputElement>,
    keyValue: string,
    isSelect: boolean,
  ) => {
    const value = isSelect ? e : e.target.value;
  };

  const onSearchChange = useDebounce(handleSearchEmployee, 2000);

  return (
    <div>
      <Row gutter={[16, 24]} justify="space-between">
        <Col lg={10} sm={24} xs={24}>
          <div className="w-full">
            {' '}
            <Input
              placeholder="Search employee"
              onChange={(e) => onSearchChange(e, 'employee_name', false)}
              className="w-full h-14"
              allowClear
            />
          </div>
        </Col>

        <Col lg={10} sm={24} xs={24}>
          <Row gutter={[8, 16]}>
            <Col lg={8} sm={12} xs={24}>
              <Select
                placeholder="All Offices"
                onChange={(value) =>
                  onSearchChange(value, 'subscriptionStatus', true)
                }
                allowClear
                className="w-full h-14"
              >
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Col>
            <Col lg={8} sm={12} xs={24}>
              {' '}
              <Select
                placeholder="All Job Titles"
                onChange={(value) =>
                  onSearchChange(value, 'subscriptionStatus', true)
                }
                allowClear
                className="w-full h-14"
              >
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Col>
            <Col lg={8} sm={12} xs={24}>
              {' '}
              <Select
                placeholder="All Status"
                onChange={(value) =>
                  onSearchChange(value, 'subscriptionStatus', true)
                }
                allowClear
                className="w-full h-14"
              >
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Col>
          </Row>{' '}
        </Col>
      </Row>
      <div className="flex flex-wrap w-full justify-between ">
        <div className=" flex w-full md:w-1/4 p-2 gap-3" id=""></div>
      </div>
    </div>
  );
};

export default ManageEmployeesSearch;
