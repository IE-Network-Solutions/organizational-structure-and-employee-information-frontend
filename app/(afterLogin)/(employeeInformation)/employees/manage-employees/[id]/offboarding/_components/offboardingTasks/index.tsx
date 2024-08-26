'use client';
import React from 'react';
import { Card, Checkbox, Button, Divider, Dropdown } from 'antd';
import { DownOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import {
  Task,
  useOffboardingStore,
} from '@/store/uistate/features/offboarding';
import { AddTaskModal } from '../addTaskModal';
import OffboardingTemplate from '../offboardingTemplate';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteOffboardingItem } from '@/store/server/features/employees/offboarding/mutation';
import { useFetchOffboardItems } from '@/store/server/features/employees/offboarding/queries';

const TaskItem: React.FC<{ task: Task; onToggle: () => void }> = ({
  task,
  onToggle,
}) => (
  <div className="flex items-center mb-2">
    <Checkbox
      checked={task.completed}
      onChange={onToggle}
      className="mr-2"
      disabled={task.completed}
    />
    <span className={task.completed ? 'line-through text-gray-500' : ''}>
      {task.title}
    </span>
    {task.completed && task.completedBy && task.completedDate && (
      <span className="ml-2 text-sm text-gray-500">
        Completed by {task.completedBy} on {task.completedDate}
      </span>
    )}
    {!task.completed && task.dueDate && (
      <span className="ml-2 text-sm text-gray-500">Due: {task.dueDate}</span>
    )}
  </div>
);

const OffboardingTasks: React.FC = () => {
  const {
    isDeleteModalVisible,
    toggleTask,
    setIsAddTaskModalVisible,
    setIsTaskTemplateVisible,
    setIsDeleteModalVisible,
  } = useOffboardingStore();

  const { mutate: offboardingTaskDeleteMutation } = useDeleteOffboardingItem();
  const { data: offboardingTasks, isLoading, error } = useFetchOffboardItems();

  const handleAddTaskClick = () => setIsAddTaskModalVisible(true);
  const handleTaskTemplate = () => setIsTaskTemplateVisible(true);
  const handleDeleteTask = () => setIsDeleteModalVisible(true);
  const handleDeleteConfirm = () => offboardingTaskDeleteMutation();

  const groupedTasks: Record<string, Task[]> = offboardingTasks?.reduce(
    (acc: any, task: any) => {
      (acc[task.category] = acc[task.category] || []).push(task);
      return acc;
    },
    {} as Record<string, typeof offboardingTasks>,
  );
  const menuItems = [
    {
      key: '1',
      label: 'Add Items from Menu',
      onClick: handleTaskTemplate,
    },
    {
      key: '2',
      label: 'Delete Items',
      onClick: handleDeleteTask,
    },
  ];

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
            >
              Add Task
            </Button>
            <Dropdown
              menu={{ items: menuItems }}
              trigger={['click']}
              placement="bottomRight"
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
        {groupedTasks &&
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
          ))}
        <AddTaskModal />
      </Card>
      <OffboardingTemplate />
      <DeleteModal
        open={isDeleteModalVisible}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalVisible(false)}
      />
    </div>
  );
};

export default OffboardingTasks;
