'use client';
import { useUpdateEmployeeRolePermission } from '@/store/server/features/employees/employeeDetail/mutations';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetPermissionsWithOutPagination } from '@/store/server/features/employees/settings/permission/queries';
import { useGetRolesWithPermission } from '@/store/server/features/employees/settings/role/queries';
import { EditState, useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import { Button, Card, Col, Form, Row, Select } from 'antd';
import React, { useEffect, useCallback } from 'react';
import { LuPencil } from 'react-icons/lu';

const { Option } = Select;

interface Ids {
  id: string;
}
const RolePermission: React.FC<Ids> = ({ id }) => {
  const [form] = Form.useForm();
  const { data: employeeData,isLoading } = useGetEmployee(id);
  const { data: permissionList, error: permissionError } =
    useGetPermissionsWithOutPagination();
  const { data: rolesWithPermission, error: roleError } =
    useGetRolesWithPermission();
  const {
    setSelectedRoleOnOption,
    setSelectedRoleOnList,
    selectedRoleOnOption,
  } = useSettingStore();
  const {mutate:employeeRolePermissionUpdate,isLoading:rolePermissionUpdateLoading}=useUpdateEmployeeRolePermission()
  const { setEdit, edit,selectedPermissions, setSelectedPermissions } =
    useEmployeeManagementStore();

  const onRoleChangeHandler = useCallback(
    (value: string) => {
      const selectedRole = rolesWithPermission?.find(
        (role) => role.id === value,
      );
      setSelectedRoleOnList(selectedRole);
      setSelectedRoleOnOption(value);

      const newPermissions =
        selectedRole?.permissions?.map((item: any) => item.id) || [];
      setSelectedPermissions(newPermissions);
    },
    [
      rolesWithPermission,
      setSelectedRoleOnList,
      setSelectedRoleOnOption,
      setSelectedPermissions,
    ],
  );

  const handlePermissionChange = useCallback(
    (value: string[]) => {
      setSelectedPermissions(value);
    },
    [setSelectedPermissions],
  );

  useEffect(() => {
    if (edit.rolePermission && employeeData) {
      form.setFieldsValue({
        roleId: employeeData?.role?.id,
        permission: employeeData?.userPermissions?.map((perm: any) => perm?.permissionId),
      });
      setSelectedRoleOnOption(employeeData?.role?.id);
      setSelectedPermissions(employeeData?.userPermissions?.map((perm: any) => perm?.permissionId));
    }
  }, [edit.rolePermission, employeeData, form, setSelectedRoleOnOption, setSelectedPermissions]);

  if (permissionError || roleError) {
    return <div>Error loading data</div>; // Handle errors gracefully
  }
  const handleUpdateUserRolePermission=(values:any)=>{
    employeeRolePermissionUpdate({id,values});
    setEdit('rolePermission');
  }
  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
  };
  return (
    <div>
      <Card
      loading={isLoading}
      title="User Role Permission "
      extra={<LuPencil className='cursor-pointer' onClick={() => handleEditChange('rolePermission')} />}
      className="my-6"
    >
      <Form
          form={form}
          disabled={edit.rolePermission}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          onFinish={handleUpdateUserRolePermission}>
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
      <Row className='flex justify-end'>
        <Button loading={rolePermissionUpdateLoading} htmlType='submit' type='primary'>Save changes</Button>
      </Row>
      </Form>
      </Card>
    </div>
  );
};

export default RolePermission;
