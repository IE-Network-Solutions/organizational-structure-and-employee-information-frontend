import React from 'react';
import { Modal, Input, Select, DatePicker, Button, Upload, Form } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Task,
  useOffboardingStore,
} from '@/store/uistate/features/offboarding';
import { useAddOffboardingItem } from '@/store/server/features/employees/offboarding/mutation';

const { TextArea } = Input;
const { Option } = Select;

export const AddTaskModal: React.FC = () => {
  const [form] = Form.useForm();

  const { mutate: createTaskList } = useAddOffboardingItem();
  const {
    isAddTaskModalVisible,
    taskForm,
    setTaskForm,
    addTask,
    resetTaskForm,
    setIsAddTaskModalVisible,
    addCustomOption,
    customOptions,
    newTaskList,
    setNewTaskList,
    isAddListVisible,
    setIsAddListVisible,
    newAssign,
    setNewAssign,
  } = useOffboardingStore();

  const handleAddTask = () => {
    form.validateFields().then((values: any) => {
      addTask({
        id: Date.now().toString(),
        title: values.taskName,
        completed: false,
        category: values.category,
        dueDate: values.dueDate?.toISOString(),
        assignedTo: values.assignedTo,
        description: values.description,
      });
      setIsAddTaskModalVisible(false);
      form.resetFields();
    });
  };
  const handleAddTaskList = () => {
    if (newTaskList) {
      addCustomOption(newTaskList);
      createTaskList({ name: newTaskList });
      setNewTaskList('');
      setIsAddTaskModalVisible(false);
    }
  };
  const handleAddList = () => {
    if (newAssign) {
      addCustomOption(newAssign);
      createTaskList({ name: newAssign });
      setNewAssign('');
      setIsAddListVisible(false);
    }
  };

  const handleListStatusChange = (value: any) => {
    if (value === 'addList') {
      setIsAddListVisible(true);
    } else {
      setTaskForm({ category: value });
    }
  };
  const handleClose = () => {
    setIsAddTaskModalVisible(false);
    resetTaskForm();
  };

  return (
    <>
      <Modal
        title="Add Task"
        centered
        open={isAddTaskModalVisible}
        onCancel={handleClose}
        footer={[
          <Button key="cancel" onClick={handleClose}>
            Cancel
          </Button>,
          <Button key="add" type="primary" onClick={handleAddTask}>
            Add Task
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="taskName"
            rules={[{ required: true, message: 'Please enter a task name' }]}
          >
            <Input placeholder="Task Name" allowClear />
          </Form.Item>
          <div className="flex space-x-2">
            <Form.Item
              name="approver"
              className="w-1/2"
              rules={[{ required: true, message: 'Please select approver' }]}
            >
              <Select placeholder="Approver" allowClear>
                <Option value="IT">Gelila</Option>
                <Option value="HR">Selam</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="category"
              className="w-1/2"
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select
                allowClear
                placeholder="-List-"
                onChange={handleListStatusChange}
              >
                <Option value="IT">IT</Option>
                <Option value="HR">HR</Option>
                <Option value="Manager">Manager</Option>
                {customOptions.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
                <Option value="addList" className="text-blue border-t-[1px]">
                  <PlusOutlined size={20} /> Add Item
                </Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="description">
            <TextArea
              rows={4}
              allowClear
              placeholder="Description (optional)"
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Add a New List"
        centered
        okText="Create List"
        open={isAddListVisible}
        onOk={handleAddList}
        onCancel={() => setIsAddListVisible(false)}
        style={{ backgroundColor: 'rgba(243, 244, 246)' }}
      >
        <Input
          value={newAssign}
          onChange={(e) => setNewAssign(e.target.value)}
          placeholder="Enter new list"
        />
      </Modal>
    </>
  );
};
