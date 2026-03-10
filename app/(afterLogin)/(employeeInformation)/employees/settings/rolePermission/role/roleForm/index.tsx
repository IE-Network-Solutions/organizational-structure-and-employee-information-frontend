'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Form,
  Input,
  Modal,
  Button,
  Steps,
  Checkbox,
  Input as AntInput,
  Tag,
  Collapse,
  Switch,
  message,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { MdOutlineGrid4X4 } from 'react-icons/md';
import { Role } from '@/types/dashboard/adminManagement';
import { useGetRole } from '@/store/server/features/employees/settings/role/queries';
import { useGetPermissionsWithOutPagination } from '@/store/server/features/employees/settings/permission/queries';
import { useGetPermissionGroupsWithOutPagination } from '@/store/server/features/employees/settings/groupPermission/queries';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import {
  useAddRole,
  useUpdateRole,
} from '@/store/server/features/employees/settings/role/mutations';
import type { Permission as PermissionType } from '@/store/server/features/employees/settings/permission/interface';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AppsIcon from '@mui/icons-material/Apps';

const ROLE_STEP_TITLES = [
  {
    title: <span data-cy="settings-role-name-role-step-title">Name Role</span>,
  },
  {
    title: (
      <span
        data-cy="settings-role-select-permission-step-title"
        className="text-nowrap"
      >
        Select Permission
      </span>
    ),
  },
  { title: <span data-cy="settings-role-finalize-step-title">Finalize</span> },
];

const ListOfRoles = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    [],
  );
  const [permissionSearch, setPermissionSearch] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string | null>(
    null,
  );

  const createRoleMutation = useAddRole();
  const updateRoleMutation = useUpdateRole();
  const { setSelectedRole, currentModal, selectedRole, setCurrentModal } =
    useSettingStore();

  const { data: rolePermissionsData, refetch } = useGetRole(selectedRole);
  const { data: permissionData } = useGetPermissionsWithOutPagination();
  const { data: groupPermissionData } =
    useGetPermissionGroupsWithOutPagination();

  const permissionsList: PermissionType[] = permissionData?.items ?? [];
  const groupsList = groupPermissionData?.items ?? [];

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

  const groupIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    groupsList.forEach((g: { id: string; name: string }) => {
      map[g.id] = g.name ?? 'Other';
    });
    return map;
  }, [groupsList]);

  const filteredGroupPermissions = useMemo(() => {
    if (!groupsList) return [];
    if (selectedGroupFilter === 'all' || !selectedGroupFilter)
      return groupsList;
    return groupsList.filter(
      (group: any) =>
        group.name?.toLowerCase() === selectedGroupFilter?.toLowerCase(),
    );
  }, [groupsList, selectedGroupFilter]);

  const getGroupSelectedCount = (group: any) => {
    const groupPermissionIds = group.permissions?.map((p: any) => p.id) || [];
    return selectedPermissionIds.filter((id: string) =>
      groupPermissionIds.includes(id),
    ).length;
  };

  const isGroupFullySelected = (group: any) => {
    const groupPermissionIds = group.permissions?.map((p: any) => p.id) || [];
    return (
      groupPermissionIds.length > 0 &&
      groupPermissionIds.every((id: string) =>
        selectedPermissionIds.includes(id),
      )
    );
  };

  const getGroupIcon = (groupName: string) => {
    const name = (groupName ?? '').toLowerCase();
    if (name.includes('payroll') || name.includes('salary')) {
      return <AccountBalanceWalletIcon className="text-gray-600" />;
    }
    return <AppsIcon className="text-gray-600" />;
  };

  const handleGroupToggle = (group: any, checked: boolean) => {
    const groupPermissionIds = group.permissions?.map((p: any) => p.id) || [];
    if (checked) {
      setSelectedPermissionIds((prev) =>
        Array.from(new Set([...prev, ...groupPermissionIds])),
      );
    } else {
      setSelectedPermissionIds((prev) =>
        prev.filter((id: string) => !groupPermissionIds.includes(id)),
      );
    }
  };

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissionIds((prev) => [...prev, permissionId]);
    } else {
      setSelectedPermissionIds((prev) =>
        prev.filter((id: string) => id !== permissionId),
      );
    }
  };

  const selectedPermissionsGrouped = useMemo(() => {
    const map: Record<string, PermissionType[]> = {};
    const selected = permissionsList.filter((p) =>
      selectedPermissionIds.includes(p.id),
    );
    selected.forEach((p) => {
      const gid = p.permissionGroupId ?? 'other';
      if (!map[gid]) map[gid] = [];
      map[gid].push(p);
    });
    return map;
  }, [permissionsList, selectedPermissionIds]);

  useEffect(() => {
    if (selectedRole !== null) {
      refetch();
    }
  }, [selectedRole, refetch]);

  useEffect(() => {
    if (rolePermissionsData) {
      form.setFieldsValue({
        id: rolePermissionsData?.id,
        name: rolePermissionsData?.name,
        description: rolePermissionsData?.description,
      });
      const ids =
        rolePermissionsData?.permissions?.map((item: any) => item.id) ?? [];
      setSelectedPermissionIds(ids);
      setCurrentStep(0);
    }
  }, [rolePermissionsData, form]);

  useEffect(() => {
    if (currentModal && !selectedRole) {
      setCurrentStep(0);
      setSelectedPermissionIds(basicPermission as string[]);
      setPermissionSearch('');
      setSelectedGroupFilter('all');
    }
  }, [currentModal, selectedRole]);

  const handleCancel = () => {
    form.resetFields();
    setSelectedRole(null);
    setCurrentModal(null);
    setCurrentStep(0);
    setSelectedPermissionIds([]);
    setPermissionSearch('');
    setSelectedGroupFilter('all');
  };

  const handleContinue = async () => {
    if (currentStep === 0) {
      try {
        await form.validateFields(['name', 'description']);
        setCurrentStep(1);
      } catch {
        // validation failed
      }
      return;
    }
    if (currentStep === 1) {
      if (selectedPermissionIds.length === 0) {
        message.warning('Select at least one permission');
        return;
      }
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateRole = async (values: Role) => {
    const permission = Array.from(
      new Set([...basicPermission, ...selectedPermissionIds]),
    );
    createRoleMutation.mutate({ ...values, permission } as any);
    setCurrentModal(null);
    handleCancel();
  };

  const handleRoleUpdate = (values: any) => {
    const permission = Array.from(
      new Set([...basicPermission, ...selectedPermissionIds]),
    );
    updateRoleMutation.mutate({
      values: { ...values, permission },
      roleId: selectedRole,
    });
    setCurrentModal(null);
    handleCancel();
  };

  const removePermission = (id: string) => {
    setSelectedPermissionIds((prev) => prev.filter((x) => x !== id));
  };

  const selectedPermissionObjects = useMemo(
    () =>
      selectedPermissionIds
        .map((id) => permissionsList.find((p) => p.id === id))
        .filter(Boolean) as PermissionType[],
    [selectedPermissionIds, permissionsList],
  );
  const firstThreeSelected = selectedPermissionObjects.slice(0, 3);
  const remainingCount = selectedPermissionIds.length - 3;

  const modalTitle = (
    <div
      className="flex w-full justify-center items-center text-md font-extrabold"
      id="settings-role-modal-title"
      data-cy="settings-role-modal-title"
    >
      {currentModal === 'editRoleModal' ? 'Edit Role' : 'Create Role'}
    </div>
  );

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div
          className="grid gap-4 pt-2 p-4"
          id="settings-role-form-wrapper"
          data-cy="settings-role-form-wrapper"
        >
          {currentModal === 'editRoleModal' && (
            <Form.Item name="id" hidden>
              <Input type="hidden" data-cy="settings-role-id-input" />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label={
              <p
                className="text-xs font-bold text-gray-600"
                id="settings-role-name-label"
                data-cy="settings-role-name-label"
              >
                Name
              </p>
            }
            rules={[{ required: true, message: 'Enter group name!' }]}
            id="settings-role-name-item"
            data-cy="settings-role-name-item"
          >
            <Input
              id="roleNameId"
              className="h-10 text-xs text-gray-600"
              placeholder="Input"
              data-cy="settings-role-name-input"
            />
          </Form.Item>
          <Form.Item
            name="description"
            label={
              <p
                className="text-xs font-bold text-gray-600"
                id="settings-role-description-label"
                data-cy="settings-role-description-label"
              >
                Description
              </p>
            }
            rules={[{ required: true, message: 'Enter role description!' }]}
            id="settings-role-description-item"
            data-cy="settings-role-description-item"
          >
            <Input.TextArea
              id="roleDescriptionId"
              className="text-xs text-gray-600 resize-y"
              placeholder="Textarea"
              rows={3}
              data-cy="settings-role-description-input"
            />
          </Form.Item>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div
          className="pt-2 p-4"
          data-cy="settings-role-select-permissions-step"
        >
          <div
            data-cy="settings-role-selected-permissions-container"
            className="mb-3"
          >
            {selectedPermissionIds.length > 0 && (
              <div
                data-cy="settings-role-selected-permissions-list"
                className="flex flex-wrap items-center gap-2 mb-3"
              >
                {firstThreeSelected.map((p) => (
                  <Tag
                    key={p.id}
                    closable
                    onClose={() => removePermission(p.id)}
                    className="inline-flex items-center gap-1 rounded-md"
                    data-cy={`settings-role-selected-permission-tag-${p.id}`}
                  >
                    {p.name}
                  </Tag>
                ))}
                {remainingCount > 0 && (
                  <span
                    className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200"
                    data-cy="settings-role-selected-permission-more"
                  >
                    +{remainingCount}
                  </span>
                )}
              </div>
            )}
            <AntInput
              placeholder="Search Permission"
              suffix={<SearchOutlined className="text-gray-400" />}
              value={permissionSearch}
              onChange={(e) => setPermissionSearch(e.target.value)}
              className="rounded-lg mb-3"
              data-cy="settings-role-permission-search"
            />
            <div
              data-cy="settings-role-filter-groups-container"
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
            >
              <Tag
                className={`cursor-pointer inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 border ${
                  selectedGroupFilter === 'all'
                    ? 'border-[#1d4ed8] text-[#1d4ed8] bg-white'
                    : 'border-gray-300 text-gray-700 bg-white'
                }`}
                onClick={() => setSelectedGroupFilter('all')}
                data-cy="settings-role-filter-all-groups"
              >
                <span
                  data-cy="settings-role-filter-all-groups-count"
                  className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded text-xs font-medium ${
                    selectedGroupFilter === 'all'
                      ? 'bg-blue-50 border border-[#1d4ed8] text-[#1d4ed8]'
                      : 'bg-gray-100 border border-gray-300 text-gray-600'
                  }`}
                >
                  {groupsList.length || 0}
                </span>
                All Groups
              </Tag>
              {groupsList.map((group: any) => {
                const isSelected =
                  selectedGroupFilter === group.name?.toLowerCase();
                return (
                  <Tag
                    key={group.id}
                    className={`cursor-pointer inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 border ${
                      isSelected
                        ? 'border-[#1d4ed8] text-[#1d4ed8] bg-white'
                        : 'border-gray-300 text-gray-700 bg-white'
                    }`}
                    onClick={() =>
                      setSelectedGroupFilter(group.name?.toLowerCase() ?? 'all')
                    }
                    data-cy={`settings-role-filter-group-${group.id}`}
                  >
                    <span
                      data-cy="settings-role-filter-group-count"
                      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded text-xs font-medium ${
                        isSelected
                          ? 'bg-blue-50 border border-[#1d4ed8] text-[#1d4ed8]'
                          : 'bg-gray-100 border border-gray-300 text-gray-600'
                      }`}
                    >
                      {group.permissions?.length || 0}
                    </span>
                    {group.name}
                  </Tag>
                );
              })}
            </div>
          </div>
          <div
            className="max-h-96 overflow-y-auto"
            id="settings-role-permission-collapse"
            data-cy="settings-role-permission-collapse"
          >
            <Collapse
              ghost
              bordered={false}
              expandIcon={() => null}
              className="role-permission-collapse [&_.ant-collapse-item]:border [&_.ant-collapse-item]:border-gray-200 [&_.ant-collapse-item]:rounded-lg [&_.ant-collapse-item]:bg-gray-50 [&_.ant-collapse-item]:mb-3 [&_.ant-collapse-header]:px-4 [&_.ant-collapse-header]:py-3 [&_.ant-collapse-content]:bg-white [&_.ant-collapse-content-box]:px-4 [&_.ant-collapse-content-box]:pb-4 [&_.ant-collapse-content-box]:pt-0"
            >
              {filteredGroupPermissions.map((group: any) => {
                const selectedCount = getGroupSelectedCount(group);
                const totalCount = group.permissions?.length || 0;
                const isFullySelected = isGroupFullySelected(group);
                const groupPermissions = group.permissions || [];
                const permissionsToShow = permissionSearch
                  ? groupPermissions.filter(
                      (p: any) =>
                        p.name
                          ?.toLowerCase()
                          .includes(permissionSearch.toLowerCase()) ||
                        p.description
                          ?.toLowerCase()
                          .includes(permissionSearch.toLowerCase()),
                    )
                  : groupPermissions;
                if (permissionsToShow.length === 0) return null;
                return (
                  <Collapse.Panel
                    key={group.id}
                    header={
                      <div
                        data-cy="settings-role-permission-group-header-container"
                        className="flex items-center gap-3 flex-1 pr-2"
                      >
                        <div
                          data-cy="settings-role-permission-group-icon-container"
                          className="w-8 h-8 rounded flex items-center justify-center bg-gray-100 shrink-0"
                        >
                          {getGroupIcon(group.name)}
                        </div>
                        <div
                          data-cy="settings-role-permission-group-content"
                          className="flex-1 min-w-0"
                        >
                          <p
                            data-cy="settings-role-permission-group-name"
                            className="text-sm font-semibold text-gray-900 m-0"
                          >
                            {group.name}
                          </p>
                          <p
                            data-cy="settings-role-permission-group-selected-count"
                            className="text-xs text-gray-500 m-0"
                          >
                            {selectedCount} of {totalCount} Selected
                          </p>
                        </div>
                      </div>
                    }
                    extra={
                      <span
                        data-cy="settings-role-permission-group-switch-container"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Switch
                          checked={isFullySelected}
                          onChange={(checked) =>
                            handleGroupToggle(group, checked)
                          }
                          id={`settings-role-permission-group-switch-${group.id}`}
                          data-cy={`settings-role-permission-group-switch-${group.id}`}
                          className={isFullySelected ? 'bg-[#1d4ed8]' : ''}
                        />
                      </span>
                    }
                    id={`settings-role-permission-group-panel-${group.id}`}
                    data-cy={`settings-role-permission-group-panel-${group.id}`}
                  >
                    <div
                      data-cy="settings-role-permission-group-items-container"
                      className="space-y-3 pt-2 border-t border-gray-100"
                    >
                      {permissionsToShow.map((permission: any) => {
                        const isChecked = selectedPermissionIds.includes(
                          permission.id,
                        );
                        return (
                          <div
                            key={permission.id}
                            className="flex items-start gap-3 py-2 hover:bg-gray-50 rounded px-1 -mx-1"
                            id={`settings-role-permission-item-${permission.id}`}
                            data-cy={`settings-role-permission-item-${permission.id}`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onChange={(e) =>
                                handlePermissionToggle(
                                  permission.id,
                                  e.target.checked,
                                )
                              }
                              id={`settings-role-permission-checkbox-${permission.id}`}
                              data-cy={`settings-role-permission-checkbox-${permission.id}`}
                              className="pt-0.5"
                            />
                            <div
                              data-cy="settings-role-permission-item-content"
                              className="flex-1"
                            >
                              <span
                                data-cy="settings-role-permission-item-name"
                                className="text-sm font-medium text-gray-900"
                              >
                                {permission.name}
                              </span>
                              {permission.description && (
                                <p
                                  data-cy="settings-role-permission-item-description"
                                  className="text-xs text-gray-500 m-0 mt-0.5"
                                >
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Collapse.Panel>
                );
              })}
            </Collapse>
          </div>
        </div>
      );
    }

    // Step 2: Finalize
    return (
      <div
        data-cy="settings-role-finalize-content"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 p-4"
      >
        <div
          data-cy="settings-role-finalize-form-content"
          className="space-y-4"
        >
          <Form.Item
            name="name"
            label={
              <span
                data-cy="settings-role-name-label-finalize"
                className="text-gray-700 font-medium"
              >
                Name
              </span>
            }
            rules={[{ required: true, message: 'Enter group name!' }]}
          >
            <Input
              placeholder="Input"
              className="h-10"
              data-cy="settings-role-name-input-finalize"
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              placeholder="Textarea"
              rows={3}
              className="resize-y"
              data-cy="settings-role-description-input-finalize"
            />
          </Form.Item>
        </div>
        <div
          data-cy="settings-role-selected-permissions-content"
          className="border border-gray-200 rounded-lg p-4 bg-gray-50/50"
        >
          <div
            data-cy="settings-role-selected-permissions-header-container"
            className="flex items-center justify-between mb-3"
          >
            <span
              data-cy="settings-role-selected-permissions-label"
              className="font-semibold text-gray-800"
            >
              Selected Permissions
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
              data-cy="settings-role-selected-count"
            >
              {selectedPermissionIds.length} Selected
            </span>
          </div>
          <div
            data-cy="settings-role-selected-permissions-list-container"
            className="max-h-[220px] overflow-y-auto space-y-3"
          >
            {Object.entries(selectedPermissionsGrouped).map(
              ([groupId, perms]) => (
                <div
                  data-cy="settings-role-selected-permission-group-item"
                  key={groupId}
                  className="border border-gray-200 rounded-lg bg-white px-3 py-3"
                >
                  <div
                    data-cy="settings-role-selected-permission-group-header-container"
                    className="flex items-center gap-3 mb-3"
                  >
                    <span
                      data-cy="settings-role-selected-permission-group-icon-container"
                      className="flex h-7 w-7 items-center justify-center rounded bg-gray-100"
                    >
                      <MdOutlineGrid4X4 className="w-4 h-4 text-gray-600" />
                    </span>
                    <span
                      data-cy="settings-role-selected-permission-group-name"
                      className="text-sm font-semibold text-gray-800"
                    >
                      {groupIdToName[groupId] ?? 'Other'}
                    </span>
                  </div>
                  <ul
                    data-cy="settings-role-selected-permission-group-list"
                    className="space-y-2"
                  >
                    {perms.map((p) => (
                      <li
                        data-cy="settings-role-selected-permission-item"
                        key={p.id}
                        className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5"
                      >
                        <span
                          data-cy="settings-role-selected-permission-name"
                          className="text-xs font-medium text-gray-800"
                        >
                          {p.name ?? 'N/A'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePermission(p.id)}
                          className="text-gray-400 hover:text-red-500 p-0.5"
                          aria-label="Remove"
                          data-cy={`settings-role-remove-permission-${p.id}`}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
            {selectedPermissionIds.length === 0 && (
              <div
                data-cy="settings-role-no-permissions-selected"
                className="py-4 text-center text-gray-500 text-sm"
              >
                No permissions selected
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    const isStep0 = currentStep === 0;
    const isStep1 = currentStep === 1;
    const isStep2 = currentStep === 2;

    return (
      <div
        className="flex justify-center w-full bg-[#fff] px-6 py-6 gap-6 border-t border-gray-100 mt-4"
        id="settings-role-form-actions"
        data-cy="settings-role-form-actions"
      >
        {isStep0 && (
          <Button
            id="cancelButtonForRole"
            className="px-6 py-3 text-xs font-bold"
            onClick={handleCancel}
            data-cy="settings-role-cancel-btn"
          >
            Cancel
          </Button>
        )}
        {(isStep1 || isStep2) && (
          <Button
            className="px-6 py-3 text-xs font-bold"
            onClick={handleBack}
            data-cy="settings-role-back-btn"
          >
            Back
          </Button>
        )}
        {isStep0 || isStep1 ? (
          <Button
            type="primary"
            className="px-6 py-3 text-xs font-bold"
            onClick={handleContinue}
            data-cy="settings-role-continue-btn"
          >
            Continue
          </Button>
        ) : (
          <Button
            id="roleAction"
            className="px-6 py-3 text-xs font-bold"
            type="primary"
            loading={
              createRoleMutation.isLoading || updateRoleMutation.isLoading
            }
            onClick={() => {
              form
                .validateFields()
                .then((values) => {
                  if (currentModal === 'editRoleModal') {
                    handleRoleUpdate(values);
                  } else {
                    handleCreateRole(values as Role);
                  }
                })
                .catch(() => {});
            }}
            data-cy="settings-role-submit-btn"
          >
            {currentModal !== 'editRoleModal' ? 'Create' : 'Update'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div data-cy="settings-role-modal-container">
      <Modal
        title={modalTitle}
        open={true}
        footer={null}
        onCancel={handleCancel}
        data-cy="settings-role-modal"
        zIndex={10002}
        styles={{ body: { padding: 0 } }}
      >
        <Steps
          responsive={false}
          labelPlacement="vertical"
          current={currentStep}
          size="small"
          className="mb-6"
          items={ROLE_STEP_TITLES}
          data-cy="settings-role-steps"
        />

        <Form
          form={form}
          name="basic"
          layout="vertical"
          data-cy="settings-role-form"
        >
          <div
            data-cy="settings-role-form-content"
            className="border border-gray-200 rounded-md"
          >
            {renderStepContent()}
          </div>
          {renderFooter()}
        </Form>
      </Modal>
    </div>
  );
};

export default ListOfRoles;
