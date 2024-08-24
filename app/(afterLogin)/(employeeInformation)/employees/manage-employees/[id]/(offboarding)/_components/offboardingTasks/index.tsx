'use client';
import React, { useMemo } from 'react';
import { Card, Checkbox, Button, Divider, Menu, Dropdown } from 'antd';
import { DownOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import {
  Task,
  useOffboardingStore,
} from '@/store/uistate/features/offboarding';
import { AddTaskModal } from '../addTaskModal';
import OffboardingTemplate from '../offboardingTemplate';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteOffboardingItem } from '@/store/server/features/employees/offboarding/mutation';

const TaskItem: React.FC<{ task: Task; onToggle: () => void }> = React.memo(
  ({ task, onToggle }) => (
    <div className="flex items-center mb-2">
      <Checkbox checked={task.completed} onChange={onToggle} className="mr-2" />
      <span className={task.completed ? 'line-through text-gray-500' : ''}>
        {task.title} This is task assigned for Gelila
      </span>
      {task.completed && (
        <span className="ml-2 text-sm text-gray-500">
          Completed by {task.completedBy} on {task.completedDate} Gelila T.
        </span>
      )}
      {!task.completed && task.dueDate && (
        <span className="ml-2 text-sm text-gray-500">Due: {task.dueDate}</span>
      )}
    </div>
  ),
);

TaskItem.displayName = 'TaskItem';

const OffboardingTasks: React.FC = () => {
  const {
    tasks,
    isDeleteModalVisible,
    toggleTask,
    setIsAddTaskModalVisible,
    setIsTaskTemplateVisible,
    setIsDeleteModalVisible,
  } = useOffboardingStore();
  const { mutate: offboardingTaskDeleteMutation } = useDeleteOffboardingItem();

  const categorizedTasks = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        if (!acc[task.category]) {
          acc[task.category] = [];
        }
        acc[task.category].push(task);
        return acc;
      },
      {} as Record<string, Task[]>,
    );
  }, [tasks]);

  const handleAddTaskClick = () => {
    setIsAddTaskModalVisible(true);
  };
  const handleTaskTemplate = () => {
    setIsTaskTemplateVisible(true);
  };
  const handleDeleteTask = () => {
    setIsDeleteModalVisible(true);
  };
  const handleDeleteConfirm = () => {
    offboardingTaskDeleteMutation();
  };
  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={handleTaskTemplate}>
        Add Items from Menu
      </Menu.Item>
      <Menu.Item key="2" onClick={handleDeleteTask}>
        Delete Items
      </Menu.Item>
    </Menu>
  );
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
              overlay={menu}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button className="flex items-center">
                <SettingOutlined className="mr-2" />
                <DownOutlined />
              </Button>
            </Dropdown>
            {/* <Button icon={<SettingOutlined />} onClick={handleTaskTemplate} > <Button/> */}
          </div>
        }
        className="w-full"
      >
        {Object.entries(categorizedTasks).map(([category, categoryTasks]) => (
          <React.Fragment key={category}>
            <Divider orientation="left">{category}</Divider>
            {categoryTasks.map((task) => (
              <TaskItem
                key={task?.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
              />
            ))}
          </React.Fragment>
        ))}
        <p>Task Assigned To Gelila To return sim</p>
      </Card>
      <AddTaskModal />
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
