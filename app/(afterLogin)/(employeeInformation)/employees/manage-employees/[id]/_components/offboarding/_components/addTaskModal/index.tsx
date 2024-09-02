import React, { useEffect } from 'react';
import { Modal, Input, Select, Button, Form, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useOffboardingStore } from '@/store/uistate/features/offboarding';
import { useAddOffboardingItem, useAddOffboardingTasksTemplate, useAddTerminationTasks } from '@/store/server/features/employees/offboarding/mutation';
import { useEmployeeAllFilter, useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { userFetchUserTerminationByUserId } from '@/store/server/features/employees/offboarding/queries';

const { TextArea } = Input;
const { Option } = Select;
interface Ids {
  id: string;
}
export const AddTaskModal: React.FC<Ids> = ({ id: id }) => {
  const [form] = Form.useForm();

  const { mutate: createTaskTemplate } = useAddOffboardingTasksTemplate();
  const { mutate: createTaskList } = useAddTerminationTasks();
  const { data: offboardingTermination, isSuccess: terminationSuccess } = userFetchUserTerminationByUserId(id);

  const {
    searchParams,
    userCurrentPage,
    pageSize,

  } = useEmployeeManagementStore();
  const { data: users, isLoading: isEmployeeLoading } =
    useGetEmployees()
  const {
    isAddTaskModalVisible,
    isTaskTemplateVisible,
    setTaskForm,
    addTask,
    resetTaskForm,
    setIsAddTaskModalVisible,
    addCustomOption,
    customOptions,
    isAddListVisible,
    setIsAddListVisible,
    newAssign,
    setNewAssign,
  } = useOffboardingStore();

  // const handleAddTask = () => {
  //   form.validateFields().then((values: any) => {
  //     addTask({
  //       id: Date.now().toString(),
  //       title: values.taskName,
  //       isCompleted: false,
  //    //   category: values.category,
  //       dueDate: values.dueDate?.toISOString(),
  //       assignedTo: values.assignedTo,
  //       description: values.description,
  //     });
  //     setIsAddTaskModalVisible(false);
  //     form.resetFields();
  //   });
  // };


  // const handleAddTaskList = () => {
  //   if (newTaskList) {
  //     addCustomOption(newTaskList);
  //     createTaskList({ name: newTaskList });
  //     setNewTaskList('');
  //     setIsAddTaskModalVisible(false);
  //   }
  // };


  // useEffect(() => {
  //   if (id) {
  //     // Fetch data only when id is provided
  //     refetch();
  //   }
  // }, [id, refetch]);

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
  const createTsks = (values: any) => {
    if (offboardingTermination) {
      values.employeTerminationId = offboardingTermination?.id
      createTaskList([values])
    }
  }

  const createTsksTemplate = (values: any) => {
    createTaskTemplate(values)

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
        <Form form={form}
          onFinish={isTaskTemplateVisible ? createTsksTemplate : createTsks}
          layout="vertical">
          <Form.Item
            name="title"
            rules={[{ required: true, message: 'Please enter a task name' }]}
          >
            <Input placeholder="Task Name" allowClear />
          </Form.Item>
          <div className="flex space-x-2">
            <Form.Item
              name="approverId"
              id='approver'
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
            {/* <Form.Item
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
            </Form.Item> */}
          </div>

          <Form.Item name="description"
            id='description'
          >
            <TextArea
              rows={4}
              allowClear
              placeholder="Description (optional)"
            />
          </Form.Item>


          <Form.Item >
            <Row className='flex justify-end gap-3'>
              <Button type="primary" htmlType='submit' value={"submit"} name='submit' onClick={handleClose} >Submit</Button >
              <Button className='text-indigo-500' htmlType='button' value={"cancel"} name='cancel' onClick={handleClose} >Cancel </Button >
            </Row>
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
