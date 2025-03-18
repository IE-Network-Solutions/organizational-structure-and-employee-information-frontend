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
import React, { useEffect, useState } from 'react';
import { LuPencil } from 'react-icons/lu';

const { Option } = Select;

interface Ids {
  id: string;
}
const RolePermission: React.FC<Ids> = ({ id }) => {
  const [form] = Form.useForm();
  const { data: employeeData, isLoading } = useGetEmployee(id);
  const { data: rolesWithPermission } = useGetRolesWithPermission();
  const { data: groupPermissionData } =
    useGetPermissionGroupsWithOutPagination();
  const { data: permissionListData } = useGetPermissionsWithOutPagination();

  const [selectedGroupPermission, setSelectedGroupPermission] = useState<
    string[]
  >([]);
  const [selectedPermissionsUnderGroup, setSelectedPermissionsUnderGroup] =
    useState<string[]>([]);
  const [selectedGroupForModal, setSelectedGroupForModal] = useState<
    any | null
  >(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempSelectedPermissions, setTempSelectedPermissions] = useState<
    string[]
  >([]);
  const [selectAll, setSelectAll] = useState(false);

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
                rules={[]}
              >
                <Select
                  placeholder="Select a Group Permission"
                  onChange={onGroupPermissionChange}
                  allowClear
                  mode="multiple"
                  value={selectedGroupPermission}
                >
                  {groupPermissionData?.items?.map((groupPermission) => (
                    <Option
                      key={groupPermission.id}
                      disabled={groupPermission?.isBasic}
                      value={groupPermission.id}
                    >
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
      <Modal
        title={`Select Permissions for ${selectedGroupForModal?.name}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleConfirmPermissions}
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
        >
          <Checkbox checked={selectAll} onChange={handleSelectAll}>
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
        />
      </Modal>
    </div>
  );
};

export default RolePermission;
