import React from 'react';
import { Skeleton } from 'antd';

const LeaveBalanceCardSkeleton = () => {
  return (
    <div
      className="w-full min-h-[120px] rounded-xl my-2 py-3 px-3 sm:px-4 border border-gray-200"
      style={{ backgroundColor: '#F9FAFB' }}
      data-cy="time-attendance-leave-balance-card-skeleton"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <Skeleton active title={{ width: '70%' }} paragraph={false} />
          <Skeleton active title={{ width: '40%' }} paragraph={false} className="!mt-1" />
        </div>
        <Skeleton active title={{ width: 48 }} paragraph={false} className="shrink-0" />
      </div>
      <div className="flex justify-between gap-2 mt-3">
        <Skeleton.Button active block className="!flex-1 !min-w-0 !h-12 !rounded-lg" />
        <Skeleton.Button active block className="!flex-1 !min-w-0 !h-12 !rounded-lg" />
        <Skeleton.Button active block className="!flex-1 !min-w-0 !h-12 !rounded-lg" />
      </div>
    </div>
  );
};

export default LeaveBalanceCardSkeleton;
