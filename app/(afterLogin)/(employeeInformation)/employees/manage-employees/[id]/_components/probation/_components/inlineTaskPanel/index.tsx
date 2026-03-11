'use client';
import React from 'react';
import { Form, Input, Button, Select, Card, Space, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useCreateProbationTaskBulk,
  useUpdateProbationTask,
} from '@/store/server/features/probation-task/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useIsMobile } from '@/hooks/useIsMobile';

interface InlineTaskPanelProps {
  probationTargetId: string;
  isVisible: boolean;
  onClose: () => void;
  onTaskAdded?: () => void;
  existingTasks?: any[];
  editMode?: boolean;
  taskToEdit?: any;
  onTaskUpdated?: () => void;
}

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const InlineTaskPanel: React.FC<InlineTaskPanelProps> = ({
  probationTargetId,
  isVisible,
  onClose,
  onTaskAdded,
  existingTasks = [],
  editMode = false,
  taskToEdit,
  onTaskUpdated,
}) => {
  const [form] = Form.useForm();
  const { isMobile } = useIsMobile();
  const panelSlug = toSlug(probationTargetId);
  const createTaskBulkMutation = useCreateProbationTaskBulk();
  const updateTaskMutation = useUpdateProbationTask();
  const { userId } = useAuthenticationStore();
  const { data: allUsers } = useGetAllUsers();
  // const allUsers = { items: [{ id: "1939e6ff-ffa6-4c2e-aa7d-b7f9f0189508", firstName: "SUrafel", middleName: "Kifle", lastName: "seyoum" }] }
  const peopleOptions = allUsers?.items?.map((i: any) => ({
    value: i.id,
    label: `${i?.firstName} ${i?.middleName} ${i?.lastName}`,
    firstName: i?.firstName,
    lastName: i?.lastName,
    avatar: i?.profileImage,
  }));

  // Initialize form with task data when in edit mode
  React.useEffect(() => {
    if (editMode && taskToEdit) {
      form.setFieldsValue({
        tasks: [
          {
            taskName: taskToEdit.taskName,
            approverId: taskToEdit.evaluator,
            weight: taskToEdit.weight,
            description: taskToEdit.description || '',
          },
        ],
      });
    }
  }, [editMode, taskToEdit, form]);

  const calculateExistingWeight = () => {
    return existingTasks.reduce(
      (total, task) => total + parseFloat(task.weight || 0),
      0,
    );
  };
  const tasks = Form.useWatch('tasks', form) || [];

  const calculateNewTasksWeight = () => {
    return tasks.reduce(
      (total: number, task: any) => total + (parseInt(task?.weight) || 0),
      0,
    );
  };

  const calculateTotalWeight = () => {
    return calculateExistingWeight() + calculateNewTasksWeight();
  };

  const handleSubmitAll = () => {
    form
      .validateFields()
      .then((values) => {
        const tasks = values.tasks || [];

        if (editMode && taskToEdit) {
          // Handle edit mode
          const task = tasks[0]; // In edit mode, we only have one task
          if (!task) {
            NotificationMessage.warning({
              message: 'Please fill in the task form',
            });
            return;
          }

          const updateData = {
            id: taskToEdit.id,
            taskName: task.taskName,
            weight: parseInt(task.weight),
            evaluator: task.approverId,
            description: task.description,
          };

          updateTaskMutation.mutate(updateData, {
            onSuccess: () => {
              NotificationMessage.success({
                message: 'Task updated successfully',
              });
              form.resetFields();
              if (onTaskUpdated) {
                onTaskUpdated();
              }
            },
            onError: () => {
              NotificationMessage.error({
                message: 'Failed to update task',
              });
            },
          });
        } else {
          // Handle create mode
          // Check total weight for probation target
          const totalWeight = calculateTotalWeight();
          const existingWeight = calculateExistingWeight();
          const newWeight = calculateNewTasksWeight();

          if (totalWeight > 100) {
            NotificationMessage.error({
              message: 'Total probation target weight cannot exceed 100',
              description: `Total probation target weight cannot exceed 100. Current: ${existingWeight} existing + ${newWeight} new = ${totalWeight}`,
            });
            return;
          }

          if (totalWeight < 100) {
            NotificationMessage.error({
              message: 'Total probation target weight must be 100',
              description: `Total probation target weight must be 100. Current: ${existingWeight} existing + ${newWeight} new = ${totalWeight}. Need ${100 - totalWeight} more.`,
            });
            return;
          }

          if (tasks.length === 0) {
            NotificationMessage.warning({
              message: 'Please fill in at least one complete task form',
            });
            return;
          }

          // Prepare data for bulk submission
          const bulkData = tasks.map((task: any) => ({
            probationId: probationTargetId,
            taskName: task.taskName,
            weight: parseInt(task.weight),
            evaluator: task.approverId,
            evaluationScore: 0,
            createdBy: userId,
            description: task.description,
          }));

          createTaskBulkMutation.mutate(bulkData, {
            onSuccess: () => {
              NotificationMessage.success({
                message: `${tasks.length} task(s) created successfully`,
              });
              form.resetFields();

              if (onTaskAdded) {
                onTaskAdded();
              }
            },
            onError: () => {
              NotificationMessage.error({
                message: 'Failed to create tasks',
              });
            },
          });
        }
      })
      .catch(() => {
        NotificationMessage.error({
          message: 'Please fix all validation errors before submitting',
        });
      });
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  if (!isVisible) return null;
  return (
    <Modal
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      title={
        <div
          className="text-lg font-medium"
          data-cy="probation-inline-panel-title"
        >
          Add New Task
        </div>
      }
    >
      {/* Task Forms */}
      <Form
        form={form}
        layout="vertical"
        className="space-y-3 sm:space-y-4"
        id={`probation-inline-panel-form-${panelSlug}`}
        data-cy={`probation-inline-panel-form-${panelSlug}`}
      >
        <Form.List
          name="tasks"
          initialValue={editMode ? [{}] : [{}]}
          data-cy={`probation-inline-panel-form-list-${panelSlug}`}
        >
          {(fields, { add, remove }) => (
            <>
              <div
                className="space-y-3 sm:space-y-4"
                id={`probation-inline-panel-task-list-${panelSlug}`}
                data-cy={`probation-inline-panel-task-list-${panelSlug}`}
              >
                {fields.map((field, index) => {
                  const taskSlug = `${panelSlug}-${field.key}`;
                  return (
                    <Card
                      key={field.key}
                      size="small"
                      id={`probation-inline-panel-task-card-${taskSlug}`}
                      data-cy={`probation-inline-panel-task-card-${taskSlug}`}
                      bordered={false}
                      bodyStyle={{ padding: '0' }}
                    >
                      <div
                        className="flex justify-between items-center mb-2 sm:mb-3"
                        id={`probation-inline-panel-task-header-${taskSlug}`}
                        data-cy={`probation-inline-panel-task-header-${taskSlug}`}
                      >
                        <h4
                          className="text-sm font-medium text-gray-700"
                          id={`probation-inline-panel-task-title-${taskSlug}`}
                          data-cy={`probation-inline-panel-task-title-${taskSlug}`}
                        >
                          Task {index + 1}
                        </h4>
                        {!editMode && fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                            className="w-8 h-8 p-0 flex items-center justify-center"
                            id={`probation-inline-panel-task-delete-btn-${taskSlug}`}
                            data-cy={`probation-inline-panel-task-delete-btn-${taskSlug}`}
                          />
                        )}
                      </div>

                      <div
                        className="space-y-2 sm:space-y-3"
                        id={`probation-inline-panel-task-body-${taskSlug}`}
                        data-cy={`probation-inline-panel-task-body-${taskSlug}`}
                      >
                        {/* Task Name Row */}
                        <div
                          className="grid grid-cols-12 gap-2 sm:gap-3"
                          id={`probation-inline-panel-task-row-${taskSlug}`}
                          data-cy={`probation-inline-panel-task-row-${taskSlug}`}
                        >
                          <div
                            className="col-span-12 sm:col-span-6"
                            id={`probation-inline-panel-task-name-col-${taskSlug}`}
                            data-cy={`probation-inline-panel-task-name-col-${taskSlug}`}
                          >
                            <Form.Item
                              {...field}
                              name={[field.name, 'taskName']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter task name',
                                },
                                {
                                  min: 3,
                                  message:
                                    'Task name must be at least 3 characters',
                                },
                              ]}
                              className="mb-0"
                              id={`probation-inline-panel-task-name-item-${taskSlug}`}
                              data-cy={`probation-inline-panel-task-name-item-${taskSlug}`}
                            >
                              <Input
                                placeholder="Task Name"
                                className="h-10 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                id={`probation-inline-panel-task-name-input-${taskSlug}`}
                                data-cy={`probation-inline-panel-task-name-input-${taskSlug}`}
                              />
                            </Form.Item>
                          </div>

                          <div
                            className="col-span-12 sm:col-span-4"
                            id={`probation-inline-panel-task-approver-col-${taskSlug}`}
                            data-cy={`probation-inline-panel-task-approver-col-${taskSlug}`}
                          >
                            <Form.Item
                              {...field}
                              name={[field.name, 'approverId']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please select an approver',
                                },
                              ]}
                              className="mb-0"
                              id={`probation-inline-panel-task-approver-item-${taskSlug}`}
                              data-cy={`probation-inline-panel-task-approver-item-${taskSlug}`}
                            >
                              <Select
                                placeholder="Select Approver"
                                options={peopleOptions}
                                showSearch
                                filterOption={(input: any, option: any) =>
                                  (option?.label ?? '')
                                    ?.toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                                className="h-10 w-full"
                                id={`probation-inline-panel-task-approver-select-${taskSlug}`}
                                data-cy={`probation-inline-panel-task-approver-select-${taskSlug}`}
                              />
                            </Form.Item>
                          </div>

                          <div
                            className="col-span-12 sm:col-span-2"
                            id={`probation-inline-panel-task-weight-col-${taskSlug}`}
                            data-cy={`probation-inline-panel-task-weight-col-${taskSlug}`}
                          >
                            <Form.Item
                              {...field}
                              name={[field.name, 'weight']}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter weight',
                                },
                                {
                                  validator: (notused, value) => {
                                    if (
                                      value === undefined ||
                                      value === null ||
                                      value === ''
                                    ) {
                                      return Promise.reject(
                                        'Please enter weight',
                                      );
                                    }
                                    const num = Number(value);
                                    if (isNaN(num) || !Number.isFinite(num)) {
                                      return Promise.reject(
                                        'Weight must be a number',
                                      );
                                    }
                                    if (num < 1 || num > 100) {
                                      return Promise.reject(
                                        'Weight must be between 1 and 100',
                                      );
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                              className="mb-0"
                              id={`probation-inline-panel-task-weight-item-${taskSlug}`}
                              data-cy={`probation-inline-panel-task-weight-item-${taskSlug}`}
                            >
                              <Input
                                placeholder="Weight"
                                type="number"
                                min={1}
                                max={100}
                                className="h-10 text-center rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                id={`probation-inline-panel-task-weight-input-${taskSlug}`}
                                data-cy={`probation-inline-panel-task-weight-input-${taskSlug}`}
                              />
                            </Form.Item>
                          </div>
                        </div>

                        {/* Description Row */}
                        <Form.Item
                          {...field}
                          name={[field.name, 'description']}
                          className="mb-0"
                          id={`probation-inline-panel-task-description-item-${taskSlug}`}
                          data-cy={`probation-inline-panel-task-description-item-${taskSlug}`}
                        >
                          <Input.TextArea
                            placeholder="Description (optional)"
                            rows={isMobile ? 3 : 2}
                            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            id={`probation-inline-panel-task-description-input-${taskSlug}`}
                            data-cy={`probation-inline-panel-task-description-input-${taskSlug}`}
                          />
                        </Form.Item>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Add Another Task Button */}
              {!editMode && (
                <div
                  className="mt-3 sm:mt-4 flex justify-center"
                  data-cy="probation-inline-task-add-button-container"
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                    className=""
                    id={`probation-inline-panel-add-task-btn-${panelSlug}`}
                    data-cy={`probation-inline-panel-add-task-btn-${panelSlug}`}
                  >
                    Add Task
                  </Button>
                </div>
              )}
            </>
          )}
        </Form.List>
      </Form>

      {/* Total Weight Display */}
      {!editMode && (
        <div
          className="mt-3 sm:mt-4 p-3 bg-gray-100 rounded-lg"
          id={`probation-inline-panel-total-weight-${panelSlug}`}
          data-cy={`probation-inline-panel-total-weight-${panelSlug}`}
        >
          <div
            className="space-y-2"
            id={`probation-inline-panel-total-weight-${panelSlug}`}
            data-cy={`probation-inline-panel-total-weight-${panelSlug}`}
          >
            <div
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
              id={`probation-inline-panel-total-weight-row-${panelSlug}`}
              data-cy={`probation-inline-panel-total-weight-row-${panelSlug}`}
            >
              <span
                className="text-sm font-medium text-gray-700"
                id={`probation-inline-panel-total-weight-value-${panelSlug}`}
                data-cy={`probation-inline-panel-total-weight-value-${panelSlug}`}
              >
                Probation Target Weight:
              </span>
              <span
                className={`text-sm font-bold ${
                  calculateTotalWeight() === 100
                    ? 'text-green-600'
                    : calculateTotalWeight() > 100
                      ? 'text-red-600'
                      : 'text-orange-600'
                }`}
                id={`probation-inline-panel-total-weight-value-${panelSlug}`}
                data-cy={`probation-inline-panel-total-weight-value-${panelSlug}`}
              >
                {calculateTotalWeight()}/100
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div
        className="flex justify-end items-center mt-3 sm:mt-4"
        id={`probation-inline-panel-actions-${panelSlug}`}
        data-cy={`probation-inline-panel-actions-${panelSlug}`}
      >
        <Space
          direction={'horizontal'}
          size={isMobile ? 8 : 12}
          id={`probation-inline-panel-actions-space-${panelSlug}`}
          data-cy={`probation-inline-panel-actions-space-${panelSlug}`}
        >
          <Button
            onClick={handleClose}
            className="border-gray-300 w-full sm:w-auto"
            id={`probation-inline-panel-cancel-btn-${panelSlug}`}
            data-cy={`probation-inline-panel-cancel-btn-${panelSlug}`}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmitAll}
            loading={
              editMode
                ? updateTaskMutation.isLoading
                : createTaskBulkMutation.isLoading
            }
            disabled={!editMode && calculateTotalWeight() > 100}
            className="disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
            id={`probation-inline-panel-submit-btn-${panelSlug}`}
            data-cy={`probation-inline-panel-submit-btn-${panelSlug}`}
          >
            {editMode ? 'Update Task' : `Create`}
          </Button>
        </Space>
      </div>
      {/* </div> */}
    </Modal>
  );
};

export default InlineTaskPanel;
