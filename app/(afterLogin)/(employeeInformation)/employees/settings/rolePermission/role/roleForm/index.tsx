'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Modal, Button, Checkbox } from 'antd';
import { Permission, Role } from '@/types/dashboard/adminManagement';
import { RiErrorWarningFill } from 'react-icons/ri';
import { useGetRole } from '@/store/server/features/employees/settings/role/queries';
import { useGetPermissionsWithOutPagination } from '@/store/server/features/employees/settings/permission/queries';
import { useGetPermissionGroupsWithOutPagination } from '@/store/server/features/employees/settings/groupPermission/queries';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import {
  useAddRole,
  useUpdateRole,
} from '@/store/server/features/employees/settings/role/mutations';
import { GroupPermissionItem } from '@/store/server/features/employees/settings/groupPermission/interface';

const ListOfRoles = () => {
  const [form] = Form.useForm();
  const [permissionList, setPermissionList] = useState<any>([]);
  const createRoleMutation = useAddRole();
  const updateRoleMutation = useUpdateRole();
  const {
    selectedGroupPermission,
    setSelectedGroupForModal,
    setTempSelectedPermissions,
    setSelectedPermissionsUnderGroup,
    setModalVisible,
    selectedPermissionsUnderGroup,
    setSelectedGroupPermission,
    selectedGroupForModal,
    setSelectAll,
    modalVisible,
    selectAll,
    tempSelectedPermissions,
    setSelectedRole,
    currentModal,
    selectedRole,
    setCurrentModal,
  } = useSettingStore();

  const { data: rolePermissionsData, refetch } = useGetRole(selectedRole);

  const { data: permissionData } = useGetPermissionsWithOutPagination();
  const { data: groupPermissionData } =
    useGetPermissionGroupsWithOutPagination();

  const basicGroupPermissionList: any = groupPermissionData?.items?.filter(
    (item: any) => item.isBasic === true,
  );
  const basicPermission = Array.from(
    new Set(
      basicGroupPermissionList?.flatMap((group: any) =>
        group?.permissions?.map((item: any) => item?.id),
      ) ?? [],
    ),
  );
  const basicGroupPermissionListIds =
    groupPermissionData?.items
      ?.filter((item: any) => item.isBasic === true)
      .map((item: any) => item.id.toString()) || [];

  useEffect(() => {
    if (selectedRole !== null) {
      refetch();
    }
  }, [selectedRole, refetch]);

  useEffect(() => {
    if (rolePermissionsData) {
      const permission = rolePermissionsData?.permissions?.map(
        (item: any) => item.id,
      );
      setSelectedGroupPermission(basicGroupPermissionListIds);
      setPermissionList([
        ...(permission ?? []),
        ...basicGroupPermissionListIds,
      ]);
    }
  }, [rolePermissionsData]);

  const handleModalPermissionChange = (checkedValues: string[]) => {
    setTempSelectedPermissions(checkedValues);
  };

  const handleChangeOnGroupSelection = (value: string[]) => {
    setSelectedGroupPermission(value);

    const newGroupId = value.find(
      (id) => !selectedGroupPermission.includes(id),
    );
    const removedGroupIds = selectedGroupPermission.filter(
      (id) => !value.includes(id),
    );

    if (newGroupId) {
      const selectedGroup = groupPermissionData?.items?.find(
        (gp) => gp.id === newGroupId,
      );
      if (selectedGroup) {
        setSelectedGroupForModal(selectedGroup);
        setTempSelectedPermissions([]);
        setModalVisible(true);
      }
    }

    let updatedPermissionsUnderGroup = [...selectedPermissionsUnderGroup];

    removedGroupIds.forEach((groupId) => {
      const removedGroup = groupPermissionData?.items?.find(
        (gp) => gp.id === groupId,
      );
      if (removedGroup) {
        const groupPermissions = removedGroup.permissions.map(
          (perm) => perm.id,
        );
        updatedPermissionsUnderGroup = updatedPermissionsUnderGroup.filter(
          (permId) => !groupPermissions.includes(permId),
        );
      }
    });

    setSelectedPermissionsUnderGroup(updatedPermissionsUnderGroup);

    form.setFieldsValue({
      permission: Array.from(
        new Set([...permissionList, ...updatedPermissionsUnderGroup]),
      ),
    });
  };

  const handleConfirmPermissions = () => {
    if (selectedGroupForModal) {
      const updatedPermissions = Array.from(
        new Set([...selectedPermissionsUnderGroup, ...tempSelectedPermissions]),
      );
      setSelectedPermissionsUnderGroup(updatedPermissions);
    }

    setModalVisible(false);
    setSelectedGroupForModal(null);
    setSelectAll(false);
  };

  useEffect(() => {
    const permissionArray = Array.from(
      new Set([
        ...permissionList,
        ...selectedPermissionsUnderGroup,
        ...basicPermission,
      ]),
    );

    if (selectedRole) {
      form.setFieldsValue({
        id: rolePermissionsData?.id,
        name: rolePermissionsData?.name,
        description: rolePermissionsData?.description,
        permission: permissionArray,
      });
    } else {
      form.setFieldsValue({
        permission: permissionArray,
      });
    }
  }, [
    selectedRole,
    selectedPermissionsUnderGroup,
    permissionList,
    basicPermission,
    form,
    rolePermissionsData,
  ]);

  const handleCreateRole = async (values: Role) => {
    createRoleMutation.mutate(values);
    setCurrentModal(null);
  };
  const handleRoleUpdate = (values: any) => {
    updateRoleMutation.mutate({ values, roleId: selectedRole });
    setCurrentModal(null);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setTempSelectedPermissions([]);
    } else {
      const allPermissionIds =
        selectedGroupForModal?.permissions?.map((perm: any) => perm.id) || [];
      setTempSelectedPermissions(allPermissionIds);
    }
    setSelectAll(!selectAll);
  };

  const modalTitle = (
    <div
      className="flex w-full justify-center items-center text-md font-extrabold"
      id="settings-role-modal-title"
      data-cy="settings-role-modal-title"
    >
      {currentModal === 'editRoleModal' ? 'Edit Role' : 'New Role'}
    </div>
  );

  return (
    <div data-cy="settings-role-modal-container">
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
        data-cy="settings-role-modal"
      >
        <Form
          form={form}
          name="basic"
          layout="vertical"
          onFinish={
            currentModal === 'editRoleModal'
              ? handleRoleUpdate
              : handleCreateRole
          }
          className="p-4 sm:p-2 md:p-4 lg:p-6"
          data-cy="settings-role-form"
        >
          <div
            className="grid"
            id="settings-role-form-wrapper"
            data-cy="settings-role-form-wrapper"
          >
            {currentModal === 'editRoleModal' && (
              <Form.Item
                name="id"
                id="settings-role-id-item"
                data-cy="settings-role-id-item"
              >
                <Input type="hidden" data-cy="settings-role-id-input" />
              </Form.Item>
            )}
            <div
              className="mb-1"
              id="settings-role-name-wrapper"
              data-cy="settings-role-name-wrapper"
            >
              <Form.Item
                name="name"
                label={
                  <p
                    className="text-xs font-bold text-gray-600"
                    id="settings-role-name-label"
                    data-cy="settings-role-name-label"
                  >
                    Role name
                  </p>
                }
                rules={[{ required: true, message: 'Enter group name!' }]}
                id="settings-role-name-item"
                data-cy="settings-role-name-item"
              >
                <Input
                  id="roleNameId"
                  className="h-10 text-xs text-gray-600"
                  placeholder="Enter group name"
                  data-cy="settings-role-name-input"
                />
              </Form.Item>
            </div>
            <div
              className="mb-1"
              id="settings-role-description-wrapper"
              data-cy="settings-role-description-wrapper"
            >
              <Form.Item
                name="description"
                label={
                  <p
                    className="text-xs font-bold text-gray-600"
                    id="settings-role-description-label"
                    data-cy="settings-role-description-label"
                  >
                    Role Description
                  </p>
                }
                rules={[{ required: true, message: 'Enter role description!' }]}
                id="settings-role-description-item"
                data-cy="settings-role-description-item"
              >
                <Input
                  id="roleDescriptionId"
                  className="h-10 text-xs text-gray-600"
                  placeholder="Enter role description"
                  data-cy="settings-role-description-input"
                />
              </Form.Item>
            </div>
            <div
              className="mb-1"
              id="settings-role-group-permission-wrapper"
              data-cy="settings-role-group-permission-wrapper"
            >
              <p
                className="text-xs font-bold text-gray-600"
                id="settings-role-group-permission-label"
                data-cy="settings-role-group-permission-label"
              >
                Group Permission
              </p>
              <Select
                id="groupDescriptionForRole"
                mode="tags"
                size="large"
                placeholder="Please select"
                value={selectedGroupPermission}
                style={{ width: '100%', fontSize: '0.75rem' }}
                onChange={handleChangeOnGroupSelection}
                options={groupPermissionData?.items?.map(
                  (item: GroupPermissionItem) => ({
                    value: item?.id,
                    label: item?.name,
                    disabled: item?.isBasic === true, // Disable if isBasic is true
                  }),
                )}
                data-cy="settings-role-group-select"
              />
              <p
                className="flex gap-2 text-xs text-gray-600 mt-2"
                id="settings-role-group-permission-description"
                data-cy="settings-role-group-permission-description"
              >
                <RiErrorWarningFill
                  className="mt-1"
                  data-cy="settings-role-group-permission-description-icon"
                />
                <span
                  id="settings-role-group-permission-description-text"
                  data-cy="settings-role-group-permission-description-text"
                >
                  Group permission allows you to get a bundle of permissions in
                  one place.
                </span>
              </p>
            </div>
            <div
              className="mb-1"
              id="settings-role-permission-wrapper"
              data-cy="settings-role-permission-wrapper"
            >
              <Form.Item
                name="permission"
                className="h-auto"
                label={
                  <p
                    className="text-xs font-bold text-gray-600"
                    data-cy="settings-role-permission-label"
                  >
                    Permission
                  </p>
                }
                rules={[
                  { required: true, message: 'Select the Permission List!' },
                ]}
                id="settings-role-permission-item"
                data-cy="settings-role-permission-item"
              >
                <Select
                  mode="tags"
                  size="large"
                  id="rolePermissionIdSelect"
                  placeholder="Please select"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                  options={permissionData?.items?.map((item: Permission) => ({
                    value: item?.id,
                    label: item?.name,
                  }))}
                  data-cy="settings-role-permission-select"
                />
              </Form.Item>
              <p
                className="flex gap-2 text-xs text-gray-600 mt-2"
                id="settings-role-permission-description"
                data-cy="settings-role-permission-description"
              >
                <RiErrorWarningFill
                  className="mt-1"
                  data-cy="settings-role-permission-description-icon"
                  id="settings-role-permission-description-icon"
                />
                <span
                  id="settings-role-permission-description-text"
                  data-cy="settings-role-permission-description-text"
                >
                  This is a set of permissions assigned to the roles.
                </span>
              </p>
            </div>
          </div>
          <Form.Item
            id="settings-role-form-actions-form-item"
            data-cy="settings-role-form-actions-form-item"
          >
            <div
              className="flex justify-center w-full bg-[#fff] px-6 py-6 gap-6"
              id="settings-role-form-actions"
              data-cy="settings-role-form-actions"
            >
              <Button
                id="cancelButtonForRole"
                className="px-6 py-3 text-xs font-bold"
                onClick={() => {
                  form.resetFields();
                  setSelectedRole(null);
                  setCurrentModal(null);
                  setSelectedPermissionsUnderGroup([]);
                }}
                data-cy="settings-role-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                id="roleAction"
                className="px-6 py-3 text-xs font-bold"
                htmlType="submit"
                type="primary"
                data-cy="settings-role-submit-btn"
              >
                {currentModal !== 'editRoleModal' ? 'Create' : 'Update'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={`Select Permissions for ${selectedGroupForModal?.name}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setModalVisible(false);
              const newGroupPermission = selectedGroupPermission?.filter(
                (item) => item !== selectedGroupForModal?.id,
              );
              setSelectedGroupPermission(newGroupPermission);
            }}
            data-cy="settings-role-group-permission-cancel-btn"
          >
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleConfirmPermissions}
            data-cy="settings-role-group-permission-confirm-btn"
          >
            Confirm
          </Button>,
        ]}
        data-cy="settings-role-group-permission-modal"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
          }}
          id="settings-role-select-all-wrapper"
          data-cy="settings-role-select-all-wrapper"
        >
          <Checkbox
            checked={selectAll}
            onChange={handleSelectAll}
            id="settings-role-select-all-checkbox"
            data-cy="settings-role-select-all-checkbox"
          >
            Select All
          </Checkbox>
        </div>
        <Checkbox.Group
          options={selectedGroupForModal?.permissions.map((perm: any) => ({
            label: perm.name,
            value: perm.id,
          }))}
          value={tempSelectedPermissions}
          onChange={handleModalPermissionChange}
          data-cy="settings-role-group-permission-checkboxes"
        />
      </Modal>
    </div>
  );
};

export default ListOfRoles;
