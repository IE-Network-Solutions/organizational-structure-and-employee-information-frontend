'use client';

import { Skeleton } from 'antd';

const CARD_COUNT = 6;

export default function ScorecardsGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      data-cy="bsc-scorecards-grid-skeleton"
    >
      {Array.from({ length: CARD_COUNT }).map((unused, idx) => (
        <div
          key={idx}
          className="rounded-[12px] bg-[#F9FAFB] p-5"
          data-cy={`bsc-scorecards-grid-skeleton-card-${idx}`}
        >
          <div
            data-cy="scorecardsgridskeleton-div-19"
            className="mb-6 flex items-start justify-between gap-2"
          >
            <Skeleton.Input
              active
              size="small"
              className="!h-5 !min-w-0 !flex-1 !w-[72%]"
            />
            <Skeleton.Button active className="!h-8 !w-8 !min-w-8" />
          </div>
          <div
            data-cy="scorecardsgridskeleton-div-27"
            className="flex flex-wrap items-center gap-3"
          >
            <Skeleton.Input
              active
              size="small"
              className="!h-7 !w-24 !min-w-0"
            />
            <Skeleton.Input
              active
              size="small"
              className="!h-7 !w-28 !min-w-0"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
