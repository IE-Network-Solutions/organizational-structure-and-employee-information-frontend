'use client';

import { Skeleton } from 'antd';

const SurveyCategorySkeleton = () => {
  return (
    <div
      data-cy="survey-category-page-loading"
      id="surveyCategoryPageLoading"
      className="rounded-lg border border-[#D9D9D9] p-4"
    >
      <div className="mx-2 mb-4" data-cy="survey-category-skeleton-toolbar">
        <Skeleton.Input
          active
          className="!h-10 !w-full !max-w-[280px] !min-w-0"
        />
      </div>

      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        data-cy="survey-category-skeleton-grid"
      >
        {Array.from({ length: 8 }).map((unusedValue, idx) => {
          void unusedValue;
          return (
            <div
              key={idx}
              className="rounded-md border border-[#D9D9D9] px-4 py-2"
              data-cy={`survey-category-skeleton-card-${idx}`}
            >
              <div
                className="mb-3 flex items-center justify-between gap-3"
                data-cy={`survey-category-skeleton-card-header-${idx}`}
              >
                <Skeleton.Input
                  active
                  size="small"
                  className="!h-4 !w-[62%] !min-w-0"
                />
                <Skeleton.Button
                  active
                  size="small"
                  className="!h-6 !w-6 !min-w-0"
                />
              </div>

              <div
                className="flex items-center justify-between gap-2"
                data-cy={`survey-category-skeleton-card-footer-${idx}`}
              >
                <div
                  className="flex items-center gap-2"
                  data-cy={`survey-category-skeleton-card-meta-${idx}`}
                >
                  <Skeleton.Avatar active size="small" shape="circle" />
                  <Skeleton.Input
                    active
                    size="small"
                    className="!h-4 !w-24 !min-w-0"
                  />
                </div>
                <Skeleton.Button
                  active
                  size="small"
                  className="!h-5 !w-14 !min-w-0"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-4 flex justify-end gap-2"
        data-cy="survey-category-skeleton-actions"
      >
        <Skeleton.Button active size="small" className="!h-8 !w-20 !min-w-0" />
        <Skeleton.Button active size="small" className="!h-8 !w-8 !min-w-0" />
        <Skeleton.Button active size="small" className="!h-8 !w-8 !min-w-0" />
      </div>
    </div>
  );
};

export default SurveyCategorySkeleton;
