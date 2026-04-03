'use client';

import { Skeleton } from 'antd';

const headerStatCardShellClass =
  'flex flex-col gap-4 h-[115px] min-w-[260px] flex-none shadow-none rounded-lg border border-[#D9D9D9] bg-white p-3 md:min-w-0';

function HeaderStatCardSkeleton({ dataCy }: { dataCy?: string }) {
  return (
    <div className={headerStatCardShellClass} data-cy={dataCy}>
      <div
        data-cy="dashboard-subscription-skeleton-header-card-avatar"
        className="flex items-center justify-between"
      >
        <Skeleton.Avatar
          active
          shape="square"
          size={34}
          className="!rounded-[4px]"
        />
      </div>
      <div
        data-cy="dashboard-subscription-skeleton-header-card-lines"
        className="mt-3 flex flex-col gap-2"
      >
        <Skeleton.Input active size="small" className="!h-4 !w-36 !min-w-0" />
        <Skeleton.Input active size="small" className="!h-2 !w-full !min-w-0" />
      </div>
    </div>
  );
}

export default function DashboardSubscriptionSkeleton() {
  return (
    <div className="min-h-screen" data-cy="dashboard-subscription-skeleton">
      <div
        className="my-5 flex justify-between items-center"
        data-cy="dashboard-subscription-skeleton-header"
      >
        <Skeleton.Input active className="!h-8 !w-44 !min-w-0" />
        <div
          data-cy="dashboard-subscription-skeleton-header-buttons"
          className="flex gap-2 items-center"
        >
          <Skeleton.Button active size="small" />
          <Skeleton.Button active size="small" />
        </div>
      </div>

      <div
        className="w-full pb-6 flex flex-nowrap gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5"
        data-cy="dashboard-subscription-skeleton-header-cards"
      >
        <HeaderStatCardSkeleton data-cy="dashboard-subscription-skeleton-stat-1" />
        <HeaderStatCardSkeleton data-cy="dashboard-subscription-skeleton-stat-2" />
        <HeaderStatCardSkeleton data-cy="dashboard-subscription-skeleton-stat-3" />
        <HeaderStatCardSkeleton data-cy="dashboard-subscription-skeleton-stat-4" />
        <HeaderStatCardSkeleton data-cy="dashboard-subscription-skeleton-stat-5" />
      </div>

      <div data-cy="dashboard-subscription-skeleton-content">
        <div
          data-cy="dashboard-subscription-skeleton-content-grid"
          className="grid grid-cols-12 gap-4 pb-5"
        >
          <div
            data-cy="dashboard-subscription-skeleton-content-grid-left"
            className="md:col-span-7 col-span-12 space-y-4"
          >
            <Skeleton
              active
              paragraph={{ rows: 10 }}
              title={{ width: '42%' }}
            />
          </div>
          <div
            data-cy="dashboard-subscription-skeleton-content-grid-right"
            className="md:col-span-5 col-span-12 space-y-4"
          >
            <Skeleton active paragraph={{ rows: 8 }} title={{ width: '55%' }} />
          </div>
        </div>
        <div
          data-cy="dashboard-subscription-skeleton-content-bottom"
          className="pb-5"
        >
          <Skeleton active paragraph={{ rows: 4 }} title={{ width: '32%' }} />
        </div>
        <div
          data-cy="dashboard-subscription-skeleton-content-bottom-bottom"
          className="pb-6"
        >
          <Skeleton.Input active className="!h-7 !w-36 !min-w-0 mb-4" />
          <Skeleton active paragraph={{ rows: 6 }} title={false} />
        </div>
      </div>
    </div>
  );
}
