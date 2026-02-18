'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Modal, Button, Steps, Checkbox, Input as AntInput, Tag, Collapse, Switch } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { MdOutlineGrid4X4 } from 'react-icons/md';
import {
  GroupPermissionkey,
  Permission,
} from '@/types/dashboard/adminManagement';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import {
  useAddPermissionGroup,
  useUpdatePermissionGroup,
} from '@/store/server/features/employees/settings/groupPermission/mutations';
import { useGetPermissionsWithOutPagination } from '@/store/server/features/employees/settings/permission/queries';
import { useGetPermissionGroupsWithOutPagination } from '@/store/server/features/employees/settings/groupPermission/queries';
import type { Permission as PermissionType } from '@/store/server/features/employees/settings/permission/interface';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AppsIcon from '@mui/icons-material/Apps';

const STEP_TITLES = [
  { title: <span>Name Group</span> },
  { title: <span className="text-nowrap">Select Permissions</span> },
  { title: <span>Finalize</span> },
];

const GroupPermission = () => {
  const {
    selectedPermissionGroup,
    setSelectedPermissionGroup,
    setCurrentModal,
    currentModal,
  } = useSettingStore();
  const { mutate: createPermissionGroupMutation, isLoading: createLoading } =
    useAddPermissionGroup();
  const { mutate: updatePermissionGroupMutation, isLoading: updateLoaing } =
    useUpdatePermissionGroup();
  const { data: allPermissionsData } = useGetPermissionsWithOutPagination();
  const { data: groupsData } = useGetPermissionGroupsWithOutPagination();

  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    [],
  );
  const [permissionSearch, setPermissionSearch] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string | null>(
    null,
  );

  const isEdit = currentModal === 'editModal';
  const permissionsList: PermissionType[] = allPermissionsData?.items ?? [];
  const groupsList = groupsData?.items ?? [];
  const groupCount = groupsList.length;


  const groupIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    groupsList.forEach((g: { id: string; name: string }) => {
      map[g.id] = g.name ?? 'Other';
    });
    return map;
  }, [groupsList]);

  const handleGroupToggle = (group: any, checked: boolean) => {
    const groupPermissionIds = group.permissions?.map((p: any) => p.id) || [];
    if (checked) {
      const updatedPermissions = Array.from(
        new Set([...selectedPermissionIds, ...groupPermissionIds])
      );
      setSelectedPermissionIds(updatedPermissions);
    } else {
      const updatedPermissions = selectedPermissionIds.filter(
        (id: string) => !groupPermissionIds.includes(id)
      );
      setSelectedPermissionIds(updatedPermissions);
    }
  };

  useEffect(() => {
    if (currentModal === 'editModal' && selectedPermissionGroup) {
      form.setFieldsValue({
        id: selectedPermissionGroup?.id,
        name: selectedPermissionGroup?.name,
        description: selectedPermissionGroup?.description ?? '',
      });
      const ids =
        selectedPermissionGroup?.permissions?.map((p: Permission) => p.id) ??
        [];
      setSelectedPermissionIds(ids);
      setCurrentStep(0);
    }
  }, [currentModal, selectedPermissionGroup, form]);

  useEffect(() => {
    if (currentModal === 'createModal') {
      setCurrentStep(0);
      setSelectedPermissionIds([]);
      setPermissionSearch('');
      setSelectedGroupFilter('all');
    }
  }, [currentModal]);

   // Filter group permissions based on selected filter
   const filteredGroupPermissions = useMemo(() => {
    if (!groupsList) return [];
    if (selectedGroupFilter === 'all' || !selectedGroupFilter) return groupsList;
    return groupsList?.filter((group: any) =>
      group.name.toLowerCase() === selectedGroupFilter.toLowerCase()
    );
  }, [groupsList, selectedGroupFilter]);

   // Get selected permissions count for a group
   const getGroupSelectedCount = (group: any) => {
    const groupPermissionIds = group.permissions?.map((p: any) => p.id) || [];
    const selectedCount = selectedPermissionIds.filter((id: string) =>
      groupPermissionIds.includes(id)
    ).length;
    return selectedCount;
  };

  // Check if group is fully selected
  const isGroupFullySelected = (group: any) => {
    const groupPermissionIds = group.permissions?.map((p: any) => p.id) || [];
    return (
      groupPermissionIds.length > 0 &&
      groupPermissionIds.every((id: string) => selectedPermissionIds.includes(id))
    );
  };

  // Get group icon
  const getGroupIcon = (groupName: string) => {
    const name = groupName.toLowerCase();
    if (name.includes('payroll') || name.includes('salary')) {
      return <AccountBalanceWalletIcon className="text-gray-600" />;
    }
    return <AppsIcon className="text-gray-600" />;
  };

    // Handle individual permission toggle
    const handlePermissionToggle = (permissionId: string, checked: boolean) => {
      if (checked) {
        setSelectedPermissionIds((prev) => [...prev, permissionId]);
      } else {
        setSelectedPermissionIds((prev) => prev.filter((id: string) => id !== permissionId));
      }
    };

  const filteredPermissions = useMemo(() => {
    let list = permissionsList;
    const term = permissionSearch.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term),
      );
    }
    if (selectedGroupFilter) {
      list = list.filter((p) => p.permissionGroupId === selectedGroupFilter);
    }
    return list;
  }, [permissionsList, permissionSearch, selectedGroupFilter]);

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

  const handleCancel = () => {
    form.resetFields();
    setSelectedPermissionGroup(null);
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
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = () => {
    if (!isEdit && selectedPermissionIds.length === 0) {
      form.setFields([
        {
          name: 'permissions',
          errors: ['Select at least one permission'],
        },
      ]);
      return;
    }
    form.validateFields().then((values) => {
      const payload = {
        ...values,
        permissionIds: selectedPermissionIds,
        permissions: selectedPermissionIds,
      };
      if (isEdit) {
        updatePermissionGroupMutation(payload as any, {
          onSuccess: () => {
            handleCancel();
          },
        });
      } else {
        createPermissionGroupMutation(payload as unknown as GroupPermissionkey, {
          onSuccess: () => {
            handleCancel();
          },
        });
      }
    }).catch(() => {});
  };


  const removePermission = (id: string) => {
    setSelectedPermissionIds((prev) => prev.filter((x) => x !== id));
  };

  const modalTitle =
    currentModal === 'editModal'
      ? 'Update Group Permission'
      : 'Create Group Permission';

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div
          className="grid gap-4 pt-2 p-4"
          id="settings-group-permission-form-div"
          data-cy="settings-group-permission-form-div"
        >
          {isEdit && (
            <Form.Item name="id" hidden>
              <Input type="hidden" />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label={
              <span className="text-gray-700 font-medium">
                Name
              </span>
            }
            rules={[{ required: true, message: 'Enter group name!' }]}
          >
            <Input
              placeholder="Enter Group Name"
              className="h-10"
              data-cy="settings-group-permission-name-input"
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              placeholder="Add Description"
              rows={3}
              className="resize-y"
              data-cy="settings-group-permission-description-input"
            />
          </Form.Item>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="pt-2" data-cy="settings-group-permission-select-step">
          <div className="mb-3">
            <AntInput
              placeholder="Search Permission"
              suffix={<SearchOutlined className="text-gray-400" />}
              value={permissionSearch}
              onChange={(e) => {
                setPermissionSearch(e.target.value);
              }}
              className="rounded-lg mb-3"
              data-cy="settings-group-permission-search"
            />
                              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">

                              <Tag
                      className={`cursor-pointer inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 border ${
                        selectedGroupFilter === 'all'
                          ? 'border-[#1d4ed8] text-[#1d4ed8] bg-white'
                          : 'border-gray-300 text-gray-700 bg-white'
                      }`}
                      onClick={() => setSelectedGroupFilter('all')}
                    >
                      <span
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
                      const isSelected = selectedGroupFilter === group.name.toLowerCase();
                      return (
                        <Tag
                          key={group.id}
                          className={`cursor-pointer inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 border ${
                            isSelected
                              ? 'border-[#1d4ed8] text-[#1d4ed8] bg-white'
                              : 'border-gray-300 text-gray-700 bg-white'
                          }`}
                          onClick={() => setSelectedGroupFilter(group.name.toLowerCase())}
                        >
                          <span
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
                id="role-permission-collapse"
                data-cy="role-permission-collapse"
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
                            p.name?.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                            p.description?.toLowerCase().includes(permissionSearch.toLowerCase())
                        )
                      : groupPermissions;
                    if (permissionsToShow.length === 0) return null;
                    return (
                      <Collapse.Panel
                        key={group.id}
                        header={
                          <div className="flex items-center gap-3 flex-1 pr-2">
                            <div className="w-8 h-8 rounded flex items-center justify-center bg-gray-100 shrink-0">
                              {getGroupIcon(group.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 m-0">
                                {group.name}
                              </p>
                              <p className="text-xs text-gray-500 m-0">
                                {selectedCount} of {totalCount} Selected
                              </p>
                            </div>
                          </div>
                        }
                        extra={
                          <span onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={isFullySelected}
                              onChange={(checked) => handleGroupToggle(group, checked)}
                              id={`permission-group-switch-${group.id}`}
                              data-cy={`permission-group-switch-${group.id}`}
                              className={`${isFullySelected ? 'bg-[#1d4ed8]' : ''}`}
                            />
                          </span>
                        }
                        id={`permission-group-panel-${group.id}`}
                        data-cy={`permission-group-panel-${group.id}`}
                      >
                        <div className="space-y-3 pt-2 border-t border-gray-100">
                          {permissionsToShow.map((permission: any) => {
                            const isChecked = selectedPermissionIds.includes(
                              permission.id
                            );
                            return (
                              <div
                                key={permission.id}
                                className="flex items-start gap-3 py-2 hover:bg-gray-50 rounded px-1 -mx-1"
                                id={`permission-item-${permission.id}`}
                                data-cy={`permission-item-${permission.id}`}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onChange={(e) =>
                                    handlePermissionToggle(permission.id, e.target.checked)
                                  }
                                  id={`permission-checkbox-${permission.id}`}
                                  data-cy={`permission-checkbox-${permission.id}`}
                                  className="pt-0.5"
                                />
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-gray-900">
                                    {permission.name}
                                  </span>
                                  {permission.description && (
                                    <p className="text-xs text-gray-500 m-0 mt-0.5">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-4">
          <Form.Item
            name="name"
            label={
              <span className="text-gray-700 font-medium">
                Name <span className="text-red-500">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Enter group name!' }]}
          >
            <Input
              placeholder="Input"
              className="h-10"
              data-cy="settings-group-permission-name-input-finalize"
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              placeholder="Textarea"
              rows={3}
              className="resize-y"
              data-cy="settings-group-permission-description-input-finalize"
            />
          </Form.Item>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-800">
              Selected Permissions
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
              data-cy="settings-group-permission-selected-count"
            >
              {selectedPermissionIds.length} Selected
            </span>
          </div>
          <div className="max-h-[200px] overflow-y-auto space-y-3">
            {Object.entries(selectedPermissionsGrouped).map(
              ([groupId, perms]) => (
                <div key={groupId}>
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1">
                    <MdOutlineGrid4X4 className="w-4 h-4" />
                    {groupIdToName[groupId] ?? 'Other'}
                  </div>
                  <ul className="space-y-1">
                    {perms.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-gray-100"
                      >
                        <span className="text-gray-800">{p.name ?? 'N/A'}</span>
                        <button
                          type="button"
                          onClick={() => removePermission(p.id)}
                          className="text-gray-400 hover:text-red-500 p-0.5"
                          aria-label="Remove"
                          data-cy={`settings-group-permission-remove-${p.id}`}
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
              <div className="py-4 text-center text-gray-500 text-sm">
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
        className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4"
        id="settings-group-permission-actions"
        data-cy="settings-group-permission-actions"
      >
          {isStep0 && (
            <Button
              onClick={handleCancel}
              data-cy="settings-group-permission-cancel-btn"
            >
              Cancel
            </Button>
          )}
          {(isStep1 || isStep2) && (
            <Button onClick={handleBack} data-cy="settings-group-permission-back-btn">
              Back
            </Button>
          )}
        {isStep0 || isStep1 ? (
          <Button type="primary" onClick={handleContinue}>
            Continue
          </Button>
        ) : (
          <Button
            type="primary"
            loading={isEdit ? updateLoaing : createLoading}
            onClick={handleCreate}
            data-cy="settings-group-permission-submit-btn"
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Modal
      title={
        <span
          className="text-lg font-semibold"
          id="settings-group-permission-modal-title"
          data-cy="settings-group-permission-modal-title"
        >
          {modalTitle}
        </span>
      }
      width={currentStep === 2 ? 720 : 560}
      open={currentModal === 'createModal' || currentModal === 'editModal'}
      footer={null}
      onCancel={handleCancel}
      data-cy="settings-group-permission-modal"
      destroyOnClose
    >
      <Steps
        labelPlacement="vertical"
        current={currentStep}
        size="small"
        className="mb-6"
        items={STEP_TITLES}
        data-cy="settings-group-permission-steps"
      />

      <Form
        form={form}
        layout="vertical"
        id="settings-group-permission-form"
        data-cy="settings-group-permission-form"
      >
        <div className='border border-gray-200 rounded-md'>
        {renderStepContent()}
        </div>
        {renderFooter()}
      </Form>
    </Modal>
  );
};

export default GroupPermission;
