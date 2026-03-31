'use client';

import React from 'react';
import { Card } from 'antd';

const SkeletonBlock = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

export default function PayrollGraphSkeleton({
  'data-cy': dataCy = 'dashboard-payroll-graph-skeleton',
}: {
  'data-cy'?: string;
}) {
  return (
    <Card
      className="rounded-lg border border-gray-200 shadow-sm h-[333px]"
      styles={{ body: { padding: '12px' } }}
      data-cy={dataCy}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="h-6 w-36" />
      </div>
      <SkeletonBlock className="mb-2 h-6 w-full max-w-[620px]" />
      <SkeletonBlock className="h-[255px] w-full sm:h-[250px]" />
    </Card>
  );
}
