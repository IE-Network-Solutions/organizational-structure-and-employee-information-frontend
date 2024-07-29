'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Modal, Button } from 'antd';
import {
  GroupPermissionkey,
  Permission,
  Role,
} from '@/types/dashboard/adminManagement';
import { RiErrorWarningFill } from 'react-icons/ri';
import { useGetRole, useGetRoles } from '@/store/server/features/employees/settings/role/queries';
import { useGetPermissions } from '@/store/server/features/employees/settings/permission/queries';
import { useGetPermissionGroups } from '@/store/server/features/employees/settings/groupPermission/queries';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import { useAddRole, useUpdateRole } from '@/store/server/features/employees/settings/role/mutations';

const ListOfRoles = () => {
  const [form] = Form.useForm();
  const [groupPermissionList, setGroupPermissionList] = useState<any>([]);
  const [permissionList, setPermissionList] = useState<any>([]);
  const createRoleMutation=useAddRole();
  const updateRoleMutation=useUpdateRole();

  const {
    selectedRole,
    setCurrentModal,
    roleCurrentPage,
    pageSize,
    currentModal,
    setSelectedRole,
  } = useSettingStore();

  const { data: rolePermissionsData,refetch } = useGetRole(selectedRole);
  const { data: permissionData } = useGetPermissions();
  const { data: groupPermissionData } = useGetPermissionGroups();

  useEffect(() => {
    if (selectedRole) {
      refetch();
    }
  }, [selectedRole, refetch]);

  useEffect(() => {
    if (rolePermissionsData) {
      const permission = rolePermissionsData?.permissions?.map((item: any) => ({
        value: item.id,
        label: item.name,
      }));
      setPermissionList(permission || []);
    }
  }, [rolePermissionsData]);
  const convertPermissions = (permissions: any): string[] => {
    return permissions.map((permission: any) => {
      if (typeof permission === 'string') {
        return permission;
      }
      return permission.value;
    });
  };
  const handleChangeOnGroupSelection = (val: any) => {
    const newPermissions = groupPermissionData
      ?.filter((group: any) => val.includes(group.id.toString()))
      .flatMap((group: any) =>
        group?.permissions?.map((item: any) => ({
          value: item.id,
          label: item.name,
        })),
      );

    // const combinedPermissions = [...permissionList, ...newPermissions];
    const combinedPermissions = [...permissionList];

    const permissionSet = new Set(
      combinedPermissions.map((permission) => permission?.value),
    );
    const updatedPermissionList = Array.from(permissionSet).map((value) =>
      combinedPermissions.find((permission) => permission.value === value),
    );
    setGroupPermissionList(updatedPermissionList);
  };
  useEffect(() => {
    if (selectedRole) {
      form.setFieldsValue({
        id: rolePermissionsData?.id,
        name: rolePermissionsData?.name,
        description: rolePermissionsData?.description,
        permission: groupPermissionList?.length
          ? groupPermissionList
          : permissionList,
      });
    } else {
      form.setFieldsValue({
        permission: groupPermissionList?.length
          ? groupPermissionList
          : permissionList,
      });
    }
  }, [
    selectedRole,
    groupPermissionList,
    permissionList,
    form,
    rolePermissionsData,
  ]);

  const handleCreateRole = async (values: Role) => {
    const convertedValues = {
      ...values,
      permission: convertPermissions(values.permission),
    };
    createRoleMutation.mutate(convertedValues);
    setCurrentModal(null);
  };
  const handleRoleUpdate = (values: any) => {
    const convertedValues = {
      ...values,
      permission: convertPermissions(values.permission),
    };
    updateRoleMutation.mutate(convertedValues);
    setCurrentModal(null);
  };

  const modalTitle = (
    <div className="flex w-full justify-center items-center text-md font-extrabold">
      {currentModal === 'editRoleModal' ? 'Edit Role' : 'New Role'}
    </div>
  );

  return (
    <Modal
      // width="50%"
      className="w-3/4 md:w-1/4 lg:w-1/2 xl:w-1/2"
      title={modalTitle}
      style={{ top: '10vh' }}
      open={true}
      footer={null}
      onCancel={() => {
        form.resetFields();
        setSelectedRole(null);
        setCurrentModal(null);
      }}
    >
      <Form
        form={form}
        name="basic"
        layout="vertical"
        onFinish={
          currentModal === 'editRoleModal' ? handleRoleUpdate : handleCreateRole
        }
        className="p-4 sm:p-2 md:p-4 lg:p-6"
      >
        <div className="grid">
          {currentModal === 'editRoleModal' && (
            <Form.Item name="id">
              <Input type="hidden" />
            </Form.Item>
          )}
          <div className="mb-1">
            <Form.Item
              name="name"
              label={
                <p className="text-xs font-bold text-gray-600">Role name</p>
              }
              rules={[{ required: true, message: 'Enter group name!' }]}
            >
              <Input
                id="roleNameId"
                className="h-10 text-xs text-gray-600"
                placeholder="Enter group name"
              />
            </Form.Item>
          </div>
          <div className="mb-1">
            <Form.Item
              name="description"
              label={
                <p className="text-xs font-bold text-gray-600">
                  Role Description
                </p>
              }
              rules={[{ required: true, message: 'Enter role description!' }]}
            >
              <Input
                id="roleDescriptionId"
                className="h-10 text-xs text-gray-600"
                placeholder="Enter role description"
              />
            </Form.Item>
          </div>
          <div className="mb-1">
            <p className="text-xs font-bold text-gray-600">Group Permission</p>
            <Select
              id="groupDescriptionForRole"
              mode="tags"
              size="large"
              placeholder="Please select"
              style={{ width: '100%', fontSize: '0.75rem' }}
              onChange={handleChangeOnGroupSelection}
              options={groupPermissionData?.map(
                (item: GroupPermissionkey) => ({
                  value: item?.id,
                  label: item?.name,
                }),
              )}
            />
            <p className="flex gap-2 text-xs text-gray-600 mt-2">
              <RiErrorWarningFill className="mt-1" />
              <span>
                Group permission allows you to get a bundle of permissions in
                one place.
              </span>
            </p>
          </div>
          <div className="mb-1">
            <Form.Item
              name="permission"
              className="h-auto"
              label={
                <p className="text-xs font-bold text-gray-600">Permission</p>
              }
              rules={[
                { required: true, message: 'Select the Permission List!' },
              ]}
            >
              <Select
                mode="tags"
                size="large"
                id="rolePermissionIdSelect"
                placeholder="Please select"
                style={{ width: '100%', fontSize: '0.75rem' }}
                options={permissionData?.map((item: Permission) => ({
                  value: item?.id,
                  label: item?.name,
                }))}
              />
            </Form.Item>
            <p className="flex gap-2 text-xs text-gray-600 mt-2">
              <RiErrorWarningFill className="mt-1" />
              <span>This is a set of permissions assigned to the roles.</span>
            </p>
          </div>
        </div>
        <Form.Item>
          <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
            <Button
              id="cancelButtonForRole"
              className="px-6 py-3 text-xs font-bold"
              onClick={() => {
                form.resetFields();
                setSelectedRole(null);
                setCurrentModal(null);
              }}
            >
              Cancel
            </Button>
            <Button
              id="roleAction"
              className="px-6 py-3 text-xs font-bold"
              htmlType="submit"
              type="primary"
            >
              {currentModal !== 'editRoleModal' ? 'Create' : 'Update'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ListOfRoles;
