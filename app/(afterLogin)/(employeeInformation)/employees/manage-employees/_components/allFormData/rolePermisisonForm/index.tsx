import { useGetPermissionsWithOutPagination } from '@/store/server/features/employees/settings/permission/queries';
import { useGetRolesWithPermission } from '@/store/server/features/employees/settings/role/queries';
import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import { Col, Form, Row, Select } from 'antd';
import React, { useEffect, useCallback } from 'react';

const { Option } = Select;

interface RolePermissionFormProps {
  form: any; // Define a proper type for the form if possible
}

const RolePermissionForm: React.FC<RolePermissionFormProps> = ({ form }) => {
  const { data: permissionList, error: permissionError } = useGetPermissionsWithOutPagination();
  const { data: rolesWithPermission, error: roleError } = useGetRolesWithPermission();
  const { setSelectedRoleOnOption, setSelectedRoleOnList, selectedRoleOnOption } = useSettingStore();
  const { selectedPermissions, setSelectedPermissions } = useEmployeeManagmentStore();

  const onRoleChangeHandler = useCallback((value: string) => {
    const selectedRole = rolesWithPermission?.find((role) => role.id === value);
    setSelectedRoleOnList(selectedRole);
    setSelectedRoleOnOption(value);

    const newPermissions = selectedRole?.permissions?.map((item: any) => item.id) || [];
    setSelectedPermissions(newPermissions);
  }, [rolesWithPermission, setSelectedRoleOnList, setSelectedRoleOnOption, setSelectedPermissions]);

  const handlePermissionChange = useCallback((value: string[]) => {
    setSelectedPermissions(value);
  }, [setSelectedPermissions]);

  useEffect(() => {
    form.setFieldsValue({ setOfPermission: selectedPermissions, set: 'ahmedin' });
  }, [selectedPermissions, form]);

  if (permissionError || roleError) {
    return <div>Error loading data</div>; // Handle errors gracefully
  }

  return (
    <div>
      <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
        Role Permission
      </div>
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
      <Row gutter={16}>
        <Col xs={24} sm={24}>
          <Form.Item
            className="font-semibold text-xs"
            name="setOfPermission"
            id="setOfPermission"
            label="Set of Permissions"
            rules={[
              { required: true, message: 'Please select at least one permission!' }
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
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default RolePermissionForm;
