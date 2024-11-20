'use client';
import { EntityTypeList } from '@/store/server/features/approver/interface';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { useDebounce } from '@/utils/useDebounce';
import { Col, Input, Row, Select } from 'antd';
const { Option } = Select;

const ApprovalFilter = () => {
  const { searchParams, setSearchParams } = useApprovalStore();
  const EntityType: EntityTypeList[] = [
    {
      name: 'Department',
    },
    {
      name: 'Hierarchy',
    },
    {
      name: 'User',
    },
  ];
  const handleSearchEmployee = async (
    value: string,
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
  const handleDepartmentChange = (value: string) => {
    onSelectChange(value, 'entityType');
  };
  return (
    <div>
      <Row gutter={[16, 24]} justify="space-between">
        <Col xl={10} lg={12} md={24}>
          <div className="w-full">
            <Input
              id={`inputEmployeeNames${searchParams.name}`}
              placeholder="Search workflow name"
              onChange={(e) => handleSearchInput(e.target.value, 'name')}
              className="w-full h-14"
              allowClear
            />
          </div>
        </Col>

        <Col xl={8} lg={12} md={24}>
          <Select
            id={`selectDepartment${searchParams.entityType}`}
            placeholder="Applied For"
            onChange={handleDepartmentChange}
            allowClear
            className="w-full h-14"
          >
            {EntityType?.map((item: any, index) => (
              <Option key={index} value={item?.name}>
                {item?.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
};
export default ApprovalFilter;
