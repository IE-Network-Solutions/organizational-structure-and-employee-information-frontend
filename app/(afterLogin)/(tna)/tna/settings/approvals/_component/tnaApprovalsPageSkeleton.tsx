'use client';

import { Skeleton } from 'antd';

const CARD_COUNT = 6;

const TnaApprovalsPageSkeleton = () => {
  return (
    <div
      className="mt-2 w-full"
      data-cy="tna-approvals-page-skeleton"
      id="tnaApprovalsPageSkeletonId"
    >
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        data-cy="tna-approvals-skeleton-grid"
      >
        {Array.from({ length: CARD_COUNT }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-[#D9D9D9] bg-white p-3"
            data-cy={`tna-approvals-skeleton-card-${idx}`}
          >
            <div
              className="flex items-center justify-between mb-3"
              data-cy={`tna-approvals-skeleton-card-header-${idx}`}
            >
              <Skeleton.Button active className="!h-6 !w-20 !min-w-0" />
              <div className="flex gap-2">
                <Skeleton.Button active className="!h-7 !w-7 !min-w-7" />
                <Skeleton.Button active className="!h-7 !w-7 !min-w-7" />
                <Skeleton.Button active className="!h-7 !w-7 !min-w-7" />
              </div>
            </div>
            <Skeleton.Input
              active
              className="!h-7 !w-[75%] !min-w-0 !max-w-[280px] mb-3"
            />
            <Skeleton.Input
              active
              size="small"
              className="!h-6 !w-[55%] !min-w-0 mb-3"
            />
            <div
              className="border-t border-gray-200 pt-3 space-y-2"
              data-cy={`tna-approvals-skeleton-card-assigned-${idx}`}
            >
              <Skeleton.Input
                active
                size="small"
                className="!h-4 !w-24 !min-w-0"
              />
              <div className="flex items-center gap-2">
                <Skeleton.Avatar active size="small" />
                <div className="flex-1 space-y-1">
                  <Skeleton.Input
                    active
                    size="small"
                    className="!h-3 !w-[45%] !min-w-0"
                  />
                  <Skeleton.Input
                    active
                    size="small"
                    className="!h-3 !w-[35%] !min-w-0"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TnaApprovalsPageSkeleton;
