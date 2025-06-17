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
      {data.map((item, itemIndex) => (
        <Card
          key={itemIndex}
          bodyStyle={{ padding: 0 }}
          className=" my-3 border border-gray-300"
        >
          <div className="flex justify-between bg-gray-50  p-2 items-center rounded-t-xl">
            <span className="text-right text-md font-bold">
              {item.departmentId
                ? getDepartmentData(item.departmentId)?.name +
                " Team's weekly priority:" || ''
                : ''}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 flex flex-col text-xs">
                <span className="text-right">
                  {getEmployeeData(item.tasks[0]?.createdBy || '')?.firstName +
                    ' ' +
                    (getEmployeeData(item.tasks[0]?.createdBy || '')
                      ?.middleName || '')}
                </span>
                <span>
                  {dayjs(item?.tasks[0]?.createdAt).format(
                    'MMMM DD YYYY, h:mm:ss A',
                  )}
                </span>
              </span>
              {item.tasks[0]?.createdBy === userId && (
                <Dropdown
                  menu={{ items: dropdownItems(item) }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    icon={<RiMore2Fill className="text-gray-500" />}
                    className="flex items-center justify-center"
                  />
                </Dropdown>
              )}
            </div>
          </div>
          {/* <div className="text-black font-semibold text-lg">
           
          </div> */}

          <Form form={form}>
            <div className="p-2">
              {item.tasks.map((task, taskIndex) => (
                <div key={taskIndex} className="flex flex-col mt-2">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center w-full">
                      {task.status === 'COMPLETED' ? (
                        <Popconfirm
                          title="Do you want to undo the task progress?"
                          onConfirm={() =>
                            handleUpdateStatus(
                              itemIndex,
                              taskIndex,
                              'PENDING',
                              '',
                            )
                          }
                          okText="Yes"
                          cancelText="No"
                          placement="bottom"
                        >
                          <Button
                            type="primary"
                            className="bg-green-600 border-none w-4 h-4 rounded-full"
                            icon={<FiCheckCircle size={8} />}
                          />
                        </Popconfirm>
                      ) : task.status === 'NOT_COMPLETED' ? (
                        <Popconfirm
                          title="Do you want to undo the task progress?"
                          onConfirm={() =>
                            handleUpdateStatus(
                              itemIndex,
                              taskIndex,
                              'PENDING',
                              '',
                            )
                          }
                          okText="Yes"
                          cancelText="No"
                          placement="bottom"
                        >
                          <Button
                            type="primary"
                            className="bg-red-600 border-none w-4 h-4 rounded-full"
                            icon={<RiCloseCircleFill size={8} />}
                          />
                        </Popconfirm>
                      ) : (
                        '  '
                      )}
                      <div className="border-[1px] rounded-[4px] w-3 h-3 flex items-center justify-center border-[#cfaaff]">
                        <span className="rounded-full bg-blue w-1 h-1"></span>
                      </div>

                      {task.isEdit ? (
                        <Form.Item
                          name={`task-${itemIndex}-${taskIndex}`}
                          initialValue={task.title}
                          rules={[
                            {
                              required: true,
                              message: 'Task Description is required',
                            },
                          ]}
                          className="w-[80%] mb-0"
                        >
                          <Input
                            placeholder="Enter Task Description"
                            autoFocus
                          />
                        </Form.Item>
                      ) : (
                        <span
                          className="w-full"
                          onClick={() => {
                            if (task.status === 'PENDING') {
                              handleEditToggle(itemIndex, taskIndex);
                            }
                          }}
                        >
                          {task.title}
                        </span>
                      )}
                    </div>
                    {task.status === 'PENDING' &&
                      item.tasks[0]?.createdBy === userId && (
                        <div className="flex gap-4 mb-4">
                          {task?.isEdit ? (
                            <Button
                              type="primary"
                              className="bg-green-600 border-none w-8 h-5 rounded-sm"
                              onClick={() =>
                                handleSaveEditTask(itemIndex, taskIndex)
                              }
                              icon={<HiOutlineCheck />}
                            />
                          ) : (
                            <Popconfirm
                              title="Are you sure you Finished?"
                              onConfirm={() =>
                                handleUpdateStatus(
                                  itemIndex,
                                  taskIndex,
                                  'COMPLETED',
                                  '',
                                )
                              }
                              okText="Finished"
                              cancelText="Cancel"
                              placement="bottom"
                            >
                              <Button
                                type="primary"
                                className="bg-green-600 border-none w-8 h-5 rounded-sm"
                                icon={<HiOutlineCheck />}
                              />
                            </Popconfirm>
                          )}
                          {task?.isEdit ? (
                            <Popconfirm
                              title="Are you sure to Remove the Task?"
                              onConfirm={() =>
                                task?.id
                                  ? handleDeleted(itemIndex, taskIndex)
                                  : removeTask(itemIndex, taskIndex)
                              }
                              okText="Remove"
                              cancelText="Cancel"
                              placement="bottom"
                            >
                              <Button
                                type="primary"
                                className="bg-red-600 w-8 h-5 rounded-sm"
                                icon={<HiMinus />}
                              />
                            </Popconfirm>
                          ) : (
                            <Button
                              type="primary"
                              className="bg-red-600 w-8 h-5 rounded-sm"
                              icon={<RiCloseLine />}
                              onClick={() => {
                                const taskKey = `${itemIndex}-${taskIndex}`;
                                setFailedReasonVisible({
                                  ...failedReasonVisible,
                                  [taskKey]: true,
                                });
                              }}
                            />
                          )}
                        </div>
                      )}
                  </div>
                  {failedReasonVisible[`${itemIndex}-${taskIndex}`] && (
                    <div className="ml-6 mt-2 relative">
                      <Input.TextArea
                        placeholder="Enter reason for failure"
                        value={
                          failedReasons[`${itemIndex}-${taskIndex}`] ||
                          task.failureReason
                        }
                        onChange={(e) => {
                          const taskKey = `${itemIndex}-${taskIndex}`;
                          setFailedReasons({
                            ...failedReasons,
                            [taskKey]: e.target.value,
                          });
                        }}
                        className="mb-2"
                        autoFocus
                      />
                      <div className="absolute bottom-2 right-2">
                        <div className="flex gap-2 mb-1">
                          <Button
                            type="primary"
                            className="text-xs py-1 px-2 h-6"
                            onClick={() =>
                              handleFailedReasonSubmit(itemIndex, taskIndex)
                            }
                            disabled={
                              !failedReasons[
                                `${itemIndex}-${taskIndex}`
                              ]?.trim()
                            }
                            loading={updateWeeklyPriorityTaskLoading}
                          >
                            Submit
                          </Button>
                          <Button
                            onClick={() =>
                              handleFailedReasonCancel(itemIndex, taskIndex)
                            }
                            className="text-xs py-1 px-2 h-6"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {!failedReasonVisible[`${itemIndex}-${taskIndex}`] &&
                    task.status === 'NOT_COMPLETED' && (
                      <div
                        onClick={() => {
                          const taskKey = `${itemIndex}-${taskIndex}`;
                          setFailedReasonVisible({
                            ...failedReasonVisible,
                            [taskKey]: true,
                          });
                        }}
                        className="ml-6 mt-2 relative border rounded-md p-2 cursor-pointer"
                      >
                        <span className="text-xs">{task.failureReason}</span>
                      </div>
                    )}
                </div>
              ))}
              {/* {item.tasks[0]?.createdBy === userId && (
                <div className="flex justify-end">
                  <Button
                    type="primary"
                    icon={<HiPlus />}
                    onClick={() => addNewTask(itemIndex)}
                  >
                    <span className="text-xs"> Add new</span>
                  </Button>
                </div>
              )} */}
            </div>
          </Form>
        </Card>
      ))}
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
