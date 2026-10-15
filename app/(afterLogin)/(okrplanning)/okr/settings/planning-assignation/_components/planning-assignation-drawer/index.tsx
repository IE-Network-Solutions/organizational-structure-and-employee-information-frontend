'use client';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { Form, Select, Avatar, Modal, Tooltip, Button, Segmented } from 'antd';
import {
  UserOutlined,
  QuestionCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { useQueries } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  getDepartmentUsersAllLevels,
  useGetDepartments,
} from '@/store/server/features/employees/employeeManagment/department/queries';
import { extractUserIdsFromPayload } from '../../../../_components/dashboard/okrFilterUsers';
import { useGetAllPlanningPeriods } from '@/store/server/features/employees/planning/planningPeriod/queries';
import {
  useAssignPlanningPeriodToUsers,
  useUpdateAssignPlanningPeriodToUsers,
} from '@/store/server/features/employees/planning/planningPeriod/mutation';
import { useOKRSettingStore } from '@/store/uistate/features/okrplanning/okrSetting';
import { PlanningPeriodItem } from '@/store/uistate/features/okrplanning/okrSetting/interface';

type AssignMode = 'employees' | 'departments' | 'all';

const isActiveEmployee = (employee: any) =>
  employee &&
  (employee.deletedAt === null || employee.deletedAt === undefined) &&
  employee.employee_status !== 'inactive' &&
  employee.employee_status !== 'terminated';

interface PlanningAssignationModalProps {
  open: boolean;
  onClose: () => void;
}

const PlanningAssignationModal: React.FC<PlanningAssignationModalProps> = ({
  open,
  onClose,
}) => {
  const { data: allUsers } = useGetAllUsers();
  const { data: allPlanningperiod } = useGetAllPlanningPeriods();
  const { mutate: planAssign, isLoading } = useAssignPlanningPeriodToUsers();
  const { mutate: editAssign, isLoading: editLoading } =
    useUpdateAssignPlanningPeriodToUsers();

  const { selectedPlanningUser } = useOKRSettingStore();

  const { Option } = Select;
  const [form] = Form.useForm();
  const [assigneeSearchValue, setAssigneeSearchValue] = useState('');
  const [planSearchValue, setPlanSearchValue] = useState('');
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false);
  const [assignMode, setAssignMode] = useState<AssignMode>('employees');
  const { data: departments } = useGetDepartments();

  const userIds = Form.useWatch('userIds', form);
  const planningPeriods = Form.useWatch('planningPeriods', form);
  const departmentIds: string[] = Form.useWatch('departmentIds', form) ?? [];

  // Bulk modes are create-only; editing always targets the one chosen user.
  const effectiveMode: AssignMode = selectedPlanningUser
    ? 'employees'
    : assignMode;

  const activeEmployeeIds = useMemo(
    () =>
      (allUsers?.items ?? [])
        .filter(isActiveEmployee)
        .map((employee: any) => employee.id as string),
    [allUsers],
  );

  // Same cache key as useGetDepartmentUsersAllLevels (includes sub-departments).
  const departmentUserQueries = useQueries(
    departmentIds.map((id) => ({
      queryKey: ['departmentUsersAllLevels', id],
      queryFn: () => getDepartmentUsersAllLevels(id),
      staleTime: 5 * 60_000,
      enabled: effectiveMode === 'departments',
    })),
  );
  const departmentUsersLoading = departmentUserQueries.some(
    (query) => query.isLoading,
  );

  // useQueries returns a new array each render; key the memo on data updates.
  const departmentDataKey = departmentUserQueries
    .map((query) => query.dataUpdatedAt)
    .join(',');

  /** Everyone the current selection resolves to (active employees only). */
  const resolvedUserIds = useMemo<string[]>(() => {
    if (effectiveMode === 'employees') return userIds ?? [];
    if (effectiveMode === 'all') return activeEmployeeIds;
    const active = new Set(activeEmployeeIds);
    const fromDepartments = departmentUserQueries.flatMap((query) =>
      extractUserIdsFromPayload(query.data),
    );
    return Array.from(new Set(fromDepartments)).filter(
      (id) => active.size === 0 || active.has(id),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveMode, userIds, activeEmployeeIds, departmentDataKey]);
  const okrProgressPlanningPeriodId = Form.useWatch(
    'okrProgressPlanningPeriodId',
    form,
  );

  /** Selected plans, longest interval first (Quarterly > ... > Daily). */
  const selectedPeriodsByLength = useMemo(
    () =>
      (planningPeriods ?? [])
        .map((id: string) =>
          allPlanningperiod?.items?.find((period) => period.id === id),
        )
        .filter(Boolean)
        .sort(
          (a: any, b: any) =>
            Number(b.intervalLength) - Number(a.intervalLength),
        ),
    [planningPeriods, allPlanningperiod],
  );

  const isLegacyProgressAssignment =
    !!selectedPlanningUser &&
    !selectedPlanningUser.planningPeriod.some(
      (item: PlanningPeriodItem) => item.drivesOkrProgress,
    );

  // Keep the progress plan within the selection; default to the longest.
  useEffect(() => {
    if (!selectedPeriodsByLength.length) {
      if (okrProgressPlanningPeriodId) {
        form.setFieldsValue({ okrProgressPlanningPeriodId: undefined });
      }
      return;
    }
    if (
      !selectedPeriodsByLength.some(
        (period: any) => period.id === okrProgressPlanningPeriodId,
      )
    ) {
      form.setFieldsValue({
        okrProgressPlanningPeriodId: selectedPeriodsByLength[0].id,
      });
    }
  }, [selectedPeriodsByLength, okrProgressPlanningPeriodId, form]);

  const handleModalClose = () => {
    form.resetFields();
    setAssigneeSearchValue('');
    setPlanSearchValue('');
    setAssigneeDropdownOpen(false);
    setPlanDropdownOpen(false);
    setAssignMode('employees');
    onClose();
  };

  useEffect(() => {
    if (selectedPlanningUser) {
      form.setFieldsValue({
        userIds: [selectedPlanningUser.userId],
        planningPeriods: selectedPlanningUser.planningPeriod.map(
          (item: PlanningPeriodItem) => item.planningPeriodId,
        ),
        okrProgressPlanningPeriodId: selectedPlanningUser.planningPeriod.find(
          (item: PlanningPeriodItem) => item.drivesOkrProgress,
        )?.planningPeriodId,
      });
    } else {
      form.resetFields();
    }
  }, [selectedPlanningUser, form, open]);

  const onFinish = (values: any) => {
    // departmentIds only drives who is covered; the API takes userIds.
    const rest = { ...values };
    delete rest.departmentIds;
    if (!selectedPlanningUser && resolvedUserIds.length === 0) {
      NotificationMessage.error({
        message: 'No employees selected',
        description:
          effectiveMode === 'departments'
            ? 'The selected departments have no active employees.'
            : 'Please select at least one employee.',
      });
      return;
    }
    if (selectedPlanningUser) {
      editAssign(rest, {
        onSuccess: () => {
          handleModalClose();
        },
      });
    } else {
      planAssign(
        { ...rest, userIds: resolvedUserIds },
        {
          onSuccess: () => {
            handleModalClose();
          },
        },
      );
    }
  };

  const footer = (
    <div
      className="flex justify-end gap-3"
      data-cy="okr-planning-assignation-modal-footer"
    >
      <Button
        type="default"
        onClick={handleModalClose}
        className="h-10 px-6 rounded-lg border-[#d9d9d9] text-[#595959] hover:text-[#262626] font-medium"
        id="okr-planning-assignation-modal-cancel-button"
        data-cy="okr-planning-assignation-modal-cancel-button"
      >
        Cancel
      </Button>
      <Button
        type="primary"
        onClick={() => form.submit()}
        loading={isLoading || editLoading}
        className="h-10 px-8 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] border-none font-medium flex items-center justify-center"
        id="okr-planning-assignation-modal-submit-button"
        data-cy="okr-planning-assignation-modal-submit-button"
      >
        {selectedPlanningUser ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={handleModalClose}
      title={
        <span
          className="text-[20px] font-bold text-[#262626]"
          data-cy="okr-planning-assignation-modal-title"
        >
          {selectedPlanningUser ? 'Edit Assignment' : 'Assign Users'}
        </span>
      }
      footer={footer}
      width={640}
      centered
      closeIcon={
        <CloseOutlined
          className="text-[#8c8c8c]"
          data-cy="okr-planning-assignation-modal-close-icon"
        />
      }
      data-cy="okr-planning-assignation-modal"
      className="okr-settings-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className=""
        id="okr-planning-assignation-modal-form"
        data-cy="okr-planning-assignation-modal-form"
      >
        {/* Assignee Selection - Hidden field for real value */}
        <Form.Item
          name="userIds"
          noStyle
          data-cy="okr-planning-assignation-hidden-userids-field"
        />

        {!selectedPlanningUser && (
          <Segmented
            block
            value={assignMode}
            onChange={(value) => setAssignMode(value as AssignMode)}
            options={[
              { label: 'Employees', value: 'employees' },
              { label: 'Departments', value: 'departments' },
              { label: 'All employees', value: 'all' },
            ]}
            className="mb-5"
            data-cy="okr-planning-assignation-assign-mode"
          />
        )}

        {effectiveMode === 'employees' ? (
          <>
            <Form.Item
              label={
                <div
                  className="flex items-center gap-1"
                  data-cy="okr-planning-assignation-assignee-label"
                >
                  <span
                    className="text-[14px] font-medium text-[#262626]"
                    data-cy="okr-planning-assignation-assignee-label-text"
                  >
                    Assignee
                  </span>
                  <Tooltip title="Choose the employees you want to assign OKR plans to.">
                    <QuestionCircleOutlined
                      className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                      data-cy="okr-planning-assignation-assignee-tooltip"
                    />
                  </Tooltip>
                </div>
              }
              required
              rules={[
                {
                  required: true,
                  message: 'Please select at least one assignee',
                },
              ]}
              data-cy="okr-planning-assignation-assignee-field"
              id="okr-planning-assignation-assignee-field"
              className="mb-2"
            >
              <div
                className="okr-planning-assignation-select-wrapper relative"
                data-cy="okr-planning-assignation-assignee-select-wrapper"
              >
                <Select
                  mode="multiple"
                  showSearch
                  autoClearSearchValue={false}
                  placeholder=""
                  className="w-full h-11 okr-planning-assignation-assignee-select"
                  maxTagCount={0}
                  maxTagPlaceholder={() => null}
                  tagRender={() => (
                    <span
                      className="hidden"
                      data-cy="okr-planning-assignation-assignee-hidden-tag"
                    />
                  )}
                  searchValue={assigneeSearchValue}
                  onSearch={setAssigneeSearchValue}
                  onDropdownVisibleChange={setAssigneeDropdownOpen}
                  value={userIds}
                  onSelect={(id: string) => {
                    const currentIds = form.getFieldValue('userIds') || [];
                    if (!currentIds.includes(id)) {
                      form.setFieldsValue({ userIds: [...currentIds, id] });
                    }
                    setAssigneeSearchValue('');
                  }}
                  onDeselect={(id: string) => {
                    const currentIds = form.getFieldValue('userIds') || [];
                    form.setFieldsValue({
                      userIds: currentIds.filter((uid: string) => uid !== id),
                    });
                  }}
                  filterOption={(input, option: any) => {
                    const search = input.toLowerCase();
                    const user = allUsers?.items?.find(
                      (u: any) => u.id === option?.value,
                    );
                    if (!user) return false;
                    const fullName =
                      `${user.firstName} ${user.lastName}`.toLowerCase();
                    const email = (user.email ?? '').toLowerCase();
                    return fullName.includes(search) || email.includes(search);
                  }}
                  optionLabelProp="label"
                  id="okr-planning-assignation-assignee-select"
                  data-cy="okr-planning-assignation-assignee-select"
                  dropdownClassName="custom-assignee-dropdown"
                  popupClassName="custom-assignee-dropdown"
                >
                  {allUsers?.items.map((user: any) => (
                    <Option
                      key={user.id}
                      value={user.id}
                      label={`${user.firstName} ${user.lastName}`}
                      data-cy={`okr-planning-assignation-assignee-option-${user.id}`}
                    >
                      <div
                        className="flex items-center gap-3 py-1"
                        data-cy={`okr-planning-assignation-assignee-option-content-${user.id}`}
                      >
                        <Avatar
                          size={28}
                          src={user.profileImage}
                          icon={!user.profileImage && <UserOutlined />}
                          data-cy={`okr-planning-assignation-assignee-option-avatar-${user.id}`}
                        />
                        <div
                          className="flex flex-col"
                          data-cy={`okr-planning-assignation-assignee-option-info-${user.id}`}
                          id={`okr-planning-assignation-assignee-option-info-${user.id}`}
                        >
                          <span
                            className="text-[14px] font-medium text-[#262626]"
                            data-cy={`okr-planning-assignation-assignee-option-name-${user.id}`}
                          >
                            {user.firstName} {user.lastName}
                          </span>
                          <span
                            className="text-[12px] text-[#8c8c8c]"
                            data-cy={`okr-planning-assignation-assignee-option-email-${user.id}`}
                          >
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
                {!assigneeSearchValue && !assigneeDropdownOpen ? (
                  <span
                    className="absolute left-3 text-[#8c8c8c] font-normal pointer-events-none z-[1]"
                    style={{ lineHeight: '44px' }}
                    data-cy="okr-planning-assignation-assignee-placeholder"
                  >
                    Select Employee
                  </span>
                ) : null}
                <style
                  jsx
                  global
                  data-cy="okr-planning-assignation-drawer-styles"
                >{`
                  .okr-planning-assignation-select-wrapper
                    .ant-select-selector {
                    display: flex !important;
                    align-items: center !important;
                    height: 44px !important;
                    padding-top: 0 !important;
                    padding-bottom: 0 !important;
                  }
                  .okr-planning-assignation-assignee-select
                    .ant-select-selection-overflow-item:not(
                      .ant-select-selection-overflow-item-suffix
                    ) {
                    display: none !important;
                  }
                  .okr-planning-assignation-assignee-select
                    .ant-select-selection-search {
                    inset-inline-start: 12px !important;
                    inset-inline-end: 28px !important;
                    position: relative !important;
                    z-index: 2 !important;
                  }
                  .okr-planning-assignation-assignee-select
                    .ant-select-selection-search-input {
                    height: 42px !important;
                    opacity: 1 !important;
                  }
                  .okr-planning-assignation-assignee-select.ant-select-open
                    .ant-select-selection-search {
                    width: 100% !important;
                    max-width: 100% !important;
                  }
                  .okr-planning-assignation-plan-select
                    .ant-select-selection-overflow-item:not(
                      .ant-select-selection-overflow-item-suffix
                    ) {
                    display: none !important;
                  }
                  .okr-planning-assignation-plan-select
                    .ant-select-selection-search {
                    inset-inline-start: 12px !important;
                    inset-inline-end: 28px !important;
                    position: relative !important;
                    z-index: 2 !important;
                  }
                  .okr-planning-assignation-plan-select
                    .ant-select-selection-search-input {
                    height: 42px !important;
                    opacity: 1 !important;
                  }
                  .okr-planning-assignation-plan-select.ant-select-open
                    .ant-select-selection-search {
                    width: 100% !important;
                    max-width: 100% !important;
                  }
                  .custom-assignee-dropdown .ant-select-item-option-selected {
                    background-color: #e6f7ff !important;
                    font-weight: 500;
                  }
                  .custom-assignee-dropdown
                    .ant-select-item-option-selected
                    .ant-select-item-option-state {
                    color: #1890ff;
                  }
                  .okr-settings-modal .ant-modal-content {
                    padding: 0 !important;
                    border-radius: 8px !important;
                  }
                  .okr-settings-modal .ant-modal-header {
                    padding: 20px 24px 16px 24px !important;
                    border-bottom: none !important;
                  }
                  .okr-settings-modal .ant-modal-body {
                    padding: 0px 24px 24px 24px !important;
                  }
                  .okr-settings-modal .ant-modal-footer {
                    padding: 8px 24px 24px 24px !important;
                    border-top: none !important;
                  }
                  .okr-settings-modal .ant-form-item-label > label {
                    height: auto !important;
                    line-height: 1.5 !important;
                    padding-bottom: 4px !important;
                  }
                `}</style>
              </div>
            </Form.Item>

            {/* Manual Tag Display */}
            <div
              className="flex flex-wrap gap-2 mb-6"
              data-cy="okr-planning-assignation-user-tags-container"
            >
              {userIds?.map((id: string) => {
                const user = allUsers?.items?.find((u: any) => u.id === id);
                if (!user) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 bg-white border border-[#d9d9d9] px-3 py-1 rounded-[6px]"
                    id={`okr-manual-user-tag-${id}`}
                    data-cy={`okr-manual-user-tag-${id}`}
                  >
                    <span
                      className="text-[14px] text-[#595959]"
                      data-cy={`okr-manual-user-tag-name-${id}`}
                    >
                      {user.firstName}
                    </span>
                    <CloseOutlined
                      className="text-[10px] text-[#8c8c8c] cursor-pointer hover:text-red-500"
                      onClick={() => {
                        const newIds = userIds.filter(
                          (uid: string) => uid !== id,
                        );
                        form.setFieldsValue({ userIds: newIds });
                      }}
                      data-cy={`okr-manual-user-tag-close-${id}`}
                    />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="mb-6" data-cy="okr-planning-assignation-bulk-section">
            {effectiveMode === 'departments' ? (
              <Form.Item
                label={
                  <span
                    className="text-[14px] font-medium text-[#262626]"
                    data-cy="okr-planning-assignation-department-label"
                  >
                    Departments
                  </span>
                }
                name="departmentIds"
                extra="Includes every active employee in the selected departments and their sub-departments."
                data-cy="okr-planning-assignation-department-field"
              >
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select Departments"
                  className="w-full"
                  options={(departments ?? []).map((department: any) => ({
                    value: department.id,
                    label: department.name,
                  }))}
                  data-cy="okr-planning-assignation-department-select"
                />
              </Form.Item>
            ) : null}
            <div
              className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#595959]"
              data-cy="okr-planning-assignation-bulk-summary"
            >
              {effectiveMode === 'departments' && departmentUsersLoading
                ? 'Counting employees…'
                : effectiveMode === 'departments' && departmentIds.length === 0
                  ? 'Select one or more departments.'
                  : `${resolvedUserIds.length} active employee${
                      resolvedUserIds.length === 1 ? '' : 's'
                    } will be assigned. Plans they already have are kept.`}
            </div>
          </div>
        )}

        {/* Plan Selection */}
        <Form.Item
          label={
            <div
              className="flex items-center gap-1"
              data-cy="okr-planning-assignation-plan-label"
            >
              <span
                className="text-[14px] font-medium text-[#262626]"
                data-cy="okr-planning-assignation-plan-label-text"
              >
                Plan
              </span>
              <Tooltip title="Choose the OKR planning periods for these employees.">
                <QuestionCircleOutlined
                  className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                  data-cy="okr-planning-assignation-plan-tooltip"
                />
              </Tooltip>
            </div>
          }
          name="planningPeriods"
          required
          rules={[
            { required: true, message: 'Please select at least one plan' },
          ]}
          id="okr-planning-assignation-plan-field"
          data-cy="okr-planning-assignation-plan-field"
        >
          <div
            className="okr-planning-assignation-select-wrapper relative"
            data-cy="okr-planning-assignation-plan-select-wrapper"
          >
            <Select
              mode="multiple"
              showSearch
              autoClearSearchValue={false}
              placeholder=""
              className="w-full h-11 okr-planning-assignation-plan-select"
              maxTagCount={0}
              maxTagPlaceholder={() => null}
              tagRender={() => (
                <span
                  className="hidden"
                  data-cy="okr-planning-assignation-plan-hidden-tag"
                />
              )}
              searchValue={planSearchValue}
              onSearch={setPlanSearchValue}
              onDropdownVisibleChange={setPlanDropdownOpen}
              id="okr-planning-assignation-plan-select"
              data-cy="okr-planning-assignation-plan-select"
              dropdownClassName="custom-assignee-dropdown"
              popupClassName="custom-assignee-dropdown"
              value={planningPeriods}
              onSelect={(id: string) => {
                const current = form.getFieldValue('planningPeriods') || [];
                if (!current.includes(id)) {
                  form.setFieldsValue({ planningPeriods: [...current, id] });
                }
                setPlanSearchValue('');
              }}
              onDeselect={(id: string) => {
                const current = form.getFieldValue('planningPeriods') || [];
                form.setFieldsValue({
                  planningPeriods: current.filter((pid: string) => pid !== id),
                });
              }}
              filterOption={(input, option: any) =>
                (option?.children ?? '')
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {allPlanningperiod?.items
                ?.filter((p) => p.isActive)
                .map((period) => (
                  <Option
                    key={period.id}
                    value={period.id}
                    data-cy={`okr-planning-assignation-plan-option-${period.id}`}
                  >
                    {period.name}
                  </Option>
                ))}
            </Select>
            {!planSearchValue && !planDropdownOpen ? (
              <span
                className="absolute left-3 text-[#8c8c8c] font-normal pointer-events-none z-[1]"
                style={{ lineHeight: '44px' }}
                data-cy="okr-planning-assignation-plan-placeholder"
              >
                Select Plan
              </span>
            ) : null}
          </div>
        </Form.Item>

        {/* Manual Plan Tag Display */}
        <div
          className="flex flex-wrap gap-2 mt-2"
          data-cy="okr-planning-assignation-plan-tags-container"
        >
          {planningPeriods?.map((id: string) => {
            const period = allPlanningperiod?.items?.find((p) => p.id === id);
            if (!period) return null;
            return (
              <div
                key={id}
                className="flex items-center gap-2 bg-white border border-[#d9d9d9] px-3 py-1 rounded-[6px]"
                id={`okr-manual-plan-tag-${id}`}
                data-cy={`okr-manual-plan-tag-${id}`}
              >
                <span
                  className="text-[14px] text-[#595959]"
                  data-cy={`okr-manual-plan-tag-name-${id}`}
                >
                  {period.name}
                </span>
                <CloseOutlined
                  className="text-[10px] text-[#8c8c8c] cursor-pointer hover:text-red-500"
                  onClick={() => {
                    const newPeriods = planningPeriods.filter(
                      (pid: string) => pid !== id,
                    );
                    form.setFieldsValue({ planningPeriods: newPeriods });
                  }}
                  data-cy={`okr-manual-plan-tag-close-${id}`}
                />
              </div>
            );
          })}
        </div>

        {/* OKR progress plan: only its reports move KR / Average OKR */}
        <Form.Item
          label={
            <div
              className="flex items-center gap-1"
              data-cy="okr-planning-assignation-progress-plan-label"
            >
              <span
                className="text-[14px] font-medium text-[#262626]"
                data-cy="okr-planning-assignation-progress-plan-label-text"
              >
                Progress OKR on
              </span>
              <Tooltip title="Only reports on this plan update Key Result progress and the Average OKR score. Reports on the other assigned plans are informational.">
                <QuestionCircleOutlined
                  className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                  data-cy="okr-planning-assignation-progress-plan-tooltip"
                />
              </Tooltip>
            </div>
          }
          name="okrProgressPlanningPeriodId"
          required
          rules={[
            {
              required: true,
              message: 'Please select the plan that progresses the OKR',
            },
          ]}
          extra={
            isLegacyProgressAssignment
              ? 'This employee currently progresses OKR on every plan. Saving applies the selected plan only.'
              : undefined
          }
          className="mt-6"
          id="okr-planning-assignation-progress-plan-field"
          data-cy="okr-planning-assignation-progress-plan-field"
        >
          <Select
            placeholder="Select Plan"
            className="w-full h-11"
            disabled={!selectedPeriodsByLength.length}
            options={selectedPeriodsByLength.map((period: any) => ({
              value: period.id,
              label: period.name,
            }))}
            id="okr-planning-assignation-progress-plan-select"
            data-cy="okr-planning-assignation-progress-plan-select"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PlanningAssignationModal;
