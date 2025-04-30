import {
  useEmployeeDepartments,
  useGetAllUsers,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Col, Row, Select } from 'antd';

interface FiltersProps {
  onSearch: (filters: { [key: string]: string }) => void;
}
const Filters: React.FC<FiltersProps> = () => {
  const { Option } = Select;
  const { data: employeeData } = useGetAllUsers();
  const { data: EmployeeDepartment } = useEmployeeDepartments();
  const { searchParams, setSearchValue, setSearchParams } =
    useEmployeeManagementStore();

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
