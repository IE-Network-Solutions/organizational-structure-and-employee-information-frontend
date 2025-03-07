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
import { useGetCompanyProfileByTenantId } from '@/store/server/features/organizationStructure/companyProfile/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import dayjs from 'dayjs';
import { handlePDFDownload } from '@/utils/pdfDownload';

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
  const { data: companyDetails } = useGetCompanyProfileByTenantId(tenantId);
  const { data: userDetails } = useGetEmployee(id);
  const { userId } = useAuthenticationStore();

  const employeeFullName = `${userDetails?.firstName || 'N/A'} ${userDetails?.lastName || 'N/A'}`;
  const jobRole = userDetails?.employeeJobInformation?.[0].position?.name || 'N/A';
  const joinedDate = dayjs(userDetails?.employeeJobInformation?.[0].effectiveStartDate).format('MMMM D, YYYY') || 'N/A';
  const terminationDate = dayjs(offboardingTermination?.effectiveDate).format('MMMM D, YYYY') || 'N/A';
  const companyName = companyDetails?.companyName || 'The company';
  const address = companyDetails?.address || 'Address not provided';
  const phoneNumber = companyDetails?.phoneNumber || 'Phone not available';
  const companyEmail = companyDetails?.companyEmail || 'Email not provided';  
  const downloadFileName = `Handover_Tasks_Report_${dayjs().format('YYYY-MM-DD_HH-mm')}.pdf`;
  type TerminationType = 'Resignation' | 'Termination' | 'Death';
  const terminationType: TerminationType = offboardingTermination?.type ?? 'Resignation';

  const terminationDetails: Record<TerminationType, { verb: string; reason: string }> = {
    Resignation: {
      verb: 'submitted a formal resignation effective',
      reason: `The reason for resignation was, ${offboardingTermination?.reason || 'not provided'}.`,
    },
    Termination: {
      verb: 'was terminated effective',
      reason: `The reason for termination was, ${offboardingTermination?.reason || 'not provided'}.`,
    },
    Death: {
      verb: 'passed away on',
      reason: `This document details the status and descriptions of all tasks, assigned approvers, and relevant handover details to ensure a smooth transition and operational continuity during this difficult time.`,
    },
  };

  const defaultDetails = {
    verb: `termination type was recorded as ${terminationType}`,
    reason: '',
  };
  
  const terminationInfo = terminationDetails[terminationType] || defaultDetails;
  
  // Construct the base paragraph
  const baseParagraph = `
    This report pertains to ${employeeFullName}, who served as ${jobRole} at ${companyName}.
    The employee joined the organization on ${joinedDate} and ${terminationInfo.verb} ${terminationDate}.
    ${terminationInfo.reason || 'This document details the status and descriptions of all tasks, assigned approvers, and relevant handover details to ensure a smooth transition and operational continuity.'}
  `.trim();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tasks</div>;

  const handleAddTaskClick = () => setIsAddTaskModalVisible(true);
  const handleTaskTemplate = () => setIsTaskTemplateVisible(true);

  const handelTaskDelete = (value: string) => {
    offboardingTaskDelete(value);
  };

  const tables = [
    {
      title: 'Tasks Overview',
      paragraph: 'This table provides an overview of the handover tasks, including their names, statuses, descriptions, and approvers.',
      header: ['No', 'Task Name', 'Status', 'Description', 'Approver'],
      rows: offboardingTasks.map((task: any, index: number) => [
        index + 1,
        task.title,
        task.isCompleted ? 'Completed' : 'Pending',
        task.description,
        task.approver ? `${task.approver.firstName} ${task.approver.lastName}` : 'Not Assigned'
      ]),
      colWidths: [10, 50, 25, 50, 40],
      style: {
        titlefontSize: 14,
        titlecolor: '#003366',
        paragraphfontSize: 12,
        paragraphcolor: '#000000',
      },
    },
  ];
  
  const opening = {
    header: {
      companyName: companyName,
      address: address,
      phoneNumber: phoneNumber,
      companyEmail: companyEmail
    },
    pageTitle: 'HANDOVER TASKS REPORT',
    pageParagraph: `${baseParagraph}`,
    style: {
      titlefontSize: 22,
      titlecolor: '#003366',
      paragraphfontSize: 12,
      paragraphcolor: '#000000',
    },
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
                onClick={() => handlePDFDownload(opening, tables, downloadFileName)}
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