'use client';
import { useUpdateEmployeeRolePermission } from '@/store/server/features/employees/employeeDetail/mutations';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetPermissionGroupsWithOutPagination } from '@/store/server/features/employees/settings/groupPermission/queries';
import { useGetPermissionsWithOutPagination } from '@/store/server/features/employees/settings/permission/queries';
import { useGetRolesWithPermission } from '@/store/server/features/employees/settings/role/queries';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import { Permissions } from '@/types/commons/permissionEnum';
import AccessGuard from '@/utils/permissionGuard';
import { Button, Card, Col, Form, Row, Select } from 'antd';
import React, { useEffect, useCallback, useState } from 'react';
import { LuPencil } from 'react-icons/lu';

const { Option } = Select;

interface Ids {
  id: string;
}
const RolePermission: React.FC<Ids> = ({ id }) => {
  const [form] = Form.useForm();
  const { data: employeeData, isLoading } = useGetEmployee(id);
  const { data: rolesWithPermission } = useGetRolesWithPermission();
  const {data:groupPermissionData}=useGetPermissionGroupsWithOutPagination();
  const [selectedGroupPermission,setSelectedGroupPermission]=useState<string[]>([]);
  const [selectedPermissionsUnderGroup,setSelectedPermissionsUnderGroup]=useState<string[]>([]);
  const {data:permissionListData}=useGetPermissionsWithOutPagination();


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

    const basicGroupPermissionId = groupPermissionData?.items?.filter((item) => item.isBasic);
    const basicGroupPermissions = groupPermissionData?.items
    ?.filter((item) => item.isBasic)
    ?.flatMap((item) => item.permissions);
  


  // useEffect(() => {

  //   const allPermissionIds =
  //     employeeData?.userPermissions?.map((perm: any) => perm.permissionId) ||
  //     [];

  //   const basicPermissions=basicGroupPermissions?.map((item)=>item.id) ?? []

  //   form.setFieldsValue({
  //     permission: [...allPermissionIds,...basicPermissions,...selectedPermissionsUnderGroup],
  //     roleId: employeeData?.roleId,
  //     groupPermissionId:basicGroupPermissionId?.map((item)=>item.id)
  //   });

  // }, [employeeData, form,selectedPermissionsUnderGroup]);


  const onGroupPermissionChange = (value: string[]) => {
    console.log("Selected Group Permission IDs:", value);
  
    const groupPermissionIds = basicGroupPermissionId?.map((item) => item.id) ?? [];
    const newGroupPermission = Array.from(new Set([...groupPermissionIds, ...value]));
  
    setSelectedGroupPermission(newGroupPermission);
  
    form.setFieldsValue({
      groupPermissionId: newGroupPermission,
    });
  
    const permissionsBelongTo =
      groupPermissionData?.items
        ?.filter((item) => value?.includes(item.id))
        ?.flatMap((item) => item?.permissions) ?? [];
    const updatedPermissionsBelongTo=permissionsBelongTo?.map((item)=>item.id)??[];
  
    setSelectedPermissionsUnderGroup(updatedPermissionsBelongTo);
  };
  
  useEffect(() => {
    const allPermissionIds =
      employeeData?.userPermissions?.map((perm: any) => perm.permissionId) || [];
  
    const basicPermissions = basicGroupPermissions?.map((item) => item.id) ?? [];
  

    // console.log([...selectedPermissionsUnderGroup],"All Permissions")
    // const updatedSelectedPermissionsUnderGroup = selectedPermissionsUnderGroup?.map((item) => item.id) ?? [];
    form.setFieldsValue({
      permission: [...new Set([...allPermissionIds, ...basicPermissions, ...selectedPermissionsUnderGroup])],
      roleId: employeeData?.roleId,
      groupPermissionId: selectedGroupPermission, // Ensure the latest state is used
    });
  
  }, [employeeData, form, selectedPermissionsUnderGroup, selectedGroupPermission]);
  


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
        // permission: newPermissions,
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



  // const onGroupPermissionChange =(value:string[])=>{
  //   const groupPermissionIds=basicGroupPermissionId?.map((item)=>item.id)??[];
  //   const newGroupPermission=[...groupPermissionIds,...value];
  //   setSelectedGroupPermission(newGroupPermission);

  //   form.setFieldsValue({
  //     'groupPermissionId':newGroupPermission
  //   })
  //    const permissionsBelongTo=groupPermissionData?.items?.filter((item)=>value?.includes(item.id))?.flatMap((item)=>item?.permissions)??[];
  //    setSelectedPermissionsUnderGroup(permissionsBelongTo)
  
  // }

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
                name="groupPermissionId"
                id="groupPermissionId"
                label="Group Permission"
                rules={[{ required: true, message: 'Please select a role!' }]}
              >
                <Select
                  placeholder="Select a Group Permission"
                  onChange={onGroupPermissionChange}
                  allowClear
                  mode='multiple'
                  value={selectedGroupPermission}
                >
                  {groupPermissionData?.items?.map((groupPermission) => (
                    <Option key={groupPermission.id} value={groupPermission.id}>
                      {groupPermission.name}
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
                  // options={
                  //   selectedRoleOnOption
                  //     ? rolesWithPermission
                  //         ?.find((role) => role.id === selectedRoleOnOption)
                  //         ?.permissions.map((perm) => ({
                  //           label: perm.name,
                  //           value: perm.id,
                  //         }))
                  //     : employeeData?.userPermissions?.map((perm: any) => ({
                  //         label: perm.permission?.name,
                  //         value: perm.permissionId,
                  //       }))
                  // }
                  value={selectedPermissions}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  dropdownStyle={{ maxHeight: '200px', overflowY: 'auto' }}
                >
                  {permissionListData?.items?.map((permission) => (
                        <Option key={permission.id} value={permission.id}>
                          {permission.name}
                        </Option>
                  ))}
                </Select>
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
