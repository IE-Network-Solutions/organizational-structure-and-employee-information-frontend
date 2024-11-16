import React from 'react';
import { Modal, Input, Select, Button, Form, Row, Space, Avatar } from 'antd';
import { useOffboardingStore } from '@/store/uistate/features/offboarding';
import {
  useAddOffboardingTasksTemplate,
  useAddTerminationTasks,
} from '@/store/server/features/employees/offboarding/mutation';
import { useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';
import { useFetchUserTerminationByUserId } from '@/store/server/features/employees/offboarding/queries';

const { TextArea } = Input;
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
    approverId,
    setApproverId,
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

  const options = users
    ? users.items.map((user: any) => ({
        value: user.id,
        label: (
          <Space size="small">
            <Avatar
              src={
                user?.profileImage && typeof user?.profileImage === 'string'
                  ? (() => {
                      try {
                        const parsed = JSON.parse(user.profileImage);
                        return parsed.url && parsed.url.startsWith('http')
                          ? parsed.url
                          : Avatar;
                      } catch {
                        return user.profileImage.startsWith('http')
                          ? user.profileImage
                          : Avatar;
                      }
                    })()
                  : Avatar
              }
            />
            {user.firstName}
          </Space>
        ),
      }))
    : [];

  const handlAprover = (value: string) => {
    setApproverId(value);
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
          <div>
            <Form.Item
              name={'approverId'}
              rules={[
                {
                  required: true,
                  message: 'Please select an approver',
                },
              ]}
              label={'Approver'}
            >
              <Select
                placeholder="Approver"
                allowClear
                value={approverId}
                onChange={handlAprover}
                showSearch
                filterOption={(input, option) => {
                  const label = option?.label;
                  if (React.isValidElement(label)) {
                    const userName = label.props.children[1];
                    return userName.toLowerCase().includes(input.toLowerCase());
                  }
                  return false;
                }}
                options={options}
              ></Select>
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
