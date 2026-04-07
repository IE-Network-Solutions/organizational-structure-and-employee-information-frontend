'use client';

import { Skeleton } from 'antd';

const CARD_COUNT = 5;

const CommitmentRulePageSkeleton = () => {
  return (
    <div
      data-cy="tna-commitment-rule-page-skeleton"
      id="tnaCommitmentRulePageSkeletonId"
    >
      <div
        className="flex justify-between mb-4"
        data-cy="tna-commitment-rule-skeleton-header"
      >
        <Skeleton.Input active className="!h-7 !w-48 !min-w-0" />
        <Skeleton.Button active className="!h-10 !w-10 lg:!w-[100px]" />
      </div>

      <div
        className="flex flex-col"
        data-cy="tna-commitment-rule-skeleton-list"
      >
        {Array.from({ length: CARD_COUNT }).map((_, idx) => (
          <div
            key={idx}
            className="mt-6 first:mt-0 rounded-lg border border-gray-200 overflow-hidden bg-white"
            data-cy={`tna-commitment-rule-skeleton-card-${idx}`}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-gray-200">
              <Skeleton.Input
                active
                size="small"
                className="!h-5 !w-[40%] !min-w-0 flex-1"
              />
              <div className="flex items-center gap-2 shrink-0">
                <Skeleton.Button active className="!h-8 !w-8 !min-w-8" />
                <Skeleton.Button active className="!h-8 !w-8 !min-w-8" />
                <Skeleton.Avatar active size="small" shape="square" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommitmentRulePageSkeleton;
