import { useIsMobile } from '@/hooks/useIsMobile';
import {
  useEmployeeDepartments,
  useGetAllUsers,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Button, Col, Modal, Row, Select } from 'antd';
import { LuSettings2 } from 'react-icons/lu';

interface FiltersProps {
  onSearch: (filters: { [key: string]: string }) => void;
}
const Filters: React.FC<FiltersProps> = () => {
  const { Option } = Select;
  const { data: employeeData } = useGetAllUsers();
  const { data: EmployeeDepartment } = useEmployeeDepartments();
  const {
    searchParams,
    setSearchValue,
    isModalOpen,
    setIsModalOpen,
    setSearchParams,
  } = useEmployeeManagementStore();

  const handleSearchEmployee = async (
    value: string | boolean,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };

  const onSelectChange = handleSearchEmployee;

  const handleDepartmentChange = (value: string) => {
    onSelectChange(value, 'allJobs');
  };

  const handleEmployeeSelect = (value: string) => {
    setSearchValue(value);
  };
  const options =
    employeeData?.items?.map((emp: any) => ({
      value: emp.id,
      label: `${emp?.firstName || ''} ${emp?.middleName} ${emp?.lastName}`,
      employeeData: emp,
    })) || [];

  const { isMobile } = useIsMobile();
  if (isMobile) {
    return (
      <>
        <div
          className="flex justify-between items-center mb-6 py-3 px-1"
          id="payroll-mobile-filterbar-view-container"
          data-cy="payroll-mobile-filterbar-view-container"
        >
          <div
            className="flex-1 mr-2"
            id="payroll-mobile-filter-select-view-container"
            data-cy="payroll-mobile-filter-select-view-container"
          >
            <Select
              id="payroll-mobile-employee-search-interact-select"
              data-cy="payroll-mobile-employee-search-interact-select"
              showSearch
              allowClear
              className="h-10 w-[100%]"
              placeholder="Search by name"
              onChange={(value) => handleEmployeeSelect(value)}
              filterOption={(input, option) => {
                const label = option?.label;
                return (
                  typeof label === 'string' &&
                  label.toLowerCase().includes(input.toLowerCase())
                );
              }}
              options={options}
            />
          </div>
          <Button
            id="payroll-mobile-filter-open-click-button"
            data-cy="payroll-mobile-filter-open-click-button"
            className="p-5 h-10  text-gray-500 border border-gray-300"
            onClick={() => setIsModalOpen(true)}
            icon={
              <LuSettings2
                id="payroll-mobile-filter-open-click-icon"
                data-cy="payroll-mobile-filter-open-click-icon"
              />
            }
          />
        </div>

        <Modal
          title="Filter"
          style={{ top: 200 }} // <-- This adjusts the top margin
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={
            <div
              id="payroll-mobile-filter-modal-footer-view-container"
              data-cy="payroll-mobile-filter-modal-footer-view-container"
              style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}
            >
              <Button
                id="payroll-mobile-filter-cancel-click-button"
                data-cy="payroll-mobile-filter-cancel-click-button"
                key="cancel"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                key="filter"
                id="payroll-mobile-filter-apply-click-button"
                data-cy="payroll-mobile-filter-apply-click-button"
                type="primary"
                onClick={() => setIsModalOpen(false)}
                className="bg-purple-600"
              >
                Filter
              </Button>
            </div>
          }
  
          data-cy="payroll-mobile-filter-modal-view-modal"
        >
          <div
            className="py-4"
            id="payroll-mobile-filter-modal-view-container"
            data-cy="payroll-mobile-filter-modal-view-container"
          >
            <Select
              id={`selectDepartment${searchParams.allJobs}`}
              data-cy="payroll-mobile-department-filter-interact-select"
              placeholder="All Departments"
              onChange={handleDepartmentChange}
              allowClear
              className="w-full h-14"
            >
              {EmployeeDepartment?.map((item: any) => (
                <Option
                  id={`payroll-mobile-department-option-select-${item?.id}`}
                  data-cy={`payroll-mobile-department-option-select-${item?.id}`}
                  key={item?.id}
                  value={item?.id}
                >
                  {item?.name}
                </Option>
              ))}
            </Select>
          </div>
        </Modal>
      </>
    );
  }
  return (
    <div
      className="mb-6"
      id="payroll-desktop-filter-view-container"
      data-cy="payroll-desktop-filter-view-container"
    >
      <Row
        id="payroll-desktop-filter-row-view-row"
        data-cy="payroll-desktop-filter-row-view-row"
        gutter={[16, 16]}
        align="middle"
        justify="space-between"
        style={{ flexWrap: 'nowrap' }}
      >
        <Col
          id="payroll-desktop-filter-employee-view-column"
          data-cy="payroll-desktop-filter-employee-view-column"
          lg={16}
          md={14}
          sm={24}
          xs={24}
        >
          <Select
            id="payroll-desktop-employee-search-interact-select"
            data-cy="payroll-desktop-employee-search-interact-select"
            showSearch
            allowClear
            className="min-h-12 w-[100%]"
            placeholder="Search by name"
            onChange={(value) => handleEmployeeSelect(value)}
            filterOption={(input, option) => {
              const label = option?.label;
              return (
                typeof label === 'string' &&
                label.toLowerCase().includes(input.toLowerCase())
              );
            }}
            options={options}
          />
        </Col>
        <Col
          id="payroll-desktop-filter-department-view-column"
          data-cy="payroll-desktop-filter-department-view-column"
          lg={8}
          sm={12}
          xs={24}
        >
          <Select
            id={`selectDepartment${searchParams.allJobs}`}
            data-cy="payroll-desktop-department-filter-interact-select"
            placeholder="All Departments"
            onChange={handleDepartmentChange}
            allowClear
            className="w-full h-14"
          >
            {EmployeeDepartment?.map((item: any) => (
              <Option
                id={`payroll-desktop-department-option-select-${item?.id}`}
                data-cy={`payroll-desktop-department-option-select-${item?.id}`}
                key={item?.id}
                value={item?.id}
              >
                {item?.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default Filters;
