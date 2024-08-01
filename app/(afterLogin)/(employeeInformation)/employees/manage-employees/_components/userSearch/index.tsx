import { useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { EmployeeData } from '@/types/dashboard/adminManagement';
import { useDebounce } from '@/utils/useDebounce';
import { Col, Input, Row, Select } from 'antd';
import React from 'react';

const { Option } = Select;

const EmployeeSearch: React.FC = () => {
  const { data: userData } = useGetEmployees();
  const { searchParams, setSearchParams } = useEmployeeManagementStore();

  const handleSearchEmployee = async (
    value: string | undefined,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value ?? '');
  };

  const onSearchChange = useDebounce(handleSearchEmployee, 2000);

  const filteredUserData = userData?.filter((user: EmployeeData) => {
    return (
      (searchParams.employee_name
        ? user.employee_name.includes(searchParams.employee_name)
        : true) ||
      (searchParams.allJobs
        ? user.job_title.includes(searchParams.allJobs)
        : true) ||
      (searchParams.allOffices
        ? user.office.includes(searchParams.allOffices)
        : true) ||
      (searchParams.allStatus
        ? user.employee_status.includes(searchParams.allStatus)
        : true)
    );
  });

  return (
    <div>
      <Row gutter={[16, 24]} justify="space-between">
        <Col lg={10} sm={24} xs={24}>
          <div className="w-full">
            <Input
              placeholder="Search employee"
              onChange={(e) => onSearchChange(e.target.value, 'employee_name')}
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
                onChange={(value) => onSearchChange(value, 'allOffices')}
                allowClear
                className="w-full h-14"
              >
                {filteredUserData?.map((offices: EmployeeData) => (
                  <Option key={offices?.avatar} value={offices?.office}>
                    {offices?.office}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col lg={8} sm={12} xs={24}>
              <Select
                placeholder="All Job Titles"
                onChange={(value) => onSearchChange(value, 'allJobs')}
                allowClear
                className="w-full h-14"
              >
                {userData?.map((jobs: EmployeeData) => (
                  <Option key={jobs?.avatar} value={jobs?.job_title}>
                    {jobs?.job_title}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col lg={8} sm={12} xs={24}>
              <Select
                placeholder="All Status"
                onChange={(value) => onSearchChange(value, 'allStatus')}
                allowClear
                className="w-full h-14"
              >
                {userData?.map((status: EmployeeData) => (
                  <Option key={status?.avatar} value={status?.employee_status}>
                    {status?.employee_status}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeSearch;
