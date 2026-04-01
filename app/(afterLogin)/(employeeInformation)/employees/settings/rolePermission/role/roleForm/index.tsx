'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Form,
  Input,
  Modal,
  Button,
  Steps,
  Checkbox,
  Tag,
  Collapse,
  Switch,
  message,
  Row,
  Col,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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
import { AppstoreOutlined, FileTextOutlined } from '@ant-design/icons';
import { CiCalendar, CiSettings, CiStar, CiBookmark } from 'react-icons/ci';
import { TbMessage2 } from 'react-icons/tb';
import { AiOutlineDollarCircle } from 'react-icons/ai';
import { PiMoneyLight, PiSuitcaseSimpleThin } from 'react-icons/pi';
import { LuCircleDollarSign, LuUsers } from 'react-icons/lu';
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

  // Get group icon
  const getGroupIcon = (groupName: string) => {
    const name = groupName.toLowerCase();

    if (name.includes('dashboard')) {
      return <AppstoreOutlined style={{ fontSize: 18 }} />;
    }

    if (name.includes('organization') || name.includes('org ')) {
      return <CiSettings size={18} />;
    }

    if (name.includes('employee')) {
      return <LuUsers size={18} />;
    }

    if (
      name.includes('recruit') ||
      name.includes('talent') ||
      name.includes('job')
    ) {
      return <PiSuitcaseSimpleThin size={18} />;
    }

    if (name.includes('okr')) {
      return <CiStar size={18} />;
    }

    if (
      name.includes('feedback') ||
      name.includes('cfr') ||
      name.includes('conversation') ||
      name.includes('recognition')
    ) {
      return <TbMessage2 size={18} />;
    }

    if (
      name.includes('learning') ||
      name.includes('training') ||
      name.includes('tna')
    ) {
      return <CiBookmark size={18} />;
    }

    if (name.includes('payroll') || name.includes('salary')) {
      return <AiOutlineDollarCircle size={18} />;
    }

    if (
      name.includes('timesheet') ||
      name.includes('attendance') ||
      name.includes('leave')
    ) {
      return <CiCalendar size={18} />;
    }

    if (
      name.includes('compensation') ||
      name.includes('benefit') ||
      name.includes('allowance') ||
      name.includes('deduction')
    ) {
      return <PiMoneyLight size={18} />;
    }

    if (name.includes('incentive') || name.includes('variable pay')) {
      return <LuCircleDollarSign size={18} />;
    }

    if (name.includes('audit')) {
      return <FileTextOutlined style={{ fontSize: 18 }} />;
    }

    if (name.includes('admin') || name.includes('configuration')) {
      return <CiSettings size={18} />;
    }

    return <AppstoreOutlined style={{ fontSize: 18 }} />;
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
      className="flex w-full justify-start items-center text-base font-bold"
      id="settings-role-modal-title"
      data-cy="settings-role-modal-title"
    >
      {currentModal === 'editRoleModal' ? 'Edit Role' : 'Create Role'}
    </div>
  );

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div data-cy="settings-role-form-step-0">
          <div
            className="grid gap-4 p-4 border border-[#d9d9d9] rounded-md"
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
                  className="text-sm font-normal text-black mb-1"
                  id="settings-role-name-label"
                  data-cy="settings-role-name-label"
                >
                  Name{' '}
                  <span
                    style={{ color: 'red' }}
                    data-cy={`settings-role-name-required`}
                  >
                    *
                  </span>
                </p>
              }
              rules={[{ required: true, message: 'Enter role name!' }]}
              id="settings-role-name-item"
              data-cy="settings-role-name-item"
            >
              <Input
                id="roleNameId"
                className="h-10 text-gray-600"
                placeholder="Enter role name"
                data-cy="settings-role-name-input"
              />
            </Form.Item>
            <Form.Item
              name="description"
              label={
                <p
                  className="text-sm font-normal text-black mb-1"
                  id="settings-role-description-label"
                  data-cy="settings-role-description-label"
                >
                  Description{' '}
                  <span
                    style={{ color: 'red' }}
                    data-cy={`settings-role-description-required`}
                  >
                    *
                  </span>
                </p>
              }
              rules={[{ required: true, message: 'Enter role description!' }]}
              id="settings-role-description-item"
              data-cy="settings-role-description-item"
            >
              <Input.TextArea
                id="roleDescriptionId"
                className=" text-gray-600 resize-y"
                placeholder="Enter role description"
                rows={3}
                data-cy="settings-role-description-input"
              />
            </Form.Item>
          </div>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="pt-2" data-cy="settings-role-select-permissions-step">
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
            <Input
              placeholder="Search Permission"
              className="w-full pr-0 py-0 mb-4"
              suffix={
                <div
                  data-cy="settings-role-permission-search-icon"
                  className="text-gray-400 border-l border-gray-300 px-2 py-1"
                >
                  <SearchOutlined />
                </div>
              }
              value={permissionSearch}
              onChange={(e) => setPermissionSearch(e.target.value)}
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
            className="max-h-96 overflow-y-auto scrollbar-hide"
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
                          className="w-8 h-8 rounded flex items-center justify-center bg-gray-100 shrink-0 font-normal"
                        >
                          {getGroupIcon(group.name)}
                        </div>
                        <div
                          data-cy="settings-role-permission-group-content"
                          className="flex-1 min-w-0"
                        >
                          <p
                            data-cy="settings-role-permission-group-name"
                            className="text-sm font-normal text-black m-0"
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
      <Row
        data-cy="settings-role-finalize-content"
        gutter={[16, 16]}
        justify="space-between"
      >
        <Col
          lg={11}
          xs={24}
          sm={24}
          md={11}
          data-cy="settings-role-finalize-form-content"
          className="border border-[#d9d9d9] rounded-md p-4 h-56"
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
            rules={[{ required: true, message: 'Enter role name!' }]}
          >
            <Input
              placeholder="Enter role name"
              className="h-10"
              data-cy="settings-role-name-input-finalize"
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              placeholder="Enter role description"
              rows={3}
              className="resize-y"
              data-cy="settings-role-description-input-finalize"
            />
          </Form.Item>
        </Col>
        <Col
          lg={12}
          xs={24}
          sm={24}
          md={12}
          data-cy="settings-role-selected-permissions-content"
          className="border border-[#d9d9d9] rounded-md px-2 py-1"
        >
          <div
            data-cy="settings-role-selected-permissions-header-container"
            className="flex items-center justify-between mb-3"
          >
            <span
              data-cy="settings-role-selected-permissions-label"
              className="font-normal text-[#4d4d4d] text-sm"
            >
              Selected Permissions
            </span>
            <Tag
              className="px-2.5 py-0.5 rounded-sm text-xs font-normal text-[#818181] border border-[#e4e4e4]"
              data-cy="settings-role-selected-count"
            >
              {selectedPermissionIds.length} Selected
            </Tag>
          </div>
          <div
            data-cy="settings-role-selected-permissions-list-container"
            className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-hide"
          >
            {Object.entries(selectedPermissionsGrouped).map(
              ([groupId, perms]) => (
                <div
                  data-cy="settings-role-selected-permission-group-item"
                  key={groupId}
                >
                  <ul
                    data-cy="settings-role-selected-permission-group-list"
                    className="space-y-2"
                  >
                    {perms.map((p) => (
                      <Tag
                        data-cy="settings-role-selected-permission-item"
                        key={p.id}
                        className="flex items-center justify-between text-sm py-1 px-2 rounded border border-[#e4e4e4] text-[#818181] font-normal"
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
                      </Tag>
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
        </Col>
      </Row>
    );
  };

  const renderFooter = () => {
    const isStep0 = currentStep === 0;
    const isStep1 = currentStep === 1;
    const isStep2 = currentStep === 2;

    return (
      <div
        className="flex justify-end w-full bg-[#fff] gap-3  mt-4"
        id="settings-role-form-actions"
        data-cy="settings-role-form-actions"
      >
        {isStep0 && (
          <Button
            id="cancelButtonForRole"
            className="h-8 font-normal border border-[#d9d9d9]"
            onClick={handleCancel}
            data-cy="settings-role-cancel-btn"
          >
            Cancel
          </Button>
        )}
        {(isStep1 || isStep2) && (
          <Button
            className="h-8 font-normal border border-[#d9d9d9]"
            onClick={handleBack}
            data-cy="settings-role-back-btn"
          >
            Back
          </Button>
        )}
        {isStep0 || isStep1 ? (
          <Button
            type="primary"
            className="h-8 font-normal"
            onClick={handleContinue}
            data-cy="settings-role-continue-btn"
          >
            Continue
          </Button>
        ) : (
          <Button
            id="roleAction"
            className="h-8 font-normal"
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
        centered
      >
        <style data-cy="user-sidebar-steps-style">{`
              /* Keep step labels on a single line */
              .user-sidebar-steps .ant-steps-item-title {
                white-space: nowrap !important;
              }

              /* Active and completed steps: primary blue (match screenshot) */
              .user-sidebar-steps .ant-steps-item-process .ant-steps-item-title,
              .user-sidebar-steps .ant-steps-item-finish .ant-steps-item-title {
                color: #1e40af !important;
              }

              /* Upcoming steps: light gray */
              .user-sidebar-steps .ant-steps-item-wait .ant-steps-item-title {
                color: #d9d9d9 !important;
              }
            `}</style>
        <Steps
          responsive={false}
          labelPlacement="vertical"
          current={currentStep}
          progressDot
          className="user-sidebar-steps max-w-6xl hidden sm:flex my-5"
          items={ROLE_STEP_TITLES}
          data-cy="settings-role-steps"
        />

        <Form
          form={form}
          name="basic"
          layout="vertical"
          data-cy="settings-role-form"
          requiredMark={false}
        >
          <div data-cy="settings-role-form-content">{renderStepContent()}</div>
          {renderFooter()}
        </Form>
      </Modal>
    </div>
  );
};

export default ListOfRoles;
