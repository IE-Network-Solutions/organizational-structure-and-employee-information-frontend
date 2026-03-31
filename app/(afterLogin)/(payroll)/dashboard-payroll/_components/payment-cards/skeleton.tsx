'use client';

import React from 'react';
import { Card } from 'antd';

const SkeletonBlock = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

export default function PayrollPaymentCardsSkeleton({
  'data-cy': dataCy = 'dashboard-payroll-payment-cards-skeleton',
}: {
  'data-cy'?: string;
}) {
  return (
    <Card
      className="h-full rounded-lg border border-gray-200 shadow-sm"
      styles={{ body: { padding: '10px 10px 12px' } }}
      data-cy={dataCy}
    >
      <SkeletonBlock className="mb-3 h-5 w-36" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={`payment-row-skeleton-${index + 1}`}
            className="flex items-center gap-2 rounded-md border border-gray-100 bg-white px-2 py-1.5"
          >
            <SkeletonBlock className="h-[10px] w-[10px]" />
            <SkeletonBlock className="h-4 flex-1" />
            <SkeletonBlock className="h-4 w-16" />
          </div>
        ))}
      </div>
    </Card>
  );
}
