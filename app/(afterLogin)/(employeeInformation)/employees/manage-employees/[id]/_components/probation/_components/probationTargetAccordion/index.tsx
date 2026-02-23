'use client';
import React from 'react';
import {
  Card,
  Collapse,
  Button,
  Input,
  Avatar,
  Typography,
  Space,
  Tag,
  Checkbox,
  Modal,
  Select,
  Form,
  Tooltip,
  Empty,
  Dropdown,
} from 'antd';
import Image from 'next/image';
import {
  PlusOutlined,
  CheckOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import {
  ProbationTarget,
  ProbationTask,
} from '@/store/server/features/probation-target/interface';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useUpdateProbationTarget,
  useDeleteProbationTarget,
} from '@/store/server/features/probation-target/mutation';
import { useUpdateEmployeeJobInformation } from '@/store/server/features/employees/employeeDetail/mutations';
import { EmptyImage } from '@/components/emptyIndicator';
import InlineTaskPanel from '../inlineTaskPanel';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useCreateProbationTaskSaveAll } from '@/store/server/features/probation-task/mutation';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Panel } = Collapse;
const { Text } = Typography;

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
  onEdit: (task: ProbationTask) => void;
}> = ({ task, onToggle, onDelete, onUpdateScore, onEdit }) => {
  const { userId } = useAuthenticationStore();
  const [scoreInput, setScoreInput] = React.useState<string>(
    task.isCompleted ? task.evaluationScore.toString() : '',
  );

  // Sync scoreInput with task.score when task changes
  React.useEffect(() => {
    setScoreInput(task.isCompleted ? task.evaluationScore.toString() : '');
  }, [task.evaluationScore, task.isCompleted]);

  const handleCheckBox = () => {
    if (userId !== task.evaluator) return; // Prevent toggle if user is not approver
    if (task.isCompleted) {
      // If unchecking,  clear the score
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
    const weight =
      typeof task.weight === 'string'
        ? parseInt(task.weight)
        : (task.weight ?? 0);
    if (isNaN(score) || score < 0 || score > weight) {
      NotificationMessage.error({
        message: `Score must be a number between 0 and ${weight}`,
      });
      return;
    }
    onUpdateScore(task.id, score);
  };

  const taskSlug = toSlug(task.id);

  const canEdit = AccessGuard.checkAccess({
    permissions: [Permissions.UpdateProbationTask],
  });
  const canDelete = AccessGuard.checkAccess({
    permissions: [Permissions.DeleteProbationTask],
  });
  const taskMenuItems = [
    canEdit
      ? {
          key: 'edit',
          label: 'Edit',
          icon: <EditOutlined />,
          onClick: () => onEdit(task),
        }
      : null,
    canDelete
      ? {
          key: 'delete',
          label: 'Delete',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: onDelete,
        }
      : null,
  ].filter(Boolean) as any[];

  return (
    <div
      className="rounded-lg p-4 mb-3 border border-gray-200 bg-white hover:shadow-sm transition-shadow"
      id={`probation-task-${taskSlug}`}
      data-cy={`probation-task-${taskSlug}`}
    >
      {/* Top row: task title (with checkbox) + options */}
      <div
        className="flex items-center justify-between gap-2"
        id={`probation-task-row-${taskSlug}`}
        data-cy={`probation-task-row-${taskSlug}`}
      >
        <div
          className="flex items-center min-w-0 flex-1"
          id={`probation-task-info-${taskSlug}`}
          data-cy={`probation-task-info-${taskSlug}`}
        >
          <Checkbox
            checked={task?.isCompleted}
            onChange={handleCheckBox}
            className="mr-2 flex-shrink-0"
            disabled={userId !== task.evaluator}
            id={`probation-task-checkbox-${taskSlug}`}
            data-cy={`probation-task-checkbox-${taskSlug}`}
          />
          <div
            className={`text-base font-semibold truncate min-w-0 ${task?.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}
            id={`probation-task-title-${taskSlug}`}
            data-cy={`probation-task-title-${taskSlug}`}
          >
            {task.taskName}
          </div>
        </div>
        {taskMenuItems.length > 0 && (
          <Dropdown
            menu={{ items: taskMenuItems }}
            trigger={['click']}
            placement="bottomRight"
            data-cy={`probation-task-options-dropdown-${taskSlug}`}
          >
            <Button
              type="default"
              size="small"
              icon={<MoreOutlined className="text-gray-600" />}
              className="flex-shrink-0 w-8 h-8 p-0 flex items-center justify-center rounded border border-gray-200 bg-white hover:bg-gray-50"
              id={`probation-task-options-btn-${taskSlug}`}
              data-cy={`probation-task-options-btn-${taskSlug}`}
            />
          </Dropdown>
        )}
      </div>

      {/* Bottom row: assigned person + weight tag (and score when applicable) */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 mt-2"
        id={`probation-task-meta-${taskSlug}`}
        data-cy={`probation-task-meta-${taskSlug}`}
      >
        <div
          className="flex items-center min-w-0"
          id={`probation-task-evaluator-${taskSlug}`}
          data-cy={`probation-task-evaluator-${taskSlug}`}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2 flex-shrink-0 overflow-hidden bg-gray-300"
            id={`probation-task-avatar-${taskSlug}`}
            data-cy={`probation-task-avatar-${taskSlug}`}
          >
            {task.evaluatorUser?.profileImage ? (
              <Image
                src={task.evaluatorUser.profileImage}
                alt="avatar"
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover"
                id={`probation-task-avatar-img-${taskSlug}`}
                data-cy={`probation-task-avatar-img-${taskSlug}`}
              />
            ) : (
              getInitials(
                task.evaluatorUser?.firstName,
                task.evaluatorUser?.lastName,
              )
            )}
          </div>
          <span
            className="text-sm text-gray-500 truncate"
            id={`probation-task-evaluator-name-${taskSlug}`}
            data-cy={`probation-task-evaluator-name-${taskSlug}`}
          >
            {`${task.evaluatorUser?.firstName || ''} ${task.evaluatorUser?.lastName || ''}`.trim() ||
              'Assigned Person'}
          </span>
        </div>
        <div
          className="flex items-center gap-2 flex-wrap"
          id={`probation-task-weight-${taskSlug}`}
          data-cy={`probation-task-weight-${taskSlug}`}
        >
          <span
            className="inline-flex items-center rounded border border-gray-200 bg-white px-2.5 py-1 text-sm text-gray-800"
            id={`probation-task-weight-text-${taskSlug}`}
            data-cy={`probation-task-weight-text-${taskSlug}`}
          >
            <span
              className="text-gray-500 mr-1"
              id={`probation-task-weight-text-span-${taskSlug}`}
              data-cy={`probation-task-weight-text-span-${taskSlug}`}
            >
              Weight:
            </span>
            <strong
              id={`probation-task-weight-strong-${taskSlug}`}
              data-cy={`probation-task-weight-strong-${taskSlug}`}
            >
              {task.weight}
            </strong>
          </span>
          {task.isCompleted && task.evaluationScore == '0.00' && (
            <div
              className="flex items-center gap-2"
              id={`probation-task-score-input-${taskSlug}`}
              data-cy={`probation-task-score-input-${taskSlug}`}
            >
              <Input
                placeholder="Score"
                value={scoreInput}
                onChange={handleScoreChange}
                className="w-20 h-8 text-center text-sm"
                size="small"
                disabled={task.isCompleted && userId !== task.evaluator}
                id={`probation-task-score-field-${taskSlug}`}
                data-cy={`probation-task-score-field-${taskSlug}`}
              />
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={handleScoreSubmit}
                className="w-6 h-6 p-0 flex items-center justify-center"
                disabled={task.isCompleted && userId !== task.evaluator}
                id={`probation-task-score-submit-${taskSlug}`}
                data-cy={`probation-task-score-submit-${taskSlug}`}
              />
            </div>
          )}
          {task.isCompleted && (
            <div
              className="text-sm font-medium"
              id={`probation-task-score-display-${taskSlug}`}
              data-cy={`probation-task-score-display-${taskSlug}`}
            >
              <span
                className="text-gray-500"
                id={`probation-task-score-text-span-${taskSlug}`}
                data-cy={`probation-task-score-text-span-${taskSlug}`}
              >
                Score:
              </span>{' '}
              <strong
                id={`probation-task-score-strong-${taskSlug}`}
                data-cy={`probation-task-score-strong-${taskSlug}`}
              >
                {task.evaluationScore}
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ProbationTargetAccordionProps {
  probationTargets: ProbationTarget[];
  employeeId: string;
  onAddTask?: (probationTargetId: string) => void;
  onUpdateTaskScore?: (taskId: string, score: number | undefined) => void;
  onToggleTaskComplete?: (taskId: string) => void;
  onTaskAdded?: () => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (task: ProbationTask) => void;
}

const ProbationTargetAccordion: React.FC<ProbationTargetAccordionProps> = ({
  probationTargets,
  employeeId,
  onUpdateTaskScore,
  onToggleTaskComplete,
  onTaskAdded,
  onDeleteTask,
}) => {
  const { isMobile } = useIsMobile();
  const [showInlinePanel, setShowInlinePanel] = React.useState<string | null>(
    null,
  );
  const [taskToDelete, setTaskToDelete] = React.useState<ProbationTask | null>(
    null,
  );
  const [taskToEdit, setTaskToEdit] = React.useState<ProbationTask | null>(
    null,
  );
  const [isEditMode, setIsEditMode] = React.useState<boolean>(false);
  const [showEmploymentModal, setShowEmploymentModal] =
    React.useState<boolean>(false);

  const [completedTargets, setCompletedTargets] = React.useState<Set<string>>(
    new Set(),
  );
  const [showEditModal, setShowEditModal] = React.useState<boolean>(false);
  const [targetToEdit, setTargetToEdit] =
    React.useState<ProbationTarget | null>(null);
  const [targetToDelete, setTargetToDelete] =
    React.useState<ProbationTarget | null>(null);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] =
    React.useState<boolean>(false);
  const [targetForTaskEdit, setTargetForTaskEdit] =
    React.useState<ProbationTarget | null>(null);
  const [drawerForm] = Form.useForm();
  const { data: allUsers } = useGetAllUsers();
  // const allUsers = { items: [{ id: "1939e6ff-ffa6-4c2e-aa7d-b7f9f0189508", firstName: "SUrafel", middleName: "Kifle", lastName: "seyoum" }] }

  const { userId } = useAuthenticationStore();
  const peopleOptions = allUsers?.items?.map((i: any) => ({
    value: i.id,
    label: `${i?.firstName} ${i?.middleName} ${i?.lastName}`,
    firstName: i?.firstName,
    lastName: i?.lastName,
    avatar: i?.profileImage,
  }));
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { data: employementType } = useGetEmployementTypes();
  const updateProbationTargetMutation = useUpdateProbationTarget();
  const deleteProbationTargetMutation = useDeleteProbationTarget();
  const updateEmployeeJobInformationMutation =
    useUpdateEmployeeJobInformation();
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  const calculateTotalScore = (tasks: ProbationTask[]) => {
    return tasks
      .filter((task) => task.isCompleted)
      .reduce((total, task) => total + parseFloat(task.evaluationScore), 0);
  };

  const handleAddTask = (probationTargetId: string) => {
    setShowInlinePanel(probationTargetId);
  };

  const handleCloseInlinePanel = () => {
    setShowInlinePanel(null);
  };

  const handleTaskAdded = () => {
    setShowInlinePanel(null);
    if (onTaskAdded) {
      onTaskAdded();
    }
  };

  const handleDeleteClick = (task: ProbationTask) => {
    setTaskToDelete(task);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete && onDeleteTask) {
      onDeleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setTaskToDelete(null);
  };

  const handleEditClick = (task: ProbationTask) => {
    setTaskToEdit(task);
    setIsEditMode(true);
    setShowInlinePanel(task.probationId);
  };

  const handleEditClose = () => {
    setTaskToEdit(null);
    setIsEditMode(false);
    setShowInlinePanel(null);
  };

  const handleTaskUpdated = () => {
    setTaskToEdit(null);
    setIsEditMode(false);
    setShowInlinePanel(null);
    if (onTaskAdded) {
      onTaskAdded();
    }
  };

  const handleCompleteProbation = async (target: ProbationTarget) => {
    const totalScore = calculateTotalScore(target.probationTasks);
    await updateProbationTargetMutation.mutateAsync(
      {
        id: target.id,
        totalScore: totalScore,
        isCompleted: true,
      },
      {
        onSuccess: () => {
          setCompletedTargets((prev) => new Set(prev).add(target.id));
          setShowEmploymentModal(true);
        },
      },
    );

    // Mark as completed

    // Show employment type modal after successful completion
  };

  const handleUncompleteProbation = async (target: ProbationTarget) => {
    await updateProbationTargetMutation.mutateAsync(
      {
        id: target.id,
        totalScore: 0,
        isCompleted: false,
      },
      {
        onSuccess: () => {
          setCompletedTargets((prev) => {
            const newSet = new Set(prev);
            newSet.delete(target.id);
            return newSet;
          });
        },
      },
    );

    // Remove from completed targets

    NotificationMessage.success({
      message: 'Probation target uncompleted successfully',
    });
  };
  const { data: employeeData } = useGetEmployee(employeeId);
  const empJobInfo = employeeData?.employeeJobInformation?.find(
    (job: any) => job.isPositionActive,
  );
  const handleEmploymentTypeUpdate = async (values: {
    employmentType: string;
  }) => {
    await updateEmployeeJobInformationMutation.mutateAsync(
      {
        id: empJobInfo?.id,
        values: {
          employementTypeId: values.employmentType,
        },
      },
      {
        onSuccess: () => {
          setShowEmploymentModal(false);
          form.resetFields();
        },
      },
    );
  };

  const handleEmploymentModalCancel = () => {
    setShowEmploymentModal(false);
    form.resetFields();
  };

  const handleEditTarget = (target: ProbationTarget) => {
    setTargetToEdit(target);
    editForm.setFieldsValue({
      name: target.name,
    });
    setShowEditModal(true);
  };

  const handleEditTargetSubmit = async (values: { name: string }) => {
    if (!targetToEdit) return;

    await updateProbationTargetMutation.mutateAsync({
      id: targetToEdit.id,
      name: values.name,
    });

    setShowEditModal(false);
    setTargetToEdit(null);
    editForm.resetFields();
  };

  const handleEditModalCancel = () => {
    setShowEditModal(false);
    setTargetToEdit(null);
    editForm.resetFields();
  };

  const handleDeleteTarget = (target: ProbationTarget) => {
    setTargetToDelete(target);
  };

  const handleDeleteTargetConfirm = async () => {
    if (!targetToDelete) return;

    await deleteProbationTargetMutation.mutateAsync(targetToDelete.id, {
      onSuccess: () => {
        setTargetToDelete(null);
      },
    });
  };

  const handleDeleteTargetCancel = () => {
    setTargetToDelete(null);
  };

  const openTaskEditDrawer = (target: ProbationTarget) => {
    setTargetForTaskEdit(target);
    setIsTaskDrawerOpen(true);

    const initialTasks = target.probationTasks.map((t) => ({
      id: t.id,
      taskName: t.taskName,
      approverId: t.evaluator,
      weight: t.weight,
      description: (t as any).description || '',
      isCompleted: t.isCompleted,
    }));
    drawerForm.setFieldsValue({ tasks: initialTasks });
  };

  const closeTaskEditDrawer = () => {
    setIsTaskDrawerOpen(false);
    setTargetForTaskEdit(null);
  };

  const drawerTasksWatch = Form.useWatch('tasks', drawerForm) || [];
  const drawerTotalWeight = React.useMemo(
    () =>
      (drawerTasksWatch || []).reduce(
        (total: number, t: any) => total + (parseInt(t?.weight) || 0),
        0,
      ),
    [drawerTasksWatch],
  );
  const createTaskSaveAllMutation = useCreateProbationTaskSaveAll();
  const handleDrawerSaveAll = async () => {
    const values = await drawerForm.validateFields();
    const normalizedTasks = (values?.tasks || []).map((t: any) => ({
      id: t.id,
      taskName: t.taskName,
      weight: parseInt(t.weight),
      evaluator: t.approverId,
      description: t.description,
    }));
    const payload = {
      probationId: targetForTaskEdit?.id,
      createdBy: userId,
      tasks: normalizedTasks,
    } as any;

    await createTaskSaveAllMutation.mutateAsync(payload, {
      onSuccess: () => {
        closeTaskEditDrawer();
      },
    });
  };

  if (!probationTargets || probationTargets.length === 0) {
    return (
      <Card
        className="w-full"
        id="probation-targets-empty-card"
        data-cy="probation-targets-empty-card"
      >
        <div
          className="flex justify-center items-center py-8"
          id="probation-targets-empty-state"
          data-cy="probation-targets-empty-state"
        >
          <Empty
            description="No probation targets found"
            image={<EmptyImage />}
            data-cy="probation-targets-empty"
          />
        </div>
      </Card>
    );
  }

  return (
    <Card
      bodyStyle={{ padding: 0 }}
      className="w-full border-none"
      id="probation-targets-card"
      data-cy="probation-targets-card" 
    >
      <Collapse
        defaultActiveKey={probationTargets.map((target) => target.id)}
        size="large"
        data-cy="probation-targets-collapse"
      >
        {probationTargets.map((target) => {
          const targetSlug = toSlug(target.id);
          const totalScore = calculateTotalScore(target.probationTasks);
          const completedTasks = target.probationTasks.filter(
            (task) => task.isCompleted,
          ).length;

          return (
            <Panel
              id={`probation-target-panel-${targetSlug}`}
              data-cy={`probation-target-panel-${targetSlug}`}
              key={target.id}
              header={
                <div
                  className="flex flex-row items-start md:items-center justify-between w-full pr-0 gap-2"
                  style={{ padding: 0 }}
                  id={`probation-target-header-${targetSlug}`}
                  data-cy={`probation-target-header-${targetSlug}`}
                >
                  <div
                    className="flex items-center"
                    id={`probation-target-user-${targetSlug}`}
                    data-cy={`probation-target-user-${targetSlug}`}
                  >
                    <Avatar
                      size="default"
                      src={target.user.profileImage}
                      icon={<UserOutlined />}
                      className="mr-3 hidden sm:flex"
                      data-cy={`probation-target-avatar-${targetSlug}`}
                    >
                      {!target.user.profileImage &&
                        getInitials(
                          target.user.firstName,
                          target.user.lastName,
                        )}
                    </Avatar>
                    <div
                      className="flex flex-col"
                      id={`probation-target-name-wrapper-${targetSlug}`}
                      data-cy={`probation-target-name-wrapper-${targetSlug}`}
                    >
                      <Text
                        className="mb-0 text-md font-bold"
                        id={`probation-target-name-${targetSlug}`}
                        data-cy={`probation-target-name-${targetSlug}`}
                      >
                        {target.name}
                      </Text>
                      <Text
                        className="text-gray-600"
                        id={`probation-target-employee-${targetSlug}`}
                        data-cy={`probation-target-employee-${targetSlug}`}
                      >
                        {`${target.user.firstName} ${target.user.middleName} ${target.user.lastName}`.trim()}
                      </Text>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 sm:gap-4"
                    id={`probation-target-actions-${targetSlug}`}
                    data-cy={`probation-target-actions-${targetSlug}`}
                  >
                    <div
                      className="flex items-center gap-2 sm:gap-4"
                      id={`probation-target-status-tags-wrapper-${targetSlug}`}
                      data-cy={`probation-target-status-tags-wrapper-${targetSlug}`}
                    >
                      <Space
                        id={`probation-target-status-tags-${targetSlug}`}
                        data-cy={`probation-target-status-tags-${targetSlug}`}
                      >
                        {completedTargets.has(target.id) && (
                          <Tag
                            className="cursor-pointer"
                            onClick={() => handleUncompleteProbation(target)}
                            color="green"
                            id={`probation-target-completed-tag-${targetSlug}`}
                            data-cy={`probation-target-completed-tag-${targetSlug}`}
                          >
                            ✓ Completed
                          </Tag>
                        )}

                        {completedTasks === target.probationTasks.length &&
                          target.probationTasks.length > 0 &&
                          !completedTargets.has(target.id) && (
                            <Tooltip
                              title="Complete Probation"
                              id={`probation-target-complete-btn-tooltip-${targetSlug}`}
                              data-cy={`probation-target-complete-btn-tooltip-${targetSlug}`}
                            >
                              <Button
                                type={'primary'}
                                size="small"
                                className="flex-shrink-0 w-6 h-6 p-0 flex items-center justify-center"
                                icon={<CheckCircleOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (completedTargets.has(target.id)) {
                                    // handleUncompleteProbation(target);
                                  } else {
                                    handleCompleteProbation(target);
                                  }
                                }}
                                loading={
                                  updateProbationTargetMutation.isLoading
                                }
                                id={`probation-target-complete-btn-${targetSlug}`}
                                data-cy={`probation-target-complete-btn-${targetSlug}`}
                              ></Button>
                            </Tooltip>
                          )}
                      </Space>
                    </div>
                    <AccessGuard
                      permissions={[Permissions.CreateProbationTask]}
                      id={`probation-target-add-task-btn-guard-${targetSlug}`}
                      data-cy={`probation-target-add-task-btn-guard-${targetSlug}`}
                    >
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddTask(target.id);
                        }}
                        className="hidden sm:flex"
                        id={`probation-target-add-task-btn-${targetSlug}`}
                        data-cy={`probation-target-add-task-btn-${targetSlug}`}
                      >
                        Add Probation Task
                      </Button>
                    </AccessGuard>
                    {(() => {
                      const canEditTarget = AccessGuard.checkAccess({
                        permissions: [Permissions.UpdateProbationTarget],
                      });
                      const canEditTask = AccessGuard.checkAccess({
                        permissions: [Permissions.UpdateProbationTask],
                      });
                      const canDeleteTarget = AccessGuard.checkAccess({
                        permissions: [Permissions.DeleteProbationTarget],
                      });
                      const items = [
                        isMobile ? {
                          key: 'add-task',
                          label: 'Add Probation Task',
                          icon: <PlusOutlined />,
                          onClick: (e: any) => {
                            e?.domEvent?.stopPropagation?.();
                            handleAddTask(target.id);
                          },
                        } : null,
                        canEditTarget
                          ? {
                              key: 'edit-target',
                              label: 'Edit Probation Target',
                              icon: <EditOutlined />,
                              onClick: (e: any) => {
                                e?.domEvent?.stopPropagation?.();
                                handleEditTarget(target);
                              },
                            }
                          : null,
                        canEditTask
                          ? {
                              key: 'edit-task',
                              label: 'Edit Probation Task',
                              icon: <EditOutlined />,
                              onClick: (e: any) => {
                                e?.domEvent?.stopPropagation?.();
                                openTaskEditDrawer(target);
                              },
                            }
                          : null,
                        canDeleteTarget
                          ? {
                              key: 'delete-target',
                              label: 'Delete Probation Target',
                              icon: <DeleteOutlined />,
                              danger: true,
                              onClick: (e: any) => {
                                e?.domEvent?.stopPropagation?.();
                                handleDeleteTarget(target);
                              },
                            }
                          : null,
                      ].filter(Boolean) as any[];

                      if (!items.length) return null;

                      return (
                        <Dropdown
                          menu={{ items }}
                          trigger={['click']}
                          placement="bottomRight"
                          data-cy={`probation-target-actions-dropdown-${targetSlug}`}
                        >
                          <Button
                            size="small"
                            type="text"
                            className="flex items-center justify-center w-8 h-8 p-0 rounded-full hover:bg-gray-100"
                            onClick={(e) => e.stopPropagation()}
                            id={`probation-target-actions-dropdown-btn-${targetSlug}`}
                            data-cy={`probation-target-actions-dropdown-btn-${targetSlug}`}
                          >
                            <MoreOutlined
                              className="text-lg text-gray-600"
                              id={`probation-target-actions-dropdown-btn-icon-${targetSlug}`}
                              data-cy={`probation-target-actions-dropdown-btn-icon-${targetSlug}`}
                            />
                          </Button>
                        </Dropdown>
                      );
                    })()}
                  </div>
                </div>
              }
            >
              <div
                className="space-y-3 max-h-96 sm:max-h-72 overflow-y-auto scrollbar-hide pr-1"
                id={`probation-target-panel-body-${targetSlug}`}
                data-cy={`probation-target-panel-body-${targetSlug}`}
              >
                {/* Inline Task Panel */}
                <InlineTaskPanel
                  probationTargetId={target.id}
                  isVisible={showInlinePanel === target.id}
                  onClose={
                    isEditMode ? handleEditClose : handleCloseInlinePanel
                  }
                  onTaskAdded={handleTaskAdded}
                  onTaskUpdated={handleTaskUpdated}
                  existingTasks={target.probationTasks}
                  editMode={isEditMode}
                  taskToEdit={taskToEdit}
                  data-cy={`probation-target-inline-task-panel-${targetSlug}`}
                />

                {target.probationTasks.length > 0 ? (
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
                    id={`probation-target-tasks-grid-${targetSlug}`}
                    data-cy={`probation-target-tasks-grid-${targetSlug}`}
                  >
                    {target.probationTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={() => onToggleTaskComplete?.(task.id)}
                        onDelete={() => handleDeleteClick(task)}
                        onUpdateScore={onUpdateTaskScore || (() => {})}
                        onEdit={() => handleEditClick(task)}
                        data-cy={`probation-target-task-item-${targetSlug}-${task.id}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className="flex justify-center items-center py-8"
                    id={`probation-target-empty-tasks-wrapper-${targetSlug}`}
                    data-cy={`probation-target-empty-tasks-wrapper-${targetSlug}`}
                  >
                    <Empty
                      description="No tasks found for this probation target"
                      image={
                        <EmptyImage data-cy="probation-target-empty-tasks-image" />
                      }
                      data-cy={`probation-target-empty-tasks-${targetSlug}`}
                    />
                  </div>
                )}
              </div>
              <div
                className="flex justify-end mt-3 sm:mt-4 mr-0 sm:mr-4 px-2 sm:px-0"
                id={`probation-target-total-wrapper-${targetSlug}`}
                data-cy={`probation-target-total-wrapper-${targetSlug}`}
              >
                <div
                  className="text-[14px] font-bold text-gray-900"
                  id={`probation-target-total-score-${targetSlug}`}
                  data-cy={`probation-target-total-score-${targetSlug}`}
                >
                  Total: {totalScore.toFixed(2)}
                </div>
              </div>
            </Panel>
          );
        })}
      </Collapse>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div
            className="flex items-center"
            data-cy="probation-task-delete-modal-title"
          >
            <ExclamationCircleOutlined
              className="text-red-500 mr-2"
              id="probation-task-delete-modal-title-icon"
              data-cy="probation-task-delete-modal-title-icon"
            />
            Delete Task
          </div>
        }
        open={!!taskToDelete}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        data-cy="probation-task-delete-modal"
      >
        {taskToDelete && (
          <div
            id="probation-task-delete-modal-body"
            data-cy="probation-task-delete-modal-body"
          >
            <p
              id="probation-task-delete-modal-text"
              data-cy="probation-task-delete-modal-text"
            >
              Are you sure you want to delete this task?
            </p>
            <div
              className="mt-4 p-3 bg-gray-50 rounded"
              id="probation-task-delete-modal-details"
              data-cy="probation-task-delete-modal-details"
            >
              <p
                id="probation-task-delete-modal-task"
                data-cy="probation-task-delete-modal-task"
              >
                <strong
                  id="probation-task-delete-modal-task-strong"
                  data-cy="probation-task-delete-modal-task-strong"
                >
                  Task:
                </strong>{' '}
                {taskToDelete.taskName}
              </p>
              <p
                id="probation-task-delete-modal-assigned"
                data-cy="probation-task-delete-modal-assigned"
              >
                <strong
                  id="probation-task-delete-modal-assigned-strong"
                  data-cy="probation-task-delete-modal-assigned-strong"
                >
                  Assigned To:
                </strong>{' '}
                {`${taskToDelete.evaluatorUser?.firstName || ''} ${taskToDelete.evaluatorUser?.lastName || ''}`.trim() ||
                  'Unassigned'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Probation Tasks Drawer */}
      {targetForTaskEdit && (
        <CustomDrawerLayout
          open={isTaskDrawerOpen}
          onClose={closeTaskEditDrawer}
          modalHeader={
            <CustomDrawerHeader className="flex justify-start">
              Edit Tasks - {targetForTaskEdit.name}
            </CustomDrawerHeader>
          }
          width={isMobile ? '100%' : '45%'}
          footer={
            <div
              className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              id="probation-task-drawer-footer"
              data-cy="probation-task-drawer-footer"
            >
              <div
                className={`text-sm font-bold ${
                  drawerTotalWeight === 100
                    ? 'text-green-600'
                    : drawerTotalWeight > 100
                      ? 'text-red-600'
                      : 'text-orange-600'
                }`}
                id="probation-task-drawer-total-weight"
                data-cy="probation-task-drawer-total-weight"
              >
                Total Weight: {drawerTotalWeight}/100
              </div>
              <div
                className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto"
                id="probation-task-drawer-action-buttons"
                data-cy="probation-task-drawer-action-buttons"
              >
                <Button
                  onClick={closeTaskEditDrawer}
                  className="w-full sm:w-auto"
                  id="probation-task-drawer-cancel-btn"
                  data-cy="probation-task-drawer-cancel-btn"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  loading={createTaskSaveAllMutation.isLoading}
                  disabled={drawerTotalWeight !== 100}
                  onClick={handleDrawerSaveAll}
                  className="w-full sm:w-auto"
                  id="probation-task-drawer-save-btn"
                  data-cy="probation-task-drawer-save-btn"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          }
          data-cy="probation-task-drawer"
        >
          <div
            className="py-2"
            id="probation-task-drawer-body"
            data-cy="probation-task-drawer-body"
          >
            <Form
              form={drawerForm}
              layout="vertical"
              id="probation-task-drawer-form"
              data-cy="probation-task-drawer-form"
            >
              <Form.List name="tasks" data-cy="probation-task-drawer-list">
                {(fields, { add, remove }) => (
                  <>
                    <div
                      className="space-y-3 max-h-screen scrollbar-hide overflow-y-auto pr-2"
                      id="probation-task-drawer-list"
                      data-cy="probation-task-drawer-list"
                    >
                      {fields.map((field, index) => {
                        const fieldSlug = toSlug(`${field.key}-${index}`);
                        const isCompleted = drawerForm.getFieldValue([
                          'tasks',
                          index,
                          'isCompleted',
                        ]);
                        const hasId = drawerForm.getFieldValue([
                          'tasks',
                          index,
                          'id',
                        ]);
                        return (
                          <Card
                            key={field.key}
                            size="small"
                            className="bg-white border-gray-200"
                            id={`probation-task-drawer-card-${fieldSlug}`}
                            data-cy={`probation-task-drawer-card-${fieldSlug}`}
                          >
                            <div
                              className="flex items-center justify-between mb-2"
                              id={`probation-task-drawer-card-header-${fieldSlug}`}
                              data-cy={`probation-task-drawer-card-header-${fieldSlug}`}
                            >
                              <div
                                className="text-sm font-medium text-gray-700"
                                id={`probation-task-drawer-card-header-text-${fieldSlug}`}
                                data-cy={`probation-task-drawer-card-header-text-${fieldSlug}`}
                              >
                                Task {index + 1}
                              </div>
                              {!hasId && (
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => remove(field.name)}
                                  className="w-8 h-8 p-0 flex items-center justify-center"
                                  id={`probation-task-drawer-remove-btn-${fieldSlug}`}
                                  data-cy={`probation-task-drawer-remove-btn-${fieldSlug}`}
                                />
                              )}
                            </div>
                            <div
                              className="grid grid-cols-12 gap-3"
                              id={`probation-task-drawer-card-body-${fieldSlug}`}
                              data-cy={`probation-task-drawer-card-body-${fieldSlug}`}
                            >
                              <Form.Item
                                {...field}
                                name={[field.name, 'id']}
                                hidden
                                id={`probation-task-drawer-card-body-id-${fieldSlug}`}
                                data-cy={`probation-task-drawer-card-body-id-${fieldSlug}`}
                              >
                                <Input
                                  id={`probation-task-drawer-card-body-id-input-${fieldSlug}`}
                                  data-cy={`probation-task-drawer-card-body-id-input-${fieldSlug}`}
                                />
                              </Form.Item>
                              <Form.Item
                                {...field}
                                name={[field.name, 'isCompleted']}
                                hidden
                                id={`probation-task-drawer-card-body-is-completed-${fieldSlug}`}
                                data-cy={`probation-task-drawer-card-body-is-completed-${fieldSlug}`}
                              >
                                <Input
                                  id={`probation-task-drawer-card-body-is-completed-input-${fieldSlug}`}
                                  data-cy={`probation-task-drawer-card-body-is-completed-input-${fieldSlug}`}
                                />
                              </Form.Item>
                              <div
                                className="col-span-5"
                                id={`probation-task-drawer-card-body-task-name-wrapper-${fieldSlug}`}
                                data-cy={`probation-task-drawer-card-body-task-name-wrapper-${fieldSlug}`}
                              >
                                <Form.Item
                                  label="Task Name"
                                  name={[field.name, 'taskName']}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Please enter task name',
                                    },
                                  ]}
                                  className="mb-0"
                                  id={`probation-task-drawer-card-body-task-name-form-item-${fieldSlug}`}
                                  data-cy={`probation-task-drawer-card-body-task-name-form-item-${fieldSlug}`}
                                >
                                  <Input
                                    placeholder="Task Name"
                                    disabled={!!isCompleted}
                                    id={`probation-task-drawer-card-body-task-name-input-${fieldSlug}`}
                                    data-cy={`probation-task-drawer-card-body-task-name-input-${fieldSlug}`}
                                  />
                                </Form.Item>
                              </div>
                              <div
                                className="col-span-4"
                                id={`probation-task-drawer-card-body-approver-wrapper-${fieldSlug}`}
                                data-cy={`probation-task-drawer-card-body-approver-wrapper-${fieldSlug}`}
                              >
                                <Form.Item
                                  id={`probation-task-drawer-card-body-approver-form-item-${fieldSlug}`}
                                  label="Approver"
                                  name={[field.name, 'approverId']}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Please select an approver',
                                    },
                                  ]}
                                  className="mb-0"
                                >
                                  <Select
                                    placeholder="Select Approver"
                                    options={peopleOptions}
                                    showSearch
                                    optionFilterProp="label"
                                    disabled={!!isCompleted}
                                    id={`probation-task-drawer-card-body-approver-select-${fieldSlug}`}
                                    data-cy={`probation-task-drawer-card-body-approver-select-${fieldSlug}`}
                                  />
                                </Form.Item>
                              </div>
                              <div
                                className="col-span-3"
                                id={`probation-task-drawer-card-body-weight-wrapper-${fieldSlug}`}
                                data-cy={`probation-task-drawer-card-body-weight-wrapper-${fieldSlug}`}
                              >
                                <Form.Item
                                  label="Weight"
                                  name={[field.name, 'weight']}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Please enter weight',
                                    },
                                  ]}
                                  className="mb-0"
                                  id={`probation-task-drawer-card-body-weight-form-item-${fieldSlug}`}
                                  data-cy={`probation-task-drawer-card-body-weight-form-item-${fieldSlug}`}
                                >
                                  <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    placeholder="Weight"
                                    disabled={!!isCompleted}
                                    id={`probation-task-drawer-card-body-weight-input-${fieldSlug}`}
                                    data-cy={`probation-task-drawer-card-body-weight-input-${fieldSlug}`}
                                  />
                                </Form.Item>
                              </div>
                              <div
                                className="col-span-12"
                                id={`probation-task-drawer-card-body-description-wrapper-${fieldSlug}`}
                                data-cy={`probation-task-drawer-card-body-description-wrapper-${fieldSlug}`}
                              >
                                <Form.Item
                                  label="Description"
                                  name={[field.name, 'description']}
                                  className="mb-0"
                                  id={`probation-task-drawer-card-body-description-form-item-${fieldSlug}`}
                                  data-cy={`probation-task-drawer-card-body-description-form-item-${fieldSlug}`}
                                >
                                  <Input.TextArea
                                    rows={2}
                                    placeholder="Description (optional)"
                                    disabled={!!isCompleted}
                                    id={`probation-task-drawer-card-body-description-textarea-${fieldSlug}`}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                    <div
                      className="mt-3"
                      id="probation-task-drawer-add-button-wrapper"
                      data-cy="probation-task-drawer-add-button-wrapper"
                    >
                      <AccessGuard
                        permissions={[Permissions.CreateProbationTask]}
                        id="probation-task-drawer-add-button-guard"
                        data-cy="probation-task-drawer-add-button-guard"
                      >
                        <Button
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={() => add({})}
                          id="probation-task-drawer-add-button"
                          data-cy="probation-task-drawer-add-button"
                        >
                          Add New Task
                        </Button>
                      </AccessGuard>
                    </div>
                  </>
                )}
              </Form.List>
            </Form>
          </div>
        </CustomDrawerLayout>
      )}

      {/* Employment Type Update Modal */}
      <Modal
        title={
          <div
            className="flex items-center"
            id="probation-employment-modal-title"
            data-cy="probation-employment-modal-title"
          >
            <CheckCircleOutlined
              className="text-green-500 mr-2"
              id="probation-employment-modal-title-icon"
              data-cy="probation-employment-modal-title-icon"
            />
            Update Employment Type
          </div>
        }
        open={showEmploymentModal}
        onCancel={handleEmploymentModalCancel}
        footer={null}
        width={isMobile ? '95%' : 500}
        data-cy="probation-employment-modal"
      >
        <div
          className="py-4"
          id="probation-employment-modal-body"
          data-cy="probation-employment-modal-body"
        >
          <p
            className="mb-4 text-gray-600"
            id="probation-employment-modal-text"
            data-cy="probation-employment-modal-text"
          >
            Probation completed successfully! Please update the employment type
            for this employee.
          </p>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEmploymentTypeUpdate}
            id="probation-employment-form"
            data-cy="probation-employment-form"
          >
            <Form.Item
              name="employmentType"
              label="Employment Type"
              rules={[
                { required: true, message: 'Please select an employment type' },
              ]}
              id="probation-employment-type-form-item"
              data-cy="probation-employment-type-form-item"
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Select an employment type"
                options={employementType?.items?.map(
                  (employementType: any) => ({
                    value: employementType?.id,
                    label: `${employementType?.name ? employementType?.name : ''} `,
                  }),
                )}
                data-cy="probation-employment-type-select"
              />
            </Form.Item>
            <div
              className="flex justify-end space-x-2 mt-6"
              id="probation-employment-modal-actions"
              data-cy="probation-employment-modal-actions"
            >
              <Button
                onClick={handleEmploymentModalCancel}
                id="probation-employment-cancel-btn"
                data-cy="probation-employment-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                id="probation-employment-submit-btn"
                data-cy="probation-employment-submit-btn"
              >
                Update Employment Type
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Edit Probation Target Modal */}
      <Modal
        title={
          <div
            className="flex items-center"
            id="probation-edit-target-modal-title"
            data-cy="probation-edit-target-modal-title"
          >
            <EditOutlined
              className="text-blue-500 mr-2"
              id="probation-edit-target-modal-title-icon"
              data-cy="probation-edit-target-modal-title-icon"
            />
            Edit Probation Target
          </div>
        }
        open={showEditModal}
        onCancel={handleEditModalCancel}
        footer={null}
        width={isMobile ? '95%' : 400}
        data-cy="probation-edit-target-modal"
      >
        <div
          className="py-4"
          id="probation-edit-target-modal-body"
          data-cy="probation-edit-target-modal-body"
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditTargetSubmit}
            id="probation-edit-target-form"
            data-cy="probation-edit-target-form"
          >
            <Form.Item
              name="name"
              label="Probation Target Name"
              rules={[
                {
                  required: true,
                  message: 'Please enter probation target name',
                },
              ]}
              id="probation-edit-target-name-form-item"
              data-cy="probation-edit-target-name-form-item"
            >
              <Input
                placeholder="Enter probation target name"
                id="probation-edit-target-name-input"
                data-cy="probation-edit-target-name-input"
              />
            </Form.Item>
            <div
              className="flex justify-end space-x-2 mt-6"
              id="probation-edit-target-actions"
              data-cy="probation-edit-target-actions"
            >
              <Button
                onClick={handleEditModalCancel}
                id="probation-edit-target-cancel-btn"
                data-cy="probation-edit-target-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateProbationTargetMutation.isLoading}
                id="probation-edit-target-submit-btn"
                data-cy="probation-edit-target-submit-btn"
              >
                Update Target
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Delete Probation Target Confirmation Modal */}
      <Modal
        title={
          <div
            className="flex items-center"
            id="probation-delete-target-modal-title"
            data-cy="probation-delete-target-modal-title"
          >
            <ExclamationCircleOutlined
              className="text-red-500 mr-2"
              id="probation-delete-target-modal-title-icon"
              data-cy="probation-delete-target-modal-title-icon"
            />
            Delete Probation Target
          </div>
        }
        open={!!targetToDelete}
        onOk={handleDeleteTargetConfirm}
        onCancel={handleDeleteTargetCancel}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        data-cy="probation-delete-target-modal"
      >
        {targetToDelete && (
          <div
            id="probation-delete-target-modal-body"
            data-cy="probation-delete-target-modal-body"
          >
            <p
              id="probation-delete-target-modal-text"
              data-cy="probation-delete-target-modal-text"
            >
              Are you sure you want to delete this probation target?
            </p>
            <div
              className="mt-4 p-3 bg-gray-50 rounded"
              id="probation-delete-target-modal-details"
              data-cy="probation-delete-target-modal-details"
            >
              <p
                id="probation-delete-target-modal-name"
                data-cy="probation-delete-target-modal-name"
              >
                <strong
                  id="probation-delete-target-modal-name-strong"
                  data-cy="probation-delete-target-modal-name-strong"
                >
                  Target Name:
                </strong>{' '}
                {targetToDelete.name}
              </p>
              <p
                id="probation-delete-target-modal-employee"
                data-cy="probation-delete-target-modal-employee"
              >
                <strong
                  id="probation-delete-target-modal-employee-strong"
                  data-cy="probation-delete-target-modal-employee-strong"
                >
                  Employee:
                </strong>{' '}
                {`${targetToDelete.user.firstName} ${targetToDelete.user.lastName}`.trim()}
              </p>
              <p
                id="probation-delete-target-modal-tasks"
                data-cy="probation-delete-target-modal-tasks"
              >
                <strong
                  id="probation-delete-target-modal-tasks-strong"
                  data-cy="probation-delete-target-modal-tasks-strong"
                >
                  Tasks:
                </strong>{' '}
                {targetToDelete.probationTasks.length}
              </p>
            </div>
            <p
              className="mt-3 text-red-600 text-sm"
              id="probation-delete-target-modal-warning"
              data-cy="probation-delete-target-modal-warning"
            >
              This action cannot be undone and will delete all associated tasks.
            </p>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default ProbationTargetAccordion;
