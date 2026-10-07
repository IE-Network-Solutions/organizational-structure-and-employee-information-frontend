'use client';

import { Skeleton } from 'antd';

/** Shell every KPI card in the dashboard header shares. */
export const okrHeaderCardShellClass =
  'flex flex-col gap-4 h-[115px] min-w-[260px] flex-none shadow-none rounded-lg border border-[#D9D9D9] bg-white p-3 md:min-w-0';

export const OkrHeaderStatCardSkeleton = ({ dataCy }: { dataCy?: string }) => (
  <div className={okrHeaderCardShellClass} data-cy={dataCy}>
    <div
      className="flex items-center justify-between"
      data-cy={
        dataCy ? `${dataCy}-avatar-row` : 'okr-header-stat-card-avatar-row'
      }
    >
      <Skeleton.Avatar
        active
        shape="square"
        size={34}
        className="!rounded-[4px]"
      />
    </div>
    <div
      className="mt-3 flex flex-col gap-2"
      data-cy={dataCy ? `${dataCy}-stat-lines` : 'okr-header-stat-card-lines'}
    >
      <Skeleton.Input active size="small" className="!h-4 !w-36 !min-w-0" />
      <Skeleton.Input active size="small" className="!h-2 !w-full !min-w-0" />
    </div>
  </div>
);

export type TrendDirection = 'up' | 'down';

export interface RecognitionStat {
  id: string;
  label: string;
  value: number;
  trendLabel: string;
  trendDirection: TrendDirection;
}

/** Turns a month-over-month delta into the label and arrow the cards render. */
export function getTrendMeta(difference: number): {
  trendLabel: string;
  trendDirection: TrendDirection;
} {
  return {
    trendLabel: `${Math.abs(difference)}%`,
    trendDirection: difference < 0 ? 'down' : 'up',
  };
}

export const slidePercent = (index: number, length: number) =>
  length > 0 ? (index * 100) / length : 0;
