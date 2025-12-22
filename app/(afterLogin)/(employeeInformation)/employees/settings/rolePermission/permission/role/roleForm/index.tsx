'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Modal, Button } from 'antd';
import { Permission, Role } from '@/types/dashboard/adminManagement';
import { RiErrorWarningFill } from 'react-icons/ri';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import {
  useAddRole,
  useUpdateRole,
} from '@/store/server/features/employees/settings/role/mutations';
import { useGetRole } from '@/store/server/features/employees/settings/role/queries';
import { useGetPermissionGroups } from '@/store/server/features/employees/settings/groupPermission/queries';
import { GroupPermissionItem } from '@/store/server/features/employees/settings/groupPermission/interface';
import { useGetPermissions } from '@/store/server/features/employees/settings/permission/queries';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const ListOfRoles = () => {
  const [form] = Form.useForm();
  const [groupPermissionList, setGroupPermissionList] = useState<any>([]);
  const [permissionList, setPermissionList] = useState<any>([]);
  const createRoleMutation = useAddRole();
  const updateRoleMutation = useUpdateRole();

  const {
    selectedRole,
    setCurrentModal,
    permissonGroupCurrentPage,
    pageSize,
    currentModal,
    setSelectedRole,
    permissionCurrentPage,
  } = useSettingStore();

  const { data: permissionData, isLoading: isPermissionLoading } =
    useGetPermissions(permissionCurrentPage, pageSize);
  const { data: groupPermissionData, isLoading: isGroupPermissionLoading } =
    useGetPermissionGroups(permissonGroupCurrentPage, pageSize);
  const {
    data: rolePermissionsData,
    // isLoading: rolePermissionsLoading,
    refetch,
  } = useGetRole(selectedRole);

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
    const newPermissions =
      groupPermissionData?.items
        ?.filter((group: any) => val.includes(group.id.toString()))
        .flatMap((group: any) =>
          group?.permissions?.map((item: any) => ({
            value: item.id,
            label: item.name,
          })),
        ) || [];

    const combinedPermissions = [...permissionList, ...newPermissions];

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
    updateRoleMutation.mutate(convertedValues, convertedValues?.id);
    setCurrentModal(null);
  };

  const modalSlug = toSlug(selectedRole ?? 'permission-role');

  const modalTitle = (
    <div
      className="flex w-full justify-center items-center text-md font-extrabold"
      id={`settings-permission-role-modal-title-${modalSlug}`}
      data-cy={`settings-permission-role-modal-title-${modalSlug}`}
    >
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
      data-cy={`settings-permission-role-modal-${modalSlug}`}
    >
      <Form
        form={form}
        name="basic"
        layout="vertical"
        onFinish={
          currentModal === 'editRoleModal' ? handleRoleUpdate : handleCreateRole
        }
        className="p-4 sm:p-2 md:p-4 lg:p-6"
        id={`settings-permission-role-form-${modalSlug}`}
        data-cy={`settings-permission-role-form-${modalSlug}`}
      >
        <div
          className="grid"
          id={`settings-permission-role-form-wrapper-${modalSlug}`}
          data-cy={`settings-permission-role-form-wrapper-${modalSlug}`}
        >
          {currentModal === 'editRoleModal' && (
            <Form.Item
              name="id"
              id={`settings-permission-role-id-item-${modalSlug}`}
            >
              <Input
                type="hidden"
                data-cy={`settings-permission-role-id-input-${modalSlug}`}
              />
            </Form.Item>
          )}
          <div
            className="mb-1"
            id={`settings-permission-role-name-wrapper-${modalSlug}`}
            data-cy={`settings-permission-role-name-wrapper-${modalSlug}`}
          >
            <Form.Item
              name="name"
              label={
                <p
                  className="text-xs font-bold text-gray-600"
                  id={`settings-permission-role-name-label-${modalSlug}`}
                  data-cy={`settings-permission-role-name-label-${modalSlug}`}
                >
                  Role name
                </p>
              }
              rules={[{ required: true, message: 'Enter group name!' }]}
              data-cy={`settings-permission-role-name-item-${modalSlug}`}
            >
              <Input
                id="roleNameId"
                className="h-10 text-xs text-gray-600"
                placeholder="Enter group name"
                data-cy={`settings-permission-role-name-input-${modalSlug}`}
              />
            </Form.Item>
          </div>
          <div
            className="mb-1"
            id={`settings-permission-role-description-wrapper-${modalSlug}`}
            data-cy={`settings-permission-role-description-wrapper-${modalSlug}`}
          >
            <Form.Item
              name="description"
              label={
                <p
                  className="text-xs font-bold text-gray-600"
                  id={`settings-permission-role-description-label-${modalSlug}`}
                  data-cy={`settings-permission-role-description-label-${modalSlug}`}
                >
                  Role Description
                </p>
              }
              rules={[{ required: true, message: 'Enter role description!' }]}
              data-cy={`settings-permission-role-description-item-${modalSlug}`}
            >
              <Input
                id="roleDescriptionId"
                className="h-10 text-xs text-gray-600"
                placeholder="Enter role description"
                data-cy={`settings-permission-role-description-input-${modalSlug}`}
              />
            </Form.Item>
          </div>
          <div
            className="mb-1"
            id={`settings-permission-role-group-wrapper-${modalSlug}`}
            data-cy={`settings-permission-role-group-wrapper-${modalSlug}`}
          >
            <p
              className="text-xs font-bold text-gray-600"
              id={`settings-permission-role-group-label-${modalSlug}`}
              data-cy={`settings-permission-role-group-label-${modalSlug}`}
            >
              Group Permission
            </p>
            <Select
              id="groupDescriptionForRole"
              mode="tags"
              size="large"
              placeholder="Please select"
              style={{ width: '100%', fontSize: '0.75rem' }}
              loading={isGroupPermissionLoading}
              onChange={handleChangeOnGroupSelection}
              options={groupPermissionData?.items?.map(
                (item: GroupPermissionItem) => ({
                  value: item?.id,
                  label: item?.name,
                }),
              )}
              data-cy={`settings-permission-role-group-select-${modalSlug}`}
            />
            <p
              className="flex gap-2 text-xs text-gray-600 mt-2"
              id={`settings-permission-role-group-helper-${modalSlug}`}
              data-cy={`settings-permission-role-group-helper-${modalSlug}`}
            >
              <RiErrorWarningFill
                className="mt-1"
                data-cy={`settings-permission-role-group-helper-icon-${modalSlug}`}
              />
              <span
                id={`settings-permission-role-group-helper-text-${modalSlug}`}
                data-cy={`settings-permission-role-group-helper-text-${modalSlug}`}
              >
                Group permission allows you to get a bundle of permissions in
                one place.
              </span>
            </p>
          </div>
          <div
            className="mb-1"
            id={`settings-permission-role-permission-wrapper-${modalSlug}`}
            data-cy={`settings-permission-role-permission-wrapper-${modalSlug}`}
          >
            <Form.Item
              name="permission"
              className="h-auto"
              label={
                <p
                  className="text-xs font-bold text-gray-600"
                  id={`settings-permission-role-permission-label-${modalSlug}`}
                  data-cy={`settings-permission-role-permission-label-${modalSlug}`}
                >
                  Permission
                </p>
              }
              rules={[
                { required: true, message: 'Select the Permission List!' },
              ]}
              data-cy={`settings-permission-role-permission-item-${modalSlug}`}
            >
              <Select
                mode="tags"
                size="large"
                id="rolePermissionIdSelect"
                placeholder="Please select"
                loading={isPermissionLoading}
                style={{ width: '100%', fontSize: '0.75rem' }}
                options={permissionData?.items?.map((item: Permission) => ({
                  value: item?.id,
                  label: item?.name,
                }))}
                data-cy={`settings-permission-role-permission-select-${modalSlug}`}
              />
            </Form.Item>
            <p
              className="flex gap-2 text-xs text-gray-600 mt-2"
              id={`settings-permission-role-permission-helper-${modalSlug}`}
              data-cy={`settings-permission-role-permission-helper-${modalSlug}`}
            >
              <RiErrorWarningFill
                className="mt-1"
                data-cy={`settings-permission-role-permission-helper-icon-${modalSlug}`}
              />
              <span
                id={`settings-permission-role-permission-helper-text-${modalSlug}`}
                data-cy={`settings-permission-role-permission-helper-text-${modalSlug}`}
              >
                This is a set of permissions assigned to the roles.
              </span>
            </p>
          </div>
        </div>
        <Form.Item
          id={`settings-permission-role-actions-item-${modalSlug}`}
          data-cy={`settings-permission-role-actions-item-${modalSlug}`}
        >
          <div
            className="flex justify-center w-full bg-[#fff] px-6 py-6 gap-6"
            id={`settings-permission-role-actions-${modalSlug}`}
            data-cy={`settings-permission-role-actions-${modalSlug}`}
          >
            <Button
              id="cancelButtonForRole"
              className="px-6 py-3 text-xs font-bold"
              onClick={() => {
                form.resetFields();
                setSelectedRole(null);
                setCurrentModal(null);
              }}
              data-cy={`settings-permission-role-cancel-btn-${modalSlug}`}
            >
              Cancel
            </Button>
            <Button
              id="roleAction"
              className="px-6 py-3 text-xs font-bold"
              htmlType="submit"
              type="primary"
              data-cy={`settings-permission-role-submit-btn-${modalSlug}`}
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
