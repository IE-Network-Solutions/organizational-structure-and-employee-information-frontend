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
          className="mb-5 overflow-hidden rounded-lg border border-shell-line"
          styles={{ body: { padding: 0 } }}
          style={{ boxShadow: 'none' }}
          data-cy={`weekly-priority-list-skeleton-card-${i}`}
        >
          <div
            className="border-b border-shell-line bg-white px-4 py-3.5 md:px-5"
            data-cy={`weekly-priority-list-skeleton-card-header-${i}`}
          >
            <Skeleton
              active
              title={{ width: '55%' }}
              paragraph={{ rows: 1, width: ['38%'] }}
            />
          </div>
          <div
            className="space-y-3 px-4 py-3.5 md:px-5"
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
    <div
      className="min-w-0 max-w-full w-full"
      data-cy="department-team-container"
    >
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
