'use client';
import { useUpdateEmployeeRolePermission } from '@/store/server/features/employees/employeeDetail/mutations';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetRolesWithPermission } from '@/store/server/features/employees/settings/role/queries';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import { Permissions } from '@/types/commons/permissionEnum';
import AccessGuard from '@/utils/permissionGuard';
import { Button, Card, Col, Form, Modal, Row, Select } from 'antd';
import React, { useEffect, useCallback, useState } from 'react';
import { LuPencil } from 'react-icons/lu';
import { useGetPermissionGroups } from '@/store/server/features/employees/settings/groupPermission/queries';
import {
  useGetPermissions,
  useGetPermissionsWithOutPagination,
} from '@/store/server/features/employees/settings/permission/queries';
import { GroupPermissionItem } from '@/store/server/features/employees/settings/groupPermission/interface';
import RolePermissionModal from './rolePermissionModal';

const { Option } = Select;

interface Ids {
  id: string;
}
const RolePermission: React.FC<Ids> = ({ id }) => {
  const [form] = Form.useForm();
  const {
    permissonGroupCurrentPage,
    pageSize,
    permissionCurrentPage,
    setIsModalVisible,
    selectedPermissions: selectedPermisssionData,
    setSelectedGroup,
  } = useSettingStore();

  const {
    setSelectedRoleOnOption,
    setSelectedRoleOnList,
    selectedRoleOnOption,
  } = useSettingStore();

  const { data: employeeData, isLoading } = useGetEmployee(id);
  const { data: rolesWithPermission } = useGetRolesWithPermission();
  const { data: permissionData, isLoading: isPermissionLoading } =
    useGetPermissions(permissionCurrentPage, pageSize);

  const { data: permissionDatawithOutPagination } =
    useGetPermissionsWithOutPagination();
  const { data: groupPermissionData, isLoading: isGroupPermissionLoading } =
    useGetPermissionGroups(permissonGroupCurrentPage, pageSize);
  const {
    mutate: employeeRolePermissionUpdate,
    isLoading: rolePermissionUpdateLoading,
  } = useUpdateEmployeeRolePermission();

  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const {
    setEdit,
    edit,
    selectedPermissions,
    selectedGroupPermissions,
    setSelectedGroupPermissions,
    setSelectedUniqueGroupPermissions,
    setSelectedUniquePermissions,
    selectedBasicGroupPermissions,
    selectedBasicPermissions,
    setSelectedBasicGroupPermissions,
    setSelectedBasicPermissions,
    setSelectedPermissions,
  } = useEmployeeManagementStore();

  useEffect(() => {
    const basicGroup =
      groupPermissionData?.items?.filter((item) => item.isBasic) || [];

    const basicGroups = basicGroup.map((group) => group.id);

    console.log(basicGroups, 'basicGroups');
    setSelectedBasicGroupPermissions(basicGroups);

    const basicPermissions = basicGroup.flatMap(
      (item) => item.permissions?.map((perm) => perm.id) || [],
    );
    setSelectedBasicPermissions(basicPermissions);
  }, [groupPermissionData]);

  useEffect(() => {
    const allPermissionIds =
      employeeData?.userPermissions?.map((perm: any) => perm.permissionId) ||
      [];
    setSelectedUniquePermissions(allPermissionIds);
    setSelectedRoleOnOption(employeeData?.roleId);
  }, [employeeData, selectedPermisssionData]);

  ////////////////////////////////////////////////////////////////

  const onRoleChangeHandler = (value: string) => {
    const selectedRole = rolesWithPermission?.find((role) => role.id === value);
    const newPermissions =
      selectedRole?.permissions?.map((item: any) => item.id) || [];

    setSelectedRoleOnList(selectedRole);

    setSelectedRoleOnOption(value);
    setSelectedUniquePermissions(newPermissions);
  };

  const handleSave = () => {
    setIsModalVisible(false);
  };

  const handlePermissionChange = (value: string[]) => {
    setSelectedUniquePermissions(value);
  };

  const handleUpdateUserRolePermission = (values: any) => {
    employeeRolePermissionUpdate({ id, values });
    setEdit('rolePermission');
  };

  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
  };

  useEffect(() => {
    const selectedRole = rolesWithPermission?.find(
      (role) => role.id === selectedRoleOnOption,
    );
    const newRolePermissions =
      selectedRole?.permissions?.map((item: any) => item.id) || [];

    setSelectedUniquePermissions(newRolePermissions);
  }, [selectedRoleOnOption, rolesWithPermission]);

  const handleSelect = (newSelectedGroupPermissions: string[]) => {
    // Convert to a Set for easier operations
    const currentPermissions = new Set(selectedGroupPermissions);

    // Identify removed groups (groups that were in the state but are not in the new selection)
    const removedGroups = selectedGroupPermissions.filter(
      (id) => !newSelectedGroupPermissions.includes(id), // Corrected comparison
    );

    // Find all permissions for the newly selected groups
    const newPermissions = newSelectedGroupPermissions.flatMap((groupId) => {
      const group = groupPermissionData?.items?.find(
        (item) => item.id === groupId,
      );
      return group?.permissions?.map((perm) => perm.id) || [];
    });

    // Remove permissions belonging to removed groups (only if they are NOT in selectedBasicPermissions)
    removedGroups.forEach((groupId) => {
      const group = groupPermissionData?.items.find(
        (item) => item.id === groupId,
      );
      group?.permissions.forEach((perm: { id: string }) => {
        if (!selectedBasicPermissions.includes(perm.id)) {
          currentPermissions.delete(perm.id); // Correctly remove permissions
        }
      });
    });

    // Merge new permissions, ensuring basic permissions are always included
    const updatedPermissions = Array.from(
      new Set([
        ...selectedBasicPermissions, // Keep basic permissions
        ...newPermissions, // Add new permissions
        ...Array.from(currentPermissions), // Keep existing permissions
      ]),
    );

    // Update state correctly
    setSelectedUniquePermissions(updatedPermissions);
    setSelectedUniqueGroupPermissions(newSelectedGroupPermissions);
  };
  useEffect(() => {
    const selectedRole = rolesWithPermission?.find(
      (role) => role.id === selectedRoleOnOption,
    );
    const newRolePermissions =
      selectedRole?.permissions?.map((item: any) => item.id) || [];

    setSelectedUniquePermissions(newRolePermissions);
  }, [selectedRoleOnOption, rolesWithPermission]);

  console.log(selectedGroupPermissions, '111111selectedGroupPermissions');

  useEffect(() => {
    form.setFieldsValue({
      roleId: selectedRoleOnOption,
      permission: Array.from(
        new Set([...selectedPermissions, ...selectedBasicPermissions]),
      ),
      groupDescriptionForRole: Array.from(
        new Set([
          ...selectedGroupPermissions,
          ...selectedBasicGroupPermissions,
        ]),
      ),
    });
  }, [
    selectedRoleOnOption,
    selectedPermissions,
    selectedGroupPermissions,
    selectedBasicPermissions,
    selectedBasicGroupPermissions,
  ]);

  const data = form.getFieldValue('groupDescriptionForRole');
  console.log(data, 'data');

  return (
    <div>
      <Card
        loading={isLoading}
        title="User Role Permission "
        extra={
          <AccessGuard permissions={[Permissions.UpdateEmployeeDetails]}>
            <LuPencil
              className="cursor-pointer"
              onClick={() => handleEditChange('rolePermission')}
            />
          </AccessGuard>
        }
        className="my-6"
      >
        <Form
          form={form}
          disabled={!edit.rolePermission}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          onFinish={handleUpdateUserRolePermission}
        >
          <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item
                className="font-semibold text-xs"
                name="roleId"
                id="roleId"
                label="Role"
                rules={[{ required: true, message: 'Please select a role!' }]}
              >
                <Select
                  placeholder="Select a role"
                  onChange={onRoleChangeHandler}
                  allowClear
                  value={selectedRoleOnOption}
                >
                  {rolesWithPermission?.map((role) => (
                    <Option key={role.id} value={role.id}>
                      {role.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          {/* Additional Dropdown after Role Selection */}
          <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item
                className="font-semibold text-xs"
                id="groupDescriptionForRole"
                name="groupDescriptionForRole"
                label="Group Permission"
                rules={[
                  { required: true, message: 'Please select an option!' },
                ]}
              >
                <Select
                  id="groupDescriptionForRole"
                  mode="tags"
                  placeholder="Please select"
                  onChange={handleSelect} // Updated function
                >
                  {groupPermissionData?.items?.map(
                    (item: GroupPermissionItem) => (
                      <Option
                        disabled={
                          selectedValues.includes(item.id) && item.isBasic
                        }
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </Option>
                    ),
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item
                className="font-semibold text-xs"
                name="permission"
                id="setOfPermission"
                label="Set of Permissions"
                rules={[
                  {
                    required: true,
                    message: 'Please select at least one permission!',
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  style={{ width: '100%', overflowY: 'auto' }}
                  onChange={handlePermissionChange}
                  options={permissionDatawithOutPagination?.items?.map(
                    (perm: any) => ({
                      label: perm.name,
                      value: perm.id,
                    }),
                  )}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  dropdownStyle={{ maxHeight: '200px', overflowY: 'auto' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row className="flex justify-end">
            <Button
              loading={rolePermissionUpdateLoading}
              htmlType="submit"
              type="primary"
            >
              Save changes
            </Button>
          </Row>
        </Form>
      </Card>
      <RolePermissionModal handleSave={handleSave} />
    </div>
  );
};

export default RolePermission;
