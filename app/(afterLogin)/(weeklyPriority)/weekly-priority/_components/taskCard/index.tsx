import React, { useState } from 'react';
import { Button, Card, Input, Form, Dropdown } from 'antd';
import { HiMinus, HiOutlineCheck } from 'react-icons/hi';
import { RiCloseCircleFill, RiCloseLine, RiMore2Fill } from 'react-icons/ri';
import { useWeeklyPriorityStore } from '@/store/uistate/features/weeklyPriority/useStore';
import { Popconfirm } from 'antd/lib';
import {
  useCreateWeeklyPriority,
  useDeleteWeeklyPriority,
  useUpdateWeeklyPriority,
} from '@/store/server/features/okrplanning/weeklyPriority/mutations';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import dayjs from 'dayjs';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { FiCheckCircle } from 'react-icons/fi';
import WeeklyPriorityModal from '../WeeklyPriorityModal';
import { useGetAssignedPlanningPeriodForUserId } from '@/store/server/features/employees/planning/planningPeriod/queries';
import { useGetPlannedTaskForReport } from '@/store/server/features/okrPlanningAndReporting/queries';

const TaskCard: React.FC = () => {
  const [form] = Form.useForm();
  const { userId } = useAuthenticationStore();
  const {
    data,
    setData,
    removeTask,
    modalOpen,
    setModalOpen,
    failedReasonVisible,
    setFailedReasonVisible,
    failedReasons,
    setFailedReasons,
  } = useWeeklyPriorityStore();
  const { mutate: createWeeklyPriorityTask } = useCreateWeeklyPriority();
  const {
    mutate: updateWeeklyPriorityTask,
    isLoading: updateWeeklyPriorityTaskLoading,
  } = useUpdateWeeklyPriority();
  const { mutate: deletedWeeklyPriorityTask } = useDeleteWeeklyPriority();
  const { data: userInfo } = useGetEmployee(userId);
  const { data: activeFiscalYear } = useGetActiveFiscalYears();
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const session = activeFiscalYear?.sessions?.find(
    (item: any) => item?.active === true,
  );
  const month = session?.months?.find((item: any) => item?.active === true);
  const userDepartmentId = userInfo?.employeeJobInformation[0]?.departmentId;

  const handleEditToggle = (itemIndex: number, taskIndex: number) => {
    const newData = [...data];
    newData[itemIndex].tasks[taskIndex].isEdit =
      !newData[itemIndex].tasks[taskIndex].isEdit;
    setData(newData);
  };

  const handleSaveEditTask = (itemIndex: number, taskIndex: number) => {
    form.validateFields().then((values) => {
      const newData = [...data];
      const { ...filteredData } = {
        ...newData[itemIndex].tasks[taskIndex],
        title: values[`task-${itemIndex}-${taskIndex}`],
        departmentId: userDepartmentId,
        session: session?.id,
        month: month?.id,
        createdBy: userId,
        failureReason: '',
      };
      createWeeklyPriorityTask(filteredData, {
        onSuccess: () => {
          newData[itemIndex].tasks[taskIndex].isEdit = false;
          newData[itemIndex].tasks[taskIndex].title =
            values[`task-${itemIndex}-${taskIndex}`];
          setData(newData);
        },
      });
    });
  };

  const handleUpdateStatus = (
    itemIndex: number,
    taskIndex: number,
    status: string,
    failureReason?: string,
  ) => {
    const newData = [...data];
    /*  eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { isEdit, ...filteredData } = {
      ...newData[itemIndex].tasks[taskIndex],
      status: status,
      failureReason: failureReason || '',
    };
    /*  eslint-enable-next-line @typescript-eslint/no-unused-vars */
    const value = filteredData;
    updateWeeklyPriorityTask(value, {
      onSuccess: () => {
        newData[itemIndex].tasks[taskIndex].isEdit = false;
        newData[itemIndex].tasks[taskIndex].status = status;
      },
    });
  };
  const handleDeleted = (itemIndex: number, taskIndex: number) => {
    const newData = [...data];

    /*  eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { isEdit, ...filteredData } = {
      ...newData[itemIndex].tasks[taskIndex],
    };
    /*  eslint-enable-next-line @typescript-eslint/no-unused-vars */
    deletedWeeklyPriorityTask(filteredData?.id || '', {
      onSuccess: () => {
        newData[itemIndex].tasks[taskIndex] = {
          ...newData[itemIndex].tasks[taskIndex],
          isEdit: false,
        };

        // Make sure to update the state if `data` is coming from React state
        setData(newData);
      },
    });
  };
  const { data: employeeData } = useGetAllUsers();
  const { data: Departments } = useGetUserDepartment();

  const getEmployeeData = (id: string) => {
    const employeeDataDetail = employeeData?.items?.find(
      (emp: any) => emp?.id === id,
    );
    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
  };
  const getDepartmentData = (id: string) => {
    const depDetail = Departments?.find((dep: any) => dep?.id === id);
    return depDetail || { name: '' }; // Return an object with a name property if depDetail is undefined
  };
  const { data: userPlanningPeriod } = useGetAssignedPlanningPeriodForUserId();
  const planningPeriodWithHighestInterval = userPlanningPeriod?.reduce(
    (maxItem: any, currentItem: any) => {
      const currentLength = currentItem?.planningPeriod?.intervalLength ?? 0;
      const maxLength = maxItem?.planningPeriod?.intervalLength ?? 0;
      return currentLength > maxLength ? currentItem : maxItem;
    },
    null,
  );

  const { data: plannedTask, isLoading: plannedTaskLoading } =
    useGetPlannedTaskForReport(
      planningPeriodWithHighestInterval?.planningPeriodId,
    );

  const handleFailedReasonSubmit = (itemIndex: number, taskIndex: number) => {
    const taskKey = `${itemIndex}-${taskIndex}`;
    if (failedReasons[taskKey]?.trim()) {
      const newData = [...data];
      newData[itemIndex].tasks[taskIndex] = {
        ...newData[itemIndex].tasks[taskIndex],
        status: 'NOT_COMPLETED',
        failureReason: failedReasons[taskKey],
      };

      updateWeeklyPriorityTask(
        {
          ...newData[itemIndex].tasks[taskIndex],
          status: 'NOT_COMPLETED',
          failureReason: failedReasons[taskKey],
        },
        {
          onSuccess: () => {
            setData(newData);
            setFailedReasonVisible({
              ...failedReasonVisible,
              [taskKey]: false,
            });
            setFailedReasons({ ...failedReasons, [taskKey]: '' });
          },
        },
      );
    }
  };

  const handleFailedReasonCancel = (itemIndex: number, taskIndex: number) => {
    const taskKey = `${itemIndex}-${taskIndex}`;
    setFailedReasonVisible({ ...failedReasonVisible, [taskKey]: false });
    setFailedReasons({ ...failedReasons, [taskKey]: '' });
  };

  const handleEditClick = (item: any) => {
    setSelectedTask(item);
    setModalOpen(true);
  };

  const dropdownItems = (item: any) => [
    {
      key: 'edit',
      label: 'Edit',
      onClick: () => handleEditClick(item),
    },
  ];

  return (
    <>
      <style data-cy="task-card-styles">{`
        .custom-pixel-checkbox .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #254ec2;
            border-color: #254ec2;
        }
        .completed-task-checkbox .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #52c41a !important;
            border-color: #52c41a !important;
        }
        .text-strike-green {
            color: #6b7280; /* Standard gray for completed task */
        }
        .text-strike-red {
            color: #374151;
        }
        .task-row-line {
            position: absolute;
            left: 16px;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            height: 1.5px;
            z-index: 5;
            pointer-events: none;
        }
        @media (min-width: 768px) {
            .task-row-line {
                left: 20px;
                right: 24px;
            }
        }
        .task-row-line-inner {
            width: 100%;
            height: 100%;
        }
        .bg-strike-green {
            background-color: #52c41a; /* Matching specified green */
        }
        .bg-strike-red {
            background-color: #ef4444; /* Standard red */
        }
        
        /* Custom styled checkboxes for the left side */
        .completed-checkbox .ant-checkbox-inner {
            width: 18px !important;
            height: 18px !important;
            background-color: #52c41a !important;
            border-color: #52c41a !important;
            border-radius: 4px !important;
        }
        .completed-checkbox .ant-checkbox-checked .ant-checkbox-inner::after {
            width: 5.5px !important;
            height: 10px !important;
            left: 21.5% !important;
        }
        .failed-checkbox-icon {
            width: 18px;
            height: 18px;
            background-color: #ef4444;
            border: 1px solid #ef4444;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 13px;
        }
        @media (max-width: 767px) {
            .task-row-line {
                left: 16px;
                right: 16px;
            }
        }
      `}</style>

      {data.map((item, itemIndex) => {
        const employee = getEmployeeData(item.tasks[0]?.createdBy || '');
        const fullName = `${employee?.firstName || ''} ${employee?.middleName || ''}`;

        return (
          <Card
            key={itemIndex}
            className="mb-5 border border-[#e5e7eb] rounded-[12px] overflow-hidden"
            bodyStyle={{ padding: '0px' }}
            style={{ boxShadow: 'none' }}
            data-cy={`task-card-${itemIndex}`}
          >
            <div
              className="px-4 md:px-6 py-4 md:py-5 bg-[#f9fafb] border-b border-gray-100"
              data-cy={`task-card-header-${itemIndex}`}
            >
              <div
                className="flex justify-between items-center"
                data-cy={`task-card-header-content-${itemIndex}`}
              >
                <div
                  className="flex-1"
                  data-cy={`task-card-header-info-${itemIndex}`}
                >
                  <h3
                    className="text-[15.5px] md:text-[16.5px] font-bold text-[#111827] mb-1 leading-tight"
                    data-cy={`task-card-title-${itemIndex}`}
                  >
                    {item.departmentId
                      ? getDepartmentData(item.departmentId)?.name +
                        " Team's weekly priority"
                      : 'Weekly priority'}
                  </h3>
                  <div
                    className="flex items-center gap-2"
                    data-cy={`task-card-meta-${itemIndex}`}
                  >
                    <Avatar
                      size={22}
                      icon={
                        <UserOutlined
                          data-cy={`task-card-avatar-icon-${itemIndex}`}
                        />
                      }
                      src={employee?.photo}
                      className="bg-gray-100 flex-shrink-0"
                      data-cy={`task-card-avatar-${itemIndex}`}
                    />
                    <div
                      className="flex items-center text-[13px] md:text-[14px] text-gray-500 font-medium"
                      data-cy={`task-card-user-info-${itemIndex}`}
                    >
                      <span
                        className="text-[#374151]"
                        data-cy={`task-card-user-name-${itemIndex}`}
                      >
                        {fullName}
                      </span>
                      <span
                        className="mx-1.5 text-gray-400"
                        data-cy={`task-card-separator-${itemIndex}`}
                      >
                        •
                      </span>
                      <span
                        className="text-[#4b5563] font-medium"
                        data-cy={`task-card-date-${itemIndex}`}
                      >
                        {dayjs(item?.tasks[0]?.createdAt).format('DD MMM YYYY')}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="flex-shrink-0 -mr-2"
                  data-cy={`task-card-actions-${itemIndex}`}
                >
                  <Dropdown
                    menu={{ items: dropdownItems(item) }}
                    trigger={['click']}
                    placement="bottomRight"
                    data-cy={`task-card-dropdown-${itemIndex}`}
                  >
                    <Button
                      type="text"
                      className="flex items-center justify-center h-9 w-9 bg-white border border-gray-200 rounded-[8px] transition-all"
                      icon={
                        <RiMoreFill
                          className="text-[#111827] text-[22px] translate-y-[1px]"
                          data-cy={`task-card-dropdown-icon-${itemIndex}`}
                        />
                      }
                      data-cy={`task-card-dropdown-button-${itemIndex}`}
                    />
                  </Dropdown>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="text-black font-semibold text-lg">
           
          </div> */}

          <Form form={form}>
            <div
              data-cy="weekly-priority-components-taskcard-index-tsx-index-div-251"
              className="p-2"
            >
              {item.tasks.map((task, taskIndex) => (
                <div
                  data-cy="weekly-priority-components-taskcard-index-tsx-index-div-253"
                  key={taskIndex}
                  className="flex flex-col mt-2"
                >
                  <div
                    data-cy="weekly-priority-components-taskcard-index-tsx-index-div-254"
                    className="flex justify-between items-center"
                  >
                    <div
                      className={`${isReported ? 'grid grid-cols-[auto_1fr]' : 'flex'} transition-colors ${isCompleted ? 'bg-[#F7FEE7]' : isNotCompleted ? 'bg-[#fff1f2]' : 'bg-white'}`}
                      data-cy={`task-item-content-${itemIndex}-${taskIndex}`}
                    >
                      {/* Left Column: Icon - Only show for reported tasks */}
                      {isReported && (
                        <div
                          className={`flex ${isNotCompleted ? 'items-center' : 'items-center md:items-start md:pt-[18px]'} pl-4 md:pl-6 pr-1 md:pr-0 py-4 md:py-[18px]`}
                          data-cy={`task-item-icon-column-${itemIndex}-${taskIndex}`}
                        >
                          <div
                            className="flex-shrink-0"
                            data-cy={`task-item-checkbox-wrapper-${itemIndex}-${taskIndex}`}
                          >
                            {isCompleted ? (
                              <Popconfirm
                                title="Undo task progress?"
                                onConfirm={() =>
                                  handleUndoCompleted(itemIndex, taskIndex)
                                }
                                okText="Yes"
                                cancelText="No"
                                placement="topLeft"
                                data-cy={`task-item-popconfirm-completed-${itemIndex}-${taskIndex}`}
                              >
                                <div
                                  className="relative z-10 bg-[#F7FEE7] px-1"
                                  data-cy={`task-item-completed-wrapper-${itemIndex}-${taskIndex}`}
                                >
                                  <Checkbox
                                    checked
                                    className="completed-checkbox"
                                    data-cy={`task-item-completed-checkbox-${itemIndex}-${taskIndex}`}
                                  />
                                </div>
                              </Popconfirm>
                            ) : (
                              <div
                                className="relative z-10 bg-[#fff1f2] px-1"
                                data-cy={`task-item-failed-wrapper-${itemIndex}-${taskIndex}`}
                              >
                                <div
                                  className="failed-checkbox-icon"
                                  data-cy={`task-item-failed-checkbox-icon-${itemIndex}-${taskIndex}`}
                                >
                                  <RiCloseFill
                                    data-cy={`task-item-failed-checkbox-icon-inner-${itemIndex}-${taskIndex}`}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Right Column: Content */}
                      <div
                        className="flex-1 flex flex-col min-w-0"
                        data-cy={`task-item-content-column-${itemIndex}-${taskIndex}`}
                      >
                        <div
                          className={`flex items-center md:items-start gap-4 group pr-4 md:pr-6 py-4 md:py-[18px] relative ${isReported ? 'pl-4 md:pl-5' : 'pl-4 md:pl-6'}`}
                          data-cy={`task-item-header-container-${itemIndex}-${taskIndex}`}
                        >
                          {(isCompleted || isNotCompleted) && (
                            <div
                              className="task-row-line"
                              data-cy={`task-item-line-wrapper-${itemIndex}-${taskIndex}`}
                            >
                              <div
                                className={`task-row-line-inner ${isCompleted ? 'bg-strike-green' : 'bg-strike-red'}`}
                                data-cy={`task-item-line-inner-${itemIndex}-${taskIndex}`}
                              />
                            </div>
                          )}

                          <div
                            className="flex-1 min-w-0"
                            data-cy={`task-item-details-${itemIndex}-${taskIndex}`}
                          >
                            <div
                              className="flex justify-between items-center w-full min-h-[24px]"
                              data-cy={`task-item-header-${itemIndex}-${taskIndex}`}
                            >
                              <span
                                className={`text-[14.5px] md:text-[15px] font-medium leading-normal transition-all truncate md:whitespace-normal ${isCompleted ? 'text-strike-green' : isNotCompleted ? 'text-strike-red' : 'text-[#374151]'}`}
                                data-cy={`task-item-title-${itemIndex}-${taskIndex}`}
                              >
                                {task.title}
                              </span>

                              <div
                                className="flex items-center gap-2 flex-shrink-0 ml-4"
                                data-cy={`task-item-status-icons-${itemIndex}-${taskIndex}`}
                              >
                                {isCompleted && (
                                  <HiCheckCircle
                                    className="text-[#52c41a] text-[15px] flex-shrink-0 relative z-10 bg-[#F7FEE7] rounded-full"
                                    data-cy={`task-item-completed-icon-${itemIndex}-${taskIndex}`}
                                  />
                                )}

                                {isNotCompleted && (
                                  <HiXCircle
                                    className="text-[#ef4444] text-[15px] flex-shrink-0 relative z-10 bg-[#fff1f2] rounded-full"
                                    data-cy={`task-item-failed-icon-${itemIndex}-${taskIndex}`}
                                  />
                                )}
                              </div>
                            </div>

                            {failedReasonVisible[taskId] && isNotCompleted && (
                              <div
                                className="mt-3 bg-white border border-[#fee2e2] p-4 rounded-[10px]"
                                data-cy={`task-item-failed-reason-form-${itemIndex}-${taskIndex}`}
                              >
                                <p
                                  className="text-[12px] font-bold text-red-800 mb-2 uppercase tracking-tight"
                                  data-cy={`task-item-failed-reason-title-${itemIndex}-${taskIndex}`}
                                >
                                  Postpone Details
                                </p>
                                <Input.TextArea
                                  placeholder="Why did this task fail?"
                                  value={
                                    failedReasons[taskId] || task.failureReason
                                  }
                                  onChange={(e) => {
                                    setFailedReasons({
                                      ...failedReasons,
                                      [taskId]: e.target.value,
                                    });
                                  }}
                                  className="mb-3 text-sm rounded-[6px] border-[#fee2e2]"
                                  autoFocus
                                  rows={2}
                                  data-cy={`task-item-failed-reason-textarea-${itemIndex}-${taskIndex}`}
                                />
                                <div
                                  className="flex gap-2 justify-end"
                                  data-cy={`task-item-failed-reason-actions-${itemIndex}-${taskIndex}`}
                                >
                                  <Button
                                    size="small"
                                    className="rounded-[6px] text-[12px]"
                                    onClick={() =>
                                      handleFailedReasonCancel(
                                        itemIndex,
                                        taskIndex,
                                      )
                                    }
                                    data-cy={`task-item-failed-reason-cancel-${itemIndex}-${taskIndex}`}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="primary"
                                    danger
                                    size="small"
                                    className="rounded-[6px] text-[12px] bg-red-600 border-none font-semibold"
                                    loading={updateWeeklyPriorityTaskLoading}
                                    onClick={() =>
                                      handleFailedReasonSubmit(
                                        itemIndex,
                                        taskIndex,
                                      )
                                    }
                                    disabled={!failedReasons[taskId]?.trim()}
                                    data-cy={`task-item-failed-reason-submit-${itemIndex}-${taskIndex}`}
                                  >
                                    Submit
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {!failedReasonVisible[taskId] &&
                          task.status === 'NOT_COMPLETED' && (
                            <div
                              className="ml-4 md:ml-5 mr-4 md:mr-6 mb-4 md:mb-[18px] bg-white border border-gray-100 shadow-sm px-5 py-3 rounded-[12px]"
                              data-cy={`task-item-failed-reason-display-${itemIndex}-${taskIndex}`}
                            >
                              <span
                                className="text-[13.5px] text-[#111827] font-bold"
                                data-cy={`task-item-failed-reason-label-${itemIndex}-${taskIndex}`}
                              >
                                Reason :{' '}
                              </span>
                              <span
                                className="text-[13.5px] text-gray-500 font-medium ml-1"
                                data-cy={`task-item-failed-reason-text-${itemIndex}-${taskIndex}`}
                              >
                                {task.failureReason}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                    {taskIndex < item.tasks.length - 1 && (
                      <div
                        className="h-[1px] bg-gray-100 mx-4 md:mx-6 opacity-60"
                        data-cy={`task-item-divider-${itemIndex}-${taskIndex}`}
                      />
                    )}
                  </div>
                );
              })}
            </Form>
          </Card>
        );
      })}

      <WeeklyPriorityModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedTask(null);
        }}
        priorities={plannedTask}
        isLoading={plannedTaskLoading}
        departmentId={userDepartmentId}
        userId={userId}
        session={session?.id || ''}
        month={month?.id || ''}
        selectedTask={selectedTask}
        planningType={planningPeriodWithHighestInterval?.planningPeriod?.name}
      />
    </>
  );
};

export default TaskCard;
