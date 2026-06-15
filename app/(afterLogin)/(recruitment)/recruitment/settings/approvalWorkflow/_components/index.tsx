'use client';

import { useCreateApproverMutation } from '@/store/server/features/approver/mutation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { APPROVALTYPES } from '@/types/enumTypes';
import { flattenDepartments } from '@/utils/approval/departmentHelpers';
import { Button, Form, Input, InputNumber, Modal, Select, Tag } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

interface User {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}

export interface ApprovalWorkflowFormValues {
  workflowName: string;
  departmentId: string;
  level: number;
  assignees: string[];
}

interface ApprovalWorkflowModalProps {
  open: boolean;
  onCancel: () => void;
  onCreate?: (values: ApprovalWorkflowFormValues) => void;
}

const ApprovalWorkflowModal: React.FC<ApprovalWorkflowModalProps> = ({
  open,
  onCancel,
  onCreate,
}) => {
  const { mutate: createApprover, isLoading: isCreateLoading } =
    useCreateApproverMutation();
  const [form] = Form.useForm();
  const [level, setLevel] = useState(1);
  const [assignedUserIds, setAssignedUserIds] = useState<(string | null)[]>([
    null,
    null,
  ]);

  const { data: usersData } = useGetAllUsers();
  const { data: departmentsData } = useGetDepartments();

  const users = useMemo(() => usersData?.items || [], [usersData?.items]);

  const departmentOptions = useMemo(
    () =>
      flattenDepartments(departmentsData).map((dept) => ({
        value: dept.id,
        label: dept.name,
      })),
    [departmentsData],
  );

  const getUserFullName = (id: string) => {
    const user = users.find((item: User) => item.id === id);
    if (!user) return '-';
    return `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim();
  };

  const assigneeOptions = useMemo(
    () =>
      users
        .filter((user: User) => !assignedUserIds.includes(user.id))
        .map((user: User) => ({
          value: user.id,
          label: getUserFullName(user.id),
        })),
    [users, assignedUserIds],
  );

  const filledAssigneeCount = assignedUserIds.filter(Boolean).length;

  const handleCancel = () => {
    form.resetFields();
    setLevel(1);
    setAssignedUserIds([null, null]);
    onCancel();
  };

  const handleLevelChange = (value: number | null) => {
    const nextLevel = value ?? 1;
    setLevel(nextLevel);
    form.setFieldValue('level', nextLevel);
    setAssignedUserIds((prev) =>
      Array.from(
        { length: nextLevel },
        (notUsed, index) => prev[index] ?? null,
      ),
    );
  };

  const handleAssigneeSelect = (userId: string | undefined) => {
    if (!userId) return;
    setAssignedUserIds((prev) => {
      const firstEmptyIndex = prev.findIndex((id) => !id);
      if (firstEmptyIndex === -1) return prev;
      const updated = [...prev];
      updated[firstEmptyIndex] = userId;
      return updated;
    });
  };

  const handleAssigneeRemove = (index: number) => {
    setAssignedUserIds((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const assignees = assignedUserIds.filter(Boolean) as string[];
      if (assignees.length < level) {
        form.setFields([
          {
            name: 'assignee',
            errors: [
              `Please select ${level} assignee(s) for ${level} level(s)`,
            ],
          },
        ]);
        return;
      }

      const formValues: ApprovalWorkflowFormValues = {
        workflowName: values.workflowName,
        departmentId: values.departmentId,
        level,
        assignees,
      };

      const steps = assignees.map((userId, index) => ({
        stepOrder: index + 1,
        userId,
      }));

      createApprover(
        {
          values: {
            name: formValues.workflowName,
            description: '',
            entityType: 'Department',
            entityId: formValues.departmentId,
            approvalType: APPROVALTYPES.CANDIDATE,
            approvalWorkflowType: 'Sequential',
            steps,
          },
        },
        {
          onSuccess: () => {
            onCreate?.(formValues);
            handleCancel();
          },
        },
      );
    });
  };

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ level: 1 });
      setLevel(1);
      setAssignedUserIds([null, null]);
    }
  }, [open, form]);

  return (
    <Modal
      data-cy="recruitment-approval-workflow-modal"
      open={open}
      title="Approval Workflow"
      onCancel={handleCancel}
      footer={null}
      closable
      centered
      width={480}
      destroyOnClose
      rootClassName="recruitment-settings-status-modal"
    >
      <Form
        id="recruitment-approval-workflow-form"
        data-cy="recruitment-approval-workflow-form"
        form={form}
        layout="vertical"
        initialValues={{ level: 2 }}
      >
        <Form.Item
          label="Workflow Name"
          name="workflowName"
          rules={[{ required: true, message: 'Please enter workflow name' }]}
          required
        >
          <Input
            data-cy="recruitment-approval-workflow-input-name"
            className="h-10 rounded-md"
            placeholder="Input"
          />
        </Form.Item>

        <Form.Item
          label="Department"
          name="departmentId"
          rules={[{ required: true, message: 'Please select department' }]}
          required
        >
          <Select
            data-cy="recruitment-approval-workflow-select-department"
            className="h-10"
            placeholder="Select"
            options={departmentOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <div
          className="border border-[#D1D5DB] rounded-[8px] px-4 pt-4 pb-3 mb-6"
          data-cy="recruitment-approval-workflow-levels-section"
        >
          <Form.Item
            label="Levels"
            name="level"
            rules={[{ required: true, message: 'Please enter levels' }]}
            required
            className="mb-2"
          >
            <InputNumber
              data-cy="recruitment-approval-workflow-input-levels"
              className="h-10 w-full rounded-md"
              min={1}
              max={9}
              value={level}
              onChange={handleLevelChange}
            />
            <p
              className="text-sm text-[#4d4d4d] mt-1 mb-0"
              data-cy="recruitment-approval-workflow-assignee-instruction"
            >
              Select one assignee for {level} level{level === 1 ? '' : 's'} of
              approval
            </p>
          </Form.Item>

          <Form.Item label="Assignee" name="assignee" required className="mb-0">
            <Select
              data-cy="recruitment-approval-workflow-select-assignee"
              placeholder="Select"
              showSearch
              className="h-10 w-full"
              optionFilterProp="label"
              options={assigneeOptions}
              onSelect={handleAssigneeSelect}
              value={undefined}
              disabled={filledAssigneeCount >= level}
            />
            <div
              className="flex flex-wrap gap-2 mt-2"
              data-cy="recruitment-approval-workflow-assignee-tags"
            >
              {assignedUserIds.map(
                (userId, index) =>
                  userId && (
                    <Tag
                      key={`${userId}-${index}`}
                      closable
                      onClose={() => handleAssigneeRemove(index)}
                      className="inline-flex items-center gap-1 rounded-md border border-[#d9d9d9] bg-[#fafafa] px-2 py-1 text-sm"
                      data-cy={`recruitment-approval-workflow-assignee-tag-${index}`}
                    >
                      {getUserFullName(userId)}
                    </Tag>
                  ),
              )}
            </div>
          </Form.Item>
        </div>

        <div
          className="flex justify-end gap-3"
          data-cy="recruitment-approval-workflow-actions"
        >
          <Button
            data-cy="recruitment-approval-workflow-button-cancel"
            className="px-6 py-2 rounded-md"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            data-cy="recruitment-approval-workflow-button-create"
            type="primary"
            className="recruitment-settings-status-primary-btn px-6 py-2 rounded-md"
            onClick={handleSubmit}
            loading={isCreateLoading}
            disabled={isCreateLoading}
          >
            Create
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ApprovalWorkflowModal;
