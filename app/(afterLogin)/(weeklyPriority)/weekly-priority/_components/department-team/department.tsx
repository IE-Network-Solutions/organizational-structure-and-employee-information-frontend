import React, { useEffect } from 'react';
import { Button, Select, Empty, Spin } from 'antd';
import { HiPlus } from 'react-icons/hi';
import { useWeeklyPriorityStore } from '@/store/uistate/features/weeklyPriority/useStore';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useGetDepartmentChild,
  useGetWeeklyPriorities,
  useGetWeeks,
} from '@/store/server/features/okrplanning/weeklyPriority/queries';
import TaskCard from '../taskCard';

const Department: React.FC = () => {
  const {
    addNewCard,
    data,
    setData,
    departmentId,
    setDepartmentId,
    setWeekIds,
    weekIds,
    activeTab,
  } = useWeeklyPriorityStore();
  const { userId } = useAuthenticationStore();
  const { data: userInfo } = useGetEmployee(userId);
  const userDepartmentId = userInfo?.employeeJobInformation[0]?.departmentId;
  const { data: Departments } = useGetUserDepartment();
  const { data: departmentChild } = useGetDepartmentChild(departmentId || '');
  const departmentIds = Array.isArray(departmentChild)
    ? departmentChild.map((item) => item.id)
    : [];
  const departIds =
    !departmentIds?.length || activeTab === 2
      ? departmentId
        ? [departmentId]
        : []
      : departmentIds;
  const { data: weeklyPriority, isLoading: weeklyLoading } =
    useGetWeeklyPriorities(departIds || [], weekIds || []);
  const { data: weeks } = useGetWeeks();
  useEffect(() => {
    setData(weeklyPriority?.items || []);
  }, [weeklyPriority, activeTab]);
  return (
    <div style={{ padding: 20 }}>
      <div className="flex justify-between mb-5">
        <div className="flex gap-4">
          <Select
            id={`selectDepartment`}
            placeholder={
              activeTab == 1
                ? 'Search and select a department'
                : 'Search and select a team'
            }
            onChange={(value) => setDepartmentId(value)}
            allowClear
            showSearch
            className="w-72"
            optionFilterProp="children" // Enables searching based on the text in options
            filterOption={(input, option) =>
              (option?.children as any)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {Departments?.map((item: any) => (
              <Select.Option key={item?.id} value={item?.id}>
                {item?.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            id={`selectDepartment`}
            placeholder="Search and select a Weeks"
            onChange={(value) => setWeekIds(value)}
            allowClear
            showSearch
            mode="multiple"
            className="w-72"
            optionFilterProp="children" // Enables searching based on the text in options
            filterOption={(input, option) =>
              (option?.children as any)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {weeks?.map((item: any) => (
              <Select.Option key={item?.id} value={item?.id}>
                {item?.title}
              </Select.Option>
            ))}
          </Select>
        </div>
        <Button
          onClick={() => addNewCard(userId, userDepartmentId)}
          type="primary"
          icon={<HiPlus />}
        >
          <span className="text-xs">Add one thing</span>
        </Button>
      </div>
      <>
        {weeklyLoading ? (
          <div className="flex justify-center items-center h-96">
            <Spin size="large" tip="Loading..." />
          </div>
        ) : data?.length ? (
          <TaskCard />
        ) : (
          <Empty description="There is no weekly priority" />
        )}
      </>
    </div>
  );
};

export default Department;
