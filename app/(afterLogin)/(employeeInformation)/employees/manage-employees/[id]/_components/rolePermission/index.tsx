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
import { Button, Card, Col, Form, Row, Select } from 'antd';
import React, { useEffect, useCallback } from 'react';
import { LuPencil } from 'react-icons/lu';

const { Option } = Select;

interface Ids {
  id: string;
}
const RolePermission: React.FC<Ids> = ({ id }) => {
  const [form] = Form.useForm();
  const { data: employeeData, isLoading } = useGetEmployee(id);
  const { data: rolesWithPermission } = useGetRolesWithPermission();

  const {
    setSelectedRoleOnOption,
    setSelectedRoleOnList,
    selectedRoleOnOption,
  } = useSettingStore();

  const {
    mutate: employeeRolePermissionUpdate,
    isLoading: rolePermissionUpdateLoading,
  } = useUpdateEmployeeRolePermission();

  const { setEdit, edit, selectedPermissions, setSelectedPermissions } =
    useEmployeeManagementStore();

  useEffect(() => {
    const allPermissionIds =
      employeeData?.userPermissions?.map((perm: any) => perm.permissionId) ||
      [];
    form.setFieldsValue({
      permission: allPermissionIds,
      roleId: employeeData?.roleId,
    });
  }, [employeeData, form]);

  const onRoleChangeHandler = useCallback(
    (value: string) => {
      const selectedRole = rolesWithPermission?.find(
        (role) => role.id === value,
      );
      const newPermissions =
        selectedRole?.permissions?.map((item: any) => item.id) || [];

      setSelectedRoleOnList(selectedRole);
      setSelectedRoleOnOption(value);
      setSelectedPermissions(newPermissions);

      form.setFieldsValue({
        permission: newPermissions,
        roleId: value,
      });
    },
    [
      rolesWithPermission,
      setSelectedRoleOnList,
      setSelectedRoleOnOption,
      setSelectedPermissions,
      form,
    ],
  );

  const handlePermissionChange = useCallback(
    (value: string[]) => {
      setSelectedPermissions(value);
    },
    [setSelectedPermissions],
  );

  const handleUpdateUserRolePermission = (values: any) => {
    employeeRolePermissionUpdate({ id, values });
    setEdit('rolePermission');
  };

  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
  };

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
                  options={
                    selectedRoleOnOption
                      ? rolesWithPermission
                          ?.find((role) => role.id === selectedRoleOnOption)
                          ?.permissions.map((perm) => ({
                            label: perm.name,
                            value: perm.id,
                          }))
                      : employeeData?.userPermissions?.map((perm: any) => ({
                          label: perm.permission.name,
                          value: perm.permissionId,
                        }))
                  }
                  value={selectedPermissions}
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
    </div>
  );
};

export default RolePermission;
