import React, { useEffect } from 'react';
import { Empty, Spin } from 'antd';
import { useWeeklyPriorityStore } from '@/store/uistate/features/weeklyPriority/useStore';
import {
  useGetDepartmentChild,
  useGetWeeklyPriorities,
} from '@/store/server/features/okrplanning/weeklyPriority/queries';
import TaskCard from '../taskCard/index';
import CustomPagination from '@/components/customPagination';

const Department: React.FC = () => {
  const {
    data,
    setData,
    departmentId,
    weekIds,
    activeTab,
    pageSize,
    currentPage,
    setCurrentPage,
    setPageSize,
  } = useWeeklyPriorityStore();
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
    useGetWeeklyPriorities(
      departIds || [],
      weekIds || [],
      pageSize,
      currentPage,
    );

  useEffect(() => {
    setData(weeklyPriority?.items || []);
  }, [weeklyPriority, activeTab, setData]);

  return (
    <div className="py-4 md:py-5" data-cy="department-team-container">
      <div
        className="flex justify-between mb-5"
        data-cy="department-team-header"
      >
        {/* Filters and Add button moved to parent/FilterPopover, maintaining container if needed or removing it entirely */}
      </div>

      <>
        {weeklyLoading ? (
          <div
            data-cy="weekly-priority-components-department-team-department-tsx-department-div-116"
            className="flex justify-center items-center h-96"
          >
            <Spin size="large" tip="Loading..." />
          </div>
        ) : data?.length ? (
          <>
            <TaskCard />
            <CustomPagination
              current={weeklyPriority?.meta?.currentPage || 1}
              total={weeklyPriority?.meta?.totalItems || 1}
              pageSize={pageSize}
              onChange={(page, pageSize) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              }}
              onShowSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
        ) : (
          <Empty description="There is no weekly priority" />
        )}
      </>
    </div>
  );
};

export default Department;
