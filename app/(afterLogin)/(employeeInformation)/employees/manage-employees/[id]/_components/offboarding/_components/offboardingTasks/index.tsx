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
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import dayjs from 'dayjs';

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
  const { data: userDetails } = useGetEmployee(id);
  const { userId } = useAuthenticationStore();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tasks</div>;

  const handleAddTaskClick = () => setIsAddTaskModalVisible(true);
  const handleTaskTemplate = () => setIsTaskTemplateVisible(true);

  const handelTaskDelete = (value: string) => {
    offboardingTaskDelete(value);
  };

  const handleHandOverTasksReportPDFDownload = (data: any) => {

    const employeeFullName = `${userDetails?.firstName || 'N/A'} ${userDetails?.lastName || 'N/A'}`;
    const jobRole = userDetails?.employeeJobInformation?.[0].position?.name || 'N/A';
    const joinedDate = dayjs(userDetails?.employeeJobInformation?.[0].effectiveStartDate).format('MMMM D, YYYY') || 'N/A';
    const terminationDate = dayjs(offboardingTermination?.effectiveDate).format('MMMM D, YYYY') || 'N/A';
    const terminationType = offboardingTermination?.type || 'N/A';
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const lineHeight = 10;
    
    let y = margin;
    let pageNumber = 1;
  
    const addNewPageIfNeeded = (requiredHeight: number) => {
      if (y + requiredHeight > pageHeight - margin - 10) {
        doc.text(`Page ${pageNumber}`, pageWidth - margin - 20, pageHeight - margin - 5);
        pageNumber++;
        doc.addPage();
        y = margin;
      }
    };
  
    // Header
    doc.setFontSize(16);
    doc.setTextColor('#4da6ff');
    doc.text(companyInfo?.companyName || 'Company Name', margin, y);
    y += lineHeight;
  
    doc.setFontSize(12);
    doc.text(companyInfo?.address || 'Address not provided', margin, y);
    y += lineHeight;
    doc.text(companyInfo?.phoneNumber || 'Phone not available', margin, y);
    y += lineHeight;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += lineHeight + 5;
  
    // Title
    doc.setFontSize(22);
    doc.setTextColor('#003366');
    const title = 'HANDOVER TASKS REPORT';
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(title, titleX, y);
    y += lineHeight + 5;
  
    // Paragraph
    doc.setFontSize(12);
    doc.setTextColor('#444444');
    
    // Dynamic paragraph generation based on termination type
    let paragraph;
    if (terminationType === 'Resignation') {
      paragraph = `This report pertains to ${employeeFullName}, who served as ${jobRole} at ${
        companyInfo?.companyName || 'the company'
      }. The employee joined the organization on ${joinedDate} and submitted a formal resignation effective ${terminationDate}. 
      The reason for resignation was ${offboardingTermination?.reason || 'not provided'}. This document details the status and descriptions of all tasks, assigned approvers, and relevant handover details to ensure a smooth transition and operational continuity.`;
    } else if (terminationType === 'Termination') {
      paragraph = `This report pertains to ${employeeFullName}, who served as ${jobRole} at ${
        companyInfo?.companyName || 'the company'
      }. The employee joined the organization on ${joinedDate} and was terminated effective ${terminationDate}. 
      The reason for termination was ${offboardingTermination?.reason || 'not provided'}. This document details the status and descriptions of all tasks, assigned approvers, and relevant handover details to ensure a smooth transition and operational continuity.`;
    } else if (terminationType === 'Death') {
      paragraph = `This report pertains to ${employeeFullName}, who served as ${jobRole} at ${
        companyInfo?.companyName || 'the company'
      }. The employee joined the organization on ${joinedDate} and passed away on ${terminationDate}. 
      This document details the status and descriptions of all tasks, assigned approvers, and relevant handover details to ensure a smooth transition and operational continuity during this difficult time.`;
    } else {
      paragraph = `This report pertains to ${employeeFullName}, who served as ${jobRole} at ${
        companyInfo?.companyName || 'the company'
      }. The employee joined the organization on ${joinedDate}, and the termination type was recorded as ${terminationType}. 
      This document details the status and descriptions of all tasks, assigned approvers, and relevant handover details to ensure a smooth transition and operational continuity.`;
    }
  
    const paragraphWidth = pageWidth - 2 * margin;
    const paragraphLines = doc.splitTextToSize(paragraph, paragraphWidth);
    paragraphLines.forEach((line: any) => {
      addNewPageIfNeeded(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    });
    y += 5;
  
    // Table Header
    const colWidths = [10, 50, 25, 50, 40];
    const headerRow = ['No', 'Task Name', 'Status', 'Description', 'Approver'];
    const rowHeight = 10;
    const tableStartX = margin;
    const tableEndX = pageWidth - margin;
  
    // Draw table header
    doc.setFontSize(10);
    doc.setTextColor('#ffffff');
    doc.setFillColor('#4da6ff');
    doc.rect(tableStartX, y, tableEndX - tableStartX, rowHeight, 'F');
  
    let currentX = tableStartX;
    headerRow.forEach((header, index) => {
      doc.text(header, currentX + 2, y + 7);
      currentX += colWidths[index];
    });
    y += rowHeight;
  
    // Draw table rows
    doc.setTextColor('#444444');
    data.forEach((item: any, index: number) => {
      const taskName = item.title?.length > 25 ? item.title.substring(0, 25) + '...' : item.title || 'N/A';
      const status = item.isCompleted ? 'Completed' : 'Pending';
      const description = item.description?.length > 25 ? item.description.substring(0, 25) + '...' : item.description || 'No description provided';
      const approver = `${item.approver?.firstName || 'N/A'} ${item.approver?.lastName || ''}`;
  
      addNewPageIfNeeded(rowHeight);
  
      currentX = tableStartX;
      const rowData = [index + 1, taskName, status, description, approver];
  
      rowData.forEach((cell, cellIndex) => {
        const cellText =
          typeof cell === 'string' ? doc.splitTextToSize(cell, colWidths[cellIndex]) : `${cell}`;
        doc.text(cellText, currentX + 2, y + 7);
        currentX += colWidths[cellIndex];
      });
  
      // Draw row border
      doc.setDrawColor(200);
      doc.line(tableStartX, y, tableEndX, y);
      doc.line(tableStartX, y + rowHeight, tableEndX, y + rowHeight);
  
      y += rowHeight;
    });
  
    // Last Page Number
    doc.text(`Page ${pageNumber}`, pageWidth - margin - 20, pageHeight - margin - 5);
  
    // Save the PDF
    const fileName = `Handover_Tasks_Report_for_${employeeFullName}_${dayjs().format('YYYY-MM-DD_HH-mm')}.pdf`;
    doc.save(fileName);
  };

  const menuItems = [
    {
      key: '1',
      label: 'Add Items from Menu',
      onClick: handleTaskTemplate,
    },
  ];

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
            <AccessGuard
                permissions={[Permissions.DownloadOffBoardingTasksReport]}
              >
              <Button
                type="default"
                icon={<DownloadOutlined />}
                onClick={() => handleHandOverTasksReportPDFDownload(offboardingTasks)}
              />
            </AccessGuard>
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
                <AccessGuard
                  permissions={[Permissions.DeletedOffBoardingTasks]}
                >
                  <Button
                    onClick={() => {
                      setIsDeleteModalVisible(true);
                      setTaskToDelete(task);
                    }}
                    danger
                    icon={<MdDelete />}
                    disabled={userId !== task.approverId}
                  />
                </AccessGuard>
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