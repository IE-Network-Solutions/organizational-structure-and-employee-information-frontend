'use client';
import { Modal, Checkbox, Button, Avatar } from 'antd';
import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { useOffboardingStore } from '@/store/uistate/features/offboarding';
import { AddTaskModal } from '../addTaskModal';
import {
  useFetchOffBoardingTasksTemplate,
  useFetchUserTerminationByUserId,
} from '@/store/server/features/employees/offboarding/queries';
import {
  useAddTerminationTasks,
  useDeleteOffboardingTemplateTasksItem,
} from '@/store/server/features/employees/offboarding/mutation';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { MdDelete } from 'react-icons/md';
import DeleteModal from '@/components/common/deleteConfirmationModal';
interface Ids {
  id: string;
}
const OffboardingTemplate: React.FC<Ids> = ({ id: id }) => {
  const {
    isTaskTemplateVisible,
    selectedTemplateTasks,
    isDeleteModalVisible,
    taskToDelete,
    setselectedTemplateTasks,
    setIsTaskTemplateVisible,
    setIsAddTaskModalVisible,
    setTaskToDelete,
    setIsDeleteModalVisible,
  } = useOffboardingStore();

  const { data: offboardingTasksTemplate } = useFetchOffBoardingTasksTemplate();
  const { mutate: createTaskList } = useAddTerminationTasks();
  const { data: offboardingTermination } = useFetchUserTerminationByUserId(id);
  const { data: employeeData } = useGetEmployee(id);
  const { mutate: offboardingTemplateTaskDelete } =
    useDeleteOffboardingTemplateTasksItem();

  const handleAddTaskClick = () => {
    setIsAddTaskModalVisible(true);
  };

  const handelSelectedTemplateTasks = (item: any) => {
    item.employeTerminationId = offboardingTermination?.id;
    if (selectedTemplateTasks.includes(item)) {
      setselectedTemplateTasks(
        selectedTemplateTasks.filter((task: any) => task !== item),
      );
    } else {
      setselectedTemplateTasks([...selectedTemplateTasks, item]);
    }
  };
  const handelAddToTask = () => {
    setIsTaskTemplateVisible(false);
    createTaskList(selectedTemplateTasks);
  };
  const handelTaskDelete = (value: string) => {
    offboardingTemplateTaskDelete(value);
  };

  return (
    <>
      <Modal
        title="Add Items"
        centered
        open={isTaskTemplateVisible}
        onCancel={() => setIsTaskTemplateVisible(false)}
        footer={null}
        width={400}
      >
        <div className="mb-4 bg-gray-100 p-3 rounded">
          <div className="flex items-center">
            <Avatar icon={<UserOutlined />} />
            <div className="ml-3">
              <div className="font-bold">
                {' '}
                {`${employeeData?.firstName || ''} ${employeeData?.middleName || ''} ${employeeData?.lastName || ''}`.trim()}
              </div>
              <div className="text-sm text-gray-600">
                {employeeData?.employeeJobInformation[0]?.jobTitle}
              </div>
            </div>
          </div>
        </div>
        <Button
          type="primary"
          className="bg-blue-600 mr-2 mb-2"
          onClick={handleAddTaskClick}
        >
          Add Task List
        </Button>
        {offboardingTasksTemplate?.map((item: any, index: any) => (
          <div key={index} className="flex justify-between items-center my-3">
            <div>
              <Checkbox
                onClick={() => handelSelectedTemplateTasks(item)}
                key={index}
                className="flex mb-2"
              >
                {item.title}
              </Checkbox>
            </div>
            <div>
              <Button
                onClick={() => {
                  setIsDeleteModalVisible(true);
                  setTaskToDelete(item); // Track the task to be deleted
                }}
                danger
                icon={<MdDelete />}
              />
            </div>
          </div>
        ))}
        {isDeleteModalVisible && taskToDelete && (
          <DeleteModal
            open={isDeleteModalVisible}
            onConfirm={() => {
              handelTaskDelete(taskToDelete.id);
              setIsDeleteModalVisible(false);
              setTaskToDelete(null); // Reset the task after deletion
            }}
            onCancel={() => {
              setIsDeleteModalVisible(false);
              setTaskToDelete(null); // Reset the task if canceled
            }}
            customMessage={
              <>
                <div>
                  <p>
                    <strong>Title: </strong> {taskToDelete.title}
                  </p>
                  <p>
                    <strong>Assigned To: </strong>
                    {`${taskToDelete?.approver?.firstName || ''} ${taskToDelete?.approver?.middleName || ''} ${taskToDelete?.approver?.lastName || ''}`.trim()}
                  </p>
                </div>
              </>
            }
          />
        )}
        <div className="mt-6 pt-4 border-t">
          <Button
            onClick={() => handelAddToTask()}
            type="primary"
            className="bg-blue-600 mr-2"
          >
            Add Selected Items
          </Button>
          <Button onClick={() => setIsTaskTemplateVisible(false)}>
            Cancel
          </Button>
        </div>
        <AddTaskModal id={id} />
      </Modal>
    </>
  );
};

export default OffboardingTemplate;
