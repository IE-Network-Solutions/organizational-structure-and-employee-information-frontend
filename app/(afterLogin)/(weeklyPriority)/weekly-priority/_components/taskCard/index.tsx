import React from 'react';
import { Button, Card, Input } from 'antd';
import { HiMinus, HiOutlineCheck, HiPlus } from 'react-icons/hi';
import { RiCloseCircleFill, RiCloseLine } from 'react-icons/ri';
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

const TaskCard: React.FC = () => {
  const { userId } = useAuthenticationStore();
  const { data, setData, addNewTask, removeTask } = useWeeklyPriorityStore();
  const { mutate: createWeeklyPriorityTask } = useCreateWeeklyPriority();
  const { mutate: updateWeeklyPriorityTask } = useUpdateWeeklyPriority();
  const { mutate: deletedWeeklyPriorityTask } = useDeleteWeeklyPriority();
  const { data: userInfo } = useGetEmployee(userId);
  const { data: activeFiscalYear } = useGetActiveFiscalYears();

  const session = activeFiscalYear?.sessions?.find(
    (item: any) => item?.active===true,
  );
  const month = session?.months?.find((item: any) => item?.active===true);
  const userDepartmentId = userInfo?.employeeJobInformation[0]?.departmentId;
  const handleEditToggle = (itemIndex: number, taskIndex: number) => {
    const newData = [...data];
    newData[itemIndex].tasks[taskIndex].isEdit =
      !newData[itemIndex].tasks[taskIndex].isEdit;
    setData(newData);
  };

  const handleSaveEditTask = (itemIndex: number, taskIndex: number) => {
    const newData = [...data];
    /*  eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { isEdit, ...filteredData } = {
      ...newData[itemIndex].tasks[taskIndex],
      departmentId: userDepartmentId,
      session: session?.id,
      month: month?.id,
      createdBy: userId,
    };
    /*  eslint-enable-next-line @typescript-eslint/no-unused-vars */
    const value = filteredData;
    createWeeklyPriorityTask(value, {
      onSuccess: () => {
        newData[itemIndex].tasks[taskIndex].isEdit = false;
      },
    });
  };
  const handleUpdateStatus = (
    itemIndex: number,
    taskIndex: number,
    status: string,
  ) => {
    const newData = [...data];
    /*  eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { isEdit, ...filteredData } = {
      ...newData[itemIndex].tasks[taskIndex],
      status: status,
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

  const handleChangeDescription = (
    itemIndex: number,
    taskIndex: number,
    value: string,
  ) => {
    const newData = [...data];
    newData[itemIndex].tasks[taskIndex].title = value;
    setData(newData);
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

  return (
    <>
      {data.map((item, itemIndex) => (
        <Card
          key={itemIndex}
          bodyStyle={{ padding: 0 }}
          className="p-4 my-3 border border-gray-300"
        >
          <div className="flex justify-between">
            <span className="text-gray-300">
              {dayjs(item?.tasks[0]?.createdAt).format(
                'MMMM DD YYYY, h:mm:ss A',
              )}
            </span>
            <span className="text-gray-300">
              {getEmployeeData(item.tasks[0]?.createdBy || '')?.firstName +
                ' ' +
                (getEmployeeData(item.tasks[0]?.createdBy || '')?.middleName
                  ? getEmployeeData(item.tasks[0]?.createdBy || '')
                      .middleName.charAt(0)
                      .toUpperCase()
                  : '')}
            </span>
          </div>
          <div className="text-black font-semibold text-lg">
            {item.departmentId
              ? getDepartmentData(item.departmentId)?.name || ''
              : ''}
          </div>

          <div>
            {item.tasks.map((task, taskIndex) => (
              <div
                key={taskIndex}
                className="flex justify-between items-center mt-2"
              >
                <div className="flex gap-2 items-center w-full">
                  {task.status === 'COMPLETED' ? (
                    <Popconfirm
                      title="Do you want to undo the task progress?"
                      onConfirm={() =>
                        handleUpdateStatus(itemIndex, taskIndex, 'PENDING')
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
                        handleUpdateStatus(itemIndex, taskIndex, 'PENDING')
                      }
                      okText="Yes"
                      cancelText="No"
                      placement="bottom"
                    >
                      {' '}
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
                    <div className="relative w-full">
                      <Input
                        value={task.title}
                        onChange={(e) =>
                          handleChangeDescription(
                            itemIndex,
                            taskIndex,
                            e.target.value,
                          )
                        }
                        className="w-[80%]"
                        placeholder="Enter Task Description"
                        autoFocus
                        required
                      />
                      {!task.title && (
                        <div className="text-red-500 font-normal absolute top-7">
                          Task Description is required
                        </div>
                      )}
                    </div>
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
                {task.status === 'PENDING' && (
                  <div className="flex gap-4 mb-4">
                    {task?.isEdit ? (
                      <Button
                        type="primary"
                        className="bg-green-600 border-none w-8 h-5 rounded-sm"
                        onClick={() => handleSaveEditTask(itemIndex, taskIndex)}
                        disabled={!task.title}
                        icon={<HiOutlineCheck />}
                      />
                    ) : (
                      <Popconfirm
                        title="Are you sure you Finished?"
                        onConfirm={() =>
                          handleUpdateStatus(itemIndex, taskIndex, 'COMPLETED')
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
                      <Popconfirm
                        title="Are you sure you Finished?"
                        onConfirm={() =>
                          handleUpdateStatus(
                            itemIndex,
                            taskIndex,
                            'NOT_COMPLETED',
                          )
                        }
                        okText="Failed"
                        cancelText="Cancel"
                        placement="bottom"
                      >
                        <Button
                          type="primary"
                          className="bg-red-600 w-8 h-5 rounded-sm"
                          icon={<RiCloseLine />}
                        />
                      </Popconfirm>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div className="flex justify-end">
              <Button
                type="primary"
                icon={<HiPlus />}
                onClick={() => addNewTask(itemIndex)}
              >
                <span className="text-xs"> Add new</span>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
};
export default TaskCard;
