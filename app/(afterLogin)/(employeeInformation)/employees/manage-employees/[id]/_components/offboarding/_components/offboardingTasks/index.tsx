'use client';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  Checkbox,
  Button,
  Avatar,
  Modal,
  Form,
  Input,
  Select,
  Row,
} from 'antd';
import {
  PlusOutlined,
  DownloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  Task,
  useOffboardingStore,
} from '@/store/uistate/features/offboarding';
import { AddTaskModal } from '../addTaskModal';
import OffboardingTemplate from '../offboardingTemplate';
import CertificateContent from '../certificateContent';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DeleteConfirmationPopover from '@/components/common/deleteConfirmationPopover';
import {
  useDeleteOffboardingItem,
  useUpdateOffboardingItem,
  useAddTerminationTasks,
} from '@/store/server/features/employees/offboarding/mutation';
import {
  useFetchOffboardingTasks,
  useFetchOffBoardingTasksTemplate,
  useFetchUserTerminationByUserId,
} from '@/store/server/features/employees/offboarding/queries';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  OffBoardingTasksUpdateStatus,
  EmployeeOffBoardingTasks,
} from '@/store/server/features/employees/offboarding/interface';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  useGetEmployee,
  useGetEmployees,
} from '@/store/server/features/employees/employeeManagment/queries';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import EmptyState from '@/components/empty';

const TEMPLATE_DROPPABLE_ID = 'template-tasks';
const EMPLOYEE_DROPPABLE_ID = 'employee-tasks';

const { TextArea } = Input;
const { Option } = Select;

interface Ids {
  id: string;
}

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

interface TemplateTaskItem {
  id?: string;
  title: string;
  description: string;
  approverId?: string;
}

function TemplateTaskDraggable({
  item,
  index,
}: {
  item: TemplateTaskItem;
  index: number;
}) {
  const id = `template-${item.id ?? index}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { type: 'template' as const, index, task: item },
    });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.45 : 1,
      }
    : { opacity: isDragging ? 0.45 : 1 };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing select-none transition-colors border ${
        isDragging
          ? 'drag-item-active'
          : 'border-[#E5E7EB] hover:border-[#1E40AF]/50'
      }`}
      id={`offboarding-template-draggable-${toSlug(item.id ?? index)}`}
      data-cy={`offboarding-template-draggable-${toSlug(item.id ?? index)}`}
    >
      <div
        className="flex items-center gap-2"
        data-cy={`offboarding-template-draggable-row-${toSlug(item.id ?? index)}`}
      >
        <DragIndicatorIcon
          style={{ fontSize: 16 }}
          className="text-gray-300 shrink-0"
          aria-hidden
        />
        <div
          data-cy={`offboarding-template-draggable-text-${toSlug(item.id ?? index)}`}
        >
          <div
            className="font-medium text-sm text-gray-800"
            data-cy={`offboarding-template-draggable-title-${toSlug(item.id ?? index)}`}
          >
            {item.title}
          </div>
          {item.description && (
            <div
              className="text-xs text-gray-500 mt-1"
              data-cy={`offboarding-template-draggable-description-${toSlug(item.id ?? index)}`}
            >
              {item.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmployeeTaskDraggable({
  task,
  children,
}: {
  task: Task;
  children: React.ReactNode;
}) {
  const taskSlug = toSlug(task?.id);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { type: 'employee' as const, task },
    });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.45 : 1,
      }
    : { opacity: isDragging ? 0.45 : 1 };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-lg p-4 mb-3 cursor-grab active:cursor-grabbing select-none transition-colors border ${
        isDragging
          ? 'drag-item-active'
          : 'border-[#E5E7EB] hover:border-[#1E40AF]/50'
      }`}
      id={`offboarding-task-${taskSlug}`}
      data-cy={`offboarding-task-${taskSlug}`}
    >
      <div
        className="flex items-center gap-2 w-full"
        data-cy={`offboarding-task-row-${taskSlug}`}
      >
        <DragIndicatorIcon
          style={{ fontSize: 16 }}
          className="text-gray-300 shrink-0"
          aria-hidden
        />
        <div
          className="flex flex-1 justify-between items-center min-w-0"
          data-cy={`offboarding-task-content-${taskSlug}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function DroppableArea({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`${className ?? ''} rounded-lg border-2 transition-all ${
        isOver
          ? 'drop-zone-active'
          : 'border-dashed border-[#D1D5DB] hover:border-[#1E40AF]/40'
      }`}
      style={{ minHeight: 120, padding: '8px' }}
      data-cy={`offboarding-droppable-${id}`}
    >
      {children}
    </div>
  );
}

const OffboardingTasksTemplate: React.FC<Ids> = ({ id }) => {
  const { toggleTask, setIsAddTaskModalVisible } = useOffboardingStore();

  const { mutate: offboardingTaskDelete, isLoading: isDeleting } =
    useDeleteOffboardingItem();

  const [deletePopoverOpen, setDeletePopoverOpen] = useState<
    Record<string, boolean>
  >({});

  const handleDeleteConfirm = (taskId: string) => {
    offboardingTaskDelete(taskId, {
      onSuccess: () => {
        setDeletePopoverOpen((prev) => ({ ...prev, [taskId]: false }));
      },
    });
  };

  const handleDeleteCancel = (taskId: string) => {
    setDeletePopoverOpen((prev) => ({ ...prev, [taskId]: false }));
  };

  const [editForm] = Form.useForm();
  const [taskBeingEdited, setTaskBeingEdited] = useState<Task | null>(null);

  const {
    mutate: updateOffboardingItem,
    isLoading: isUpdatingOffboardingItem,
  } = useUpdateOffboardingItem();
  const { mutate: createTaskList } = useAddTerminationTasks();
  const { userId } = useAuthenticationStore();

  const {
    data: offboardingTasks,
    isLoading,
    error,
  } = useFetchOffboardingTasks(id);
  const { data: templateTasks, isLoading: isTemplateLoading } =
    useFetchOffBoardingTasksTemplate();
  const { data: offboardingTermination } = useFetchUserTerminationByUserId(id);
  const { data: employeeData } = useGetEmployee(id);
  const { data: users } = useGetEmployees();

  useEffect(() => {
    if (taskBeingEdited) {
      editForm.setFieldsValue({
        title: taskBeingEdited.title,
        description: taskBeingEdited.description ?? '',
        approverId: taskBeingEdited.approverId || undefined,
      });
    }
  }, [taskBeingEdited, editForm]);

  const closeEditModal = () => {
    setTaskBeingEdited(null);
    editForm.resetFields();
  };

  const handleEditTaskSubmit = (values: {
    title: string;
    description?: string;
    approverId: string;
  }) => {
    if (!taskBeingEdited) return;
    updateOffboardingItem(
      {
        id: taskBeingEdited.id,
        title: values.title,
        description: values.description ?? '',
        approverId: values.approverId,
        employeTerminationId: taskBeingEdited.employeTerminationId,
        isCompleted: taskBeingEdited.isCompleted,
        ...(taskBeingEdited.completedDate
          ? { completedDate: taskBeingEdited.completedDate }
          : {}),
      },
      { onSuccess: closeEditModal },
    );
  };

  const handleAddTaskClick = () => setIsAddTaskModalVisible(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || over.id !== EMPLOYEE_DROPPABLE_ID) return;
      const data = active.data.current;
      if (data?.type !== 'template' || !data.task) return;
      const templateTask = data.task as TemplateTaskItem;
      if (!offboardingTermination?.id) {
        NotificationMessage.warning({
          message: 'Cannot add task',
          description: 'Employee termination record not found.',
        });
        return;
      }
      const payload: EmployeeOffBoardingTasks = {
        title: templateTask.title,
        description: templateTask.description ?? '',
        approverId: templateTask.approverId ?? '',
        employeTerminationId: offboardingTermination.id,
      };
      createTaskList([payload]);
    },
    [offboardingTermination, createTaskList],
  );

  const handelCehckBox = (task: any) => {
    const data: OffBoardingTasksUpdateStatus = {
      id: '',
      isCompleted: false,
    };
    data['id'] = task.id;
    data['isCompleted'] = !task.isCompleted;

    updateOffboardingItem(data);
  };

  if (isLoading)
    return <div data-cy="offboarding-tasks-loading">Loading...</div>;
  if (error)
    return <div data-cy="offboarding-tasks-error">Error loading tasks</div>;

  // const resignationSubmittedDate =
  //   employeeData?.employeeJobInformation[0]?.resignationSubmittedDate;

  const resignationDate = employeeData.employeeJobInformation.find(
    (job: any) => job.isPositionActive === true,
  )?.resignationSubmittedDate;

  // Check if all tasks are completed
  const allTasksCompleted =
    offboardingTasks && offboardingTasks.length > 0
      ? offboardingTasks.every((task: Task) => task.isCompleted)
      : false;

  const templateList = (templateTasks ?? []) as TemplateTaskItem[];
  const employeeTaskList = (offboardingTasks ?? []) as Task[];

  return (
    <div
      className="p-2 max-h-[418px] overflow-y-scroll"
      id="offboarding-tasks-container"
      data-cy="offboarding-tasks-container"
    >
      <style data-cy="offboarding-tasks-dnd-style" jsx global>{`
        @keyframes drag-item-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(30, 64, 175, 0.45);
          }
          50% {
            box-shadow: 0 0 0 5px rgba(30, 64, 175, 0);
          }
        }
        .drag-item-active {
          border-color: #1e40af !important;
          animation: drag-item-pulse 1s ease-in-out infinite;
        }
        @keyframes drop-zone-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(30, 64, 175, 0.35);
          }
          50% {
            box-shadow: 0 0 0 7px rgba(30, 64, 175, 0);
          }
        }
        .drop-zone-active {
          border-color: #1e40af !important;
          border-style: solid !important;
          animation: drop-zone-pulse 1s ease-in-out infinite;
        }
      `}</style>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div
          className="flex flex-col sm:flex-row gap-4 w-full"
          data-cy="offboarding-tasks-dnd-layout"
        >
          {/* Left panel: Core Offboarding Tasks */}
          <Card
            bordered={false}
            className="flex-1 min-w-0 relative z-10 overflow-visible [&_.ant-card-body]:overflow-visible rounded-xl"
            style={{ background: '#F9FAFB', boxShadow: 'none' }}
            id="core-offboarding-tasks-card"
            data-cy="core-offboarding-tasks-card"
            headStyle={{
              borderBottom: '1px solid #F3F4F6',
              background: '#F9FAFB',
            }}
            title={
              <div data-cy="core-offboarding-tasks-card-title">
                <p
                  className="text-sm font-semibold text-gray-800 m-0"
                  data-cy="core-offboarding-tasks-card-heading"
                >
                  Core Offboarding Tasks
                </p>
                <p
                  className="text-xs font-normal text-gray-400 m-0 mt-0.5"
                  data-cy="core-offboarding-tasks-card-subheading"
                >
                  Drag a task to the employee board
                </p>
              </div>
            }
          >
            <DroppableArea
              id={TEMPLATE_DROPPABLE_ID}
              className="rounded transition-colors"
            >
              {isTemplateLoading ? (
                <div
                  className="py-4 text-center text-gray-500"
                  data-cy="core-tasks-loading"
                >
                  Loading...
                </div>
              ) : templateList.length === 0 ? (
                <div
                  className="py-4 text-center text-gray-500"
                  data-cy="core-tasks-empty"
                >
                  No template tasks
                </div>
              ) : (
                templateList.map((item: TemplateTaskItem, index: number) => (
                  <TemplateTaskDraggable
                    key={`template-${item.id ?? index}`}
                    item={item}
                    index={index}
                  />
                ))
              )}
            </DroppableArea>
          </Card>

          {/* Right panel: Off-boarding Tasks */}
          <Card
            bordered={false}
            className="flex-1 min-w-0 relative z-0 rounded-xl"
            style={{ background: '#F9FAFB', boxShadow: 'none' }}
            id="offboarding-tasks-card"
            data-cy="offboarding-tasks-card"
            headStyle={{
              borderBottom: '1px solid #F3F4F6',
              background: '#F9FAFB',
            }}
            title={
              <div data-cy="offboarding-tasks-card-title">
                <p
                  className="text-sm font-semibold text-gray-800 m-0"
                  data-cy="offboarding-tasks-card-heading"
                >
                  Off-boarding Tasks
                </p>
                <p
                  className="text-xs font-normal text-gray-400 m-0 mt-0.5"
                  data-cy="offboarding-tasks-card-subheading"
                >
                  Drop tasks here or add manually
                </p>
              </div>
            }
            extra={
              <div
                className="flex flex-wrap gap-2 items-center"
                id="offboarding-tasks-actions"
                data-cy="offboarding-tasks-actions"
              >
                <AccessGuard
                  permissions={[Permissions.AddOffloadingTasks]}
                  id="offboarding-add-task-guard"
                  data-cy="offboarding-add-task-guard"
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddTaskClick}
                    disabled={resignationDate === null}
                    id="offboarding-add-task-btn"
                    data-cy="offboarding-add-task-btn"
                  >
                    <span
                      className="hidden sm:inline"
                      id="offboarding-add-task-btn-text"
                      data-cy="offboarding-add-task-btn-text"
                    >
                      Add Task
                    </span>
                  </Button>
                </AccessGuard>
                {allTasksCompleted && (
                  <Button
                    type="primary"
                    icon={
                      <DownloadOutlined
                        id="offboarding-download-certificate-icon"
                        data-cy="offboarding-download-certificate-icon"
                      />
                    }
                    onClick={async () => {
                      try {
                        const certificateElement = document.getElementById(
                          'certificate-template',
                        );
                        if (!certificateElement) {
                          alert(
                            'Certificate template not found. Please try again.',
                          );
                          return;
                        }
                        const canvas = await html2canvas(certificateElement, {
                          scale: 2,
                          useCORS: true,
                          allowTaint: true,
                          backgroundColor: '#ffffff',
                        });
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF('p', 'mm', 'a4');
                        const imgWidth = 210;
                        const pageHeight = 295;
                        const imgHeight =
                          (canvas.height * imgWidth) / canvas.width;
                        let heightLeft = imgHeight;
                        let position = 0;
                        pdf.addImage(
                          imgData,
                          'PNG',
                          0,
                          position,
                          imgWidth,
                          imgHeight,
                        );
                        heightLeft -= pageHeight;
                        while (heightLeft >= 0) {
                          position = heightLeft - imgHeight;
                          pdf.addPage();
                          pdf.addImage(
                            imgData,
                            'PNG',
                            0,
                            position,
                            imgWidth,
                            imgHeight,
                          );
                          heightLeft -= pageHeight;
                        }
                        pdf.save(
                          `clearance-certificate-${new Date().toISOString().split('T')[0]}.pdf`,
                        );
                      } catch (err) {
                        alert('Error generating PDF. Please try again.');
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                    id="offboarding-download-certificate-btn"
                    data-cy="offboarding-download-certificate-btn"
                  >
                    <span
                      className="hidden sm:inline"
                      id="offboarding-download-certificate-btn-text"
                      data-cy="offboarding-download-certificate-btn-text"
                    >
                      Download Certificate
                    </span>
                  </Button>
                )}
              </div>
            }
          >
            <DroppableArea
              id={EMPLOYEE_DROPPABLE_ID}
              className="rounded transition-colors min-h-[200px]"
            >
              {employeeTaskList.length > 0 ? (
                employeeTaskList.map((task: Task) => {
                  const taskSlug = toSlug(task?.id);
                  return (
                    <EmployeeTaskDraggable key={task.id} task={task}>
                      <div
                        className="flex flex-wrap gap-2"
                        id={`offboarding-task-info-${taskSlug}`}
                        data-cy={`offboarding-task-info-${taskSlug}`}
                      >
                        <Checkbox
                          onClick={() => handelCehckBox(task)}
                          checked={task?.isCompleted}
                          onChange={() => toggleTask(task?.id)}
                          className="mr-3 [&_.ant-checkbox-checked]:bg-blue [&_.ant-checkbox-checked]:border-blue"
                          disabled={userId !== task.approverId}
                          id={`offboarding-task-checkbox-${taskSlug}`}
                          data-cy={`offboarding-task-checkbox-${taskSlug}`}
                        />
                        <div
                          data-cy="offboarding-task-info-title-wrapper"
                          className="flex flex-col gap-2"
                        >
                          <span
                            className={` text-sm font-normal ${
                              task?.isCompleted
                                ? 'line-through text-gray-500'
                                : 'text-black'
                            }`}
                            id={`offboarding-task-title-${taskSlug}`}
                            data-cy={`offboarding-task-title-${taskSlug}`}
                          >
                            {task.title}
                          </span>
                          {task.approver && (
                            <span
                              className="flex items-center gap-2 text-sm text-gray-500"
                              data-cy={`offboarding-task-approver-${taskSlug}`}
                            >
                              <Avatar
                                size="small"
                                icon={<UserOutlined />}
                                className="flex-shrink-0 "
                              />
                              <span
                                data-cy="offboarding-task-approver-name-wrapper"
                                className="text-xs font-normal text-[#949494]"
                              >
                                {task.approver.firstName ||
                                task.approver.lastName
                                  ? `${task.approver.firstName || ''} ${task.approver.middleName || ''} ${task.approver.lastName || ''}`.trim()
                                  : 'Approver Person'}
                              </span>
                            </span>
                          )}
                          {task.isCompleted &&
                            task.approverId &&
                            task.completedDate && (
                              <span
                                className="ml-2 text-sm text-gray-500"
                                id={`offboarding-task-completed-${taskSlug}`}
                                data-cy={`offboarding-task-completed-${taskSlug}`}
                              >
                                Completed by {task.approverId} on{' '}
                                {task.completedDate}
                              </span>
                            )}
                          {!task.isCompleted && task.completedDate && (
                            <span
                              className="ml-2 text-sm text-gray-500"
                              id={`offboarding-task-due-${taskSlug}`}
                              data-cy={`offboarding-task-due-${taskSlug}`}
                            >
                              Due: {task.completedDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        id={`offboarding-task-actions-${taskSlug}`}
                        data-cy={`offboarding-task-actions-${taskSlug}`}
                        className="flex items-center gap-2"
                      >
                        <AccessGuard
                          permissions={[Permissions.AddOffloadingTasks]}
                          id={`offboarding-task-edit-guard-${taskSlug}`}
                          data-cy={`offboarding-task-edit-guard-${taskSlug}`}
                        >
                          <Button
                            type="default"
                            size="small"
                            id={`offboarding-task-edit-btn-${taskSlug}`}
                            data-cy={`offboarding-task-edit-btn-${taskSlug}`}
                            className="border border-[#D9D9D9] !h-8 !w-8 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setTaskBeingEdited(task);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <EditOutlinedIcon className="text-base" />
                          </Button>
                        </AccessGuard>

                        <DeleteConfirmationPopover
                          open={deletePopoverOpen[task.id] || false}
                          onCancel={() => handleDeleteCancel(task.id)}
                          onConfirm={() => handleDeleteConfirm(task.id)}
                          message="Are you sure you want to permanently delete this Task?"
                          loading={isDeleting}
                          id={`offboarding-delete-modal-${taskSlug}`}
                          data-cy={`offboarding-delete-modal-${taskSlug}`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletePopoverOpen((prev) => ({
                                ...prev,
                                [task.id]: true,
                              }));
                            }}
                            className="border border-[#ff8384] h-8 w-8 text-[#ff8384] rounded-lg inline-flex items-center justify-center bg-white hover:bg-gray-50"
                            id={`offboarding-task-delete-btn-${taskSlug}`}
                            data-cy={`offboarding-task-delete-btn-${taskSlug}`}
                          >
                            <DeleteOutlineOutlinedIcon className="text-base" />
                          </button>
                        </DeleteConfirmationPopover>
                      </div>
                    </EmployeeTaskDraggable>
                  );
                })
              ) : (
                <div
                  className="flex justify-center items-center py-4"
                  id="offboarding-tasks-empty-wrapper"
                  data-cy="offboarding-tasks-empty-wrapper"
                >
                  <EmptyState />
                </div>
              )}
            </DroppableArea>
            <AddTaskModal id={id} data-cy="offboarding-add-task-modal" />

            <Modal
              title="Edit Task"
              centered
              open={!!taskBeingEdited}
              onCancel={closeEditModal}
              footer={false}
              destroyOnClose
              data-cy="offboarding-edit-task-modal"
            >
              <Form
                form={editForm}
                layout="vertical"
                onFinish={handleEditTaskSubmit}
                disabled={isUpdatingOffboardingItem}
                requiredMark={false}
                id="offboarding-edit-task-form"
                data-cy="offboarding-edit-task-form"
              >
                <div
                  data-cy="offboarding-edit-task-form-items"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <Form.Item
                    label="Task Name"
                    name="title"
                    rules={[
                      { required: true, message: 'Please enter a task name' },
                    ]}
                    data-cy="offboarding-edit-task-title-item"
                  >
                    <Input
                      placeholder="Task Name"
                      className="h-10"
                      id="offboarding-edit-task-title-input"
                      data-cy="offboarding-edit-task-title-input"
                    />
                  </Form.Item>
                  <Form.Item
                    label="Approver"
                    name="approverId"
                    rules={[
                      { required: true, message: 'Please select approver' },
                    ]}
                    data-cy="offboarding-edit-task-approver-item"
                  >
                    <Select
                      placeholder="Search and select approver"
                      allowClear
                      showSearch
                      filterOption={(input, option) => {
                        const user = users?.items?.find(
                          (u: { id: string }) => u.id === option?.value,
                        );
                        if (!user) return false;
                        const fullName =
                          `${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`
                            .trim()
                            .toLowerCase();
                        return fullName.includes(input.toLowerCase());
                      }}
                      optionFilterProp="children"
                      className="h-10"
                      id="offboarding-edit-task-approver-select"
                      data-cy="offboarding-edit-task-approver-select"
                    >
                      {users?.items?.map(
                        (user: {
                          id: string;
                          firstName?: string;
                          middleName?: string;
                          lastName?: string;
                        }) => (
                          <Option key={user.id} value={user.id}>
                            {`${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`.trim()}
                          </Option>
                        ),
                      )}
                    </Select>
                  </Form.Item>
                </div>
                <Form.Item
                  label={
                    <span data-cy="offboarding-edit-task-description-label">
                      Description{' '}
                      <span
                        data-cy="offboarding-edit-task-description-label-optional"
                        className="text-gray-400 font-normal"
                      >
                        (optional)
                      </span>
                    </span>
                  }
                  name="description"
                  data-cy="offboarding-edit-task-description-item"
                >
                  <TextArea
                    className="h-[52px]"
                    allowClear
                    placeholder="Description (optional)"
                    id="offboarding-edit-task-description-textarea"
                    data-cy="offboarding-edit-task-description-textarea"
                  />
                </Form.Item>
                <Form.Item data-cy="offboarding-edit-task-actions">
                  <Row className="flex justify-end gap-3 mt-3">
                    <Button
                      type="default"
                      className="border border-[#D9D9D9] !h-8 font-normal"
                      htmlType="button"
                      onClick={closeEditModal}
                      disabled={isUpdatingOffboardingItem}
                      id="offboarding-edit-task-cancel-btn"
                      data-cy="offboarding-edit-task-cancel-btn"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isUpdatingOffboardingItem}
                      className="!h-8 font-normal"
                      id="offboarding-edit-task-submit-btn"
                      data-cy="offboarding-edit-task-submit-btn"
                    >
                      Save
                    </Button>
                  </Row>
                </Form.Item>
              </Form>
            </Modal>
          </Card>
        </div>
      </DndContext>
      <OffboardingTemplate id={id} data-cy="offboarding-template" />

      <div
        style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
        id="offboarding-certificate-hidden-wrapper"
        data-cy="offboarding-certificate-hidden-wrapper"
      >
        <CertificateContent
          offboardingTasks={offboardingTasks}
          employeeData={employeeData}
          data-cy="offboarding-certificate-content"
        />
      </div>
    </div>
  );
};

export default OffboardingTasksTemplate;
