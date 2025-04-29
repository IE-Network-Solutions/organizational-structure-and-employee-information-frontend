import { useIsMobile } from '@/components/common/hooks/useIsMobile';
import {
  useEmployeeDepartments,
  useGetAllUsers,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Button, Col, Modal, Row, Select } from 'antd';
import { IoMdSwitch } from 'react-icons/io';

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
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 mr-2">
            <Select
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
          </div>
          <Button
          className="p-5 min-h-12  text-gray-500 border border-gray-300"
          onClick={() => setIsModalOpen(true)}
          icon={<IoMdSwitch size={20} className="text-gray-700" />}
        />
        </div>

        <Modal
          title="Filter"
          style={{ top: 200 }} // <-- This adjusts the top margin
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>,
            <Button
              key="filter"
              type="primary"
              onClick={() => setIsModalOpen(false)}
              className="bg-purple-600"
            >
              Filter
            </Button>,
          ]}
        >
          <div className="py-4">
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
          </div>
        </Modal>
      </>
    );
  }
  return (
    <div className="mb-6">
      <Row
        gutter={[16, 16]}
        align="middle"
        justify="space-between"
        style={{ flexWrap: 'nowrap' }}
      >
        <Col lg={16} md={14} sm={24} xs={24}>
          <Select
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
      </Row>
    </div>
  );
};

export default Filters;
