import { EntityTypeList } from '@/store/server/features/approver/interface';
import { useAllAllowanceStore } from '@/store/uistate/features/compensation/allowance';
import { Button, Col, Input, Modal, Row, Select } from 'antd';
import React, { useState } from 'react';
import { LuSettings2 } from 'react-icons/lu';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';

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
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');

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
  const { isMobileFilterVisible, setIsMobileFilterVisible } =
    useAllAllowanceStore();

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

  const isAppliedForSelected = !!selectedEntityType;

  return (
    <Row gutter={12} justify="space-between">
      {/* Search Input - Always visible */}
      <Col
        xl={isAppliedForSelected ? 8 : 16}
        lg={isAppliedForSelected ? 8 : 16}
        md={isAppliedForSelected ? 8 : 16}
        sm={isAppliedForSelected ? 8 : 16}
        xs={isAppliedForSelected ? 24 : 20}
      >
        <Input
          id={`inputEmployeeNames${searchParams.name}`}
          placeholder="Search workflow name"
          onChange={(e) => handleSearchInput(e.target.value, 'name')}
          className="w-full h-10"
          allowClear
        />
      </Col>

      {/* Applied For Dropdown */}
      <Col
        xl={isAppliedForSelected ? 8 : 8}
        lg={isAppliedForSelected ? 8 : 8}
        md={isAppliedForSelected ? 8 : 8}
        sm={isAppliedForSelected ? 8 : 8}
        xs={isAppliedForSelected ? 24 : 4}
      >
        <Select
          placeholder="Applied for"
          onChange={handleAppliedForChange}
          allowClear
          className="w-full h-10 hidden sm:block"
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
        {!isAppliedForSelected && (
          <div className="sm:hidden">
            <Button
              type="default"
              icon={<LuSettings2 size={24} className="text-gray-600" />}
              onClick={() => setIsMobileFilterVisible(!isMobileFilterVisible)}
              className="flex w-10 h-10 hover:bg-gray-50 border-gray-200"
            />
          </div>
        )}
      </Col>

      {/* Conditional: User Dropdown - Only shown when User is selected */}
      {selectedEntityType === 'User' && (
        <Col xl={8} lg={8} md={8} sm={8} xs={24}>
          <Select
            id={`selectUser${searchParams.entityType}`}
            placeholder="User"
            onChange={handleEntityTypeChange}
            allowClear
            showSearch
            optionFilterProp="label"
            className="w-full h-10 hidden sm:block"
            options={users?.items?.map((user: User) => ({
              value: user.id,
              label:
                `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim(),
            }))}
          />
          <div className="sm:hidden mb-4">
            <Button
              type="default"
              icon={<LuSettings2 size={24} className="text-gray-600" />}
              onClick={() => setIsMobileFilterVisible(!isMobileFilterVisible)}
              className="flex w-10 h-10 hover:bg-gray-50 border-gray-200"
            />
          </div>
        </Col>
      )}

      {/* Conditional: Department Dropdown - Only shown when Department is selected */}
      {selectedEntityType === 'Department' && (
        <Col xl={8} lg={8} md={8} sm={8} xs={24}>
          <Select
            id={`selectDepartment${searchParams.entityType}`}
            placeholder="Department"
            onChange={handleEntityTypeChange}
            allowClear
            showSearch
            optionFilterProp="label"
            className="w-full h-10 hidden sm:block"
            options={departments?.map((dept: Department) => ({
              value: dept.id,
              label: dept.name,
            }))}
          />
          <div className="sm:hidden mb-4">
            <Button
              type="default"
              icon={<LuSettings2 size={24} className="text-gray-600" />}
              onClick={() => setIsMobileFilterVisible(!isMobileFilterVisible)}
              className="flex w-10 h-10 hover:bg-gray-50 border-gray-200"
            />
          </div>
        </Col>
      )}

      {/* Mobile Filter Drawer */}
      <Modal
        title="Filter Options"
        centered
        onCancel={() => setIsMobileFilterVisible(false)}
        open={isMobileFilterVisible}
        width="85%"
        footer={
          <div className="flex justify-center items-center space-x-4">
            <Button
              type="default"
              className="px-10"
              onClick={() => setIsMobileFilterVisible(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setIsMobileFilterVisible(false)}
              type="primary"
              className="px-10"
            >
              Filter
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            id={`inputEmployeeNamesMobile${searchParams.name}`}
            placeholder="Search workflow name"
            onChange={(e) => handleSearchInput(e.target.value, 'name')}
            className="w-full h-10"
            allowClear
          />

          <Select
            placeholder="Applied for"
            onChange={handleAppliedForChange}
            allowClear
            className="w-full h-10"
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
              id={`selectUserMobile${searchParams.entityType}`}
              placeholder="User"
              onChange={handleEntityTypeChange}
              allowClear
              showSearch
              optionFilterProp="label"
              className="w-full h-10"
              options={users?.items?.map((user: User) => ({
                value: user.id,
                label:
                  `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim(),
              }))}
            />
          )}

          {selectedEntityType === 'Department' && (
            <Select
              id={`selectDepartmentMobile${searchParams.entityType}`}
              placeholder="Department"
              onChange={handleEntityTypeChange}
              allowClear
              showSearch
              optionFilterProp="label"
              className="w-full h-10"
              options={departments?.map((dept: Department) => ({
                value: dept.id,
                label: dept.name,
              }))}
            />
          )}
        </div>
      </Modal>
    </Row>
  );
};

export default ApprovalFilterComponent;
