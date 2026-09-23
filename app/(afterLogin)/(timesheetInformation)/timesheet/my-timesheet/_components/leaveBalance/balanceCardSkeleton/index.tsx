import React from 'react';
import { Skeleton } from 'antd';

const LeaveBalanceCardSkeleton = () => {
  return (
    <div
      className="my-2 min-h-[120px] w-full rounded-lg bg-shell-tint px-4 py-3.5"
      data-cy="time-attendance-leave-balance-card-skeleton"
    >
      <div
        className="flex justify-between items-start gap-2"
        data-cy="time-attendance-leave-balance-card-skeleton-header"
      >
        <div
          className="flex-1 min-w-0"
          data-cy="time-attendance-leave-balance-card-skeleton-header-left"
        >
          <Skeleton active title={{ width: '70%' }} paragraph={false} />
          <Skeleton
            active
            title={{ width: '40%' }}
            paragraph={false}
            className="!mt-1"
          />
        </div>
        <Skeleton
          active
          title={{ width: 48 }}
          paragraph={false}
          className="shrink-0"
        />
      </div>
      <div
        className="flex justify-between gap-2 mt-3"
        data-cy="time-attendance-leave-balance-card-skeleton-stats"
      >
        <Skeleton.Button
          active
          block
          className="!flex-1 !min-w-0 !h-12 !rounded-lg"
        />
        <Skeleton.Button
          active
          block
          className="!flex-1 !min-w-0 !h-12 !rounded-lg"
        />
        <Skeleton.Button
          active
          block
          className="!flex-1 !min-w-0 !h-12 !rounded-lg"
        />
      </div>
    </div>
  );
};

export default LeaveBalanceCardSkeleton;
