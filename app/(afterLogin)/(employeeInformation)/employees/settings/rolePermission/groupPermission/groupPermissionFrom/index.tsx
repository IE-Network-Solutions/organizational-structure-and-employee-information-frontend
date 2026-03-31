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
  Row,
  Col,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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
import type { Permission as PermissionType } from '@/store/server/features/employees/settings/permission/interface';

const STEP_TITLES = [
  {
    title: (
      <span data-cy="settings-group-permission-name-group-step-title">
        Name Group
      </span>
    ),
  },
  {
    title: (
      <span
        data-cy="settings-group-permission-select-permissions-step-title"
        className="text-nowrap"
      >
        Select Permissions
      </span>
    ),
  },
  {
    title: (
      <span data-cy="settings-group-permission-finalize-step-title">
        Finalize
      </span>
    ),
  },
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

  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    [],
  );
  const [permissionSearch, setPermissionSearch] = useState('');

  const isEdit = currentModal === 'editModal';
  const permissionsList: PermissionType[] = allPermissionsData?.items ?? [];

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
    }
  }, [currentModal]);

  // Handle individual permission toggle
  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissionIds((prev) => [...prev, permissionId]);
    } else {
      setSelectedPermissionIds((prev) =>
        prev.filter((id: string) => id !== permissionId),
      );
    }
  };

  const flatFilteredPermissions = useMemo(() => {
    if (!permissionsList) return [];
    if (!permissionSearch) return permissionsList;
    const search = permissionSearch.toLowerCase();
    return permissionsList.filter(
      (p) =>
        p.name?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search),
    );
  }, [permissionsList, permissionSearch]);

  const selectedFlatPermissions = useMemo(
    () => permissionsList.filter((p) => selectedPermissionIds.includes(p.id)),
    [permissionsList, selectedPermissionIds],
  );

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
    form
      .validateFields()
      .then((values) => {
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
          createPermissionGroupMutation(
            payload as unknown as GroupPermissionkey,
            {
              onSuccess: () => {
                handleCancel();
              },
            },
          );
        }
      })
      .catch(() => {});
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
          data-cy="settings-group-permission-form-step-0"
          className="sm:px-10"
        >
          <div
            className="grid gap-4 border border-[#d9d9d9] rounded-md p-4"
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
                <span
                  data-cy="settings-group-permission-name-label"
                  className="text-sm font-normal text-black mb-1"
                >
                  Name{' '}
                  <span
                    style={{ color: 'red' }}
                    data-cy={`settings-group-permission-name-required`}
                  >
                    *
                  </span>
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
            <Form.Item
              name="description"
              label={
                <span
                  data-cy="settings-group-permission-description-label"
                  className="text-sm font-normal text-black mb-1"
                >
                  Description
                </span>
              }
            >
              <Input.TextArea
                placeholder="Add Description"
                rows={3}
                className="resize-y"
                data-cy="settings-group-permission-description-input"
              />
            </Form.Item>
          </div>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="pt-2" data-cy="settings-group-permission-select-step">
          {selectedFlatPermissions.length > 0 && (
            <div
              className="mb-3 flex flex-wrap gap-2"
              data-cy="settings-group-permission-selected-tags"
            >
              {selectedFlatPermissions.map((permission) => (
                <Tag
                  key={permission.id}
                  data-cy="settings-group-permission-selected-tag"
                  className="border border-primary text-primary text-xs font-normal bg-white px-3 py-1 rounded-lg"
                >
                  <span
                    onClick={() => removePermission(permission.id)}
                    cursor-pointer
                    className="text-primary text-sm font-bold"
                    data-cy="settings-group-permission-remove-permission-icon"
                  >
                    ×
                  </span>{' '}
                  {permission.name}
                </Tag>
              ))}
            </div>
          )}
          <div
            data-cy="settings-group-permission-search-container"
            className="mb-3"
          >
            <Input
              placeholder="Search Permission"
              className="w-full pr-0 py-0"
              suffix={
                <div
                  className="text-gray-400 border-l border-gray-300 px-2 py-1"
                  data-cy="merge-search-icon-container"
                >
                  <SearchOutlined />
                </div>
              }
              value={permissionSearch}
              onChange={(e) => {
                setPermissionSearch(e.target.value);
              }}
              data-cy="settings-group-permission-search"
            />
          </div>
          <div
            className="max-h-96 overflow-y-auto scrollbar-hide"
            id="settings-group-permission-permissions-list"
            data-cy="settings-group-permission-permissions-list"
          >
            <div
              data-cy="settings-group-permission-permissions-list-container"
              className="space-y-3 pt-2"
            >
              {flatFilteredPermissions.map((permission) => {
                const isChecked = selectedPermissionIds.includes(permission.id);
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
                    <div
                      data-cy="settings-group-permission-item-content"
                      className="flex-1"
                    >
                      <span
                        data-cy="settings-group-permission-name"
                        className="text-sm font-medium text-gray-900"
                      >
                        {permission.name}
                      </span>
                      {permission.description && (
                        <p
                          data-cy="settings-group-permission-description"
                          className="text-xs text-gray-500 m-0 mt-0.5"
                        >
                          {permission.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {flatFilteredPermissions.length === 0 && (
                <div
                  data-cy="settings-group-permission-no-permissions-found"
                  className="py-4 text-center text-sm text-gray-500"
                >
                  No permissions found
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Step 2: Finalize
    return (
      <Row
        data-cy="settings-group-permission-finalize-content"
        gutter={[16, 16]}
        justify="space-between"
      >
        <Col
          lg={11}
          xs={24}
          sm={24}
          md={11}
          data-cy="settings-group-permission-finalize-form-content"
          className="border border-[#d9d9d9] rounded-md p-4 h-64"
        >
          <Form.Item
            name="name"
            label={
              <span
                data-cy="settings-group-permission-name-label"
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
        </Col>
        <Col
          data-cy="settings-group-permission-selected-permissions-content"
          lg={12}
          xs={24}
          sm={24}
          md={12}
          className="border border-[#d9d9d9] rounded-md px-2 py-1 h-auto"
        >
          <div
            data-cy="settings-group-permission-selected-permissions-container"
            className="flex items-center justify-between mb-3"
          >
            <span
              data-cy="settings-group-permission-selected-permissions-label"
              className="font-normal text-[#4d4d4d] text-sm"
            >
              Selected Permissions
            </span>
            <Tag
              className="px-2.5 py-0.5 rounded-sm text-xs font-normal text-[#818181] border border-[#e4e4e4]"
              data-cy="settings-group-permission-selected-count"
            >
              {selectedPermissionIds.length} Selected
            </Tag>
          </div>
          <div
            data-cy="settings-group-permission-selected-permissions-list-container"
            className=""
          >
            {Object.entries(selectedPermissionsGrouped).map(
              ([groupId, perms]) => (
                <div
                  key={groupId}
                  data-cy="settings-group-permission-group-item"
                >
                  <ul
                    data-cy="settings-group-permission-list"
                    className="space-y-1"
                  >
                    {perms.map((p) => (
                      <Tag
                        key={p.id}
                        data-cy="settings-group-permission-list-item"
                        className="flex items-center justify-between text-sm py-1 px-2 rounded border border-[#e4e4e4] text-[#818181] font-normal"
                      >
                        <span
                          data-cy="settings-group-permission-name"
                          className="text-[#818181] font-normal text-xs"
                        >
                          {p.name ?? 'N/A'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePermission(p.id)}
                          className="text-gray-400 hover:text-red-500 p-0.5"
                          aria-label="Remove"
                          data-cy={`settings-group-permission-remove-${p.id}`}
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
                data-cy="settings-group-permission-no-permissions-selected"
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
        className="flex justify-end gap-3  border-gray-100 mt-4 sm:px-10"
        id="settings-group-permission-actions"
        data-cy="settings-group-permission-actions"
      >
        {isStep0 && (
          <Button
            type="default"
            className="h-8 font-normal border border-[#D9D9D9]"
            onClick={handleCancel}
            data-cy="settings-group-permission-cancel-btn"
          >
            Cancel
          </Button>
        )}
        {(isStep1 || isStep2) && (
          <Button
            type="default"
            className="h-8 font-normal border border-[#D9D9D9]"
            onClick={handleBack}
            data-cy="settings-group-permission-back-btn"
          >
            Back
          </Button>
        )}
        {isStep0 || isStep1 ? (
          <Button
            className="h-8 font-normal"
            type="primary"
            onClick={handleContinue}
          >
            Continue
          </Button>
        ) : (
          <Button
            type="primary"
            loading={isEdit ? updateLoaing : createLoading}
            onClick={handleCreate}
            data-cy="settings-group-permission-submit-btn"
            className="h-8 font-normal"
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
      open={currentModal === 'createModal' || currentModal === 'editModal'}
      footer={null}
      onCancel={handleCancel}
      data-cy="settings-group-permission-modal"
      zIndex={10002}
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
        labelPlacement="vertical"
        current={currentStep}
        progressDot
        responsive={false}
        className="user-sidebar-steps max-w-6xl hidden sm:flex my-5"
        items={STEP_TITLES}
        data-cy="settings-group-permission-steps"
      />

      <Form
        form={form}
        layout="vertical"
        id="settings-group-permission-form"
        data-cy="settings-group-permission-form"
        className="mt-10"
        requiredMark={false}
      >
        <div
          data-cy="settings-group-permission-form-content"
          // className="border border-gray-200 rounded-md"
        >
          {renderStepContent()}
        </div>
        {renderFooter()}
      </Form>
    </Modal>
  );
};

export default GroupPermission;
