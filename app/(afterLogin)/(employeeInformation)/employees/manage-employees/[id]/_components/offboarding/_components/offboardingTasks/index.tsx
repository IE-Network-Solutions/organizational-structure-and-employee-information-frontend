'use client';
import React, { useCallback } from 'react';
import { Card, Checkbox, Button, Avatar } from 'antd';
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
import DeleteModal from '@/components/common/deleteConfirmationModal';
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
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  OffBoardingTasksUpdateStatus,
  EmployeeOffBoardingTasks,
} from '@/store/server/features/employees/offboarding/interface';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import EmptyState from '@/components/empty';

const TEMPLATE_DROPPABLE_ID = 'template-tasks';
const EMPLOYEE_DROPPABLE_ID = 'employee-tasks';

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
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-lg border border-gray-200 p-3 mb-2 shadow-sm ${
        isDragging ? 'opacity-90 shadow-md relative z-[100]' : ''
      }`}
      id={`offboarding-template-draggable-${toSlug(item.id ?? index)}`}
      data-cy={`offboarding-template-draggable-${toSlug(item.id ?? index)}`}
    >
      <div
        className="font-medium text-gray-800"
        data-cy={`offboarding-template-draggable-title-${toSlug(item.id ?? index)}`}
      >
        {item.title}
      </div>
      {item.description && (
        <div
          className="text-sm text-gray-500 mt-1"
          data-cy={`offboarding-template-draggable-description-${toSlug(item.id ?? index)}`}
        >
          {item.description}
        </div>
      )}
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
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 flex justify-between items-center ${
        isDragging ? 'opacity-90 shadow-md z-10' : ''
      }`}
      id={`offboarding-task-${taskSlug}`}
      data-cy={`offboarding-task-${taskSlug}`}
    >
      {children}
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
      className={className}
      style={{
        minHeight: 120,
        transition: 'background-color 0.2s',
        ...(isOver ? { backgroundColor: '#FFFFFF' } : {}),
      }}
      data-cy={`offboarding-droppable-${id}`}
    >
      {children}
    </div>
  );
}

const OffboardingTasksTemplate: React.FC<Ids> = ({ id }) => {
  const {
    isDeleteModalVisible,
    toggleTask,
    taskToDelete,
    setTaskToDelete,
    setIsAddTaskModalVisible,
    setIsDeleteModalVisible,
  } = useOffboardingStore();

  const { mutate: offboardingTaskDelete } = useDeleteOffboardingItem();
  const { mutate: updateOffboardingItem } = useUpdateOffboardingItem();
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

  const handelTaskDelete = (value: string) => {
    offboardingTaskDelete(value);
  };

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
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div
          className="flex flex-col sm:flex-row gap-4 w-full"
          data-cy="offboarding-tasks-dnd-layout"
        >
          {/* Left panel: Core Offboarding Tasks */}
          <Card
            title="Core Offboarding Tasks"
            className="flex-1 min-w-0 relative z-10 overflow-visible [&_.ant-card-body]:overflow-visible"
            id="core-offboarding-tasks-card"
            data-cy="core-offboarding-tasks-card"
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
            title="Off-boarding Tasks"
            className="flex-1 min-w-0 relative z-0"
            id="offboarding-tasks-card"
            data-cy="offboarding-tasks-card"
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
                        <Button
                          type="default"
                          size="small"
                          id={`offboarding-task-edit-btn-${taskSlug}`}
                          data-cy={`offboarding-task-edit-btn-${taskSlug}`}
                          className="border border-[#D9D9D9] !h-8 !w-8 rounded-lg"
                        >
                          <EditOutlinedIcon className="text-base" />
                        </Button>

                        <Button
                          type="default"
                          onClick={() => {
                            setIsDeleteModalVisible(true);
                            setTaskToDelete(task);
                          }}
                          size="small"
                          id={`offboarding-task-delete-btn-${taskSlug}`}
                          data-cy={`offboarding-task-delete-btn-${taskSlug}`}
                          className="border border-[#ff8384] !h-8 !w-8 text-[#ff8384] rounded-lg"
                        >
                          <DeleteOutlineOutlinedIcon className="text-base" />
                        </Button>
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
            {isDeleteModalVisible && taskToDelete && (
              <DeleteModal
                data-cy="offboarding-delete-modal"
                open={isDeleteModalVisible}
                onConfirm={() => {
                  handelTaskDelete(taskToDelete.id);
                  setIsDeleteModalVisible(false);
                  setTaskToDelete(null as any);
                }}
                onCancel={() => {
                  setIsDeleteModalVisible(false);
                  setTaskToDelete(null as any);
                }}
                customMessage={
                  <>
                    <div
                      id="offboarding-delete-modal-body"
                      data-cy="offboarding-delete-modal-body"
                    >
                      <p
                        id="offboarding-delete-modal-title-p"
                        data-cy="offboarding-delete-modal-title-p"
                      >
                        <strong data-cy="offboarding-delete-modal-title-label">
                          Title:{' '}
                        </strong>{' '}
                        {taskToDelete.title}
                      </p>
                      <p
                        id="offboarding-delete-modal-assigned-to-p"
                        data-cy="offboarding-delete-modal-assigned-to-p"
                      >
                        <strong
                          id="offboarding-delete-modal-assigned-to-strong"
                          data-cy="offboarding-delete-modal-assigned-to-strong"
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
            <AddTaskModal id={id} data-cy="offboarding-add-task-modal" />
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
