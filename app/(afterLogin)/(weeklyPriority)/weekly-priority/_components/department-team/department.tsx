import React, { useEffect } from 'react';
import { Card, Empty, Skeleton } from 'antd';
import { useWeeklyPriorityStore } from '@/store/uistate/features/weeklyPriority/useStore';
import TaskCard from '../taskCard/index';
import CustomPagination from '@/components/customPagination';
import { useWeeklyPriorityList } from './useWeeklyPriorityList';

const SKELETON_CARD_COUNT = 3;

function WeeklyPriorityListSkeleton() {
  return (
    <div data-cy="weekly-priority-list-skeleton">
      {Array.from({ length: SKELETON_CARD_COUNT }).map((unusedValue, i) => (
        <Card
          key={i}
          className="mb-5 border border-[#e5e7eb] rounded-[12px] overflow-hidden"
          styles={{ body: { padding: 0 } }}
          style={{ boxShadow: 'none' }}
          data-cy={`weekly-priority-list-skeleton-card-${i}`}
        >
          <div
            className="px-4 md:px-6 py-4 md:py-5 bg-[#f9fafb] border-b border-gray-100"
            data-cy={`weekly-priority-list-skeleton-card-header-${i}`}
          >
            <Skeleton
              active
              title={{ width: '55%' }}
              paragraph={{ rows: 1, width: ['38%'] }}
            />
          </div>
          <div
            className="px-4 md:px-6 py-4 md:py-5 space-y-3"
            data-cy={`weekly-priority-list-skeleton-card-body-${i}`}
          >
            <Skeleton active paragraph={{ rows: 2, width: ['100%', '85%'] }} />
          </div>
        </Card>
      ))}
      <div
        className="flex justify-end pt-1"
        data-cy="weekly-priority-list-skeleton-pagination-row"
      >
        <Skeleton.Button
          active
          className="!h-8 !w-[280px] max-w-full rounded-[6px]"
          data-cy="weekly-priority-list-skeleton-pagination"
        />
      </div>
    </div>
  );
}

const Department: React.FC = () => {
  const { data, setData, activeTab, pageSize, setCurrentPage, setPageSize } =
    useWeeklyPriorityStore();
  const { data: weeklyPriority, isLoading: weeklyLoading } =
    useWeeklyPriorityList();

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
          <WeeklyPriorityListSkeleton />
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
