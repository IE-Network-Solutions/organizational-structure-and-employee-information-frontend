'use client';

import { Skeleton } from 'antd';

const TnaManagementSkeleton = () => {
  return (
    <div
      className="w-full"
      data-cy="tna-management-layout-loading"
      id="tnaManagementLayoutLoading"
    >
      <header
        className="mb-5 flex w-full flex-col gap-4"
        data-cy="tna-management-skeleton-header"
      >
        <div
          className="flex min-h-[58px] w-full items-center justify-between gap-4"
          data-cy="tna-management-skeleton-header-row"
        >
          <div
            className="space-y-2"
            data-cy="tna-management-skeleton-title-block"
          >
            <Skeleton.Input active className="!h-8 !w-56 !min-w-0" />
            <Skeleton.Input
              active
              size="small"
              className="!h-4 !w-72 !min-w-0"
            />
          </div>
          <Skeleton.Button
            active
            className="!h-10 !w-10 md:!w-[135px] !min-w-0"
          />
        </div>
        <div
          className="h-px w-full bg-[#EEEEEE]"
          data-cy="tna-management-skeleton-divider"
        />
      </header>

      <div
        className="box-border flex w-full flex-col gap-4 rounded-lg border border-[#D9D9D9] p-3"
        data-cy="tna-management-skeleton-content"
      >
        <Skeleton.Input active className="!h-10 !w-full !min-w-0" />

        <div
          className="grid w-full max-w-[380px] grid-cols-1 gap-[32px] md:max-w-none md:grid-cols-2 xl:grid-cols-3"
          data-cy="tna-management-skeleton-grid"
        >
          {Array.from({ length: 6 }).map((unusedValue, idx) => {
            void unusedValue;
            return (
              <div
                key={idx}
                className="relative flex h-[295px] w-full flex-col overflow-hidden rounded-[8px] border border-[#D9D9D9] bg-white pb-3"
                data-cy={`tna-management-skeleton-card-${idx}`}
              >
                <Skeleton.Image active className="!h-[159px] !w-full" />
                <div
                  className="flex flex-1 flex-col gap-2 px-4 pt-3"
                  data-cy={`tna-management-skeleton-card-body-${idx}`}
                >
                  <div
                    className="flex items-center justify-between"
                    data-cy={`tna-management-skeleton-card-meta-${idx}`}
                  >
                    <Skeleton.Input
                      active
                      size="small"
                      className="!h-4 !w-24 !min-w-0"
                    />
                    <Skeleton.Input
                      active
                      size="small"
                      className="!h-4 !w-10 !min-w-0"
                    />
                  </div>
                  <Skeleton.Input
                    active
                    size="small"
                    className="!h-5 !w-[70%] !min-w-0"
                  />
                  <Skeleton paragraph={{ rows: 2 }} title={false} active />
                  <div
                    className="mt-auto flex gap-4 pt-1"
                    data-cy={`tna-management-skeleton-card-actions-${idx}`}
                  >
                    <Skeleton.Input
                      active
                      size="small"
                      className="!h-4 !w-20 !min-w-0"
                    />
                    <Skeleton.Input
                      active
                      size="small"
                      className="!h-4 !w-20 !min-w-0"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TnaManagementSkeleton;
