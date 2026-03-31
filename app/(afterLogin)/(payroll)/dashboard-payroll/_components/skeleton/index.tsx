'use client';

import React from 'react';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';

const SkeletonBlock = ({ className }: { className: string }) => (
  <div
    className={`animate-pulse rounded-md bg-gray-200 ${className}`}
    data-cy="dashboard-payroll-skeleton-block"
  />
);

export default function DashboardPayrollSkeleton({
  'data-cy': dataCy = 'dashboard-payroll-skeleton',
}: {
  'data-cy'?: string;
}) {
  return (
    <div className="h-auto w-full pr-0 md:pr-2" data-cy={dataCy}>
      <BlockWrapper className="h-auto w-full bg-white">
        <div
          className="mb-4 flex w-full items-center justify-between gap-3"
          data-cy={`${dataCy}-header`}
        >
          <div className="space-y-2" data-cy={`${dataCy}-header-title`}>
            <SkeletonBlock className="h-6 w-28" />
            <SkeletonBlock className="h-4 w-44" />
          </div>
          <SkeletonBlock className="h-8 w-36 sm:w-[217px]" />
        </div>

        <div
          className="mb-4 grid w-full grid-cols-1 gap-[19px] sm:grid-cols-2 lg:grid-cols-4"
          data-cy={`${dataCy}-stat-grid`}
        >
          {Array.from({ length: 4 }).map((itemValue, index) => {
            void itemValue;
            return (
              <div
                key={`stat-skeleton-${index + 1}`}
                className="h-[122px] rounded-lg border border-gray-200 p-3 shadow-sm"
                data-cy={`${dataCy}-stat-card-${index + 1}`}
              >
                <div
                  className="flex h-full flex-col justify-between"
                  data-cy={`${dataCy}-stat-card-body-${index + 1}`}
                >
                  <div
                    className="flex items-center gap-2"
                    data-cy={`${dataCy}-stat-card-header-${index + 1}`}
                  >
                    <SkeletonBlock className="h-[26px] w-[26px]" />
                    <SkeletonBlock className="h-4 w-24" />
                  </div>
                  <div
                    className="space-y-2"
                    data-cy={`${dataCy}-stat-card-values-${index + 1}`}
                  >
                    <SkeletonBlock className="h-6 w-28" />
                    <SkeletonBlock className="h-4 w-36" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="grid grid-cols-12 gap-4"
          data-cy={`${dataCy}-main-grid`}
        >
          <div
            className="col-span-12 rounded-lg border border-gray-200 p-3 shadow-sm lg:col-span-8"
            data-cy={`${dataCy}-graph-panel`}
          >
            <div
              className="mb-3 flex items-center justify-between gap-2"
              data-cy={`${dataCy}-graph-header`}
            >
              <SkeletonBlock className="h-5 w-32" />
              <SkeletonBlock className="h-6 w-36" />
            </div>
            <SkeletonBlock className="h-[255px] w-full sm:h-[250px]" />
          </div>

          <div
            className="col-span-12 rounded-lg border border-gray-200 p-3 shadow-sm lg:col-span-4"
            data-cy={`${dataCy}-payment-panel`}
          >
            <SkeletonBlock className="mb-3 h-5 w-36" />
            <div className="space-y-2" data-cy={`${dataCy}-payment-list`}>
              {Array.from({ length: 7 }).map((itemValue, index) => {
                void itemValue;
                return (
                  <div
                    key={`payment-skeleton-${index + 1}`}
                    className="flex items-center gap-2 rounded-md border border-gray-100 px-2 py-2"
                    data-cy={`${dataCy}-payment-item-${index + 1}`}
                  >
                    <SkeletonBlock className="h-[10px] w-[10px]" />
                    <SkeletonBlock className="h-4 flex-1" />
                    <SkeletonBlock className="h-4 w-16" />
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="col-span-12 rounded-lg border border-gray-200 p-3 shadow-sm lg:col-span-8"
            data-cy={`${dataCy}-pie-panel`}
          >
            <div
              className="mb-4 flex items-center justify-between gap-2"
              data-cy={`${dataCy}-pie-header`}
            >
              <SkeletonBlock className="h-5 w-32" />
              <SkeletonBlock className="h-6 w-28" />
            </div>
            <div
              className="flex flex-col items-center gap-6 lg:flex-row lg:items-start"
              data-cy={`${dataCy}-pie-content`}
            >
              <SkeletonBlock className="h-[285px] w-[285px] max-w-full rounded-full" />
              <div className="w-full space-y-3" data-cy={`${dataCy}-pie-list`}>
                {Array.from({ length: 5 }).map((itemValue, index) => {
                  void itemValue;
                  return (
                    <div
                      key={`pie-row-skeleton-${index + 1}`}
                      className="space-y-2"
                      data-cy={`${dataCy}-pie-item-${index + 1}`}
                    >
                      <div
                        className="flex items-center gap-2"
                        data-cy={`${dataCy}-pie-item-header-${index + 1}`}
                      >
                        <SkeletonBlock className="h-3 w-3 rounded-full" />
                        <SkeletonBlock className="h-4 flex-1" />
                        <SkeletonBlock className="h-4 w-20" />
                      </div>
                      <SkeletonBlock className="h-1 w-full" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className="col-span-12 rounded-lg border border-gray-200 p-3 shadow-sm lg:col-span-4"
            data-cy={`${dataCy}-actions-panel`}
          >
            <div
              className="mb-4 flex items-center justify-between"
              data-cy={`${dataCy}-actions-header`}
            >
              <div
                className="flex items-center gap-2"
                data-cy={`${dataCy}-actions-header-title`}
              >
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                <SkeletonBlock className="h-4 w-28" />
              </div>
              <SkeletonBlock className="h-4 w-14" />
            </div>
            <div className="space-y-3" data-cy={`${dataCy}-actions-list`}>
              {Array.from({ length: 4 }).map((itemValue, index) => {
                void itemValue;
                return (
                  <div
                    key={`action-skeleton-${index + 1}`}
                    className="flex gap-3"
                    data-cy={`${dataCy}-action-item-${index + 1}`}
                  >
                    <div
                      className="flex w-10 justify-center"
                      data-cy={`${dataCy}-action-icon-${index + 1}`}
                    >
                      <SkeletonBlock className="h-9 w-9 rounded-full" />
                    </div>
                    <div
                      className="flex-1 space-y-2 pb-2"
                      data-cy={`${dataCy}-action-content-${index + 1}`}
                    >
                      <SkeletonBlock className="h-4 w-32" />
                      <SkeletonBlock className="h-4 w-full" />
                      <SkeletonBlock className="h-3 w-20" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </BlockWrapper>
    </div>
  );
}
