import { useGetPermissionGroupsWithOutPagination } from '@/store/server/features/employees/settings/groupPermission/queries';
import { useGetPermissionsWithOutPagination } from '@/store/server/features/employees/settings/permission/queries';
import { useGetRolesWithPermission } from '@/store/server/features/employees/settings/role/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import { Col, Form, Row, Select } from 'antd';
import React, { useEffect, useCallback } from 'react';

const { Option } = Select;

interface RolePermissionFormProps {
  form: any; // Define a proper type for the form if possible
}

const RolePermissionForm: React.FC<RolePermissionFormProps> = ({ form }) => {
  const { data: permissionList, error: permissionError } =
    useGetPermissionsWithOutPagination();
  const { data: rolesWithPermission, error: roleError } =
    useGetRolesWithPermission();
  const { data: groupPermissionData } =
    useGetPermissionGroupsWithOutPagination();
  const {
    setSelectedRoleOnOption,
    setSelectedRoleOnList,
    selectedRoleOnOption,
  } = useSettingStore();
  const { selectedPermissions, setSelectedPermissions } =
    useEmployeeManagementStore();

  // Calculate basic group permissions
  const basicGroupPermissionId =
    groupPermissionData?.items?.filter((item) => item.isBasic) ?? [];
  const basicGroupPermissions = basicGroupPermissionId.flatMap(
    (item) => item.permissions ?? [],
  );

  const onRoleChangeHandler = useCallback(
    (value: string) => {
      const selectedRole = rolesWithPermission?.find(
        (role) => role.id === value,
      );
      setSelectedRoleOnList(selectedRole);
      setSelectedRoleOnOption(value);

      const rolePermissions =
        selectedRole?.permissions?.map((item: any) => item.id) || [];

      // Include basic group permissions along with role permissions
      const newPermissions = Array.from(
        new Set([
          ...rolePermissions,
          ...(basicGroupPermissions?.map((perm) => perm.id) ?? []),
        ]),
      );
      setSelectedPermissions(newPermissions);
    },
    [
      rolesWithPermission,
      setSelectedRoleOnList,
      setSelectedRoleOnOption,
      setSelectedPermissions,
      basicGroupPermissions,
    ],
  );

  const handlePermissionChange = useCallback(
    (value: string[]) => {
      setSelectedPermissions(value);
    },
    [setSelectedPermissions],
  );

  useEffect(() => {
    form.setFieldsValue({
      setOfPermission: selectedPermissions,
      roleId: selectedRoleOnOption,
    });
  }, [selectedPermissions, selectedRoleOnOption, form]);

  if (permissionError || roleError) {
    return <div data-cy="role-permission-form-error">Error loading data</div>; // Handle errors gracefully
  }
  return (
    <div id="role-permission-form" data-cy="role-permission-form">
      <Row
        gutter={16}
        id="role-permission-role-row"
        data-cy="role-permission-role-row"
      >
        <Col
          xs={24}
          sm={24}
          id="role-permission-role-col"
          data-cy="role-permission-role-col"
        >
          <Form.Item
            className="font-normal text-base"
            name="roleId"
            id="roleId"
            data-cy="roleId"
            label={
              <span
                className="mb-1 font-normal text-sm text-[#030712]"
                id="role-permission-role-label"
                data-cy="role-permission-role-label"
              >
                Role{' '}
              <span
                style={{ color: 'red' }}
                data-cy={`role-permission-role-required`}
              >
                *
              </span>
              </span>
            }
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select
              placeholder="Select a role"
              onChange={onRoleChangeHandler}
              allowClear
              value={selectedRoleOnOption}
              id="role-permission-role-select"
              data-cy="role-permission-role-select"
            >
              {rolesWithPermission?.map((role) => (
                <Option
                  key={role.id}
                  value={role.id}
                  id={`role-permission-role-option-${role.id}`}
                  data-cy={`role-permission-role-option-${role.id}`}
                >
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row
        gutter={16}
        id="role-permission-permissions-row"
        data-cy="role-permission-permissions-row"
      >
        <Col
          xs={24}
          sm={24}
          id="role-permission-permissions-col"
          data-cy="role-permission-permissions-col"
        >
          <Form.Item
            className="font-normal text-base hidden"
            name="setOfPermission"
            id="setOfPermission"
            data-cy="setOfPermission"
            label="Set of Permissions"
            rules={[
              {
                required: true,
                message: 'Please select at least one permission!',
              },
            ]}
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              onChange={handlePermissionChange}
              options={permissionList?.items.map((option) => ({
                label: option.name,
                value: option.id,
              }))}
              value={selectedPermissions}
              allowClear
              className="text-xs"
              id="role-permission-permissions-select"
              data-cy="role-permission-permissions-select"
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default RolePermissionForm;
