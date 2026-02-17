import {
  useEmployeeAllFilter,
  useEmployeeBranches,
  useEmployeeDepartments,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Select, DatePicker, Radio, Button, Row, Col } from 'antd';
import { Modal } from 'antd';
import dayjs from 'dayjs';

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
    <div
      className="space-y-4"
      id="employee-search-filters"
      data-cy="employee-search-filters"
    >
      <div
        className="space-y-4"
        id="employee-search-filters-content"
        data-cy="employee-search-filters-content"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Select
              id={`selectBranches${searchParams.allOffices}`}
              data-cy={`selectBranches${searchParams.allOffices}`}
              placeholder="Office"
              value={searchParams.allOffices || undefined}
              onChange={handleBranchChange}
              allowClear
              showSearch
              filterOption={(input, option) =>
                String(option?.children || '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              className="w-full h-10 rounded-lg border-gray-200"
            >
              {EmployeeBranches?.items?.map((item: any) => (
                <Option
                  key={item?.id}
                  value={item?.id}
                  data-cy={`employee-search-select-branch-option-${item?.id}`}
                >
                  {item?.name}
                </Option>
              ))}
            </Select>

          </Col>
          <Col span={12}>
            <Select
              id={`selectDepartment${searchParams.allJobs}`}
              data-cy={`selectDepartment${searchParams.allJobs}`}
              placeholder="Department"
              value={searchParams.allJobs || undefined}
              onChange={handleDepartmentChange}
              allowClear
              showSearch
              filterOption={(input, option) =>
                String(option?.children || '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              className="w-full h-10 rounded-lg border-gray-200"
            >
              {EmployeeDepartment?.map((item: any) => (
                <Option
                  key={item?.id}
                  value={item?.id}
                  data-cy={`employee-search-select-department-option-${item?.id}`}
                >
                  {item?.name}
                </Option>
              ))}
            </Select>

          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Select
              id={`selectGender${searchParams.gender}`}
              data-cy={`selectGender${searchParams.gender}`}
              placeholder="Gender"
              value={searchParams.gender || undefined}
              onChange={handleGenderChange}
              allowClear
              className="w-full h-10 rounded-lg border-gray-200"
            >
              <Option
                value="male"
                data-cy="employee-search-select-gender-option-male"
              >
                Male
              </Option>
              <Option
                value="female"
                data-cy="employee-search-select-gender-option-female"
              >
                Female
              </Option>
              <Option
                value="other"
                data-cy="employee-search-select-gender-option-other"
              >
                Other
              </Option>
            </Select>
          </Col>
          <Col span={12}>
            <Select
              id={`selectEmploymentType${searchParams.employmentType}`}
              data-cy={`selectEmploymentType${searchParams.employmentType}`}
              placeholder="Employment Type"
              value={searchParams.employmentType || undefined}
              onChange={handleEmploymentTypeChange}
              allowClear
              showSearch
              filterOption={(input, option) =>
                String(option?.children || '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              className="w-full h-10 rounded-lg border-gray-200"
            >
              {EmploymentTypes?.items?.map((item: any) => (
                <Option
                  key={item?.id}
                  value={item?.id}
                  data-cy={`employee-search-select-employment-type-option-${item?.id}`}
                >
                  {item?.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Select
              id={`selectStatus${searchParams.allStatus}`}
              data-cy={`selectStatus${searchParams.allStatus}`}
              placeholder="Status"
              value={searchParams.allStatus || undefined}
              onChange={handleStatusChange}
              allowClear
              className="w-full h-10 rounded-lg border-gray-200"
            >
              <Option
                value={activeStatusValue}
                data-cy={`employee-search-select-status-option-active`}
              >
                Active
              </Option>
              <Option
                value={inactiveStatusValue}
                data-cy={`employee-search-select-status-option-inactive`}
              >
                Inactive
              </Option>
            </Select>
          </Col>
          <Col span={12}>
            <DatePicker
              id={`datePickerJoinedDate${searchParams.joinedDate}`}
              data-cy={`datePickerJoinedDate${searchParams.joinedDate}`}
              placeholder="Joined Date"
              value={
                searchParams.joinedDate ? dayjs(searchParams.joinedDate) : undefined
              }
              onChange={handleJoinedDateChange}
              className="w-full h-10 rounded-lg border-gray-200"
              format="YYYY-MM-DD"
              allowClear
              suffixIcon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  id="employee-search-date-picker-suffix-icon"
                  data-cy="employee-search-date-picker-suffix-icon"
                >
                  <rect
                    x="2"
                    y="3"
                    width="12"
                    height="10"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    id="employee-search-date-picker-suffix-icon-rect"
                    data-cy="employee-search-date-picker-suffix-icon-rect"
                  />
                  <path
                    d="M5 1v4M11 1v4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    id="employee-search-date-picker-suffix-icon-path"
                    data-cy="employee-search-date-picker-suffix-icon-path"
                  />
                  <path
                    d="M2 6h12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    id="employee-search-date-picker-suffix-icon-path-2"
                    data-cy="employee-search-date-picker-suffix-icon-path-2"
                  />
                  <text
                    x="8"
                    y="10"
                    textAnchor="middle"
                    fontSize="6"
                    fill="currentColor"
                    id="employee-search-date-picker-suffix-icon-text"
                    data-cy="employee-search-date-picker-suffix-icon-text"
                  >
                    1
                  </text>
                </svg>
              }
              renderExtraFooter={() => (
                <div
                  className="flex items-center justify-between w-full px-2"
                  id="employee-search-date-footer"
                  data-cy="employee-search-date-footer"
                >
                  <span
                    className="font-semibold text-sm"
                    id="employee-search-date-label"
                    data-cy="employee-search-date-label"
                  >
                    Set Date
                  </span>
                  <Radio.Group
                    value={searchParams.joinedDateType || 'after'}
                    onChange={(e) => setJoinedDateType(e.target.value)}
                    size="small"
                    id="employee-search-date-type-group"
                    data-cy="employee-search-date-type-group"
                  >
                    <Radio
                      value="before"
                      id="employee-search-date-before"
                      data-cy="employee-search-date-before"
                    >
                      Before
                    </Radio>
                    <Radio
                      value="after"
                      id="employee-search-date-after"
                      data-cy="employee-search-date-after"
                    >
                      After
                    </Radio>
                  </Radio.Group>
                </div>
              )}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
  const handleReset = () => {
    setSearchParams('allOffices', '');
    setSearchParams('allJobs', '');
    setSearchParams('gender', '');
    setSearchParams('employmentType', '');
    setSearchParams('allStatus', '');
    setSearchParams('joinedDate', '');
    setIsMobileFilterVisible(false);
  };

  return (
    <div className="p-2 min-w-[320px]">
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-4 px-1">Filter</h3>
        <p className="text-sm font-semibold mb-4 px-1">Select all Filters</p>
        {Filters}
      </div>
      <div
        className="flex justify-end gap-2 pt-4 border-t border-gray-100"
        id="employee-search-footer"
        data-cy="employee-search-footer"
      >
        <Button
          type="default"
          onClick={handleReset}
          className="py-1 rounded-lg h-8"
          id="employee-search-reset-btn"
          data-cy="employee-search-reset-btn"
        >
          Reset
        </Button>
        <Button
          className="bg-[#1e40af] text-white py-1 rounded-lg border-none h-8"
          onClick={() => setIsMobileFilterVisible(false)}
          id="employee-search-save-btn"
          data-cy="employee-search-save-btn"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );
};

export default EmployeeSearch;
