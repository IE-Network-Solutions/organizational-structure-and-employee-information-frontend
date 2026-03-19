import { useIsMobile } from '@/hooks/useIsMobile';
import {
  useEmployeeDepartments,
  useGetAllUsers,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Button, Col, Modal, Row, Select } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

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
              className="w-full search-select-mobile"
              style={{ height: '40px' }}
              placeholder="Search Employee"
              suffixIcon={
                <div
                  id="payroll-mobile-employee-search-suffix-icon-container"
                  data-cy="payroll-mobile-employee-search-suffix-icon-container"
                  style={{
                    borderLeft: '1px solid #d9d9d9',
                    paddingLeft: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    height: '40px',
                    margin: '-8px 0',
                    marginLeft: '-4px',
                  }}
                >
                  <SearchOutlined
                    style={{ color: '#bfbfbf', fontSize: '18px' }}
                  />
                </div>
              }
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
            className="flex items-center justify-center border border-gray-300 rounded-lg overflow-hidden"
            style={{
              height: '40px',
              width: '40px',
              minWidth: '40px',
              padding: 0,
            }}
            onClick={() => setIsModalOpen(true)}
            icon={
              <FilterOutlined
                style={{ fontSize: '18px', color: '#595959' }}
                id="payroll-mobile-filter-open-click-icon"
                data-cy="payroll-mobile-filter-open-click-icon"
              />
            }
          />
          <style jsx global data-cy="payroll-mobile-filter-select-styles">{`
            .search-select-mobile .ant-select-selector {
              height: 40px !important;
              padding: 0 12px !important;
              border-radius: 8px !important;
              display: flex !important;
              align-items: center !important;
            }
            .search-select-mobile .ant-select-selection-search {
              height: 40px !important;
              display: flex !important;
              align-items: center !important;
            }
            .search-select-mobile .ant-select-selection-placeholder {
              line-height: 38px !important;
            }
          `}</style>
          <style jsx global data-cy="payroll-mobile-dropdown-custom-styles">{`
            .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
              background-color: #e6f4ff !important;
              font-weight: 600 !important;
              color: #262626 !important;
            }
            .ant-select-item-option-active:not(.ant-select-item-option-selected) {
              background-color: transparent !important;
            }
            .ant-select-item-option-selected .ant-select-item-option-state {
              color: #1677ff !important;
              position: absolute !important;
              right: 12px !important;
            }
            .ant-select-item-option-content {
              padding-right: 30px !important;
            }
          `}</style>
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
      <style jsx global data-cy="payroll-desktop-dropdown-custom-styles">{`
        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: #e6f4ff !important;
          font-weight: 600 !important;
          color: #262626 !important;
        }
        .ant-select-item-option-active:not(.ant-select-item-option-selected) {
          background-color: transparent !important;
        }
        .ant-select-item-option-selected .ant-select-item-option-state {
          color: #1677ff !important;
          position: absolute !important;
          right: 12px !important;
        }
        /* Ensure content doesn't overlap the absolute check icon */
        .ant-select-item-option-content {
          padding-right: 30px !important;
        }
      `}</style>
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
          lg={6}
          md={12}
          sm={24}
          xs={24}
        >
          <Select
            id="payroll-desktop-employee-search-interact-select"
            data-cy="payroll-desktop-employee-search-interact-select"
            showSearch
            allowClear
            className="w-full"
            style={{ borderRadius: '8px' }}
            placeholder="Search Employee"
            suffixIcon={
              <div
                id="payroll-desktop-employee-search-suffix-icon-container"
                data-cy="payroll-desktop-employee-search-suffix-icon-container"
                style={{
                  borderLeft: '1px solid #d9d9d9',
                  paddingLeft: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  height: '40px',
                  margin: '-12px 0',
                  marginLeft: '-8px',
                }}
              >
                <SearchOutlined
                  style={{ color: '#bfbfbf', fontSize: '18px' }}
                />
              </div>
            }
            onChange={(value) => handleEmployeeSelect(value)}
            size="large"
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
          lg={6}
          md={8}
          sm={12}
          xs={24}
        >
          <Select
            id={`selectDepartment${searchParams.allJobs}`}
            data-cy="payroll-desktop-department-filter-interact-select"
            placeholder="Department"
            onChange={handleDepartmentChange}
            allowClear
            className="w-full"
            size="large"
            style={{ borderRadius: '4px' }}
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
