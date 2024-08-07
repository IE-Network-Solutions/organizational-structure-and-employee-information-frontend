import { useGetPermissionsWithOutPagination } from '@/store/server/features/employees/settings/permission/queries';
import { useGetRolesWithPermission } from '@/store/server/features/employees/settings/role/queries';
import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import { Col, Form, Row, Select } from 'antd';
import React, { useEffect } from 'react';

const { Option } = Select;

const RolePermissionForm = ({ form }: any) => {
  const { data: Permissionlist } = useGetPermissionsWithOutPagination();
  const { data: rolesWithPermission } = useGetRolesWithPermission();
  const {
    setSelectedRoleOnOption,
    setSelectedRoleOnList,
    selectedRoleOnOption,
  } = useSettingStore();
  const { selectedPermissions, setSelectedPermissions } =
    useEmployeeManagmentStore();

  const onRoleChangeHandler = (value: string) => {
    const selectedRole = rolesWithPermission?.find((role) => role.id === value);
    setSelectedRoleOnList(selectedRole);
    setSelectedRoleOnOption(value);

    const newPermissions =
      selectedRole?.permissions?.map((item: any) => item.id) || [];
    setSelectedPermissions(newPermissions);
  };

  const handlePermissionChange = (value: string[]) => {
    setSelectedPermissions(value);
  };

  useEffect(() => {
    form.setFieldValue('setOfPermission', selectedPermissions);
    form.setFieldValue('set', 'ahmedin');
  }, [selectedPermissions, form]);

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
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select a role"
              onChange={onRoleChangeHandler}
              allowClear
              value={selectedRoleOnOption}
            >
              {rolesWithPermission?.map((role: any) => (
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
              options={Permissionlist?.items.map((option) => ({
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
