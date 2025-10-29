'use client';
import React from 'react';
import { Card, Checkbox, Button, Dropdown, Empty, Input, message } from 'antd';
import {
  DownOutlined,
  PlusOutlined,
  SettingOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import ProbationTemplate from '../probationTemplate';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { MdDelete } from 'react-icons/md';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { EmptyImage } from '@/components/emptyIndicator';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  useProbationStore,
  ProbationTask,
} from '@/store/uistate/features/probation';
import AddTaskModal from '../addTaskModal';

// ProbationTask interface is now imported from the store

const TaskItem: React.FC<{
  task: ProbationTask;
  onToggle: () => void;
  onDelete: () => void;
  onUpdateScore: (id: string, score: number | undefined) => void;
}> = ({ task, onToggle, onDelete, onUpdateScore }) => {
  const { userId } = useAuthenticationStore();
  const [scoreInput, setScoreInput] = React.useState<string>(
    task.score !== undefined ? task.score.toString() : '',
  );

  // Sync scoreInput with task.score when task changes
  React.useEffect(() => {
    setScoreInput(task.score !== undefined ? task.score.toString() : '');
  }, [task.score]);

  const handleCheckBox = () => {
    if (userId !== task.approverId) return; // Prevent toggle if user is not approver
    if (task.isCompleted) {
      // If unchecking, clear the score
      setScoreInput('');
      onUpdateScore(task.id, undefined);
    }
    onToggle();
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScoreInput(e.target.value);
  };

  const handleScoreSubmit = () => {
    const score = parseInt(scoreInput);
    if (isNaN(score) || score < 0 || score > (task.weight || 0)) {
      message.error(`Score must be a number between 0 and ${task.weight}`);
      return;
    }
    onUpdateScore(task.id, score);
    message.success('Score updated successfully');
  };

  return (
    <div className="rounded-lg py-1 px-4 mb-3 border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <Checkbox
            checked={task?.isCompleted}
            onChange={handleCheckBox}
            className="mr-3 flex-shrink-0"
            disabled={userId !== task.approverId}
          />

          <div className="flex flex-col min-w-0">
            <div
              className={`text-sm font-medium ${task?.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}
            >
              {task.title}
            </div>

            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2 flex-shrink-0">
                {task.approver?.avatar ? (
                  <img
                    src={task.approver.avatar}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  getInitials(task.approver?.firstName, task.approver?.lastName)
                )}
              </div>
              <span className="text-sm text-gray-700 truncate">
                {`${task.approver?.firstName || ''} ${task.approver?.lastName || ''}`.trim() ||
                  'Unassigned'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="text-right flex gap-2 items-center">
            <div className="text-sm font-medium">
              <span className="text-gray-500">Weight:</span>{' '}
              <strong>{task.weight}</strong>
            </div>
            {task.isCompleted && !task.score && (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Score"
                  value={scoreInput}
                  onChange={handleScoreChange}
                  className="w-20 h-8 text-center text-sm"
                  size="small"
                />
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={handleScoreSubmit}
                  className="w-6 h-6 p-0 flex items-center justify-center"
                />
              </div>
            )}
            {task.isCompleted && task.score !== undefined && (
              <div className="text-sm font-medium">
                <span className="text-gray-500">Score:</span>{' '}
                <strong>{task.score}</strong>
              </div>
            )}
          </div>

          <Button
            onClick={onDelete}
            danger
            size="small"
            icon={<MdDelete />}
            className="flex-shrink-0 w-6 h-6 p-0 flex items-center justify-center"
          />
        </div>
      </div>
    </div>
  );
};

interface Ids {
  id: string;
}

const ProbationTasksTemplate: React.FC<Ids> = ({ id }) => {
  // const userId = useAuthenticationStore.getState().userId;
  // const { data: probationTarget } = useFetchProbationTargetsByUserId(userId);
  const {
    tasks: probationTasks,
    isDeleteModalVisible,
    taskToDelete,
    isAddTaskModalVisible,
    isTaskTemplateVisible,
    setIsDeleteModalVisible,
    setTaskToDelete,
    setIsAddTaskModalVisible,
    setIsTaskTemplateVisible,
    deleteTask,
    toggleTask,
    getCompletedTasksScore,
    updateTaskScore,
  } = useProbationStore();

  const handleAddTaskClick = () => setIsAddTaskModalVisible(true);
  const handleTaskTemplate = () => setIsTaskTemplateVisible(true);

  const menuItems = [
    {
      key: '1',
      label: 'Add Items from Template',
      onClick: handleTaskTemplate,
    },
  ];

  const handleTaskDelete = (taskId: string) => {
    deleteTask(taskId);
    setIsDeleteModalVisible(false);
    setTaskToDelete(null);
  };

  return (
    <div className="p-1">
      <Card
        title="Probation Tasks"
        extra={
          <div className="flex flex-wrap gap-2">
            <AccessGuard permissions={[Permissions.AddOffloadingTasks]}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTaskClick}
                className="w-full sm:w-auto"
              >
                <span className="hidden sm:inline">Add Task</span>
              </Button>
            </AccessGuard>
            <div id="probation-template-tasks">
              <AccessGuard
                permissions={[Permissions.AddOffloadingTemplateTasks]}
              >
                <Dropdown
                  menu={{ items: menuItems }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button className="flex items-center w-full sm:w-auto">
                    <SettingOutlined className="mr-2 hidden sm:inline" />
                    <DownOutlined />
                  </Button>
                </Dropdown>
              </AccessGuard>
            </div>
          </div>
        }
        className="w-full"
      >
        <div className="space-y-3 max-h-96 sm:max-h-64 overflow-y-scroll scrollbar-none pr-1">
          {probationTasks.length > 0 ? (
            probationTasks.map((task: ProbationTask) => (
              <TaskItem
                key={task?.id}
                task={task}
                onToggle={() => toggleTask(task?.id)}
                onDelete={() => {
                  setIsDeleteModalVisible(true);
                  setTaskToDelete(task);
                }}
                onUpdateScore={updateTaskScore}
              />
            ))
          ) : (
            <div className="flex justify-center items-center py-8">
              <Empty
                description={'No probation tasks found'}
                image={<EmptyImage />}
              />
            </div>
          )}
        </div>

        {/* Total Score Display */}
        <div className="flex justify-end mt-3 sm:mt-4 mr-0 sm:mr-4 px-2 sm:px-0">
          <div className="text-[14px] font-bold text-gray-900">
            Total: {getCompletedTasksScore()}
          </div>
        </div>

        {/* Render the delete modal conditionally based on the state */}
        {isDeleteModalVisible && taskToDelete && (
          <DeleteModal
            open={isDeleteModalVisible}
            onConfirm={() => {
              handleTaskDelete(taskToDelete.id);
            }}
            onCancel={() => {
              setIsDeleteModalVisible(false);
              setTaskToDelete(null);
            }}
            customMessage={
              <>
                <div>
                  <p>
                    <strong>Title: </strong> {taskToDelete.title}
                  </p>
                  <p>
                    <strong>Assigned To: </strong>
                    {`${taskToDelete?.approver?.firstName || ''} ${taskToDelete?.approver?.middleName || ''} ${taskToDelete?.approver?.lastName || ''}`.trim() ||
                      'Not assigned'}
                  </p>
                </div>
              </>
            }
          />
        )}

        <AddTaskModal
          id={id}
          isVisible={isAddTaskModalVisible}
          onClose={() => setIsAddTaskModalVisible(false)}
        />
      </Card>
      <ProbationTemplate
        id={id}
        isVisible={isTaskTemplateVisible}
        onClose={() => setIsTaskTemplateVisible(false)}
      />
    </div>
  );
};

export default ProbationTasksTemplate;
