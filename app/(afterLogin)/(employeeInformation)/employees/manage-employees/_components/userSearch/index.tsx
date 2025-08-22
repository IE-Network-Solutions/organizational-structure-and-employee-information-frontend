import { useIsMobile } from '@/hooks/useIsMobile';
import {
  useEmployeeAllFilter,
  useEmployeeBranches,
  useEmployeeDepartments,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useDebounce } from '@/utils/useDebounce';
import { Col, Input, Row, Select, DatePicker, Radio, Button } from 'antd';
import { Modal } from 'antd';
import { LuSettings2 } from 'react-icons/lu';

const { Option } = Select;

const EmployeeSearch: React.FC = () => {
  const {
    searchParams,
    setSearchParams,
    pageSize,
    userCurrentPage,
    setJoinedDateType,
  } = useEmployeeManagementStore();

  const { isMobile, isTablet, isTabletLandscape } = useIsMobile();

  // Use mobile layout for tablet landscape
  const shouldUseMobileLayout = isMobile || isTablet || isTabletLandscape;

  const { data: allFilterData } = useEmployeeAllFilter(
    pageSize,
    userCurrentPage,
    searchParams.allOffices ? searchParams.allOffices : '',
    searchParams.allJobs ? searchParams.allJobs : '',
    searchParams.employee_name ? searchParams.employee_name : '',
    searchParams.allStatus ? searchParams.allStatus : '',
    searchParams.gender ? searchParams.gender : '',
    searchParams.joinedDate ? searchParams.joinedDate : '',
    searchParams.joinedDateType || 'after',
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

  const handleGenderChange = (value: string) => {
    onSelectChange(value, 'gender');
  };

  const handleJoinedDateChange = (date: any, dateString: string | string[]) => {
    const dateValue = Array.isArray(dateString) ? dateString[0] : dateString;
    onSelectChange(dateValue, 'joinedDate');
  };

  const activeStatusValue =
    allFilterData?.items?.find((item: any) => item.deletedAt === null)
      ?.deletedAt || 'null';
  const inactiveStatusValue = allFilterData?.items?.some(
    (item: any) => item.deletedAt !== null,
  )
    ? 'notNull'
    : 'notNull';

  const Filters = (
    <Row
      gutter={8}
      justify="space-between"
      align="middle"
      className="mb-5 my-2"
    >
      {!shouldUseMobileLayout && (
        <Col xs={24} sm={24} md={24} lg={6} xl={6}>
          <Input
            id={`inputEmployeeNames${searchParams.employee_name}`}
            placeholder="Search employee"
            onChange={(e) => handleSearchInput(e.target.value, 'employee_name')}
            className="w-full h-10 rounded-lg"
            allowClear
          />
        </Col>
      )}
      <Col xs={24} sm={24} md={24} lg={18} xl={18}>
        <Row gutter={[8, 8]} justify="end">
          <Col xs={24} sm={24} md={24} lg={4} xl={4}>
            <Select
              id={`selectBranches${searchParams.allOffices}`}
              placeholder="Office"
              onChange={handleBranchChange}
              allowClear
              className="w-full h-10 rounded-lg"
            >
              {EmployeeBranches?.items?.map((item: any) => (
                <Option key={item?.id} value={item?.id}>
                  {item?.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={24} lg={4} xl={4}>
            <Select
              id={`selectDepartment${searchParams.allJobs}`}
              placeholder="Department"
              onChange={handleDepartmentChange}
              allowClear
              className="w-full h-10 rounded-lg"
            >
              {EmployeeDepartment?.map((item: any) => (
                <Option key={item?.id} value={item?.id}>
                  {item?.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={24} lg={4} xl={4}>
            <Select
              id={`selectGender${searchParams.gender}`}
              placeholder="Gender"
              onChange={handleGenderChange}
              allowClear
              className="w-full h-10 rounded-lg"
            >
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={24} lg={4} xl={4}>
            <Select
              id={`selectStatus${searchParams.allStatus}`}
              placeholder="Status"
              onChange={handleStatusChange}
              allowClear
              className="w-full h-10 rounded-lg"
            >
              <Option value={activeStatusValue}>Active</Option>
              <Option value={inactiveStatusValue}>Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={24} lg={4} xl={4}>
            <DatePicker
              id={`datePickerJoinedDate${searchParams.joinedDate}`}
              placeholder="Joined Date"
              onChange={handleJoinedDateChange}
              className="w-full h-10 rounded-lg"
              format="YYYY-MM-DD"
              allowClear
              renderExtraFooter={() => (
                <div className="flex items-center justify-between w-full px-2">
                  <span className="font-semibold text-sm">Set Date</span>
                  <Radio.Group
                    value={searchParams.joinedDateType || 'after'}
                    onChange={(e) => setJoinedDateType(e.target.value)}
                    size="small"
                  >
                    <Radio value="before">Before</Radio>
                    <Radio value="after">After</Radio>
                  </Radio.Group>
                </div>
              )}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
  return (
    <div className="my-7">
      {shouldUseMobileLayout ? (
        <div className="flex justify-end my-2 space-x-4">
          <Input
            id={`inputEmployeeNames${searchParams.employee_name}`}
            placeholder="Search employee"
            onChange={(e) => handleSearchInput(e.target.value, 'employee_name')}
            className="w-full h-10 rounded-lg"
            allowClear
          />
          <div className="flex items-center justify-center rounded-lg border-[1px] border-gray-200 py-2 px-3">
            <LuSettings2
              onClick={() => setIsMobileFilterVisible(true)}
              className="text-xl cursor-pointer"
            />
          </div>
          <Modal
            centered
            title="Filter"
            open={isMobileFilterVisible}
            onCancel={() => setIsMobileFilterVisible(false)}
            footer={
              <div className="flex justify-center space-x-4 ">
                <Button
                  type="default"
                  onClick={() => setIsMobileFilterVisible(false)}
                  className="px-8 py-1 rounded-lg "
                >
                  Cancel
                </Button>
                <Button className="bg-primary text-white px-10 py-1 rounded-lg border-none">
                  Filter
                </Button>
              </div>
            }
            className="md:max-w-sm sm:max-w-xs xs:max-w-[280px]"
          >
            {Filters}
          </Modal>
        </div>
      ) : (
        Filters
      )}
    </div>
  );
};

export default EmployeeSearch;
