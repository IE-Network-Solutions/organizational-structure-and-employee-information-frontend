'use client';

import { Skeleton } from 'antd';

const CARD_COUNT = 6;

const DefineOkrRulePageSkeleton = () => {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      data-cy="okr-define-okr-rule-skeleton-grid"
      id="okrDefineOkrRuleSkeletonGrid"
    >
      {Array.from({ length: CARD_COUNT }).map((unusedValue, idx) => (
        <div
          key={idx}
          className="rounded-[12px] border border-[#d9d9d9] bg-white p-5"
          data-cy={`okr-define-okr-rule-skeleton-card-${idx}`}
        >
          <div
            className="mb-6 flex items-start justify-between gap-2"
            data-cy={`okr-define-okr-rule-skeleton-card-header-${idx}`}
          >
            <Skeleton.Input
              active
              size="small"
              className="!h-5 !min-w-0 !flex-1 !w-[72%]"
            />
            <Skeleton.Button active className="!h-8 !w-8 !min-w-8" />
          </div>
          <div
            className="flex flex-wrap items-center gap-3"
            data-cy={`okr-define-okr-rule-skeleton-card-footer-${idx}`}
          >
            <Skeleton.Input
              active
              size="small"
              className="!h-7 !w-32 !min-w-0"
            />
            <Skeleton.Input
              active
              size="small"
              className="!h-7 !w-36 !min-w-0"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DefineOkrRulePageSkeleton;
