'use client';

import { Skeleton } from 'antd';

const CARD_COUNT = 8;

export default function PeopleAssigneesGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      data-cy="bsc-people-assignees-grid-skeleton"
    >
      {Array.from({ length: CARD_COUNT }).map((unused, idx) => (
        <div
          key={idx}
          className="rounded-xl bg-[#F9FAFB] p-4"
          data-cy={`bsc-people-assignees-grid-skeleton-card-${idx}`}
        >
          <div
            data-cy="peopleassigneesgridskeleton-div-19"
            className="flex items-start gap-3"
          >
            <Skeleton.Avatar active size={40} />
            <div
              data-cy="peopleassigneesgridskeleton-div-21"
              className="min-w-0 flex-1 space-y-2"
            >
              <Skeleton.Input
                active
                size="small"
                className="!h-5 !w-[70%] !min-w-0"
              />
              <Skeleton.Input
                active
                size="small"
                className="!h-4 !w-[85%] !min-w-0"
              />
              <Skeleton.Input
                active
                size="small"
                className="!h-3 !w-24 !min-w-0"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
