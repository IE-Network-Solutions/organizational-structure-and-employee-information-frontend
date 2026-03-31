'use client';

import React from 'react';
import { Card } from 'antd';

const SkeletonBlock = ({ className }: { className: string }) => (
  <div
    className={`animate-pulse rounded-md bg-gray-200 ${className}`}
    data-cy="dashboard-payroll-pie-chart-skeleton-block"
  />
);

export default function PayrollPieChartSkeleton({
  'data-cy': dataCy = 'dashboard-payroll-pie-chart-skeleton',
}: {
  'data-cy'?: string;
}) {
  return (
    <Card
      className="rounded-lg border border-gray-200 shadow-noe h-[410px]"
      bodyStyle={{ padding: '12px' }}
      data-cy={dataCy}
    >
      <div
        className="mb-4 flex items-center justify-between gap-2"
        data-cy={`${dataCy}-header`}
      >
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="h-6 w-28" />
      </div>

      <div
        className="flex flex-col items-center gap-6 lg:flex-row lg:items-start"
        data-cy={`${dataCy}-content`}
      >
        <SkeletonBlock className="h-[285px] w-[285px] max-w-full rounded-full" />
        <div className="w-full space-y-3" data-cy={`${dataCy}-rows`}>
          {Array.from({ length: 5 }).map((itemValue, index) => {
            void itemValue;
            return (
              <div
                key={`pie-skeleton-row-${index + 1}`}
                className="space-y-2"
                data-cy={`${dataCy}-row-${index + 1}`}
              >
                <div
                  className="flex items-center gap-2"
                  data-cy={`${dataCy}-row-header-${index + 1}`}
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
    </Card>
  );
}
