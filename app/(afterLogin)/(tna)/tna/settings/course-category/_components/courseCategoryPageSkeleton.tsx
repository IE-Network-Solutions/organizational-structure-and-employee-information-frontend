'use client';

import { Skeleton } from 'antd';

const CARD_COUNT = 6;

const CourseCategoryPageSkeleton = () => {
  return (
    <div
      className="flex flex-col lg:flex-row gap-4 lg:gap-5"
      data-cy="tna-course-category-page-skeleton"
      id="tnaCourseCategoryPageSkeletonId"
    >
      <div
        className="w-full lg:w-[60%] border border-[#D9D9D9] rounded-lg bg-white p-3 lg:p-4"
        data-cy="tna-course-category-skeleton-list-panel"
      >
        <Skeleton.Input
          active
          className="!h-8 !w-full !min-w-0 mb-3 lg:hidden"
          data-cy="tna-course-category-skeleton-search"
        />
        <div
          className="flex flex-col gap-3"
          data-cy="tna-course-category-skeleton-list"
        >
          {Array.from({ length: CARD_COUNT }).map((unusedValue, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-2.5 lg:px-4 lg:py-3 border border-[#D9D9D9] rounded-lg bg-white"
              data-cy={`tna-course-category-skeleton-card-${idx}`}
            >
              <div
                className="flex-1 min-w-0 pr-3 flex flex-col gap-2"
                data-cy={`tna-course-category-skeleton-card-content-${idx}`}
              >
                <Skeleton.Input
                  active
                  size="small"
                  className="!h-4 !w-[55%] !min-w-0"
                />
                <Skeleton.Input
                  active
                  size="small"
                  className="!h-3 !w-[85%] !min-w-0"
                />
              </div>
              <Skeleton.Button active className="!w-6 !h-6 !min-w-6 !min-h-6" />
            </div>
          ))}
        </div>
      </div>

      <div
        className="hidden lg:block flex-1 self-start border border-[#D9D9D9] rounded-lg bg-white p-5"
        data-cy="tna-course-category-skeleton-form-panel"
      >
        <div
          className="space-y-6"
          data-cy="tna-course-category-skeleton-form-fields"
        >
          <div
            className="space-y-2"
            data-cy="tna-course-category-skeleton-form-name"
          >
            <Skeleton.Input
              active
              size="small"
              className="!h-3 !w-12 !min-w-0"
            />
            <Skeleton.Input active className="!h-10 !w-full !min-w-0" />
          </div>
          <div
            className="space-y-2"
            data-cy="tna-course-category-skeleton-form-description"
          >
            <Skeleton.Input
              active
              size="small"
              className="!h-3 !w-24 !min-w-0"
            />
            <Skeleton.Input active className="!h-[88px] !w-full !min-w-0" />
          </div>
          <div
            className="flex justify-end gap-2 pt-2"
            data-cy="tna-course-category-skeleton-form-actions"
          >
            <Skeleton.Button active className="!h-9 !w-20" />
            <Skeleton.Button active className="!h-9 !w-24" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCategoryPageSkeleton;
