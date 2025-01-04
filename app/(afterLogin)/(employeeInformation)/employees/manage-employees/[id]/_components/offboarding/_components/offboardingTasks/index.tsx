'use client';
import React from 'react';
import { Card, Checkbox, Button, Dropdown, Empty } from 'antd';
import {
  DownOutlined,
  PlusOutlined,
  SettingOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import {
  Task,
  useOffboardingStore,
} from '@/store/uistate/features/offboarding';
import { AddTaskModal } from '../addTaskModal';
import OffboardingTemplate from '../offboardingTemplate';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import {
  useDeleteOffboardingItem,
  useUpdateOffboardingItem,
} from '@/store/server/features/employees/offboarding/mutation';
import {
  useFetchOffboardingTasks,
  useFetchUserTerminationByUserId,
} from '@/store/server/features/employees/offboarding/queries';
import { MdDelete } from 'react-icons/md';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { EmptyImage } from '@/components/emptyIndicator';
import { OffBoardingTasksUpdateStatus } from '@/store/server/features/employees/offboarding/interface';
import jsPDF from 'jspdf';
import { useGetCompanyProfileByTenantId } from '@/store/server/features/organizationStructure/companyProfile/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

interface Ids {
  id: string;
}

const TaskItem: React.FC<{ task: Task; onToggle: () => void }> = ({
  task,
  onToggle,
}) => {
  const { userId } = useAuthenticationStore();
  const { mutate: updateOffboardingItem } = useUpdateOffboardingItem();

  const handelCehckBox = (task: any) => {
    const data: OffBoardingTasksUpdateStatus = {
      id: '',
      isCompleted: false,
    };
    data['id'] = task.id;
    data['isCompleted'] = !task.isCompleted;

    updateOffboardingItem(data);
  };

  return (
    <div className="flex items-center mb-2">
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
      {task.isCompleted && task.approverId && task.completedDate && (
        <span className="ml-2 text-sm text-gray-500">
          Completed by {task.approverId} on {task.completedDate}
        </span>
      )}
      {!task.isCompleted && task.completedDate && (
        <span className="ml-2 text-sm text-gray-500">
          Due: {task.completedDate}
        </span>
      )}
    </div>
  );
};

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
  const { data: offboardingTermination } = useFetchUserTerminationByUserId(id);
  const {
    data: offboardingTasks,
    isLoading,
    error,
  } = useFetchOffboardingTasks(id);
  const { tenantId } = useAuthenticationStore.getState();
  const { data: companyInfo } = useGetCompanyProfileByTenantId(tenantId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tasks</div>;

  const handleAddTaskClick = () => setIsAddTaskModalVisible(true);
  const handleTaskTemplate = () => setIsTaskTemplateVisible(true);

  const menuItems = [
    {
      key: '1',
      label: 'Add Items from Menu',
      onClick: handleTaskTemplate,
    },
  ];

  const handelTaskDelete = (value: string) => {
    offboardingTaskDelete(value);
  };

  const downloadPDF = (data: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const lineHeight = 10;

    let y = 10;

    const addNewPageIfNeeded = (requiredHeight: number) => {
      if (y + requiredHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Header
    doc.setFontSize(16);
    doc.setTextColor('#4da6ff');
    doc.text(companyInfo?.companyName ?? 'Company Name', margin, y);
    y += lineHeight;

    doc.setFontSize(12);
    doc.text(companyInfo?.address ?? 'Address not provided', margin, y);
    y += lineHeight;
    doc.text(companyInfo?.phoneNumber ?? 'Phone not available', margin, y);
    y += lineHeight;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += lineHeight;

    // Title
    doc.setFontSize(22);
    doc.setTextColor('#003366');
    const title = 'HANDOVER TASKS REPORT';
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(title, titleX, y);
    y += lineHeight + 10;

    // Content
    doc.setFontSize(14);
    doc.setTextColor('#444444');

    data.forEach((item: any, index: number) => {
      const approver = `${item.approver?.firstName ?? ''} ${item.approver?.lastName ?? ''}`;
      const terminationInfo = item.employeTermination?.reason ?? 'N/A';
      const comment = item.employeTermination?.comment ?? 'No comments';
      const status = item.isCompleted ? 'Completed' : 'Pending';

      const taskDetails = [
        `Task #${index + 1}`,
        `Title: ${item.title || 'N/A'}`,
        `Description: ${item.description || 'No description provided'}`,
        `Status: ${status}`,
        `Approver: ${approver}`,
        `Termination Info: ${terminationInfo}`,
        `Comment: ${comment}`,
      ];

      taskDetails.forEach((text, i) => {
        const wrappedText = doc.splitTextToSize(text, pageWidth - 2 * margin);
        const textHeight = wrappedText.length * lineHeight;

        addNewPageIfNeeded(textHeight);
        doc.text(wrappedText, margin, y);
        y += textHeight + (i < taskDetails.length - 1 ? 5 : 10);
      });

      y += 10;
      addNewPageIfNeeded(0);
    });

    const fileName = `Handover_Tasks_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="p-4 max-h-[418px] overflow-y-scroll">
      <Card
        title="Offboarding Tasks"
        extra={
          <div className="flex space-x-2">
            <AccessGuard permissions={[Permissions.AddOffloadingTasks]}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTaskClick}
                disabled={!offboardingTermination}
              >
                Add Task
              </Button>
            </AccessGuard>
            <div id="offboarding-template-tasks">
              <AccessGuard
                permissions={[Permissions.AddOffloadingTemplateTasks]}
              >
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
              </AccessGuard>
            </div>
            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={() => downloadPDF(offboardingTasks)}
            />
          </div>
        }
        className="w-full"
      >
        {offboardingTasks.length > 0 ? (
          (offboardingTasks as Task[])?.map((task: Task) => (
            <div
              key={task?.id}
              className="flex justify-between items-center my-3"
            >
              <div>
                <TaskItem task={task} onToggle={() => toggleTask(task?.id)} />
              </div>

              <div>
                <Button
                  onClick={() => {
                    setIsDeleteModalVisible(true);
                    setTaskToDelete(task);
                  }}
                  danger
                  icon={<MdDelete />}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center">
            {' '}
            <Empty description={'data not found'} image={<EmptyImage />} />
          </div>
        )}
        {isDeleteModalVisible && taskToDelete && (
          <DeleteModal
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
