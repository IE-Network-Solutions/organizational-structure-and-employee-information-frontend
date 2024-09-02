'use client';
import React, { useEffect } from 'react';
import { Card, Checkbox, Button, Divider, Dropdown, Empty } from 'antd';
import { DownOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import {
  Task,
  useOffboardingStore,
} from '@/store/uistate/features/offboarding';
import { AddTaskModal } from '../addTaskModal';
import OffboardingTemplate from '../offboardingTemplate';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteOffboardingItem, useUpdateOffboardingItem } from '@/store/server/features/employees/offboarding/mutation';
import { useFetchOffboardingTasks, userFetchUserTerminationByUserId } from '@/store/server/features/employees/offboarding/queries';
import { MdDelete } from "react-icons/md";
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { offBoardingTasksUpdateStatus } from '@/store/server/features/employees/offboarding/interface';
import { EmptyImage } from '@/components/emptyIndicator';
const TaskItem: React.FC<{ task: Task; onToggle: () => void }> = ({
  task,
  onToggle,
}) => {
  const { userId } = useAuthenticationStore()
  const { completedTask, setCompletedTask } = useOffboardingStore()
  const { mutate: updateOffboardingItem } = useUpdateOffboardingItem();
  const handelCehckBox = (task: any) => {
    // setCompletedTask(!completedTask)
    let data: offBoardingTasksUpdateStatus = {
      id: '',
      isCompleted: false
    }
    data["id"] = task.id
    data["isCompleted"] = !task.isCompleted

    updateOffboardingItem(data)
  }
  return (
    < div className="flex items-center mb-2" >
      <Checkbox
        onClick={() => handelCehckBox(task)}
        checked={task?.isCompleted}
        onChange={onToggle}
        className="mr-2"
        disabled={userId !== task.approverId}
      />

      <span className={task?.isCompleted ? 'line-through text-gray-500' : ''}>
        {task.title}
      </span>
      {
        task.isCompleted && task.approverId && task.completedDate && (
          <span className="ml-2 text-sm text-gray-500">
            Completed by {task.approverId} on {task.completedDate}
          </span>
        )
      }
      {
        !task.isCompleted && task.completedDate && (
          <span className="ml-2 text-sm text-gray-500">Due: {task.completedDate}</span>
        )
      }


    </div >

  );


}
interface Ids {
  id: string;
}
const OffboardingTasksTemplate: React.FC<Ids> = ({ id }) => {
  const {
    isDeleteModalVisible,
    toggleTask,
    taskToDelete,
    setTaskToDelete,
    setIsAddTaskModalVisible,
    setIsTaskTemplateVisible,
    setIsDeleteModalVisible,
  } = useOffboardingStore();

  const { mutate: offboardingTaskDelete } = useDeleteOffboardingItem();

  const { data: offboardingTermination } = userFetchUserTerminationByUserId(id);
  const { data: offboardingTasks, isLoading, error } = useFetchOffboardingTasks(id);

  // useEffect(() => {
  //   if (terminationSuccess && offboardingTermination?.id) {
  //     refetch();
  //   }
  // }, [terminationSuccess, offboardingTermination?.id, refetch]);
  const handleAddTaskClick = () => setIsAddTaskModalVisible(true);
  const handleTaskTemplate = () => setIsTaskTemplateVisible(true);
  const handleDeleteTask = () => setIsDeleteModalVisible(true);
  const handleDeleteConfirm = () => { };

  // const groupedTasks: Record<string, Task[]> = offboardingTasks?.reduce(
  //   (acc: any, task: any) => {
  //     (acc[task.category] = acc[task.category] || []).push(task);
  //     return acc;
  //   },
  //   {} as Record<string, typeof offboardingTasks>,
  // );
  const menuItems = [
    {
      key: '1',
      label: 'Add Items from Menu',
      onClick: handleTaskTemplate,
    },

  ];

  const handelTaskDelete = (value: string) => {
    offboardingTaskDelete(value)
  }
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tasks</div>;

  return (
    <div className="p-4">
      <Card
        title="Offboarding Tasks"
        extra={
          <div className="flex space-x-2">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddTaskClick}
              disabled={!offboardingTermination}
            >
              Add Task
            </Button>
            <Dropdown
              menu={{ items: menuItems }}
              trigger={['click']}
              placement="bottomRight"
              disabled={!offboardingTermination}
            >
              <Button className="flex items-center">
                <SettingOutlined className="mr-2" />
                <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        }
        className="w-full"
      >
        {/* {groupedTasks &&
          Object.entries(groupedTasks).map(([category, tasks]) => (
            <React.Fragment key={category}>
              <Divider orientation="left">
                <span className="text-blue-200">{category}</span>
              </Divider>
              {(tasks as Task[]).map((task: Task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(task.id)}
                />
              ))}
            </React.Fragment>
          ))} */}
        {offboardingTasks.length > 0 ? (offboardingTasks as Task[])?.map((task: Task) => (
          <div key={task?.id} className="flex justify-between items-center my-3">
            <div>
              <TaskItem
                task={task}
                onToggle={() => toggleTask(task?.id)}
              />
            </div>

            <div>
              <Button
                onClick={() => {
                  setIsDeleteModalVisible(true);
                  setTaskToDelete(task); // Track the task to be deleted
                }}
                danger
                icon={<MdDelete />}
              />
            </div>
          </div>
        )) : (<div className="flex justify-center items-center">
          {' '}
          <Empty description={'data not found'} image={<EmptyImage />} />
        </div>)}
        {/* Render the delete modal conditionally based on the state */}
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

        <AddTaskModal id={id} />
      </Card>
      <OffboardingTemplate id={id} />

    </div>
  );
};

export default OffboardingTasksTemplate;
