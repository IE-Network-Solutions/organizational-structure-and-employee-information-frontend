'use client';
import React from 'react';
import { Card, Checkbox, Button, Dropdown, Empty } from 'antd';
import { DownOutlined, PlusOutlined, SettingOutlined, DownloadOutlined } from '@ant-design/icons';
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
} from '@/store/server/features/employees/offboarding/mutation';
import { useFetchOffboardingTasks } from '@/store/server/features/employees/offboarding/queries';
import { MdDelete } from 'react-icons/md';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { EmptyImage } from '@/components/emptyIndicator';
import { OffBoardingTasksUpdateStatus } from '@/store/server/features/employees/offboarding/interface';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
interface Ids {
  id: string;
}
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
  const { mutate: updateOffboardingItem } = useUpdateOffboardingItem();
  const { userId } = useAuthenticationStore();

  const {
    data: offboardingTasks,
    isLoading,
    error,
  } = useFetchOffboardingTasks(id);
  const { data: employeeData } = useGetEmployee(id);

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

  const handelCehckBox = (task: any) => {
    const data: OffBoardingTasksUpdateStatus = {
      id: '',
      isCompleted: false,
    };
    data['id'] = task.id;
    data['isCompleted'] = !task.isCompleted;

    updateOffboardingItem(data);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tasks</div>;

  const resignationSubmittedDate =
    employeeData?.employeeJobInformation[0]?.resignationSubmittedDate;

  // Check if all tasks are completed
  const allTasksCompleted = offboardingTasks && offboardingTasks.length > 0 
    ? offboardingTasks.every((task: Task) => task.isCompleted)
    : false;

  return (
    <div className="p-2 max-h-[418px] overflow-y-scroll">
      <Card
        title="Offboarding Tasks"
        extra={
          <div className="flex space-x-2">
            <AccessGuard permissions={[Permissions.AddOffloadingTasks]}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTaskClick}
                disabled={resignationSubmittedDate === null}
              >
                <span className="hidden sm:inline">Add Task</span>
              </Button>
            </AccessGuard>
            {allTasksCompleted && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={async () => {
                  try {
                    // Generate PDF using html2canvas and jsPDF
                    const certificateElement = document.getElementById('certificate-template');
                    if (!certificateElement) {
                      alert('Certificate template not found. Please try again.');
                      return;
                    }

                    // Capture the certificate as canvas
                    const canvas = await html2canvas(certificateElement, {
                      scale: 2, // Higher quality
                      useCORS: true,
                      allowTaint: true,
                      backgroundColor: '#ffffff',
                    });

                    // Create PDF
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    
                    // Calculate dimensions to fit the page
                    const imgWidth = 210; // A4 width in mm
                    const pageHeight = 295; // A4 height in mm
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    let heightLeft = imgHeight;

                    let position = 0;

                    // Add image to PDF
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;

                    // Add new pages if content is longer than one page
                    while (heightLeft >= 0) {
                      position = heightLeft - imgHeight;
                      pdf.addPage();
                      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                      heightLeft -= pageHeight;
                    }

                    // Download the PDF
                    pdf.save(`clearance-certificate-${new Date().toISOString().split('T')[0]}.pdf`);
                  } catch (error) {
                    alert('Error generating PDF. Please try again.');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <span className="hidden sm:inline">Download Certificate</span>
              </Button>
            )}
            <div id="offboarding-template-tasks">
              <AccessGuard
                permissions={[Permissions.AddOffloadingTemplateTasks]}
              >
                <Dropdown
                  menu={{ items: menuItems }}
                  trigger={['click']}
                  placement="bottomRight"
                  disabled={resignationSubmittedDate === null}
                >
                  <Button className="flex items-center">
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
        {offboardingTasks.length > 0 ? (
          (offboardingTasks as Task[])?.map((task: Task) => (
            <div
              key={task?.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 flex justify-between items-center"
            >
              <div className="flex items-center">
                <Checkbox
                  onClick={() => handelCehckBox(task)}
                  checked={task?.isCompleted}
                  onChange={() => toggleTask(task?.id)}
                  className="mr-3 [&_.ant-checkbox-checked]:bg-blue [&_.ant-checkbox-checked]:border-blue"
                  disabled={userId !== task.approverId}
                />
                <span className={task?.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}>
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
      
      {/* Hidden certificate template for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <CertificateContent
          offboardingTasks={offboardingTasks}
          employeeData={employeeData}
        />
      </div>
    </div>
  );
};

export default OffboardingTasksTemplate;
