'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Form, Modal, Select, Spin } from 'antd';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import {
  AllowedAreaResolverType,
  AllowedAreaConfiguration,
} from '@/types/timesheet/settings';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetDepartmentUsersAllLevels } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllowedAreaConfiguration } from '@/store/server/features/timesheet/allowedAreaConfiguration/queries';
import {
  buildCreateAllowedAreaConfigurationPayload,
  buildUpdateAllowedAreaConfigurationPayload,
  getAllowedAreaConfigType,
  getAllowedAreaConfigUserIds,
} from '@/store/server/features/timesheet/allowedAreaConfiguration/interface';
import {
  useCreateAllowedAreaConfigurationWithUsers,
  useUpdateAllowedAreaConfiguration,
} from '@/store/server/features/timesheet/allowedAreaConfiguration/mutation';
import { flattenDepartments } from '@/utils/approval/departmentHelpers';

const CONFIG_TYPE_OPTIONS = [
  {
    value: AllowedAreaResolverType.DEPARTMENT_BASED,
    label: 'Department',
  },
  {
    value: AllowedAreaResolverType.USER_BASED,
    label: 'User',
  },
];

interface Department {
  id: string;
  name: string;
  children?: Department[];
}

interface DepartmentUser {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
}

const getEmployeeName = (user: DepartmentUser) =>
  `${user.firstName ?? ''} ${user.middleName ?? ''} ${user.lastName ?? ''}`.trim() ||
  user.email ||
  'Unnamed user';

const AllowedAreaConfigModal = () => {
  const {
    isShowAllowedAreaConfigModal: isShow,
    setIsShowAllowedAreaConfigModal: setIsShow,
    allowedAreaConfigId,
    setAllowedAreaConfigId,
  } = useTimesheetSettingsStore();

  const [form] = Form.useForm();
  const configType = Form.useWatch('configType', form);
  const departmentId = Form.useWatch('departmentId', form);
  const skipAutoSelectUsersRef = useRef(false);
  const lockedDepartmentIdRef = useRef<string | null>(null);

  const { data: departmentsData } = useGetDepartments();
  const { data: departmentUsersData, isFetching: isUsersLoading } =
    useGetDepartmentUsersAllLevels(departmentId ?? null);
  const {
    data: configData,
    isFetching: isConfigFetching,
    refetch,
  } = useGetAllowedAreaConfiguration({ id: allowedAreaConfigId ?? '' });
  const { mutate: createConfiguration, isLoading: isCreating } =
    useCreateAllowedAreaConfigurationWithUsers();
  const { mutate: updateConfiguration, isLoading: isUpdating } =
    useUpdateAllowedAreaConfiguration();

  const isSaving = isCreating || isUpdating;

  const isEditMode = Boolean(allowedAreaConfigId);
  const isUserBased = configType === AllowedAreaResolverType.USER_BASED;

  const departments = useMemo(
    () => (departmentsData as Department[] | undefined) ?? [],
    [departmentsData],
  );

  const departmentOptions = useMemo(
    () =>
      flattenDepartments(departments).map((dept) => ({
        value: dept.id,
        label: dept.name,
      })),
    [departments],
  );

  const availableUsers = useMemo(() => {
    const users =
      departmentUsersData?.items ??
      departmentUsersData?.data?.items ??
      departmentUsersData?.data ??
      departmentUsersData ??
      [];
    if (!Array.isArray(users)) return [];
    return users as DepartmentUser[];
  }, [departmentUsersData]);

  const userOptions = useMemo(
    () =>
      availableUsers.map((user) => ({
        value: String(user.id),
        label: getEmployeeName(user),
      })),
    [availableUsers],
  );

  const onClose = useCallback(() => {
    form.resetFields();
    skipAutoSelectUsersRef.current = false;
    lockedDepartmentIdRef.current = null;
    setAllowedAreaConfigId(null);
    setIsShow(false);
  }, [form, setAllowedAreaConfigId, setIsShow]);

  useEffect(() => {
    if (!isShow) return;
    skipAutoSelectUsersRef.current = false;
    lockedDepartmentIdRef.current = null;

    if (!allowedAreaConfigId) {
      form.resetFields();
      return;
    }

    refetch();
  }, [isShow, allowedAreaConfigId, refetch, form]);

  useEffect(() => {
    if (!configData?.item || !allowedAreaConfigId) return;

    const item = configData.item as AllowedAreaConfiguration;
    const itemDepartmentId = item.departmentId ?? null;
    lockedDepartmentIdRef.current = itemDepartmentId;
    skipAutoSelectUsersRef.current = true;
    form.setFieldsValue({
      configType: getAllowedAreaConfigType(item),
      departmentId: itemDepartmentId ?? undefined,
      userIds: getAllowedAreaConfigUserIds(item),
    });
  }, [configData, allowedAreaConfigId, form]);

  useEffect(() => {
    if (!isUserBased || !departmentId || isUsersLoading) return;
    if (skipAutoSelectUsersRef.current) {
      skipAutoSelectUsersRef.current = false;
      return;
    }

    form.setFieldsValue({
      userIds: availableUsers.map((user) => String(user.id)),
    });
  }, [isUserBased, departmentId, isUsersLoading, availableUsers, form]);

  const handleConfigTypeChange = (value: AllowedAreaResolverType) => {
    if (isEditMode) {
      const currentDepartmentId =
        lockedDepartmentIdRef.current ?? form.getFieldValue('departmentId');
      const currentUserIds: string[] = form.getFieldValue('userIds') ?? [];

      if (value === AllowedAreaResolverType.DEPARTMENT_BASED) {
        form.setFieldsValue({
          configType: value,
          departmentId: currentDepartmentId,
          userIds: [],
        });
        return;
      }

      form.setFieldsValue({
        configType: value,
        departmentId: currentDepartmentId,
        userIds: currentUserIds,
      });

      if (!currentUserIds.length) {
        skipAutoSelectUsersRef.current = false;
      }
      return;
    }

    form.setFieldsValue({
      configType: value,
      departmentId: undefined,
      userIds: [],
    });
    skipAutoSelectUsersRef.current = false;
  };

  const handleDepartmentChange = (value: string | undefined) => {
    if (isEditMode) return;

    form.setFieldsValue({
      departmentId: value,
      userIds: [],
    });
    skipAutoSelectUsersRef.current = false;
  };

  const handleSubmit = (values: {
    configType: AllowedAreaResolverType;
    departmentId: string;
    userIds?: string[];
  }) => {
    const departmentIdForSubmit =
      isEditMode && lockedDepartmentIdRef.current
        ? lockedDepartmentIdRef.current
        : values.departmentId;

    const submitValues = {
      ...values,
      departmentId: departmentIdForSubmit,
    };

    if (isEditMode && allowedAreaConfigId) {
      updateConfiguration(
        buildUpdateAllowedAreaConfigurationPayload(
          allowedAreaConfigId,
          submitValues,
        ),
        { onSuccess: onClose },
      );
      return;
    }

    createConfiguration(
      buildCreateAllowedAreaConfigurationPayload(submitValues),
      {
        onSuccess: onClose,
      },
    );
  };

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[40px] text-sm border-1 border-[#D9D9D9] text-[#4d4d4d]',
      size: 'large',
      onClick: onClose,
      id: 'time-attendance-settings-allowed-area-config-modal-cancel-button',
      'data-cy':
        'time-attendance-settings-allowed-area-config-modal-cancel-button',
    },
    {
      label: isEditMode ? 'Update' : 'Create',
      key: 'submit',
      className: 'h-[40px] text-sm',
      size: 'large',
      type: 'primary',
      loading: isSaving,
      onClick: () => form.submit(),
      id: 'time-attendance-settings-allowed-area-config-modal-submit-button',
      'data-cy':
        'time-attendance-settings-allowed-area-config-modal-submit-button',
    },
  ];

  if (!isShow) return null;

  return (
    <Modal
      open={isShow}
      onCancel={onClose}
      title={
        <div
          className="text-lg font-semibold text-[#4d4d4d]"
          id="time-attendance-settings-allowed-area-config-modal-header"
          data-cy="time-attendance-settings-allowed-area-config-modal-header"
        >
          {isEditMode ? 'Edit' : 'Add'} Allowed Area Configuration
        </div>
      }
      footer={
        <div
          className="flex justify-end"
          id="time-attendance-settings-allowed-area-config-modal-footer"
          data-cy="time-attendance-settings-allowed-area-config-modal-footer"
        >
          <CustomDrawerFooterButton
            buttons={footerModalItems}
            data-cy="time-attendance-settings-allowed-area-config-modal-footer-buttons"
          />
        </div>
      }
      width={640}
      zIndex={10002}
      centered
      destroyOnClose
      data-cy="time-attendance-settings-allowed-area-config-modal"
    >
      <Spin spinning={isConfigFetching && isEditMode}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-2"
          data-cy="time-attendance-settings-allowed-area-config-modal-form"
        >
          <Form.Item
            name="configType"
            label={
              <span
                className="text-sm font-normal text-gray-900"
                data-cy="time-attendance-settings-allowed-area-config-config-type-label"
              >
                Config Type
              </span>
            }
            rules={[{ required: true, message: 'Please select a config type' }]}
            data-cy="time-attendance-settings-allowed-area-config-config-type-field"
          >
            <Select
              placeholder="Select config type"
              className="h-10"
              options={CONFIG_TYPE_OPTIONS}
              onChange={handleConfigTypeChange}
              data-cy="time-attendance-settings-allowed-area-config-config-type-select"
            />
          </Form.Item>

          <Form.Item
            name="departmentId"
            label={
              <span
                className="text-sm font-normal text-gray-900"
                data-cy="time-attendance-settings-allowed-area-config-department-label"
              >
                Department
              </span>
            }
            rules={[{ required: true, message: 'Please select a department' }]}
            data-cy="time-attendance-settings-allowed-area-config-department-field"
          >
            <Select
              showSearch
              placeholder="Select department"
              className="h-10"
              options={departmentOptions}
              optionFilterProp="label"
              allowClear={!isEditMode}
              disabled={isEditMode || !configType}
              onChange={handleDepartmentChange}
              data-cy="time-attendance-settings-allowed-area-config-department-select"
            />
          </Form.Item>

          {isUserBased && departmentId && (
            <Form.Item
              name="userIds"
              label={
                <span
                  className="text-sm font-normal text-gray-900"
                  data-cy="time-attendance-settings-allowed-area-config-users-label"
                >
                  Users
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please select at least one user',
                },
              ]}
              data-cy="time-attendance-settings-allowed-area-config-users-field"
            >
              <Select
                mode="multiple"
                showSearch
                placeholder="Select users"
                className="w-full"
                options={userOptions}
                optionFilterProp="label"
                loading={isUsersLoading}
                maxTagCount="responsive"
                data-cy="time-attendance-settings-allowed-area-config-users-select"
              />
            </Form.Item>
          )}
        </Form>
      </Spin>
    </Modal>
  );
};

export default AllowedAreaConfigModal;
