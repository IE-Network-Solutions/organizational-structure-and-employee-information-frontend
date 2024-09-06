import React from 'react';
import { Modal, Input, Select, Button, Form, Row } from 'antd';
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

  const { mutate: createTaskTemplate } = useAddOffboardingTasksTemplate();
  const { mutate: createTaskList } = useAddTerminationTasks();
  const { data: offboardingTermination } = useFetchUserTerminationByUserId(id);
  const { data: users } = useGetEmployees();
  const {
    isAddTaskModalVisible,
    isTaskTemplateVisible,
    setIsAddTaskModalVisible,
  } = useOffboardingStore();
  const handleClose = () => {
    setIsAddTaskModalVisible(false);
    form.resetFields();
  };
  const createTsks = (values: any) => {
    if (offboardingTermination) {
      values.employeTerminationId = offboardingTermination?.id;
      createTaskList([values], {
        onSuccess: () => {
          form.resetFields();
          setIsAddTaskModalVisible(false);
        },
      });
    }
  };

  const createTsksTemplate = (values: any) => {
    createTaskTemplate(values, {
      onSuccess: () => {
        form.resetFields();
        setIsAddTaskModalVisible(false);
      },
    });
  };
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
          onFinish={isTaskTemplateVisible ? createTsksTemplate : createTsks}
          layout="vertical"
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
              >
                Submit
              </Button>
              <Button
                className="text-indigo-500"
                htmlType="button"
                value={'cancel'}
                name="cancel"
                onClick={handleClose}
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
