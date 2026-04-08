'use client';

import { Skeleton } from 'antd';

const LessonMaterialPageSkeleton = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <div
      className={`bg-white flex ${isMobile ? 'flex-col' : 'justify-between'} items-start gap-4`}
      data-cy="tna-lesson-page-loading"
      id="tnaLessonPageLoading"
    >
      <div
        className={`mt-6 ${isMobile ? 'w-full' : 'w-[67%]'} mx-auto shrink-0 self-start rounded-lg border border-[#D9D9D9] p-4`}
        data-cy="tna-lesson-skeleton-main"
      >
        <div
          className="relative aspect-video w-full overflow-hidden bg-black"
          data-cy="tna-lesson-skeleton-video"
        >
          <Skeleton.Image active className="!h-full !w-full" />
        </div>

        <div className="mt-3" data-cy="tna-lesson-skeleton-intro">
          <Skeleton.Input active className="!h-6 !w-28 !min-w-0" />
          <div className="mt-2" data-cy="tna-lesson-skeleton-intro-body">
            <Skeleton active paragraph={{ rows: 4 }} title={false} />
          </div>
        </div>

        <div className="mt-3" data-cy="tna-lesson-skeleton-materials">
          <Skeleton.Input active className="!mb-2 !h-7 !w-32 !min-w-0" />
          <div
            className="flex flex-wrap gap-2.5"
            data-cy="tna-lesson-skeleton-materials-list"
          >
            {Array.from({ length: 4 }).map((unusedValue, idx) => {
              void unusedValue;
              return (
                <Skeleton.Button
                  key={idx}
                  active
                  size="small"
                  className="!h-8 !w-32 !min-w-0"
                />
              );
            })}
          </div>
        </div>
      </div>

      {!isMobile && (
        <div
          className="mt-6 mx-auto w-[32%] shrink-0 self-start rounded-lg border border-[#D9D9D9] p-4"
          data-cy="tna-lesson-skeleton-sidebar"
        >
          <Skeleton.Input active size="small" className="!h-4 !w-24 !min-w-0" />
          <Skeleton.Input active className="!mt-2 !h-6 !w-[70%] !min-w-0" />
          <div
            className="mt-2 space-y-2"
            data-cy="tna-lesson-skeleton-sidebar-list"
          >
            {Array.from({ length: 6 }).map((unusedValue, idx) => {
              void unusedValue;
              return (
                <div
                  key={idx}
                  className="rounded-lg bg-gray-50 px-3 py-2.5"
                  data-cy={`tna-lesson-skeleton-sidebar-item-${idx}`}
                >
                  <Skeleton.Input
                    active
                    size="small"
                    className="!h-4 !w-[80%] !min-w-0"
                  />
                  <Skeleton.Input
                    active
                    size="small"
                    className="!mt-1 !h-3 !w-12 !min-w-0"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonMaterialPageSkeleton;
