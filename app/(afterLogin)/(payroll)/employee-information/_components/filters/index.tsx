import {
  useEmployeeDepartments,
  useGetAllUsers,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Col, Row, Select } from 'antd';
import React, { useState } from 'react';
interface FiltersProps {
  onSearch: (filters: { [key: string]: string }) => void;
}
const Filters: React.FC<FiltersProps> = ({ onSearch }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [SearchValue, setSearchValue] = useState<{ [key: string]: string }>({});
  /* eslint-enable @typescript-eslint/naming-convention */

  const { Option } = Select;
  const { data: employeeData } = useGetAllUsers();
  const { data: EmployeeDepartment } = useEmployeeDepartments();
  const { searchParams, setSearchParams } = useEmployeeManagementStore();

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
    setSearchValue((prev) => {
      const updatedSearchValue = { ...prev, employeeId: value };
      onSearch(updatedSearchValue);
      return updatedSearchValue;
    });
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

        {/* <Col lg={4} md={5} sm={24} xs={24}>
          <Select
            placeholder="Filters"
            onChange={handleTypeChange}
            allowClear
            className="w-full h-14"
            style={{ height: '48px' }}
          >
            <Option value="product">Product</Option>
            <Option value="engineering">Engineering</Option>
          </Select>
        </Col> */}
      </Row>
    </div>
  );
};

export default Filters;
