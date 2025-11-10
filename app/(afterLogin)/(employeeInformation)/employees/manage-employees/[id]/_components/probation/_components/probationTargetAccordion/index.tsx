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
import { MdEdit } from 'react-icons/md';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Panel } = Collapse;
const { Text } = Typography;

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

  return (
    <div className="rounded-lg py-1 px-4 mb-3 border border-gray-200 hover:shadow-sm transition-shadow ">
      <div className="flex md:flex-row flex-col md:items-center justify-between">
        <div className="flex items-center flex-1">
          <Checkbox
            checked={task?.isCompleted}
            onChange={handleCheckBox}
            className="mr-3 flex-shrink-0"
            disabled={userId !== task.evaluator}
          />

          <div className="flex flex-col min-w-0">
            <div
              className={`text-sm font-medium ${task?.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}
            >
              {task.taskName}
            </div>

            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2 flex-shrink-0">
                {task.evaluatorUser?.profileImage ? (
                  <Image
                    src={task.evaluatorUser.profileImage}
                    alt="avatar"
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  getInitials(
                    task.evaluatorUser?.firstName,
                    task.evaluatorUser?.lastName,
                  )
                )}
              </div>
              <span className="text-sm text-gray-700 truncate">
                {`${task.evaluatorUser?.firstName || ''} ${task.evaluatorUser?.lastName || ''}`.trim() ||
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
            {task.isCompleted && task.evaluationScore == '0.00' && (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Score"
                  value={scoreInput}
                  onChange={handleScoreChange}
                  className="w-20 h-8 text-center text-sm"
                  size="small"
                  disabled={task.isCompleted && userId !== task.evaluator}
                />
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={handleScoreSubmit}
                  className="w-6 h-6 p-0 flex items-center justify-center"
                  disabled={task.isCompleted && userId !== task.evaluator}
                />
              </div>
            )}
            {task.isCompleted && (
              <div className="text-sm font-medium">
                <span className="text-gray-500">Score:</span>{' '}
                <strong>{task.evaluationScore}</strong>
              </div>
            )}
          </div>
          <AccessGuard permissions={[Permissions.UpdateProbationTask]}>
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              className="flex-shrink-0 w-6 h-6 p-0 flex items-center justify-center"
              onClick={() => {
                onEdit(task);
              }}
            />
          </AccessGuard>

          <AccessGuard permissions={[Permissions.DeleteProbationTask]}>
            <Button
              onClick={onDelete}
              danger
              size="small"
              icon={<DeleteOutlined />}
              className="flex-shrink-0 w-6 h-6 p-0 flex items-center justify-center"
            />
          </AccessGuard>
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
      <Card className="w-full">
        <div className="flex justify-center items-center py-8">
          <Empty
            description="No probation targets found"
            image={<EmptyImage />}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card bodyStyle={{ padding: 0 }} className="w-full p-2 border-none">
      <Collapse
        defaultActiveKey={probationTargets.map((target) => target.id)}
        size="large"
      >
        {probationTargets.map((target) => {
          const totalScore = calculateTotalScore(target.probationTasks);
          const completedTasks = target.probationTasks.filter(
            (task) => task.isCompleted,
          ).length;

          return (
            <Panel
              key={target.id}
              header={
                <div
                  className="flex md:flex-row flex-col items-start md:items-center justify-between w-full pr-0 gap-2"
                  style={{ padding: 0 }} // Ensures no padding in the header container
                >
                  <div className="flex items-center">
                    <Avatar
                      size="default"
                      src={target.user.profileImage}
                      icon={<UserOutlined />}
                      className="mr-3"
                    >
                      {!target.user.profileImage &&
                        getInitials(
                          target.user.firstName,
                          target.user.lastName,
                        )}
                    </Avatar>
                    <div className="flex flex-col">
                      <Text className="mb-0 text-md font-bold">
                        {target.name}
                      </Text>
                      <Text className="text-gray-600">
                        {`${target.user.firstName} ${target.user.middleName} ${target.user.lastName}`.trim()}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <Space>
                        {completedTargets.has(target.id) && (
                          <Tag
                            className="cursor-pointer"
                            onClick={() => handleUncompleteProbation(target)}
                            color="green"
                          >
                            ✓ Completed
                          </Tag>
                        )}

                        {completedTasks === target.probationTasks.length &&
                          target.probationTasks.length > 0 &&
                          !completedTargets.has(target.id) && (
                            <Tooltip title="Complete Probation">
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
                              ></Button>
                            </Tooltip>
                          )}
                      </Space>
                    </div>
                    {target.probationTasks.length === 0 && (
                      <Tooltip title="Add Probation Task">
                        <AccessGuard
                          permissions={[Permissions.CreateProbationTask]}
                        >
                          <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddTask(target.id);
                            }}
                            className="flex-shrink-0 w-6 h-6 p-0 flex items-center justify-center"
                          />
                        </AccessGuard>
                      </Tooltip>
                    )}
                    {(() => {
                      const canEditTarget = AccessGuard.checkAccess({
                        permissions: [Permissions.UpdateProbationTarget],
                      });
                      const canEditTask = AccessGuard.checkAccess({
                        permissions: [Permissions.UpdateProbationTask],
                      });
                      const items = [
                        canEditTarget
                          ? {
                              key: 'edit-target',
                              label: 'Edit Probation Target',
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
                              onClick: (e: any) => {
                                e?.domEvent?.stopPropagation?.();
                                openTaskEditDrawer(target);
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
                        >
                          <Button
                            size="small"
                            className="flex items-center w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MdEdit className="mr-1" />
                            <DownOutlined />
                          </Button>
                        </Dropdown>
                      );
                    })()}

                    <Tooltip title="Delete Probation Target">
                      <AccessGuard
                        permissions={[Permissions.DeleteProbationTarget]}
                      >
                        <Button
                          type="default"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTarget(target);
                          }}
                          className="flex-shrink-0 w-6 h-6 p-0 flex items-center justify-center text-red-600 hover:text-red-800"
                        />
                      </AccessGuard>
                    </Tooltip>
                  </div>
                </div>
              }
            >
              <div className="space-y-3 max-h-96 sm:max-h-72 overflow-y-auto scrollbar-hide pr-1">
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
                />

                {target.probationTasks.length > 0 ? (
                  target.probationTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={() => onToggleTaskComplete?.(task.id)}
                      onDelete={() => handleDeleteClick(task)}
                      onUpdateScore={onUpdateTaskScore || (() => {})}
                      onEdit={() => handleEditClick(task)}
                    />
                  ))
                ) : (
                  <div className="flex justify-center items-center py-8">
                    <Empty
                      description="No tasks found for this probation target"
                      image={<EmptyImage />}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-3 sm:mt-4 mr-0 sm:mr-4 px-2 sm:px-0">
                <div className="text-[14px] font-bold text-gray-900">
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
          <div className="flex items-center">
            <ExclamationCircleOutlined className="text-red-500 mr-2" />
            Delete Task
          </div>
        }
        open={!!taskToDelete}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        {taskToDelete && (
          <div>
            <p>Are you sure you want to delete this task?</p>
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p>
                <strong>Task:</strong> {taskToDelete.taskName}
              </p>
              <p>
                <strong>Assigned To:</strong>{' '}
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
            <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div
                className={`text-sm font-bold ${
                  drawerTotalWeight === 100
                    ? 'text-green-600'
                    : drawerTotalWeight > 100
                      ? 'text-red-600'
                      : 'text-orange-600'
                }`}
              >
                Total Weight: {drawerTotalWeight}/100
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  onClick={closeTaskEditDrawer}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  loading={createTaskSaveAllMutation.isLoading}
                  disabled={drawerTotalWeight !== 100}
                  onClick={handleDrawerSaveAll}
                  className="w-full sm:w-auto"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          }
        >
          <div className="py-2">
            <Form form={drawerForm} layout="vertical">
              <Form.List name="tasks">
                {(fields, { add, remove }) => (
                  <>
                    <div className="space-y-3 max-h-screen scrollbar-hide overflow-y-auto pr-2">
                      {fields.map((field, index) => {
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
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium text-gray-700">
                                Task {index + 1}
                              </div>
                              {!hasId && (
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => remove(field.name)}
                                  className="w-8 h-8 p-0 flex items-center justify-center"
                                />
                              )}
                            </div>
                            <div className="grid grid-cols-12 gap-3">
                              <Form.Item
                                {...field}
                                name={[field.name, 'id']}
                                hidden
                              >
                                <Input />
                              </Form.Item>
                              <Form.Item
                                {...field}
                                name={[field.name, 'isCompleted']}
                                hidden
                              >
                                <Input />
                              </Form.Item>
                              <div className="col-span-5">
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
                                >
                                  <Input
                                    placeholder="Task Name"
                                    disabled={!!isCompleted}
                                  />
                                </Form.Item>
                              </div>
                              <div className="col-span-4">
                                <Form.Item
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
                                  />
                                </Form.Item>
                              </div>
                              <div className="col-span-3">
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
                                >
                                  <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    placeholder="Weight"
                                    disabled={!!isCompleted}
                                  />
                                </Form.Item>
                              </div>
                              <div className="col-span-12">
                                <Form.Item
                                  label="Description"
                                  name={[field.name, 'description']}
                                  className="mb-0"
                                >
                                  <Input.TextArea
                                    rows={2}
                                    placeholder="Description (optional)"
                                    disabled={!!isCompleted}
                                  />
                                </Form.Item>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                    <div className="mt-3">
                      <AccessGuard
                        permissions={[Permissions.CreateProbationTask]}
                      >
                        <Button
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={() => add({})}
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
          <div className="flex items-center">
            <CheckCircleOutlined className="text-green-500 mr-2" />
            Update Employment Type
          </div>
        }
        open={showEmploymentModal}
        onCancel={handleEmploymentModalCancel}
        footer={null}
        width={isMobile ? '95%' : 500}
      >
        <div className="py-4">
          <p className="mb-4 text-gray-600">
            Probation completed successfully! Please update the employment type
            for this employee.
          </p>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEmploymentTypeUpdate}
          >
            <Form.Item
              name="employmentType"
              label="Employment Type"
              rules={[
                { required: true, message: 'Please select an employment type' },
              ]}
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
              />
            </Form.Item>
            <div className="flex justify-end space-x-2 mt-6">
              <Button onClick={handleEmploymentModalCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Update Employment Type
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Edit Probation Target Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <EditOutlined className="text-blue-500 mr-2" />
            Edit Probation Target
          </div>
        }
        open={showEditModal}
        onCancel={handleEditModalCancel}
        footer={null}
        width={isMobile ? '95%' : 400}
      >
        <div className="py-4">
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditTargetSubmit}
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
            >
              <Input placeholder="Enter probation target name" />
            </Form.Item>
            <div className="flex justify-end space-x-2 mt-6">
              <Button onClick={handleEditModalCancel}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateProbationTargetMutation.isLoading}
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
          <div className="flex items-center">
            <ExclamationCircleOutlined className="text-red-500 mr-2" />
            Delete Probation Target
          </div>
        }
        open={!!targetToDelete}
        onOk={handleDeleteTargetConfirm}
        onCancel={handleDeleteTargetCancel}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        {targetToDelete && (
          <div>
            <p>Are you sure you want to delete this probation target?</p>
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p>
                <strong>Target Name:</strong> {targetToDelete.name}
              </p>
              <p>
                <strong>Employee:</strong>{' '}
                {`${targetToDelete.user.firstName} ${targetToDelete.user.lastName}`.trim()}
              </p>
              <p>
                <strong>Tasks:</strong> {targetToDelete.probationTasks.length}
              </p>
            </div>
            <p className="mt-3 text-red-600 text-sm">
              This action cannot be undone and will delete all associated tasks.
            </p>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default ProbationTargetAccordion;
