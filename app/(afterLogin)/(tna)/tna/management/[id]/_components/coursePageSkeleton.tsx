'use client';

import { Skeleton } from 'antd';

const CoursePageSkeleton = () => {
  return (
    <>
      <div
        className="mt-8 flex items-center gap-8 bg-[#B2B2FF66] py-6 pl-8 pr-2"
        data-cy="tna-course-page-header-loading"
        id="tnaCoursePageHeaderLoading"
      >
        <div className="flex-1" data-cy="tna-course-skeleton-header-text">
          <Skeleton.Input active className="!h-10 !w-[55%] !min-w-0" />
        </div>
        <div
          className="hidden h-[265px] w-[435px] overflow-hidden rounded-2xl sm:block"
          data-cy="tna-course-skeleton-header-image"
        >
          <Skeleton.Image active className="!h-full !w-full" />
        </div>
      </div>

      <div className="mt-4" data-cy="tna-course-skeleton-body">
        <div
          className="mx-auto mb-4 flex max-w-[360px] items-center justify-center gap-4"
          data-cy="tna-course-skeleton-tabs"
        >
          <Skeleton.Button active className="!h-8 !w-24 !min-w-0" />
          <Skeleton.Button active className="!h-8 !w-24 !min-w-0" />
        </div>
        <div
          className="mx-auto max-w-[980px] rounded-lg border border-[#D9D9D9] p-4"
          data-cy="tna-course-skeleton-content"
        >
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    </>
  );
};

export default CoursePageSkeleton;
