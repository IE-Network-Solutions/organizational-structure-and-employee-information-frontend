import React from 'react';
import { Modal, Input, Select, Button, Form, Row, message, Alert } from 'antd';
import { useOffboardingStore } from '@/store/uistate/features/offboarding';
import {
  useAddOffboardingTasksTemplate,
  useAddTerminationTasks,
} from '@/store/server/features/employees/offboarding/mutation';
import { useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';
import { useFetchUserTerminationByUserId } from '@/store/server/features/employees/offboarding/queries';

const { TextArea } = Input;
const { Option } = Select;
interface Ids {
  id: string;
}
export const AddTaskModal: React.FC<Ids> = ({ id: id }) => {
  const [form] = Form.useForm();

  const { mutate: createTaskTemplate, isLoading: isCreatingTemplate } =
    useAddOffboardingTasksTemplate();
  const { mutate: createTaskList, isLoading: isCreatingTask } =
    useAddTerminationTasks();
  const { data: offboardingTermination, isLoading: isTerminationLoading } =
    useFetchUserTerminationByUserId(id);
  const { data: users } = useGetEmployees();
  const {
    isAddTaskModalVisible,
    isTaskTemplateVisible,
    setIsAddTaskModalVisible,
    setIsEmploymentFormVisible,
  } = useOffboardingStore();

  const handleClose = () => {
    setIsAddTaskModalVisible(false);
    form.resetFields();
  };

  const handleCreateTermination = () => {
    setIsAddTaskModalVisible(false);
    setIsEmploymentFormVisible(true);
  };

  const createTasks = (values: any) => {
    if (offboardingTermination) {
      values.employeTerminationId = offboardingTermination?.id;
      createTaskList([values], {
        onSuccess: () => {
          form.resetFields();
          setIsAddTaskModalVisible(false);
        },
        onError: () => {
          message.error('Failed to create task. Please try again.');
        },
      });
    } else {
      message.error('Employee termination not found. Please try again.');
    }
  };

  const createTasksTemplate = (values: any) => {
    createTaskTemplate(values, {
      onSuccess: () => {
        form.resetFields();
        setIsAddTaskModalVisible(false);
      },
      onError: () => {
        message.error('Failed to create task template. Please try again.');
      },
    });
  };

  const handleSubmit = (values: any) => {
    if (isTaskTemplateVisible) {
      createTasksTemplate(values);
    } else {
      createTasks(values);
    }
  };

  const isLoading = isCreatingTemplate || isCreatingTask;

  // Show loading state while fetching termination data
  if (isTerminationLoading) {
    return (
      <Modal
        title="Add Task"
        centered
        open={isAddTaskModalVisible}
        onCancel={handleClose}
        footer={false}
        data-cy="offboarding-add-task-loading-modal"
      >
        <div
          className="text-center py-8"
          id="offboarding-add-task-loading-content"
          data-cy="offboarding-add-task-loading-content"
        >
          <div
            id="offboarding-add-task-loading-text"
            data-cy="offboarding-add-task-loading-text"
          >
            Loading termination data...
          </div>
        </div>
      </Modal>
    );
  }

  // Show message if no termination record exists
  if (!offboardingTermination && !isTaskTemplateVisible) {
    return (
      <Modal
        title="Add Task"
        centered
        open={isAddTaskModalVisible}
        onCancel={handleClose}
        footer={false}
        data-cy="offboarding-add-task-warning-modal"
      >
        <div
          className="py-4"
          id="offboarding-add-task-warning-content"
          data-cy="offboarding-add-task-warning-content"
        >
          <Alert
            message="Termination Record Required"
            description="To add offboarding tasks, the employee must first have a termination record. Please create a termination record first."
            type="warning"
            showIcon
            className="mb-4"
            id="offboarding-add-task-warning-alert"
            data-cy="offboarding-add-task-warning-alert"
          />
          <div
            className="text-center"
            id="offboarding-add-task-warning-actions"
            data-cy="offboarding-add-task-warning-actions"
          >
            <Button
              type="primary"
              onClick={handleCreateTermination}
              className="mr-2"
              id="offboarding-create-termination-btn"
              data-cy="offboarding-create-termination-btn"
            >
              Create Termination Record
            </Button>
            <Button
              onClick={handleClose}
              id="offboarding-warning-cancel-btn"
              data-cy="offboarding-warning-cancel-btn"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        title="Add Task"
        centered
        open={isAddTaskModalVisible}
        onCancel={handleClose}
        footer={false}
        data-cy="offboarding-add-task-main-modal"
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          disabled={isLoading}
          id="offboarding-add-task-main-form"
          data-cy="offboarding-add-task-main-form"
        >
          <Form.Item
            label={'Task Name'}
            required
            name="title"
            rules={[{ required: true, message: 'Please enter a task name' }]}
            id="offboarding-task-title-form-item"
            data-cy="offboarding-task-title-form-item"
          >
            <Input
              placeholder="Task Name"
              id="offboarding-task-title-input"
              data-cy="offboarding-task-title-input"
            />
          </Form.Item>
          <div
            className="flex space-x-2"
            id="offboarding-task-approver-row"
            data-cy="offboarding-task-approver-row"
          >
            <Form.Item
              label={'Approver'}
              required
              name="approverId"
              id="approver"
              className="w-full"
              rules={[{ required: true, message: 'Please select approver' }]}
              data-cy="offboarding-task-approver-form-item"
            >
              <Select
                placeholder="Search and select approver"
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const user = users?.items?.find(
                    (u: any) => u.id === option?.value,
                  );
                  if (!user) return false;
                  const fullName =
                    `${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`
                      .trim()
                      .toLowerCase();
                  return fullName.includes(input.toLowerCase());
                }}
                optionFilterProp="children"
                id="offboarding-task-approver-select"
                data-cy="offboarding-task-approver-select"
              >
                {users?.items?.map((user: any) => (
                  <Option
                    key={user.id}
                    value={user.id}
                    id={`offboarding-task-approver-option-${user.id}`}
                    data-cy={`offboarding-task-approver-option-${user.id}`}
                  >
                    {`${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`.trim()}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            id="description"
            data-cy="offboarding-task-description-form-item"
          >
            <TextArea
              rows={4}
              allowClear
              placeholder="Description (optional)"
              id="offboarding-task-description-textarea"
              data-cy="offboarding-task-description-textarea"
            />
          </Form.Item>

          <Form.Item
            id="offboarding-task-main-submit-form-item"
            data-cy="offboarding-task-main-submit-form-item"
          >
            <Row
              className="flex justify-end gap-3"
              id="offboarding-task-main-submit-row"
              data-cy="offboarding-task-main-submit-row"
            >
              <Button
                type="primary"
                htmlType="submit"
                value={'submit'}
                name="submit"
                loading={isLoading}
                id="offboarding-task-main-submit-btn"
                data-cy="offboarding-task-main-submit-btn"
              >
                {isLoading ? 'Creating...' : 'Submit'}
              </Button>
              <Button
                className="text-indigo-500"
                htmlType="button"
                value={'cancel'}
                name="cancel"
                onClick={handleClose}
                disabled={isLoading}
                id="offboarding-task-main-cancel-btn"
                data-cy="offboarding-task-main-cancel-btn"
              >
                Cancel{' '}
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
