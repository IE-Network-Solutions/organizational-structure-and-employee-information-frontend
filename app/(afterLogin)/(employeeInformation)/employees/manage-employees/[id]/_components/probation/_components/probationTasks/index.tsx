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

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

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

  const taskSlug = toSlug(task.id);

  return (
    <div
      className="rounded-lg py-1 px-4 mb-3 border border-gray-200 hover:shadow-sm transition-shadow"
      id={`probation-template-task-${taskSlug}`}
      data-cy={`probation-template-task-${taskSlug}`}
    >
      <div
        className="flex items-center justify-between"
        id={`probation-template-task-row-${taskSlug}`}
        data-cy={`probation-template-task-row-${taskSlug}`}
      >
        <div
          className="flex items-center flex-1"
          id={`probation-template-task-info-${taskSlug}`}
          data-cy={`probation-template-task-info-${taskSlug}`}
        >
          <Checkbox
            checked={task?.isCompleted}
            onChange={handleCheckBox}
            className="mr-3 flex-shrink-0"
            disabled={userId !== task.approverId}
            id={`probation-template-task-checkbox-${taskSlug}`}
            data-cy={`probation-template-task-checkbox-${taskSlug}`}
          />

          <div
            className="flex flex-col min-w-0"
            id={`probation-template-task-info-wrapper-${taskSlug}`}
            data-cy={`probation-template-task-info-wrapper-${taskSlug}`}
          >
            <div
              className={`text-sm font-medium ${task?.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}
              id={`probation-template-task-title-${taskSlug}`}
              data-cy={`probation-template-task-title-${taskSlug}`}
            >
              {task.title}
            </div>

            <div
              className="flex items-center"
              id={`probation-template-task-approver-${taskSlug}`}
              data-cy={`probation-template-task-approver-${taskSlug}`}
            >
              <div
                className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2 flex-shrink-0"
                id={`probation-template-task-avatar-${taskSlug}`}
                data-cy={`probation-template-task-avatar-${taskSlug}`}
              >
                {task.approver?.avatar ? (
                  <img
                    src={task.approver.avatar}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                    id={`probation-template-task-avatar-img-${taskSlug}`}
                    data-cy={`probation-template-task-avatar-img-${taskSlug}`}
                  />
                ) : (
                  getInitials(task.approver?.firstName, task.approver?.lastName)
                )}
              </div>
              <span
                className="text-sm text-gray-700 truncate"
                id={`probation-template-task-approver-name-${taskSlug}`}
                data-cy={`probation-template-task-approver-name-${taskSlug}`}
              >
                {`${task.approver?.firstName || ''} ${task.approver?.lastName || ''}`.trim() ||
                  'Unassigned'}
              </span>
            </div>
          </div>
        </div>

        <div
          className="flex items-center space-x-3 flex-shrink-0"
          id={`probation-template-task-actions-${taskSlug}`}
          data-cy={`probation-template-task-actions-${taskSlug}`}
        >
          <div
            className="text-right flex gap-2 items-center"
            id={`probation-template-task-weight-${taskSlug}`}
            data-cy={`probation-template-task-weight-${taskSlug}`}
          >
            <div
              className="text-sm font-medium"
              id={`probation-template-task-weight-text-${taskSlug}`}
              data-cy={`probation-template-task-weight-text-${taskSlug}`}
            >
              <span
                className="text-gray-500"
                id={`probation-template-task-weight-text-span-${taskSlug}`}
                data-cy={`probation-template-task-weight-text-span-${taskSlug}`}
              >
                Weight:
              </span>{' '}
              <strong
                id={`probation-template-task-weight-strong-${taskSlug}`}
                data-cy={`probation-template-task-weight-strong-${taskSlug}`}
              >
                {task.weight}
              </strong>
            </div>
            {task.isCompleted && !task.score && (
              <div
                className="flex items-center gap-2"
                id={`probation-template-task-score-input-${taskSlug}`}
                data-cy={`probation-template-task-score-input-${taskSlug}`}
              >
                <Input
                  placeholder="Score"
                  value={scoreInput}
                  onChange={handleScoreChange}
                  className="w-20 h-8 text-center text-sm"
                  size="small"
                  id={`probation-template-task-score-field-${taskSlug}`}
                  data-cy={`probation-template-task-score-field-${taskSlug}`}
                />
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={handleScoreSubmit}
                  className="w-6 h-6 p-0 flex items-center justify-center"
                  id={`probation-template-task-score-submit-${taskSlug}`}
                  data-cy={`probation-template-task-score-submit-${taskSlug}`}
                />
              </div>
            )}
            {task.isCompleted && task.score !== undefined && (
              <div
                className="text-sm font-medium"
                id={`probation-template-task-score-display-${taskSlug}`}
                data-cy={`probation-template-task-score-display-${taskSlug}`}
              >
                <span
                  className="text-gray-500"
                  id={`probation-template-task-score-text-span-${taskSlug}`}
                  data-cy={`probation-template-task-score-text-span-${taskSlug}`}
                >
                  Score:
                </span>{' '}
                <strong
                  id={`probation-template-task-score-strong-${taskSlug}`}
                  data-cy={`probation-template-task-score-strong-${taskSlug}`}
                >
                  {task.score}
                </strong>
              </div>
            )}
          </div>

          <Button
            onClick={onDelete}
            danger
            size="small"
            icon={<MdDelete />}
            className="flex-shrink-0 w-6 h-6 p-0 flex items-center justify-center"
            id={`probation-template-task-delete-btn-${taskSlug}`}
            data-cy={`probation-template-task-delete-btn-${taskSlug}`}
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
    <div
      className="p-1"
      id="probation-tasks-container"
      data-cy="probation-tasks-container"
    >
      <Card
        id="probation-tasks-card"
        data-cy="probation-tasks-card"
        title="Probation Tasks"
        extra={
          <div
            className="flex flex-wrap gap-2"
            id="probation-tasks-actions"
            data-cy="probation-tasks-actions"
          >
            <AccessGuard
              permissions={[Permissions.AddOffloadingTasks]}
              id="probation-add-task-btn-guard"
              data-cy="probation-add-task-btn-guard"
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTaskClick}
                className="w-full sm:w-auto"
                id="probation-add-task-btn"
                data-cy="probation-add-task-btn"
              >
                <span
                  className="hidden sm:inline"
                  id="probation-add-task-btn-text"
                  data-cy="probation-add-task-btn-text"
                >
                  Add Task
                </span>
              </Button>
            </AccessGuard>
            <div
              id="probation-template-tasks"
              data-cy="probation-template-tasks"
            >
              <AccessGuard
                permissions={[Permissions.AddOffloadingTemplateTasks]}
                id="probation-template-dropdown-guard"
                data-cy="probation-template-dropdown-guard"
              >
                <Dropdown
                  menu={{ items: menuItems }}
                  trigger={['click']}
                  placement="bottomRight"
                  data-cy="probation-template-dropdown"
                >
                  <Button
                    className="flex items-center w-full sm:w-auto"
                    id="probation-template-dropdown-btn"
                    data-cy="probation-template-dropdown-btn"
                  >
                    <SettingOutlined
                      className="mr-2 hidden sm:inline"
                      id="probation-template-dropdown-btn-icon"
                      data-cy="probation-template-dropdown-btn-icon"
                    />
                    <DownOutlined
                      id="probation-template-dropdown-btn-icon-down"
                      data-cy="probation-template-dropdown-btn-icon-down"
                    />
                  </Button>
                </Dropdown>
              </AccessGuard>
            </div>
          </div>
        }
        className="w-full"
      >
        <div
          className="space-y-3 max-h-96 sm:max-h-64 overflow-y-scroll scrollbar-none pr-1"
          id="probation-tasks-list"
          data-cy="probation-tasks-list"
        >
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
                data-cy={`probation-task-item-${task.id}`}
              />
            ))
          ) : (
            <div
              className="flex justify-center items-center py-8"
              id="probation-tasks-empty-state"
              data-cy="probation-tasks-empty-state"
            >
              <Empty
                description={'No probation tasks found'}
                image={<EmptyImage data-cy="probation-tasks-empty-image" />}
                data-cy="probation-tasks-empty"
              />
            </div>
          )}
        </div>

        {/* Total Score Display */}
        <div
          className="flex justify-end mt-3 sm:mt-4 mr-0 sm:mr-4 px-2 sm:px-0"
          id="probation-tasks-total-wrapper"
          data-cy="probation-tasks-total-wrapper"
        >
          <div
            className="text-[14px] font-bold text-gray-900"
            id="probation-tasks-total-score"
            data-cy="probation-tasks-total-score"
          >
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
            data-cy="probation-task-delete-modal"
            customMessage={
              <>
                <div
                  id="probation-task-delete-modal-body"
                  data-cy="probation-task-delete-modal-body"
                >
                  <p
                    id="probation-task-delete-modal-title"
                    data-cy="probation-task-delete-modal-title"
                  >
                    <strong>Title: </strong> {taskToDelete.title}
                  </p>
                  <p
                    id="probation-task-delete-modal-assigned"
                    data-cy="probation-task-delete-modal-assigned"
                  >
                    <strong
                      id="probation-task-delete-modal-assigned-strong"
                      data-cy="probation-task-delete-modal-assigned-strong"
                    >
                      Assigned To:{' '}
                    </strong>
                    {`${taskToDelete?.approver?.firstName || ''} ${taskToDelete?.approver?.middleName || ''} ${taskToDelete?.approver?.lastName || ''}`.trim() ||
                      'Not assigned'}
                  </p>
                </div>
              </>
            }
          />
        )}

        <div
          id="probation-add-task-modal-wrapper"
          data-cy="probation-add-task-modal-wrapper"
        >
          <AddTaskModal
            id={id}
            isVisible={isAddTaskModalVisible}
            onClose={() => setIsAddTaskModalVisible(false)}
            data-cy="probation-add-task-modal"
          />
        </div>
      </Card>
      <div
        id="probation-template-modal-wrapper"
        data-cy="probation-template-modal-wrapper"
      >
        <ProbationTemplate
          id={id}
          isVisible={isTaskTemplateVisible}
          onClose={() => setIsTaskTemplateVisible(false)}
          data-cy="probation-template-modal"
        />
      </div>
    </div>
  );
};

export default ProbationTasksTemplate;
