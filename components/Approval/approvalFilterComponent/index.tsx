import { Button, Col, Dropdown, Input, Row, Select } from 'antd';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
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
  handleApprovalTypeChange,
}: {
  searchParams: any;
  handleSearchInput: (value: string, keyValue: any) => void;
  handleDepartmentChange: (
    value: string,
    key?: 'entityType' | 'entityId' | undefined,
    options?: { entityType?: string; entityId?: string },
  ) => void;
  handleApprovalTypeChange: (value: string[]) => void;
}) => {
  const { data: users } = useGetAllUsers();
  const { data: departments } = useGetDepartments();
  const isDepartmentSelected = searchParams?.entityType === 'Department';
  const isUserSelected = searchParams?.entityType === 'User';
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [draftApprovalType, setDraftApprovalType] = useState<string[]>([
    'Leave',
    'WorkFromHome',
  ]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setSelectedDepartmentId(
      isDepartmentSelected ? searchParams?.entityId || '' : '',
    );
    setSelectedUserId(isUserSelected ? searchParams?.entityId || '' : '');
    setDraftApprovalType(
      searchParams?.approvalType?.length
        ? searchParams.approvalType
        : ['Leave', 'WorkFromHome'],
    );
  }, [
    isDepartmentSelected,
    isUserSelected,
    searchParams?.entityId,
    searchParams?.approvalType,
  ]);

  const handleDepartmentSelect = (value?: string) => {
    setSelectedDepartmentId(value || '');
    if (value) setSelectedUserId('');
  };

  const handleUserSelect = (value?: string) => {
    setSelectedUserId(value || '');
    if (value) setSelectedDepartmentId('');
  };

  const handleSaveFilter = () => {
    if (selectedDepartmentId) {
      handleDepartmentChange(selectedDepartmentId, 'entityId', {
        entityType: 'Department',
        entityId: selectedDepartmentId,
      });
    } else if (selectedUserId) {
      handleDepartmentChange(selectedUserId, 'entityId', {
        entityType: 'User',
        entityId: selectedUserId,
      });
    } else {
      handleDepartmentChange('', 'entityType');
      handleDepartmentChange('', 'entityId');
    }

    handleApprovalTypeChange(
      draftApprovalType?.length ? draftApprovalType : ['Leave', 'WorkFromHome'],
    );
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    setSelectedDepartmentId('');
    setSelectedUserId('');
    setDraftApprovalType(['Leave', 'WorkFromHome']);
    handleDepartmentChange('', 'entityType');
    handleDepartmentChange('', 'entityId');
    handleApprovalTypeChange(['Leave', 'WorkFromHome']);
  };

  return (
    <Row gutter={12} justify="space-between" align="middle">
      {/* Search Input - Always visible (desktop & mobile) */}
      <Col xs={16} sm={16} md={6} lg={6} xl={6}>
        <Input
          id={`inputEmployeeNames${searchParams.name}`}
          placeholder="Search workflow name"
          onChange={(e) => handleSearchInput(e.target.value, 'name')}
          className="w-[200px] sm:w-[300px] pr-0 py-0 h-8"
          allowClear
          suffix={
            <div
              className="text-gray-400 border-l border-gray-300 py-1 px-2"
              data-cy="components-approval-approvalfiltercomponent-index-tsx-index-search-input-suffix"
            >
              <SearchOutlined />
            </div>
          }
        />
      </Col>

      {/* Filter Dropdown - opens filters (desktop & mobile) */}
      <Col xs={6} sm={4} md={3} lg={3} xl={3} className="flex justify-end">
        <Dropdown
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
          trigger={['click']}
          placement="bottomRight"
          dropdownRender={() => (
            <div
              id="components-approval-approvalfiltercomponent-index-tsx-index-div-39"
              data-cy="components-approval-approvalfiltercomponent-index-tsx-index-div-39"
              className="bg-white rounded-lg border border-gray-200 min-w-[360px] sm:min-w-[420px] max-w-[92vw] overflow-hidden"
            >
              <div
                className="px-6 pt-5 pb-1 relative"
                data-cy="approval-filter-modal-header"
              >
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="absolute top-5 right-6 p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                  aria-label="Close filter"
                  data-cy="approval-filter-close-button"
                >
                  <CloseOutlined />
                </button>
                <h3
                  className="text-xl font-semibold text-gray-900 pr-8"
                  data-cy="approval-filter-modal-title"
                >
                  Filter
                </h3>
                <p
                  className="text-sm text-gray-500 mt-1"
                  data-cy="approval-filter-modal-subtitle"
                >
                  Select all filters that apply
                </p>
              </div>

              <div
                className="px-6 py-4 space-y-4"
                data-cy="approval-filter-modal-body"
              >
                <Row gutter={12}>
                  <Col span={12}>
                    <label
                      className="text-sm font-medium text-gray-800 mb-2 block"
                      data-cy="approval-filter-department-label"
                    >
                      Department
                    </label>
                    <Select
                      id="approval-filter-department-select"
                      placeholder="Select Department"
                      value={selectedDepartmentId || undefined}
                      onChange={handleDepartmentSelect}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      className="w-full"
                      disabled={!!selectedUserId}
                      options={departments?.map((dept: Department) => ({
                        value: dept.id,
                        label: dept.name,
                      }))}
                      data-cy="approval-filter-department-select"
                    />
                  </Col>
                  <Col span={12}>
                    <label
                      className="text-sm font-medium text-gray-800 mb-2 block"
                      data-cy="approval-filter-user-label"
                    >
                      User
                    </label>
                    <Select
                      id="approval-filter-user-select"
                      placeholder="Select User"
                      value={selectedUserId || undefined}
                      onChange={handleUserSelect}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      className="w-full"
                      disabled={!!selectedDepartmentId}
                      options={users?.items?.map((user: User) => ({
                        value: user.id,
                        label:
                          `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim(),
                      }))}
                      data-cy="approval-filter-user-select"
                    />
                  </Col>
                </Row>

                <div data-cy="approval-filter-approval-type-field">
                  <label
                    className="text-sm font-medium text-gray-800 mb-2 block"
                    data-cy="approval-filter-approval-type-label"
                  >
                    Approval Type
                  </label>
                  <Select
                    placeholder="Select Approval Type"
                    mode="multiple"
                    value={draftApprovalType}
                    onChange={setDraftApprovalType}
                    allowClear
                    className="w-full"
                    data-cy="approval-filter-approval-type-select"
                    maxTagCount="responsive"
                    onClear={() =>
                      setDraftApprovalType(['Leave', 'WorkFromHome'])
                    }
                    options={[
                      { label: 'Leave', value: 'Leave' },
                      { label: 'Work From Home', value: 'WorkFromHome' },
                    ]}
                  />
                </div>
              </div>

              <div
                className="px-6 py-4 flex justify-end gap-2 border-t border-gray-100"
                data-cy="approval-filter-modal-footer"
              >
                <Button
                  onClick={handleResetFilter}
                  className="h-8 border-[#d9d9d9] text-sm font-normal text-[#4d4d4d]"
                  data-cy="approval-filter-reset-button"
                >
                  Reset
                </Button>
                <Button
                  type="primary"
                  className="h-8 font-normal text-sm text-white"
                  onClick={handleSaveFilter}
                  data-cy="approval-filter-save-button"
                >
                  Save Filter
                </Button>
              </div>
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
