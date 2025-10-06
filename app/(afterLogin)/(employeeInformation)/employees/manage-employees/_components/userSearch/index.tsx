import {
  useEmployeeAllFilter,
  useEmployeeBranches,
  useEmployeeDepartments,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Select, DatePicker, Radio, Button } from 'antd';
import { Modal } from 'antd';

const { Option } = Select;

const EmployeeSearch: React.FC = () => {
  const {
    searchParams,
    setSearchParams,
    pageSize,
    userCurrentPage,
    setJoinedDateType,
  } = useEmployeeManagementStore();

  const { data: allFilterData } = useEmployeeAllFilter(
    pageSize,
    userCurrentPage,
    searchParams.allOffices ? searchParams.allOffices : '',
    searchParams.allJobs ? searchParams.allJobs : '',
    searchParams.employee_name ? searchParams.employee_name : '',
    searchParams.allStatus ? searchParams.allStatus : '',
    searchParams.gender ? searchParams.gender : '',
    searchParams.employmentType ? searchParams.employmentType : '',
    searchParams.joinedDate ? searchParams.joinedDate : '',
    searchParams.joinedDateType || 'after',
  );

  const { data: EmployeeBranches } = useEmployeeBranches();
  const { data: EmployeeDepartment } = useEmployeeDepartments();
  const { data: EmploymentTypes } = useGetEmployementTypes();
  const { isMobileFilterVisible, setIsMobileFilterVisible } =
    useEmployeeManagementStore();

  const handleSearchEmployee = async (
    value: string | boolean,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };

  const onSelectChange = handleSearchEmployee;
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

  const handleEmploymentTypeChange = (value: string) => {
    onSelectChange(value, 'employmentType');
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
    <div className="space-y-4">
      <div className="space-y-4">
        <Select
          id={`selectBranches${searchParams.allOffices}`}
          placeholder="Office"
          value={searchParams.allOffices || undefined}
          onChange={handleBranchChange}
          allowClear
          className="w-full h-12 rounded-lg border-gray-200"
        >
          {EmployeeBranches?.items?.map((item: any) => (
            <Option key={item?.id} value={item?.id}>
              {item?.name}
            </Option>
          ))}
        </Select>

        <Select
          id={`selectDepartment${searchParams.allJobs}`}
          placeholder="Department"
          value={searchParams.allJobs || undefined}
          onChange={handleDepartmentChange}
          allowClear
          className="w-full h-12 rounded-lg border-gray-200"
        >
          {EmployeeDepartment?.map((item: any) => (
            <Option key={item?.id} value={item?.id}>
              {item?.name}
            </Option>
          ))}
        </Select>

        <Select
          id={`selectGender${searchParams.gender}`}
          placeholder="Gender"
          value={searchParams.gender || undefined}
          onChange={handleGenderChange}
          allowClear
          className="w-full h-12 rounded-lg border-gray-200"
        >
          <Option value="male">Male</Option>
          <Option value="female">Female</Option>
          <Option value="other">Other</Option>
        </Select>

        <Select
          id={`selectEmploymentType${searchParams.employmentType}`}
          placeholder="Employment Type"
          value={searchParams.employmentType || undefined}
          onChange={handleEmploymentTypeChange}
          allowClear
          className="w-full h-12 rounded-lg border-gray-200"
        >
          {EmploymentTypes?.items?.map((item: any) => (
            <Option key={item?.id} value={item?.id}>
              {item?.name}
            </Option>
          ))}
        </Select>

        <Select
          id={`selectStatus${searchParams.allStatus}`}
          placeholder="Status"
          value={searchParams.allStatus || undefined}
          onChange={handleStatusChange}
          allowClear
          className="w-full h-12 rounded-lg border-gray-200"
        >
          <Option value={activeStatusValue}>Active</Option>
          <Option value={inactiveStatusValue}>Inactive</Option>
        </Select>

        <DatePicker
          id={`datePickerJoinedDate${searchParams.joinedDate}`}
          placeholder="Joined Date"
          value={
            searchParams.joinedDate
              ? new Date(searchParams.joinedDate)
              : undefined
          }
          onChange={handleJoinedDateChange}
          className="w-full h-12 rounded-lg border-gray-200"
          format="YYYY-MM-DD"
          allowClear
          suffixIcon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="2"
                y="3"
                width="12"
                height="10"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M5 1v4M11 1v4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path d="M2 6h12" stroke="currentColor" strokeWidth="1.5" />
              <text
                x="8"
                y="10"
                textAnchor="middle"
                fontSize="6"
                fill="currentColor"
              >
                1
              </text>
            </svg>
          }
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
      </div>
    </div>
  );
  return (
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
          <Button
            className="bg-primary text-white px-10 py-1 rounded-lg border-none"
            onClick={() => setIsMobileFilterVisible(false)}
          >
            Filter
          </Button>
        </div>
      }
      className="max-w-md"
      width={400}
    >
      {Filters}
    </Modal>
  );
};

export default EmployeeSearch;
