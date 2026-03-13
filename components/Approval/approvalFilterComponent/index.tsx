import { EntityTypeList } from '@/store/server/features/approver/interface';
import { Button, Col, Dropdown, Input, Row, Select } from 'antd';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useApprovalStore } from '@/store/uistate/features/approval';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
interface User {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}

interface Department {
  id: string;
  name: string;
}

const ApprovalFilterComponent = ({
  searchParams,
  handleSearchInput,
  handleDepartmentChange,
}: {
  searchParams: any;
  handleSearchInput: (value: string, keyValue: any) => void;
  handleDepartmentChange: (
    value: string,
    key?: 'entityType' | 'entityId' | undefined,
    options?: { entityType?: string; entityId?: string },
  ) => void;
}) => {
  const { selectedEntityType, setSelectedEntityType } = useApprovalStore();
  const EntityType: EntityTypeList[] = [
    {
      name: 'Department',
    },
    {
      name: 'User',
    },
  ];

  const { data: users } = useGetAllUsers();
  const { data: departments } = useGetDepartments();

  const { Option } = Select;

  const handleAppliedForChange = (value: string) => {
    setSelectedEntityType(value);
    // When "Applied For" is selected, set entityType in store
    // We need to pass this to parent to update the store
    if (value) {
      // Set entityType to "Department" or "User"
      handleDepartmentChange(value, 'entityType');
      // Clear entityId when switching entity type
      handleDepartmentChange('', 'entityId');
    } else {
      // Clear both when deselecting
      handleDepartmentChange('', 'entityType');
      handleDepartmentChange('', 'entityId');
    }
  };

  const handleEntityTypeChange = (value: string) => {
    // When a user/department is selected, pass the ID
    // The parent will handle setting entityId
    handleDepartmentChange(value, 'entityId', {
      entityType: selectedEntityType,
      entityId: value,
    });
  };

  return (
    <Row gutter={12} justify="space-between" align="middle">
      {/* Search Input - Always visible (desktop & mobile) */}
      <Col xs={16} sm={16} md={6} lg={6} xl={6}>
        <Input
          id={`inputEmployeeNames${searchParams.name}`}
          placeholder="Search workflow name"
          onChange={(e) => handleSearchInput(e.target.value, 'name')}
          className="w-full"
          allowClear
        />
      </Col>

      {/* Filter Dropdown - opens filters (desktop & mobile) */}
      <Col xs={6} sm={4} md={3} lg={3} xl={3} className="flex justify-end">
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          dropdownRender={() => (
            <div
              id="components-approval-approvalfiltercomponent-index-tsx-index-div-39"
              data-cy="components-approval-approvalfiltercomponent-index-tsx-index-div-39"
              className="bg-white shadow-lg rounded-md p-4 w-72 space-y-4 border border-[#D9D9D9]"
            >
              <Select
                placeholder="Applied for"
                onChange={handleAppliedForChange}
                allowClear
                className="w-full"
                onClear={() => {
                  setSelectedEntityType('');
                  handleDepartmentChange('');
                }}
              >
                {EntityType?.map((item: any, index) => (
                  <Option key={index} value={item?.name}>
                    {item?.name}
                  </Option>
                ))}
              </Select>

              {selectedEntityType === 'User' && (
                <Select
                  id={`selectUserDropdown${searchParams.entityType}`}
                  placeholder="User"
                  onChange={handleEntityTypeChange}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  className="w-full"
                  options={users?.items?.map((user: User) => ({
                    value: user.id,
                    label:
                      `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim(),
                  }))}
                />
              )}

              {selectedEntityType === 'Department' && (
                <Select
                  id={`selectDepartmentDropdown${searchParams.entityType}`}
                  placeholder="Department"
                  onChange={handleEntityTypeChange}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  className="w-full"
                  options={departments?.map((dept: Department) => ({
                    value: dept.id,
                    label: dept.name,
                  }))}
                />
              )}
            </div>
          )}
        >
          <Button
            icon={<FilterAltOutlinedIcon fontSize="small" />}
            className="h-8 border border-[#D9D9D9] text-[#4d4d4d]"
          >
            <span
              id="components-approval-approvalfiltercomponent-index-tsx-index-button-filter-text"
              data-cy="components-approval-approvalfiltercomponent-index-tsx-index-button-filter-text"
            >
              Filter
            </span>
          </Button>
        </Dropdown>
      </Col>
    </Row>
  );
};

export default ApprovalFilterComponent;
