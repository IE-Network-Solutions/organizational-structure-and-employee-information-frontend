'use client';
import React from 'react';
import { Modal, Form, Input, Button, Select, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  useProbationStore,
  ProbationTask,
} from '@/store/uistate/features/probation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useCreateProbationTask } from '@/store/server/features/probation-task/mutation';

interface AddTaskModalProps {
  id: string;
  isVisible: boolean;
  onClose: () => void;
  onTaskAdded?: () => void;
}

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  id,
  isVisible,
  onClose,
  onTaskAdded,
}) => {
  const [form] = useForm();
  const { addTask, resetTaskForm } = useProbationStore();
  const createTaskMutation = useCreateProbationTask();
  const { isMobile } = useIsMobile();

  const handleSubmit = async (values: any) => {
    const selectedApprover = peopleOptions.find(
      (approver: any) => approver.value === values.approverId,
    );

    const newTask: ProbationTask = {
      id: Date.now().toString(), // Generate unique ID
      title: values.title,
      description: values.description || '',
      isCompleted: false,
      approverId: values.approverId,
      weight: values.weight ? parseInt(values.weight) : undefined,
      createdDate: new Date().toISOString(),
      approver: selectedApprover
        ? {
            id: selectedApprover.value,
            firstName: selectedApprover.firstName,
            lastName: selectedApprover.lastName,
            avatar: selectedApprover.avatar,
          }
        : undefined,
    };

    // Create task using API
    createTaskMutation.mutate(
      {
        probationId: id,
        taskName: values.title,
        weight: parseInt(values.weight),
        evaluator: values.approverId,
        evaluationScore: 0,
        createdBy: '',
      },
      {
        onSuccess: () => {
          // Also add to local store for immediate UI update
          addTask(newTask);
          form.resetFields();
          resetTaskForm();
          message.success('Probation task added successfully');

          // Call the callback if provided
          if (onTaskAdded) {
            onTaskAdded();
          }
        },
        onError: () => {
          message.error('Failed to add probation task');
        },
      },
    );
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };
  const { data: allUsers } = useGetAllUsers();

  const peopleOptions = allUsers?.items?.map((i: any) => ({
    value: i.id,
    label: `${i?.firstName} ${i?.middleName} ${i?.lastName}`,
  }));

  const modalSlug = toSlug(id);

  return (
    <Modal
      title="Add Task"
      open={isVisible}
      onCancel={handleCancel}
      footer={null}
      width={isMobile ? '95%' : 500}
      data-cy={`probation-add-task-modal-${modalSlug}`}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
        id={`probation-add-task-form-${modalSlug}`}
        data-cy={`probation-add-task-form-${modalSlug}`}
      >
        <Form.Item
          name="title"
          label="*Task Name"
          rules={[
            { required: true, message: 'Please enter task name' },
            { min: 3, message: 'Task name must be at least 3 characters' },
          ]}
          id={`probation-add-task-title-form-item-${modalSlug}`}
          data-cy={`probation-add-task-title-form-item-${modalSlug}`}
        >
          <Input
            placeholder="Task Name"
            className="h-11"
            id={`probation-add-task-title-input-${modalSlug}`}
            data-cy={`probation-add-task-title-input-${modalSlug}`}
          />
        </Form.Item>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full" id={`probation-add-task-form-items-wrapper-${modalSlug}`} data-cy={`probation-add-task-form-items-wrapper-${modalSlug}`}>
          <Form.Item
            name="approverId"
            label="*Approver"
            rules={[{ required: true, message: 'Please select an approver' }]}
            className="w-full"
            id={`probation-add-task-approver-form-item-${modalSlug}`}
            data-cy={`probation-add-task-approver-form-item-${modalSlug}`}
          >
            <Select
              placeholder="Approver"
              options={peopleOptions}
              showSearch
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              className="h-11 w-full"
              id={`probation-add-task-approver-select-${modalSlug}`}
              data-cy={`probation-add-task-approver-select-${modalSlug}`}
            />
          </Form.Item>

          <Form.Item
            name="weight"
            label="*Weight"
            rules={[{ required: true, message: 'Please enter weight' }]}
            className="w-full"
            id={`probation-add-task-weight-form-item-${modalSlug}`}
            data-cy={`probation-add-task-weight-form-item-${modalSlug}`}
          >
            <Input
              placeholder="Weight"
              type="number"
              min={1}
              max={100}
              className="h-11"
              id={`probation-add-task-weight-input-${modalSlug}`}
              data-cy={`probation-add-task-weight-input-${modalSlug}`}
            />
          </Form.Item>
        </div>
        <Form.Item name="description" label="Description" id={`probation-add-task-description-form-item-${modalSlug}`} data-cy={`probation-add-task-description-form-item-${modalSlug}`}>
          <Input.TextArea
            placeholder="Description"
            rows={4}
            id={`probation-add-task-description-${modalSlug}`}
            data-cy={`probation-add-task-description-${modalSlug}`}
          />
        </Form.Item>

        <Form.Item className="mt-4" id={`probation-add-task-actions-form-item-${modalSlug}`} data-cy={`probation-add-task-actions-form-item-${modalSlug}`}>
          <div
            className="flex flex-col-reverse sm:flex-row justify-end gap-2"
            id={`probation-add-task-actions-${modalSlug}`}
            data-cy={`probation-add-task-actions-${modalSlug}`}
          >
            <Button
              type="primary"
              htmlType="submit"
              className="w-full sm:w-auto"
              id={`probation-add-task-submit-btn-${modalSlug}`}
              data-cy={`probation-add-task-submit-btn-${modalSlug}`}
            >
              Submit
            </Button>
            <Button
              onClick={handleCancel}
              className="w-full sm:w-auto"
              id={`probation-add-task-cancel-btn-${modalSlug}`}
              data-cy={`probation-add-task-cancel-btn-${modalSlug}`}
            >
              Cancel
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTaskModal;
