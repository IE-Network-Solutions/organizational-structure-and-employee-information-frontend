'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Checkbox, Form, Modal, Select, Spin } from 'antd';
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
import { useGetAllUsersData } from '@/store/server/features/employees/employeeManagment/queries';
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

interface EmployeeJobInformation {
  isPositionActive?: boolean;
  departmentId?: string | null;
  department?: { id?: string };
}

interface DepartmentUser {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  employeeJobInformation?: EmployeeJobInformation[];
}

const getActiveJob = (user: DepartmentUser) => {
  const jobs = user.employeeJobInformation;
  if (!Array.isArray(jobs) || jobs.length === 0) return undefined;
  return jobs.find((job) => job.isPositionActive) ?? jobs[0];
};

const isUserWithoutDepartment = (user: DepartmentUser) => {
  const activeJob = getActiveJob(user);
  if (!activeJob) return false;

  const departmentId = activeJob.departmentId ?? activeJob.department?.id;
  return departmentId == null || departmentId === '';
};

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
  const includeUsersWithoutDepartment =
    Form.useWatch('includeUsersWithoutDepartment', form) ?? false;
  const skipAutoSelectUsersRef = useRef(false);
  const lockedDepartmentIdRef = useRef<string | null>(null);

  const { data: departmentsData } = useGetDepartments();
  const { data: departmentUsersData, isFetching: isUsersLoading } =
    useGetDepartmentUsersAllLevels(departmentId ?? null);
  const { data: allUsersData, isFetching: isAllUsersLoading } =
    useGetAllUsersData();
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

  const departmentUsers = useMemo(() => {
    const users =
      departmentUsersData?.items ??
      departmentUsersData?.data?.items ??
      departmentUsersData?.data ??
      departmentUsersData ??
      [];
    if (!Array.isArray(users)) return [];
    return users as DepartmentUser[];
  }, [departmentUsersData]);

  const allUsersList = useMemo(() => {
    const users = allUsersData?.items ?? allUsersData ?? [];
    if (!Array.isArray(users)) return [];
    return users as DepartmentUser[];
  }, [allUsersData]);

  const usersWithoutDepartment = useMemo(
    () => allUsersList.filter(isUserWithoutDepartment),
    [allUsersList],
  );

  const usersWithoutDepartmentIdSet = useMemo(
    () => new Set(usersWithoutDepartment.map((user) => String(user.id))),
    [usersWithoutDepartment],
  );

  const savedEditUserIds = useMemo(() => {
    if (!isEditMode || !configData?.item) return [];
    return getAllowedAreaConfigUserIds(
      configData.item as AllowedAreaConfiguration,
    ).map(String);
  }, [isEditMode, configData]);

  const selectableUsers = useMemo(() => {
    const departmentUserIds = new Set(
      departmentUsers.map((user) => String(user.id)),
    );

    let users = [...departmentUsers];

    if (includeUsersWithoutDepartment) {
      const extraUsers = usersWithoutDepartment.filter(
        (user) => !departmentUserIds.has(String(user.id)),
      );
      users = [...users, ...extraUsers];
    }

    if (savedEditUserIds.length > 0) {
      const existingIds = new Set(users.map((user) => String(user.id)));
      const missingSavedUsers = allUsersList.filter(
        (user) =>
          savedEditUserIds.includes(String(user.id)) &&
          !existingIds.has(String(user.id)),
      );
      users = [...users, ...missingSavedUsers];
    }

    return users;
  }, [
    departmentUsers,
    usersWithoutDepartment,
    includeUsersWithoutDepartment,
    savedEditUserIds,
    allUsersList,
  ]);

  const userOptions = useMemo(
    () =>
      selectableUsers.map((user) => ({
        value: String(user.id),
        label: getEmployeeName(user),
      })),
    [selectableUsers],
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
    const savedUserIds = getAllowedAreaConfigUserIds(item).map(String);

    lockedDepartmentIdRef.current = itemDepartmentId;
    skipAutoSelectUsersRef.current = true;

    const hasUsersWithoutDepartment =
      allUsersList.length > 0 &&
      savedUserIds.some((id) => usersWithoutDepartmentIdSet.has(id));

    form.setFieldsValue({
      configType: getAllowedAreaConfigType(item),
      departmentId: itemDepartmentId ?? undefined,
      userIds: savedUserIds,
      includeUsersWithoutDepartment: hasUsersWithoutDepartment,
    });
  }, [
    configData,
    allowedAreaConfigId,
    form,
    allUsersList.length,
    usersWithoutDepartmentIdSet,
  ]);

  useEffect(() => {
    if (isEditMode) return;
    if (!isUserBased || !departmentId || isUsersLoading) return;
    if (skipAutoSelectUsersRef.current) {
      skipAutoSelectUsersRef.current = false;
      return;
    }

    form.setFieldsValue({
      userIds: departmentUsers.map((user) => String(user.id)),
    });
  }, [
    isEditMode,
    isUserBased,
    departmentId,
    isUsersLoading,
    departmentUsers,
    form,
  ]);

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
          includeUsersWithoutDepartment: false,
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
      includeUsersWithoutDepartment: false,
    });
    skipAutoSelectUsersRef.current = false;
  };

  const handleDepartmentChange = (value: string | undefined) => {
    if (isEditMode) return;

    form.setFieldsValue({
      departmentId: value,
      userIds: [],
      includeUsersWithoutDepartment: false,
    });
    skipAutoSelectUsersRef.current = false;
  };

  const handleIncludeUsersWithoutDepartmentChange = (checked: boolean) => {
    if (checked) return;

    const currentUserIds: string[] = form.getFieldValue('userIds') ?? [];
    form.setFieldsValue({
      includeUsersWithoutDepartment: false,
      userIds: currentUserIds.filter(
        (id) => !usersWithoutDepartmentIdSet.has(String(id)),
      ),
    });
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
            <>
              <Form.Item
                name="includeUsersWithoutDepartment"
                valuePropName="checked"
                className="mb-3"
                data-cy="time-attendance-settings-allowed-area-config-include-users-without-department-field"
              >
                <Checkbox
                  onChange={(event) =>
                    handleIncludeUsersWithoutDepartmentChange(event.target.checked)
                  }
                  data-cy="time-attendance-settings-allowed-area-config-include-users-without-department-checkbox"
                >
                  Include users without department
                </Checkbox>
              </Form.Item>

              {includeUsersWithoutDepartment && !isEditMode && (
                <p
                  className="-mt-1 mb-3 text-sm text-gray-500"
                  data-cy="time-attendance-settings-allowed-area-config-include-users-without-department-hint"
                >
                  Users without a department are added to the list but are not
                  selected automatically. Please select them manually.
                </p>
              )}

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
                  loading={
                    isUsersLoading ||
                    (includeUsersWithoutDepartment && isAllUsersLoading)
                  }
                  maxTagCount="responsive"
                  data-cy="time-attendance-settings-allowed-area-config-users-select"
                />
              </Form.Item>
            </>
          )}
        </Form>
      </Spin>
    </Modal>
  );
};

export default AllowedAreaConfigModal;
