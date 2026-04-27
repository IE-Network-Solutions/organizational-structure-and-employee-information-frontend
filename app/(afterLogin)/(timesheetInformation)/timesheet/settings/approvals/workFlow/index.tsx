import Image from 'next/image';
import { GENDER_NEUTRAL_AVATAR_URL } from '@/constants/publicImageUrls';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useCreateApproverMutation } from '@/store/server/features/approver/mutation';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Steps,
  Tag,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

const STEP_LABELS = ['Choose Approval Type', 'Setup Approval', 'Finalize'];

type TimesheetApprovalTypeValue = 'Leave' | 'WorkFromHome';

const TIMESHEET_APPROVAL_TYPE_OPTIONS: {
  label: string;
  value: TimesheetApprovalTypeValue;
}[] = [
  { label: 'Leave', value: 'Leave' },
  { label: 'Work From Home', value: 'WorkFromHome' },
];

const ApprovalWorkflowSteps = React.memo(({ current }: { current: number }) => {
  const stepItems = useMemo(
    () =>
      STEP_LABELS.map((label, index) => ({
        title: (
          <span
            className="sm:text-nowrap"
            data-cy={`approval-workflow-step-label-${index}`}
          >
            {label}
          </span>
        ),
      })),
    [],
  );
  return (
    <>
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
        progressDot
        current={current}
        className="user-sidebar-steps px-4 mx-auto max-w-5xl hidden sm:flex"
        data-cy="approval-workflow-steps"
        items={stepItems}
      />
    </>
  );
});

ApprovalWorkflowSteps.displayName = 'ApprovalWorkflowSteps';

interface ApprovalWorkFlowModalProps {
  openApprovalModal: boolean;
  onCancelApprovalModal: () => void;
}

interface Department {
  id: string;
  name: string;
}

interface User {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  profileImage?: string;
}

const ApprovalWorkFlowModal = ({
  openApprovalModal,
  onCancelApprovalModal,
}: ApprovalWorkFlowModalProps) => {
  const {
    mutate: createApprover,
    isLoading: isCreateLoading,
  } = useCreateApproverMutation();
  const [form] = Form.useForm();
  const {
    setApproverType,
    approverType,
    workflowApplies,
    setWorkflowApplies,
    selections,
    setSelections,
    level,
    setLevel,
    setWorkflowUserId,
    workflowUserId,
  } = useApprovalStore();
  const { data: usersData } = useGetAllUsers();
  const { data: departmentsData } = useGetDepartments();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!openApprovalModal) return;
    setCurrent(0);
  }, [openApprovalModal]);

  const users = useMemo(() => usersData?.items || [], [usersData?.items]);
  const departments = useMemo(
    () => (departmentsData as Department[] | undefined) || [],
    [departmentsData],
  );

  const getUserFullName = (id: string) => {
    const user = users.find((item: User) => item.id === id);
    if (!user) return '-';
    return `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim();
  };

  const getAppliedToLabel = () => {
    const selectedId = form.getFieldValue('workflowAppliesId');
    if (!selectedId) return '-';

    if (workflowApplies === 'Department') {
      return departments.find((dept) => dept.id === selectedId)?.name || '-';
    }

    if (workflowApplies === 'User') {
      return getUserFullName(selectedId);
    }

    return selectedId;
  };

  const handleCancel = () => {
    onCancelApprovalModal();
    setCurrent(0);
    form.resetFields();
    setApproverType(null);
    setWorkflowApplies(null);
    setWorkflowUserId(null);
    setLevel(1);
    setSelections({ SectionItemType: Array(1).fill({ user: null }) });
  };

  const handleTypeSelection = (value: string) => {
    setApproverType(value);
  };

  const handleWorkflowAppliesChange = (value: string) => {
    setWorkflowApplies(value);
    setWorkflowUserId(null);
    form.setFieldsValue({ workflowAppliesId: undefined });
  };

  const handleWorkflowAppliesIdChange = (value: string) => {
    setWorkflowUserId(value);
  };

  const handleLevelChange = (value: number) => {
    setLevel(value);
    form.setFieldValue('level', value);
    const updatedSelections = Array.from({ length: value }, (item, index) => {
      void item;
      return selections.SectionItemType[index] || { user: null };
    });
    setSelections({ SectionItemType: updatedSelections });
  };

  const assigneeOptions = useMemo(() => {
    return (
      usersData?.items
        ?.filter(
          (user: User) =>
            workflowApplies !== 'User' || user.id !== workflowUserId,
        )
        ?.map((list: User) => ({
          value: list.id,
          label:
            `${list.firstName ?? ''} ${list.middleName ?? ''} ${list.lastName ?? ''}`.trim() ||
            list.id,
        })) ?? []
    );
  }, [usersData?.items, workflowApplies, workflowUserId]);

  const handleAssigneeSelect = (userId: string | undefined) => {
    if (userId == null) return;
    const list = selections.SectionItemType as {
      user: string | string[] | null;
    }[];
    const firstEmptyIndex = list.findIndex((item) => {
      const u = item?.user;
      if (u == null) return true;
      if (Array.isArray(u)) return u.length === 0;
      return false;
    });
    if (firstEmptyIndex === -1) return;
    const updatedSelections = [...list];
    updatedSelections[firstEmptyIndex] = {
      ...updatedSelections[firstEmptyIndex],
      user: userId,
    };
    setSelections({ SectionItemType: updatedSelections });
    form.setFieldValue(`assignedUser_${firstEmptyIndex}`, userId);
  };

  const handleAssigneeRemove = (index: number) => {
    const updatedSelections = [...selections.SectionItemType];
    updatedSelections[index] = { ...updatedSelections[index], user: null };
    setSelections({ SectionItemType: updatedSelections });
    form.setFieldValue(`assignedUser_${index}`, undefined);
  };

  const assignedUserIds = useMemo(
    () =>
      selections.SectionItemType.map((item) => {
        const u = item?.user;
        if (u == null) return null;
        return Array.isArray(u) ? (u[0] ?? null) : u;
      }),
    [selections.SectionItemType],
  );

  const goToSetupStep = () => {
    if (!approverType) {
      NotificationMessage.warning({ message: 'Please choose approval type' });
      return;
    }
    setCurrent(1);
  };

  const goToFinalizeStep = async () => {
    try {
      await form.validateFields();
      setCurrent(2);
    } catch {
      // form validation will show inline errors
    }
  };

  const handleCreate = async () => {
    try {
      await form.validateFields();

      const workflowAppliesId = form.getFieldValue('workflowAppliesId');
      const workflowName = form.getFieldValue('workflowName');
      const carryOverPeriod = form.getFieldValue('carryOverPeriod');
      const selectedApprovalTypes: TimesheetApprovalTypeValue[] =
        form.getFieldValue('timesheetApprovalTypes') || [];
      const isMultiApprovalTypeSelected = selectedApprovalTypes.length > 1;
      const approvalType = isMultiApprovalTypeSelected
        ? null
        : (selectedApprovalTypes[0] ?? null);
      const approvalTypes = isMultiApprovalTypeSelected
        ? selectedApprovalTypes
        : null;

      const steps = selections.SectionItemType.flatMap((selection, idx) => {
        const usersForStep = Array.isArray(selection.user)
          ? selection.user
          : [selection.user];

        return usersForStep.filter(Boolean).map((userId: string) => ({
          stepOrder: idx + 1,
          userId,
        }));
      });

      createApprover(
        {
          values: {
            name: workflowName,
            description: carryOverPeriod,
            entityType: workflowApplies,
            entityId: workflowAppliesId,
            approvalType,
            approvalTypes,
            approvalWorkflowType: approverType,
            steps,
          },
        },
        {
          onSuccess: () => {
            NotificationMessage.success({
              message: 'Success',
              description: 'Approver created successfully',
            });
            handleCancel();
          },
          onError: (error: any) => {
            NotificationMessage.error({
              message: 'Error',
              description:
                error?.response?.data?.message ?? 'Something went wrong',
            });
          },
        },
      );
    } catch {
      // form validation will show inline errors
    }
  };

  const workflowTargetOptions = (() => {
    if (workflowApplies === 'Department') {
      return departments.map((item) => ({ value: item.id, label: item.name }));
    }
    if (workflowApplies === 'User') {
      return users.map((item: User) => ({
        value: item.id,
        label:
          `${item.firstName || ''} ${item.middleName || ''} ${item.lastName || ''}`.trim(),
      }));
    }
    if (workflowApplies === 'Hierarchy') {
      return [
        { value: 'CEO', label: 'CEO' },
        { value: 'CXO', label: 'CXO' },
        { value: 'Manager', label: 'Manager' },
      ];
    }
    return [];
  })();

  return (
    <Modal
      open={openApprovalModal}
      onCancel={handleCancel}
      width={760}
      className="approval-workflow-modal"
      data-cy="approval-work-flow-modal"
      title={
        <span
          className="text-lg font-semibold text-[#4d4d4d]"
          data-cy="approval-work-flow-title"
        >
          Approval Workflow
        </span>
      }
      footer={
        <div
          className="flex justify-end gap-3"
          data-cy="approval-workflow-footer"
        >
          <Button
            onClick={() => {
              if (current === 0) {
                handleCancel();
              } else {
                setCurrent((prev) => prev - 1);
              }
            }}
            className="h-8 border border-[#D9D9D9] text-[#4d4d4d] font-normal"
            data-cy="approval-workflow-back-btn"
          >
            {current === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            type="primary"
            loading={isCreateLoading}
            className="h-8 font-normal"
            onClick={() => {
              if (current === 0) goToSetupStep();
              if (current === 1) goToFinalizeStep();
              if (current === 2) handleCreate();
            }}
            data-cy="approval-workflow-next-btn"
          >
            {current === 2 ? 'Create' : 'Continue'}
          </Button>
        </div>
      }
      destroyOnClose
      styles={{ body: { paddingTop: 8, paddingLeft: 0, paddingRight: 0 } }}
      zIndex={10002}
    >
      <div className="mb-8" data-cy="approval-work-flow-steps-container">
        <ApprovalWorkflowSteps current={current} />
      </div>

      {current === 0 && (
        <div
          className="flex flex-col gap-4"
          data-cy="approval-workflow-options"
        >
          <Radio.Group
            value={approverType || undefined}
            onChange={(e) => handleTypeSelection(e.target.value)}
            className="w-full flex flex-col gap-4"
            data-cy="approval-workflow-type-group"
          >
            <label
              className={`flex flex-col gap-1 p-2 rounded-lg border-[1px] bg-white shadow-md cursor-pointer transition-colors ${
                approverType === 'Sequential'
                  ? 'border-primary'
                  : 'border-[#D9D9D9] hover:border-[#D9D9D9]'
              }`}
              data-cy="approval-workflow-sequential"
            >
              <div
                className="flex items-start gap-3"
                data-cy="approval-workflow-sequential-row"
              >
                <Radio
                  value="Sequential"
                  data-cy="approval-workflow-sequential-radio"
                />
                <div
                  className="flex flex-col gap-1"
                  data-cy="approval-workflow-sequential-content"
                >
                  <span
                    className="text-base font-medium text-gray-900"
                    data-cy="approval-workflow-sequential-title"
                  >
                    Sequential Approval
                  </span>
                  <span
                    className="text-sm text-gray-500 font-normal"
                    data-cy="approval-workflow-sequential-description"
                  >
                    Approval happen in a strict order, with each approver
                    signing off one after another
                  </span>
                </div>
              </div>
            </label>
            <label
              className={`flex flex-col gap-1 p-2 rounded-lg border border-[#D9D9D9] bg-white shadow-md cursor-pointer transition-colors ${
                approverType === 'Parallel'
                  ? 'border-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              data-cy="approval-workflow-parallel"
            >
              <div
                className="flex items-start gap-3"
                data-cy="approval-workflow-parallel-row"
              >
                <Radio
                  value="Parallel"
                  data-cy="approval-workflow-parallel-radio"
                />
                <div
                  className="flex flex-col gap-1"
                  data-cy="approval-workflow-parallel-content"
                >
                  <span
                    className="text-base font-medium text-gray-900"
                    data-cy="approval-workflow-parallel-title"
                  >
                    Parallel Approval
                  </span>
                  <span
                    className="text-sm text-gray-500 font-normal"
                    data-cy="approval-workflow-parallel-description"
                  >
                    multi approvers can approve at the same time without any
                    specific order
                  </span>
                </div>
              </div>
            </label>
            <label
              className="flex flex-col gap-1 p-2 rounded-lg border border-[#D9D9D9] bg-white shadow-md opacity-60 cursor-not-allowed"
              data-cy="approval-workflow-conditional"
            >
              <div
                className="flex items-start gap-3"
                data-cy="approval-workflow-conditional-row"
              >
                <Radio
                  value="Conditional"
                  disabled
                  data-cy="approval-workflow-conditional-radio"
                />
                <div
                  className="flex flex-col gap-1"
                  data-cy="approval-workflow-conditional-content"
                >
                  <span
                    className="text-base font-medium text-gray-900"
                    data-cy="approval-workflow-conditional-title"
                  >
                    Conditional Approval
                  </span>
                  <span
                    className="text-sm text-gray-500 font-normal"
                    data-cy="approval-workflow-conditional-description"
                  >
                    Approver level depend on certain condition or criteria,
                    triggering specific workflows based on the rules
                  </span>
                </div>
              </div>
            </label>
          </Radio.Group>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        className={current === 1 ? 'block px-2' : 'hidden'}
        data-cy="approval-workflow-setup-form"
      >
        <Form.Item
          name="timesheetApprovalTypes"
          label="Approval Request Type"
          initialValue={['Leave']}
          rules={[
            {
              required: true,
              message: 'Please select at least one request type',
            },
          ]}
          data-cy="approval-workflow-timesheet-approval-types-field"
        >
          <Checkbox.Group
            options={TIMESHEET_APPROVAL_TYPE_OPTIONS}
            className="flex flex-wrap items-center gap-4"
            data-cy="approval-workflow-timesheet-approval-types-checkbox-group"
          />
        </Form.Item>

        <Form.Item
          name="workflowName"
          label="Workflow Name"
          rules={[{ required: true, message: 'Please input workflow name' }]}
          data-cy="approval-workflow-field-workflow-name"
        >
          <Input
            placeholder="Input"
            className="h-10 rounded-md"
            data-cy="approval-workflow-input-workflow-name"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter a description!' }]}
        >
          <Input.TextArea
            placeholder="Enter Description"
            data-cy="approval-workflow-description-input"
            id="approval-workflow-description-input"
          />
        </Form.Item>

        <div
          id="time-attendance-settings-approvals-work-flow-setup-form-applies-section"
          data-cy="time-attendance-settings-approvals-work-flow-setup-form-applies-section"
          className="border border-gray-200 rounded-xl p-3 my-3"
        >
          <div
            className="my-1 flex flex-col sm:flex-row gap-4 items-center"
            data-cy="approval-workflow-applies-section"
          >
            <span
              className="text-sm text-[#4d4d4d]"
              data-cy="approval-workflow-applies-title"
            >
              Workflow Applies to
            </span>
            <Form.Item
              name="workflowAppliesType"
              className="mb-0 mt-1"
              rules={[
                {
                  required: true,
                  message: 'Please select workflow applies type',
                },
              ]}
              data-cy="approval-workflow-applies-type-field"
            >
              <Radio.Group
                value={workflowApplies || undefined}
                onChange={(e) => handleWorkflowAppliesChange(e.target.value)}
                data-cy="approval-workflow-applies-type-radio"
              >
                <Radio
                  value="Department"
                  data-cy="approval-workflow-applies-department"
                >
                  Department
                </Radio>
                <Radio
                  value="Hierarchy"
                  data-cy="approval-workflow-applies-hierarchy"
                  disabled
                >
                  Heirarchy
                </Radio>
                <Radio value="User" data-cy="approval-workflow-applies-user">
                  User
                </Radio>
              </Radio.Group>
            </Form.Item>
          </div>

          {workflowApplies && (
            <Form.Item
              name="workflowAppliesId"
              rules={[
                {
                  required: true,
                  message: 'Please select workflow applies to',
                },
              ]}
              data-cy="approval-workflow-applies-id-field"
            >
              <Select
                placeholder={`Select ${workflowApplies || ''}`}
                className="h-10"
                options={workflowTargetOptions}
                onChange={handleWorkflowAppliesIdChange}
                allowClear
                showSearch
                optionFilterProp="label"
                data-cy="approval-workflow-applies-id-select"
              />
            </Form.Item>
          )}
        </div>

        <div
          className="rounded-xl border border-gray-200 p-3 mb-3 flex flex-col gap-2"
          data-cy="approval-workflow-levels-section"
        >
          <Form.Item
            name="level"
            label={
              <span
                data-cy="approval-workflow-levels-label"
                className="text-sm text-[#4d4d4d]"
              >
                Levels
              </span>
            }
            required
            rules={[{ required: true, message: 'Please select levels' }]}
            initialValue={level}
            data-cy="approval-workflow-levels-field"
          >
            <Select
              className="h-10"
              value={level}
              onChange={handleLevelChange}
              options={Array.from({ length: 9 }, (item, idx) => {
                void item;
                return {
                  value: idx + 1,
                  label: `${idx + 1}`,
                };
              })}
              data-cy="approval-workflow-levels-select"
            />
            <p
              className="text-sm text-[#4d4d4d] mt-1"
              data-cy="approval-workflow-assignee-instruction"
            >
              Select one assignee for {level} level{level === 1 ? '' : 's'} of
              approval
            </p>
          </Form.Item>
          {level > 0 && (
            <div
              className="mb-3 flex flex-col gap-2"
              data-cy="approval-workflow-assignee-section"
            >
              <Form.Item
                label="Assignee"
                required
                validateTrigger="onSubmit"
                rules={[
                  {
                    validator: () => {
                      const filled = assignedUserIds.filter(Boolean).length;
                      if (filled < level) {
                        return Promise.reject(
                          `Please select ${level} assignee(s) for ${level} level(s)`,
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                data-cy="approval-workflow-assignee-field"
              >
                <Select
                  placeholder="Select"
                  showSearch
                  className="h-10 w-full"
                  optionFilterProp="label"
                  options={assigneeOptions}
                  onSelect={handleAssigneeSelect}
                  value={undefined}
                  data-cy="approval-workflow-assignee-select"
                  disabled={assignedUserIds.filter(Boolean).length >= level}
                />
              </Form.Item>
              <div
                className="flex flex-wrap gap-2"
                data-cy="approval-workflow-assignee-tags"
              >
                {assignedUserIds.map(
                  (userId, index) =>
                    userId && (
                      <Tag
                        key={`${userId}-${index}`}
                        closable
                        onClose={() => handleAssigneeRemove(index)}
                        className="inline-flex items-center gap-1 rounded-md border border-[#d9d9d9] bg-[#fafafa] px-2 py-1 text-sm"
                        data-cy={`approval-workflow-assignee-tag-${index}`}
                      >
                        {getUserFullName(userId)}
                      </Tag>
                    ),
                )}
              </div>
            </div>
          )}
        </div>
      </Form>

      {current === 2 && (
        <div className="px-2" data-cy="approval-workflow-step-finalize">
          <div
            className="rounded-xl border border-gray-200 p-4"
            data-cy="approval-workflow-final-card"
          >
            <div
              className="flex justify-between items-start gap-3"
              data-cy="approval-workflow-final-card-header"
            >
              <div data-cy="approval-workflow-final-info">
                <p
                  className="mb-2 text-sm font-semibold text-[#4d4d4d]"
                  data-cy="approval-workflow-final-name"
                >
                  {form.getFieldValue('workflowName') || '-'}
                </p>
                <span
                  className="inline-flex items-center rounded-lg border border-gray-200 bg-[#f7f7f7] px-2 py-0.5 text-sm text-[#4d4d4d]"
                  data-cy="approval-workflow-final-applies"
                >
                  Applied to: {getAppliedToLabel()}
                </span>
                <span
                  className="mt-2 inline-flex items-center rounded-lg border border-gray-200 bg-[#f7f7f7] px-2 py-0.5 text-sm text-[#4d4d4d]"
                  data-cy="approval-workflow-final-request-types"
                >
                  Request type:{' '}
                  {(
                    (form.getFieldValue('timesheetApprovalTypes') ||
                      []) as string[]
                  )
                    .map((value) =>
                      value === 'WorkFromHome' ? 'Work From Home' : value,
                    )
                    .join(' and ') || '-'}
                </span>
              </div>
              <span
                className="inline-flex items-center rounded-lg border border-gray-200 bg-[#f7f7f7] px-2 py-0.5 text-sm text-[#4d4d4d]"
                data-cy="approval-workflow-final-level"
              >
                Level: {level}
              </span>
            </div>

            <div
              className="mt-3 border-t border-gray-200 pt-3"
              data-cy="approval-workflow-final-assigned-section"
            >
              <p
                className="mb-2 text-sm text-[#4d4d4d]"
                data-cy="approval-workflow-final-assigned-title"
              >
                Assigned To:
              </p>
              <div
                className="flex flex-wrap gap-2"
                data-cy="approval-workflow-final-assigned-list"
              >
                {selections.SectionItemType.flatMap((section) => {
                  const ids = Array.isArray(section.user)
                    ? section.user
                    : [section.user];
                  return ids.filter(Boolean);
                }).map((userId: string, idx: number) => (
                  <span
                    key={`${userId}-${idx}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-[#f8f8f8] px-2 py-1"
                    data-cy={`approval-workflow-final-assigned-chip-${idx}`}
                  >
                    <span
                      className="relative h-5 w-5 overflow-hidden rounded-full"
                      data-cy={`approval-workflow-final-assigned-avatar-wrap-${idx}`}
                    >
                      <Image
                        src={GENDER_NEUTRAL_AVATAR_URL}
                        alt="avatar"
                        fill
                        className="object-cover"
                        data-cy={`approval-workflow-final-assigned-avatar-${idx}`}
                      />
                    </span>
                    <span
                      data-cy={`approval-workflow-final-assigned-name-${idx}`}
                    >
                      {getUserFullName(userId)}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ApprovalWorkFlowModal;
