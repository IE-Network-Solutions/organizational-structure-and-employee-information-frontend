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
      >
        <div className="text-center py-8">
          <div>Loading termination data...</div>
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
      >
        <div className="py-4">
          <Alert
            message="Termination Record Required"
            description="To add offboarding tasks, the employee must first have a termination record. Please create a termination record first."
            type="warning"
            showIcon
            className="mb-4"
          />
          <div className="text-center">
            <Button
              type="primary"
              onClick={handleCreateTermination}
              className="mr-2"
            >
              Create Termination Record
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
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
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          disabled={isLoading}
        >
          <Form.Item
            label={'Task Name'}
            required
            name="title"
            rules={[{ required: true, message: 'Please enter a task name' }]}
          >
            <Input placeholder="Task Name" />
          </Form.Item>
          <div className="flex space-x-2">
            <Form.Item
              label={'Approver'}
              required
              name="approverId"
              id="approver"
              className="w-full"
              rules={[{ required: true, message: 'Please select approver' }]}
            >
              <Select placeholder="Approver" allowClear>
                {users?.items?.map((user: any) => (
                  <Option key={user.id} value={user.id}>
                    {`${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`.trim()}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="description" id="description">
            <TextArea
              rows={4}
              allowClear
              placeholder="Description (optional)"
            />
          </Form.Item>

          <Form.Item>
            <Row className="flex justify-end gap-3">
              <Button
                type="primary"
                htmlType="submit"
                value={'submit'}
                name="submit"
                loading={isLoading}
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
