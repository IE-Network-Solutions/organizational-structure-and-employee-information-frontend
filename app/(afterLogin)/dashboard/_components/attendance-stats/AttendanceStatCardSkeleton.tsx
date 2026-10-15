'use client';

import { Skeleton } from 'antd';

export default function AttendanceStatCardSkeleton({
  dataCy = 'attendance-summary-cards-skeleton',
}: {
  dataCy?: string;
}) {
  return (
    <div
      className="bg-white rounded-lg border border-[#E5E7EB] p-3 h-[109px]"
      data-cy={dataCy}
    >
      <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
    </div>
  );
}
