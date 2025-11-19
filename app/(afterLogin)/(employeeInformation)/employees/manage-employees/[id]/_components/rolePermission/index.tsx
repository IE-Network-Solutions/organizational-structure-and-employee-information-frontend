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
import { Button, Card, Checkbox, Col, Form, Modal, Row, Select } from 'antd';
import React, { useEffect } from 'react';
import { LuPencil } from 'react-icons/lu';

const { Option } = Select;

interface Ids {
  id: string;
}
const RolePermission: React.FC<Ids> = ({ id }) => {
  const [form] = Form.useForm();
  const { data: employeeData, isLoading } = useGetEmployee(id);
  const { data: rolesWithPermission, isLoading: roleLoading } =
    useGetRolesWithPermission();
  const { data: groupPermissionData, isLoading: groupPermissionLoading } =
    useGetPermissionGroupsWithOutPagination();
  const { data: permissionListData, isLoading: permissionLoading } =
    useGetPermissionsWithOutPagination();

  const {
    setSelectedRoleOnOption,
    setSelectedRoleOnList,
    selectedGroupPermission,
    setSelectedGroupForModal,
    selectedRoleOnOption,
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
  } = useSettingStore();
  const {
    mutate: employeeRolePermissionUpdate,
    isLoading: rolePermissionUpdateLoading,
  } = useUpdateEmployeeRolePermission();
  const { setEdit, edit, selectedPermissions, setSelectedPermissions } =
    useEmployeeManagementStore();

  const handlePermissionChange = (value: string[]) => {
    setSelectedPermissions(value);
  };
  const basicGroupPermissionId =
    groupPermissionData?.items?.filter((item) => item.isBasic) ?? [];
  const basicGroupPermissions = basicGroupPermissionId.flatMap(
    (item) => item.permissions ?? [],
  );

  useEffect(() => {
    if (employeeData) {
      const userRoleId = employeeData?.roleId;
      const allPermissionIds =
        employeeData?.userPermissions?.map((perm: any) => perm.permissionId) ||
        [];

      const allPermissions = Array.from(
        new Set([
          ...allPermissionIds,
          ...(basicGroupPermissions?.map((perm) => perm.id) ?? []),
        ]),
      );

      const groupPermissionIds = Array.from(
        new Set([
          ...selectedGroupPermission,
          ...(basicGroupPermissionId?.map((item) => item.id) ?? []),
        ]),
      );

      form.setFieldsValue({
        roleId: userRoleId,
        permission: allPermissions,
        groupPermissionId: groupPermissionIds,
      });

      setSelectedRoleOnOption(userRoleId);
      setSelectedPermissions(allPermissions);
    }
  }, [employeeData, form]);

  const onRoleChangeHandler = (value: string) => {
    const selectedRole = rolesWithPermission?.find((role) => role.id === value);

    if (selectedRole) {
      const rolePermissions =
        selectedRole?.permissions?.map((perm) => perm.id) || [];

      const updatedPermissions = Array.from(
        new Set([
          ...rolePermissions,
          ...(basicGroupPermissions?.map((perm) => perm.id) ?? []),
        ]),
      );

      form.setFieldsValue({
        roleId: value,
        permission: updatedPermissions,
      });

      setSelectedRoleOnList(selectedRole);
      setSelectedRoleOnOption(value);
      setSelectedPermissions(updatedPermissions);
    }
  };

  const onGroupPermissionChange = (value: string[]) => {
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

    setSelectedGroupPermission(value);
    setSelectedPermissionsUnderGroup(updatedPermissionsUnderGroup);

    form.setFieldsValue({
      permission: Array.from(
        new Set([...selectedPermissions, ...updatedPermissionsUnderGroup]),
      ),
      groupPermissionId: value,
    });
  };

  const handleModalPermissionChange = (checkedValues: string[]) => {
    setTempSelectedPermissions(checkedValues);
  };

  const handleConfirmPermissions = () => {
    if (selectedGroupForModal) {
      const updatedPermissions = Array.from(
        new Set([...selectedPermissionsUnderGroup, ...tempSelectedPermissions]),
      );
      setSelectedPermissionsUnderGroup(updatedPermissions);

      form.setFieldsValue({
        permission: Array.from(
          new Set([...selectedPermissions, ...updatedPermissions]),
        ),
      });
    }

    setModalVisible(false);
    setSelectedGroupForModal(null);
    setSelectAll(false);
  };

  const handleUpdateUserRolePermission = (values: any) => {
    employeeRolePermissionUpdate({ id, values });
    setEdit('rolePermission');
  };

  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
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

  return (
    <div id="role-permission-container" data-cy="role-permission-container">
      <Card
        loading={isLoading}
        title="User Role Permission "
        extra={
          <AccessGuard permissions={[Permissions.UpdateEmployeeDetails]} id="role-permission-edit-guard" data-cy="role-permission-edit-guard">
            <LuPencil
              className="cursor-pointer"
              onClick={() => handleEditChange('rolePermission')}
              id="role-permission-edit-icon"
              data-cy="role-permission-edit-icon"
            />
          </AccessGuard>
        }
        className="my-6"
        id="role-permission-card"
        data-cy="role-permission-card"
      >
        <Form
          form={form}
          disabled={!edit.rolePermission}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          onFinish={handleUpdateUserRolePermission}
          id="role-permission-form"
          data-cy="role-permission-form"
        >
          <Row gutter={16} id="role-permission-role-row" data-cy="role-permission-role-row">
            <Col xs={24} sm={24} id="role-permission-role-col" data-cy="role-permission-role-col">
              <Form.Item
                className="font-semibold text-xs"
                name="roleId"
                id="roleId"
                data-cy="role-permission-role-form-item"
                label="Role"
                rules={[{ required: true, message: 'Please select a role!' }]}
              >
                <Select
                  loading={roleLoading}
                  placeholder="Select a role"
                  onChange={onRoleChangeHandler}
                  allowClear
                  value={selectedRoleOnOption}
                  id="role-permission-role-select"
                  data-cy="role-permission-role-select"
                >
                  {rolesWithPermission?.map((role) => (
                    <Option key={role.id} value={role.id} id={`role-permission-role-option-${role.id}`} data-cy={`role-permission-role-option-${role.id}`}>
                      {role.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} id="role-permission-group-row" data-cy="role-permission-group-row">
            <Col xs={24} sm={24} id="role-permission-group-col" data-cy="role-permission-group-col">
              <Form.Item
                className="font-semibold text-xs"
                name="groupPermissionId"
                id="groupPermissionId"
                data-cy="role-permission-group-form-item"
                label="Group Permission"
                rules={[]}
              >
                <Select
                  loading={groupPermissionLoading}
                  placeholder="Select a Group Permission"
                  onChange={onGroupPermissionChange}
                  allowClear
                  mode="multiple"
                  value={selectedGroupPermission}
                  id="role-permission-group-select"
                  data-cy="role-permission-group-select"
                >
                  {groupPermissionData?.items?.map((groupPermission) => (
                    <Option
                      key={groupPermission.id}
                      disabled={groupPermission?.isBasic}
                      value={groupPermission.id}
                      id={`role-permission-group-option-${groupPermission.id}`}
                      data-cy={`role-permission-group-option-${groupPermission.id}`}
                    >
                      {groupPermission.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} id="role-permission-permissions-row" data-cy="role-permission-permissions-row">
            <Col xs={24} sm={24} id="role-permission-permissions-col" data-cy="role-permission-permissions-col">
              <Form.Item
                className="font-semibold text-xs"
                name="permission"
                id="setOfPermission"
                data-cy="role-permission-permissions-form-item"
                label="Set of Permissions"
                rules={[
                  {
                    required: true,
                    message: 'Please select at least one permission!',
                  },
                ]}
              >
                <Select
                  loading={permissionLoading}
                  mode="multiple"
                  style={{ width: '100%', overflowY: 'auto' }}
                  onChange={handlePermissionChange}
                  value={selectedPermissions}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  dropdownStyle={{ maxHeight: '200px', overflowY: 'auto' }}
                  id="role-permission-permissions-select"
                  data-cy="role-permission-permissions-select"
                >
                  {permissionListData?.items?.map((permission) => (
                    <Option key={permission.id} value={permission.id} id={`role-permission-permission-option-${permission.id}`} data-cy={`role-permission-permission-option-${permission.id}`}>
                      {permission.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row className="flex justify-end" id="role-permission-submit-row" data-cy="role-permission-submit-row">
            <Button
              loading={rolePermissionUpdateLoading}
              htmlType="submit"
              type="primary"
              id="role-permission-submit-btn"
              data-cy="role-permission-submit-btn"
            >
              Save changes
            </Button>
          </Row>
        </Form>
      </Card>
      <Modal
        title={`Select Permissions for ${selectedGroupForModal?.name}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        data-cy="role-permission-modal"
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)} id="role-permission-modal-cancel-btn" data-cy="role-permission-modal-cancel-btn">
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleConfirmPermissions}
            id="role-permission-modal-confirm-btn"
            data-cy="role-permission-modal-confirm-btn"
          >
            Confirm
          </Button>,
        ]}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
          }}
          id="role-permission-modal-select-all-wrapper"
          data-cy="role-permission-modal-select-all-wrapper"
        >
          <Checkbox checked={selectAll} onChange={handleSelectAll} id="role-permission-modal-select-all" data-cy="role-permission-modal-select-all">
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
          data-cy="role-permission-modal-checkbox-group"
        />
      </Modal>
    </div>
  );
};

export default RolePermission;
