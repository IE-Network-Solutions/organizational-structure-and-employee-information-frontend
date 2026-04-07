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

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

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

    if (
      selectedTemplateTasks.length > 0 &&
      selectedTemplateTasks.some((task: any) => task.id === item.id)
    ) {
      setselectedTemplateTasks(
        selectedTemplateTasks.filter((task: any) => task !== item),
      );
    } else {
      setselectedTemplateTasks([...selectedTemplateTasks, item]);
    }
  };
  const handelAddToTask = () => {
    if (selectedTemplateTasks?.length > 0) {
      createTaskList(selectedTemplateTasks, {
        onSuccess: () => {
          setselectedTemplateTasks([]);
          setIsTaskTemplateVisible(false);
        },
      });
    }
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
        onCancel={() => {
          setIsTaskTemplateVisible(false);
          setselectedTemplateTasks([]);
        }}
        footer={null}
        width={400}
        data-cy="offboarding-template-modal"
      >
        <div
          className="mb-4 bg-gray-100 p-3 rounded"
          id="offboarding-template-employee-card"
          data-cy="offboarding-template-employee-card"
        >
          <div
            className="flex items-center"
            id="offboarding-template-employee-info"
            data-cy="offboarding-template-employee-info"
          >
            <Avatar icon={<UserOutlined />} />
            <div
              className="ml-3"
              data-cy="offboarding-template-employee-details"
            >
              <div
                className="font-bold"
                id="offboarding-template-employee-name"
                data-cy="offboarding-template-employee-name"
              >
                {' '}
                {`${employeeData?.firstName || ''} ${employeeData?.middleName || ''} ${employeeData?.lastName || ''}`.trim()}
              </div>
              <div
                className="text-sm text-gray-600"
                id="offboarding-template-employee-role"
                data-cy="offboarding-template-employee-role"
              >
                {employeeData?.employeeJobInformation[0]?.jobTitle}
              </div>
            </div>
          </div>
        </div>
        <Button
          type="primary"
          className="bg-blue-600 mr-2 mb-2"
          onClick={handleAddTaskClick}
          id="offboarding-template-add-task-list-btn"
          data-cy="offboarding-template-add-task-list-btn"
        >
          Add Task List
        </Button>
        <div
          className="max-h-[200px] overflow-y-scroll"
          id="offboarding-template-list"
          data-cy="offboarding-template-list"
        >
          {offboardingTasksTemplate?.map((item: any, index: any) => {
            const taskSlug = toSlug(item?.id ?? index);
            return (
              <div
                key={index}
                className="flex justify-between items-center my-3"
                id={`offboarding-template-item-${taskSlug}`}
                data-cy={`offboarding-template-item-${taskSlug}`}
              >
                <div
                  id="offboarding-template-checkbox-wrapper"
                  data-cy="offboarding-template-checkbox-wrapper"
                >
                  <Checkbox
                    onClick={() => handelSelectedTemplateTasks(item)}
                    key={index}
                    className="flex mb-2"
                    checked={selectedTemplateTasks.some(
                      (task: any) => task.id === item.id,
                    )}
                    id={`offboarding-template-checkbox-${taskSlug}`}
                    data-cy={`offboarding-template-checkbox-${taskSlug}`}
                  >
                    {item.title}
                  </Checkbox>
                </div>
                <div
                  id={`offboarding-template-delete-btn-wrapper-${taskSlug}`}
                  data-cy={`offboarding-template-delete-btn-wrapper-${taskSlug}`}
                >
                  <Button
                    onClick={() => {
                      setIsDeleteModalVisible(true);
                      setTaskToDelete(item); // Track the task to be deleted
                    }}
                    danger
                    icon={<MdDelete />}
                    id={`offboarding-template-delete-btn-${taskSlug}`}
                    data-cy={`offboarding-template-delete-btn-${taskSlug}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {isDeleteModalVisible && taskToDelete && (
          <DeleteModal
            data-cy="offboarding-template-delete-modal"
            open={isDeleteModalVisible}
            onConfirm={() => {
              handelTaskDelete(taskToDelete.id);
              setIsDeleteModalVisible(false);
              setTaskToDelete(null as any); // Reset the task after deletion
            }}
            onCancel={() => {
              setIsDeleteModalVisible(false);
              setTaskToDelete(null as any); // Reset the task if canceled
            }}
            customMessage={
              <>
                <div
                  id="offboarding-template-delete-modal-message-wrapper"
                  data-cy="offboarding-template-delete-modal-message-wrapper"
                >
                  <p
                    id="offboarding-template-delete-modal-message-title"
                    data-cy="offboarding-template-delete-modal-message-title"
                  >
                    <strong
                      id="offboarding-template-delete-modal-message-title-strong"
                      data-cy="offboarding-template-delete-modal-message-title-strong"
                    >
                      Title:{' '}
                    </strong>{' '}
                    {taskToDelete.title}
                  </p>
                  <p
                    id="offboarding-template-delete-modal-message-assigned-to"
                    data-cy="offboarding-template-delete-modal-message-assigned-to"
                  >
                    <strong
                      id="offboarding-template-delete-modal-message-assigned-to-strong"
                      data-cy="offboarding-template-delete-modal-message-assigned-to-strong"
                    >
                      Assigned To:{' '}
                    </strong>
                    {`${taskToDelete?.approver?.firstName || ''} ${taskToDelete?.approver?.middleName || ''} ${taskToDelete?.approver?.lastName || ''}`.trim()}
                  </p>
                </div>
              </>
            }
          />
        )}
        <div
          className="mt-6 pt-4 border-t"
          id="offboarding-template-footer"
          data-cy="offboarding-template-footer"
        >
          <Button
            disabled={selectedTemplateTasks?.length < 1}
            onClick={() => handelAddToTask()}
            type="primary"
            className="bg-blue-600 mr-2"
            id="offboarding-template-add-selected-btn"
            data-cy="offboarding-template-add-selected-btn"
          >
            Add Selected Items
          </Button>
          <Button
            onClick={() => {
              setIsTaskTemplateVisible(false);
              setselectedTemplateTasks([]);
            }}
            id="offboarding-template-cancel-btn"
            data-cy="offboarding-template-cancel-btn"
          >
            Cancel
          </Button>
        </div>
        <AddTaskModal id={id} data-cy="offboarding-template-add-task-modal" />
      </Modal>
    </>
  );
};

export default OffboardingTemplate;
