import {
  useEmployeeAllFilter,
  useEmployeeBranches,
  useEmployeeDepartments,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useDebounce } from '@/utils/useDebounce';
import { Button, Col, Input, Row, Select } from 'antd';
import { IoMdSwitch } from 'react-icons/io';
import { Modal } from 'antd';

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
  const { isMobileFilterVisible, setIsMobileFilterVisible } =
    useEmployeeManagementStore();

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
      <Row
        gutter={[16, 24]}
        justify="space-between"
        align="middle"
        className="mb-5"
      >
        <Col xs={24} sm={24} lg={10}>
          <Row gutter={8} align="middle">
            <Col flex="auto">
              <Input
                id={`inputEmployeeNames${searchParams.employee_name}`}
                placeholder="Search employee"
                onChange={(e) =>
                  handleSearchInput(e.target.value, 'employee_name')
                }
                className="w-full h-10"
                allowClear
              />
            </Col>
            <Col className="block lg:hidden">
              <IoMdSwitch
                className="cursor-pointer w-10 h-10 rounded-md border-gray-100 border-2"
                onClick={() => setIsMobileFilterVisible(!isMobileFilterVisible)}
              />
            </Col>
          </Row>
        </Col>

        <Col lg={11} className="hidden lg:block ">
          <Row gutter={[8, 16]}>
            <Col lg={8} sm={12} xs={24}>
              <Select
                id={`selectBranches${searchParams.allOffices}`}
                placeholder="All Offices"
                onChange={handleBranchChange}
                allowClear
                className="w-full h-10"
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
                className=" w-full h-10"
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
                placeholder="Active"
                onChange={handleStatusChange}
                allowClear
                className="w-full h-10"
              >
                <Option
                  key="active"
                  value={activeStatusValue}
                  style={{
                    backgroundColor:
                      searchParams.allStatus === activeStatusValue
                        ? '#f5f5f5'
                        : 'transparent',
                  }}
                  className="hover:bg-gray-100"
                >
                  Active
                </Option>
                <Option
                  key="inactive"
                  value={inactiveStatusValue}
                  style={{
                    backgroundColor:
                      searchParams.allStatus === inactiveStatusValue
                        ? '#f5f5f5'
                        : 'transparent',
                  }}
                  className="hover:bg-gray-100"
                >
                  Inactive
                </Option>
              </Select>
            </Col>
          </Row>
        </Col>
      </Row>

      <Modal
        centered
        title="Filter Employees"
        open={isMobileFilterVisible}
        onCancel={() => setIsMobileFilterVisible(false)}
        width="85%"
        footer={
          <div className="flex justify-center items-center space-x-4">
            <Button
              type="default"
              className="px-3"
              onClick={() => setIsMobileFilterVisible(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setIsMobileFilterVisible(false)}
              type="primary"
              className="px-3"
            >
              Filter
            </Button>
          </div>
        }
      >
        <Select
          id={`selectBranches${searchParams.allOffices}`}
          placeholder="All Offices"
          onChange={handleBranchChange}
          allowClear
          className="w-full mb-4"
        >
          {EmployeeBranches?.items?.map((item: any) => (
            <Option key={item?.id} value={item?.id}>
              {item?.name}
            </Option>
          ))}
        </Select>

        <Select
          id={`selectDepartment${searchParams.allJobs}`}
          placeholder="All Departments"
          onChange={handleDepartmentChange}
          allowClear
          className="w-full mb-4"
        >
          {EmployeeDepartment?.map((item: any) => (
            <Option key={item?.id} value={item?.id}>
              {item?.name}
            </Option>
          ))}
        </Select>

        <Select
          id={`selectStatus${searchParams.allStatus}`}
          placeholder="Active"
          onChange={handleStatusChange}
          allowClear
          className="w-full"
        >
          <Option value={activeStatusValue}>Active</Option>
          <Option value={inactiveStatusValue}>Inactive</Option>
        </Select>
      </Modal>
    </div>
  );
};

export default EmployeeSearch;
