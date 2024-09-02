import {
  useEmployeeAllFilter,
  useEmployeeBranches,
  useEmployeeDepartments,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useDebounce } from '@/utils/useDebounce';
import { Col, Input, Row, Select } from 'antd';
import React from 'react';

const { Option } = Select;

const EmployeeSearch: React.FC = () => {
  const { searchParams, setSearchParams, pageSize, userCurrentPage } =
    useEmployeeManagementStore();

  const { data: allFilterData } = useEmployeeAllFilter(
    pageSize,
    userCurrentPage,
    searchParams.allOffices ? searchParams.allOffices : '',
    searchParams.allJobs ? searchParams.allJobs : '',
    searchParams.employee_name ? searchParams.employee_name : '',
    searchParams.allStatus ? searchParams.allStatus : '',
  );

  const { data: EmployeeBranches, isLoading: sdbnsc } = useEmployeeBranches();
  const { data: EmployeeDepartment } = useEmployeeDepartments();

  const handleSearchEmployee = async (
    value: string | boolean,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };

  const onSelectChange = handleSearchEmployee;
  const onSearchChange = useDebounce(handleSearchEmployee, 2000);

  const handleSearchInput = (
    value: string,
    keyValue: keyof typeof searchParams,
  ) => {
    const trimmedValue = value.trim();
    onSearchChange(trimmedValue, keyValue);
  };
  const handleBranchChange = (value: string) => {
    onSelectChange(value, 'allOffices');
  };

  const handleDepartmentChange = (value: string) => {
    onSelectChange(value, 'allJobs');
  };

  const handleStatusChange = (value: string) => {
    onSelectChange(value, 'allStatus');
  };

  const activeStatusValue =
    allFilterData?.items?.find((item: any) => item.deletedAt === null)
      ?.deletedAt || 'null';
  const inactiveStatusValue = allFilterData?.items?.some(
    (item: any) => item.deletedAt !== null,
  )
    ? 'notNull'
    : 'notNull';

  return (
    <div>
      <Row gutter={[16, 24]} justify="space-between">
        <Col lg={10} sm={24} xs={24}>
          <div className="w-full">
            <Input
              id={`inputEmployeeNames${searchParams.employee_name}`}
              placeholder="Search employee"
              onChange={(e) =>
                handleSearchInput(e.target.value, 'employee_name')
              }
              className="w-full h-14"
              allowClear
            />
          </div>
        </Col>

        <Col lg={11} sm={24} xs={24}>
          <Row gutter={[8, 16]}>
            <Col lg={8} sm={12} xs={24}>
              <Select
                id={`selectBranches${searchParams.allOffices}`}
                placeholder="All Offices"
                onChange={handleBranchChange}
                allowClear
                className="w-full h-14"
              >
                {EmployeeBranches?.items?.map((item: any) => (
                  <Option key={item?.id} value={item?.id}>
                    {item?.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col lg={8} sm={12} xs={24}>
              <Select
                id={`selectDepartment${searchParams.allJobs}`}
                placeholder="All Departments"
                onChange={handleDepartmentChange}
                allowClear
                className="w-full h-14"
              >
                {EmployeeDepartment?.map((item: any) => (
                  <Option key={item?.id} value={item?.id}>
                    {item?.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col lg={8} sm={12} xs={24}>
              <Select
                id={`selectStatus${searchParams.allStatus}`}
                placeholder="All Status"
                onChange={handleStatusChange}
                allowClear
                className="w-full h-14"
              >
                <Option key="active" value={activeStatusValue}>
                  Active
                </Option>
                <Option key="inactive" value={inactiveStatusValue}>
                  Inactive
                </Option>
              </Select>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeSearch;
