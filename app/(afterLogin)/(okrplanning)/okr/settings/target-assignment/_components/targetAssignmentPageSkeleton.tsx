'use client';

import { Skeleton } from 'antd';

const CARD_COUNT = 8;

const TargetAssignmentPageSkeleton = () => {
  return (
    <div
      data-cy="okr-target-assignment-page-skeleton"
      id="okrTargetAssignmentPageSkeletonId"
    >
      <div
        className="mb-6 flex flex-wrap items-center gap-3"
        data-cy="okr-target-assignment-skeleton-filters"
      >
        <Skeleton.Input
          active
          className="!h-10 !min-w-0 !w-full !max-w-[280px]"
        />
        <Skeleton.Input active className="!h-10 !min-w-0 !w-[180px]" />
      </div>

      <div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        data-cy="okr-target-assignment-skeleton-grid"
      >
        {Array.from({ length: CARD_COUNT }).map((unusedValue, idx) => (
          <div
            key={idx}
            className="rounded-[8px] border border-[#d9d9d9] bg-white p-5"
            data-cy={`okr-target-assignment-skeleton-card-${idx}`}
          >
            <div
              className="mb-2 flex items-start justify-between gap-2"
              data-cy={`okr-target-assignment-skeleton-card-header-${idx}`}
            >
              <Skeleton.Input
                active
                size="small"
                className="!h-5 !min-w-0 !flex-1 !w-[65%]"
              />
              <Skeleton.Button active className="!h-8 !w-8 !min-w-8" />
            </div>
            <Skeleton.Input
              active
              size="small"
              className="!mb-4 !h-6 !w-24 !min-w-0"
            />
            <div
              className="mb-4 h-px bg-[#f0f0f0]"
              data-cy={`okr-target-assignment-skeleton-card-divider-${idx}`}
            />
            <div
              className="flex flex-wrap items-center gap-2"
              data-cy={`okr-target-assignment-skeleton-card-actions-${idx}`}
            >
              <Skeleton.Input
                active
                size="small"
                className="!h-5 !w-14 !min-w-0"
              />
              <Skeleton.Button
                active
                size="small"
                className="!h-6 !w-16 !min-w-0"
              />
              <Skeleton.Button
                active
                size="small"
                className="!h-6 !w-16 !min-w-0"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TargetAssignmentPageSkeleton;
