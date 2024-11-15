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
    doc.setFontSize(16);
    doc.setTextColor('#4da6ff');

    doc.text(companyInfo?.companyName ?? '', 10, 10);
    doc.setFontSize(12);
    doc.text(companyInfo?.address ?? '', 10, 16);
    doc.text(companyInfo?.phoneNumber ?? '', 10, 22);
    doc.setLineWidth(0.5);
    doc.line(10, 26, 200, 26);

    doc.setFontSize(22);
    doc.setTextColor('#003366');
    const title = 'HANDOVER TASKS REPORT';
    const pageWidth = doc.internal.pageSize.width;
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(title, titleX, 40);

    doc.setFontSize(14);
    doc.setTextColor('#444444');
    let y = 60;

    data.forEach((item: any, index: number) => {
      const approver = `${item.approver.firstName} ${item.approver.lastName}`;
      const terminationInfo = `${item.employeTermination.reason}`;
      const comment = `${item.employeTermination.comment}`;
      const status = item.isCompleted ? 'Completed' : 'Pending';

      doc.text(`Task #${index + 1}`, 10, y);
      doc.text(`Title: ${item.title}`, 10, y + 10);
      doc.text(`Description: ${item.description}`, 10, y + 20);
      doc.text(`Status: ${status}`, 10, y + 30);
      doc.text(`Approver: ${approver}`, 10, y + 40);
      doc.text(`Termination Info: ${terminationInfo}`, 10, y + 50);
      doc.text(`comment: ${comment}`, 10, y + 60);

      y += 70;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save('Handover_Tasks_Report.pdf');
  };

  return (
    <div className="p-4 max-h-[418px] overflow-y-scroll">
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
            <div id="offboarding-template-tasks">
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
                    setTaskToDelete(task); // Track the task to be deleted
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
        {/* Render the delete modal conditionally based on the state */}
        {isDeleteModalVisible && taskToDelete && (
          <DeleteModal
            open={isDeleteModalVisible}
            onConfirm={() => {
              handelTaskDelete(taskToDelete.id);
              setIsDeleteModalVisible(false);
              setTaskToDelete(null as any); // Reset the task after deletion
            }}
            onCancel={() => {
              setIsDeleteModalVisible(false);
              setTaskToDelete(null as any); // Reset the task if canceled
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
