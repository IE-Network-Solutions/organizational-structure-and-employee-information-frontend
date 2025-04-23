import {
  useEmployeeAllFilter,
  useEmployeeBranches,
  useEmployeeDepartments,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useDebounce } from '@/utils/useDebounce';
import { Col, Dropdown, Input, Menu, Row, Select } from 'antd';
import React from 'react';
import { IoMdSwitch } from 'react-icons/io';
import { useMediaQuery } from 'react-responsive';

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

  const { data: EmployeeBranches } = useEmployeeBranches();
  const { data: EmployeeDepartment } = useEmployeeDepartments();
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });


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
          <Col lg={10} sm={24} xs={16}>
            <Input
              id={`inputEmployeeNames${searchParams.employee_name}`}
              placeholder="Search employee"
              onChange={(e) =>
                handleSearchInput(e.target.value, 'employee_name')
              }
              className="w-full h-14"
              allowClear
            />
          </Col>
  
          <Col lg={11} sm={24} xs={8}>
            {isSmallScreen ? (
              <div className="flex justify-between gap-2 w-full">
                {/* Branch */}
                <Dropdown
                  overlay={
                    <Menu>
                      {EmployeeBranches?.items?.map((item: any) => (
                        <Menu.Item
                          key={item?.id}
                          onClick={() => handleSearchEmployee(item?.id, 'allOffices')}
                        >
                          {item?.name}
                        </Menu.Item>
                      ))}
                    </Menu>
                  }
                  trigger={['click']}
                >
                  <button className="w-[50px] h-[50px] flex items-center justify-center border border-gray-300 rounded">
                    <IoMdSwitch size={24} />
                  </button>
                </Dropdown>
  
                {/* Department */}
                <Dropdown
                  overlay={
                    <Menu>
                      {EmployeeDepartment?.map((item: any) => (
                        <Menu.Item
                          key={item?.id}
                          onClick={() => handleSearchEmployee(item?.id, 'allJobs')}
                        >
                          {item?.name}
                        </Menu.Item>
                      ))}
                    </Menu>
                  }
                  trigger={['click']}
                >
                  <button className="w-[50px] h-[50px] flex items-center justify-center border border-gray-300 rounded">
                    <IoMdSwitch size={24} />
                  </button>
                </Dropdown>
  
                {/* Status */}
                <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    key="active"
                    onClick={() => handleStatusChange(activeStatusValue)}
                    style={{
                      backgroundColor:
                        searchParams.allStatus === activeStatusValue ? '#f5f5f5' : 'transparent',
                    }}
                    className="hover:bg-gray-100"
                  >
                    Active
                  </Menu.Item>
                  <Menu.Item
                    key="inactive"
                    onClick={() => handleStatusChange(inactiveStatusValue)}
                    style={{
                      backgroundColor:
                        searchParams.allStatus === inactiveStatusValue ? '#f5f5f5' : 'transparent',
                    }}
                    className="hover:bg-gray-100"
                  >
                    Inactive
                  </Menu.Item>
                </Menu>
              }
              trigger={['click']}
            >
              <button className="w-[50px] h-[50px] flex items-center justify-center border border-gray-300 rounded">
                <IoMdSwitch size={24} className="text-gray-900" />
              </button>
            </Dropdown>
              </div>
            ) : (
              <Row gutter={[8, 16]}>
                {/* Branch */}
                <Col lg={8} sm={12} xs={8}>
                  <Select
                    placeholder="All Offices"
                    onChange={(value) => handleSearchEmployee(value, 'allOffices')}
                    allowClear
                    className="w-full h-14"
                    id={`selectBranches${searchParams.allOffices}`}
                  >
                    {EmployeeBranches?.items?.map((item: any) => (
                      <Option key={item?.id} value={item?.id}>
                        {item?.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
  
                {/* Department */}
                <Col lg={8} sm={12} xs={8}>
                  <Select
                    placeholder="All Departments"
                    onChange={(value) => handleSearchEmployee(value, 'allJobs')}
                    allowClear
                    className="w-full h-14"
                    id={`selectDepartment${searchParams.allJobs}`}
                  >
                    {EmployeeDepartment?.map((item: any) => (
                      <Option key={item?.id} value={item?.id}>
                        {item?.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
  
                {/* Status */}
                <Col lg={8} sm={12} xs={8}>
                  <Select
                    placeholder="Status"
                    onChange={(value) => handleSearchEmployee(value, 'allStatus')}
                    allowClear
                    className="w-full h-14"
                    id={`selectStatus${searchParams.allStatus}`}
                  >
                    <Option value={activeStatusValue}>Active</Option>
                    <Option value={inactiveStatusValue}>Inactive</Option>
                  </Select>
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </div>
    );
};

export default EmployeeSearch;
