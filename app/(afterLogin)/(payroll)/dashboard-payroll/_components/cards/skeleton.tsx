'use client';

import React from 'react';

const SkeletonBlock = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

export default function PayrollCardsSkeleton({
  'data-cy': dataCy = 'dashboard-payroll-cards-skeleton',
}: {
  'data-cy'?: string;
}) {
  return (
    <div
      className="mb-4 md:grid w-full gap-4 md:grid-cols-4 flex overflow-x-auto scrollbar-none"
      style={{ minHeight: 130 }}
      data-cy={dataCy}
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`payroll-card-skeleton-${index + 1}`}
          className="h-[122px] min-w-[250px] rounded-lg border border-gray-200 p-3 shadow-none"
        >
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-[26px] w-[26px]" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-6 w-28" />
              <SkeletonBlock className="h-4 w-36" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
