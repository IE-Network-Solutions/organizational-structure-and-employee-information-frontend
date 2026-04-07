'use client';

import { Skeleton } from 'antd';

const CARD_COUNT = 5;

const TnaCategoryPageSkeleton = () => {
  return (
    <div data-cy="tna-category-page-skeleton" id="tnaCategoryPageSkeletonId">
      <div
        className="flex justify-between mb-4"
        data-cy="tna-category-skeleton-header"
      >
        <Skeleton.Input active className="!h-7 !w-40 !min-w-0" />
        <Skeleton.Button active className="!h-10 !w-10 lg:!w-[120px]" />
      </div>

      <div
        className="flex flex-col gap-0"
        data-cy="tna-category-skeleton-list"
      >
        {Array.from({ length: CARD_COUNT }).map((_, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center p-6 rounded-2xl border border-gray-200 mt-6 gap-2.5"
            data-cy={`tna-category-skeleton-card-${idx}`}
          >
            <Skeleton.Input
              active
              size="small"
              className="!h-5 !w-[45%] !min-w-0 flex-1"
            />
            <div className="flex shrink-0 gap-2">
              <Skeleton.Button active className="!h-8 !w-8 !min-w-8" />
              <Skeleton.Button active className="!h-8 !w-8 !min-w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TnaCategoryPageSkeleton;
