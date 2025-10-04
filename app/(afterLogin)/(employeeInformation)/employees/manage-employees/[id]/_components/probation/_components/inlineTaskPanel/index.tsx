'use client';
import React from 'react';
import { Form, Input, Button, Select, Card, Space } from 'antd';
import { CloseOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useCreateProbationTaskBulk,
  useUpdateProbationTask,
} from '@/store/server/features/probation-task/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import NotificationMessage from '@/components/common/notification/notificationMessage';

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

  const getCurrentTaskCount = () => {
    const formValues = form.getFieldsValue();
    return (formValues.tasks || []).length;
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
    <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200 shadow-sm">
      {/* Close button */}
      <div className="flex justify-end mb-4">
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleClose}
          className="w-8 h-8 p-0 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-full"
        />
      </div>

      {/* Task Forms */}
      <Form form={form} layout="vertical" className="space-y-4">
        <Form.List name="tasks" initialValue={editMode ? [{}] : [{}]}>
          {(fields, { add, remove }) => (
            <>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    size="small"
                    className="bg-white border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        Task {index + 1}
                      </h4>
                      {!editMode && fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                          className="w-8 h-8 p-0 flex items-center justify-center"
                        />
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Task Name Row */}
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-6">
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
                          >
                            <Input
                              placeholder="Task Name"
                              className="h-10 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </Form.Item>
                        </div>

                        <div className="col-span-4">
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
                            />
                          </Form.Item>
                        </div>

                        <div className="col-span-2">
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
                          >
                            <Input
                              placeholder="Weight"
                              type="number"
                              min={1}
                              max={100}
                              className="h-10 text-center rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </Form.Item>
                        </div>
                      </div>

                      {/* Description Row */}
                      <Form.Item
                        {...field}
                        name={[field.name, 'description']}
                        className="mb-0"
                      >
                        <Input.TextArea
                          placeholder="Description (optional)"
                          rows={2}
                          className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </Form.Item>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Add Another Task Button */}
              {!editMode && (
                <div className="mt-4">
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                    className="border-blue-300 text-blue-600 hover:border-blue-500 hover:text-blue-700 w-full"
                  >
                    Add Another Task
                  </Button>
                </div>
              )}
            </>
          )}
        </Form.List>
      </Form>

      {/* Total Weight Display */}
      {!editMode && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
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
              >
                {calculateTotalWeight()}/100
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end items-center mt-4">
        <Space>
          <Button onClick={handleClose} className="border-gray-300">
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
            className="disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {editMode
              ? 'Update Task'
              : `Submit All Tasks (${getCurrentTaskCount()})`}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default InlineTaskPanel;
