'use client';

import { Skeleton } from 'antd';

const CARD_COUNT = 8;

const PlanningAssignationPageSkeleton = () => {
  return (
    <div
      data-cy="okr-planning-assignation-loading"
      id="okrPlanningAssignationLoadingWrap"
    >
      <div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        data-cy="okr-planning-assignation-skeleton-grid"
        id="okrPlanningAssignationSkeletonGrid"
      >
        {Array.from({ length: CARD_COUNT }).map((unusedValue, idx) => (
          <div
            key={idx}
            className="rounded-[8px] border border-[#d9d9d9] bg-white p-5"
            data-cy={`okr-planning-assignation-skeleton-card-${idx}`}
          >
            <div
              className="flex items-center gap-4"
              data-cy={`okr-planning-assignation-skeleton-card-row-${idx}`}
            >
              <Skeleton.Avatar active size="large" />
              <div
                className="min-w-0 flex-1 space-y-2"
                data-cy={`okr-planning-assignation-skeleton-card-fields-${idx}`}
              >
                <Skeleton.Input
                  active
                  size="small"
                  className="!h-5 !w-20 !min-w-0"
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
              <Skeleton.Button active className="!h-8 !w-8 !min-w-8 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanningAssignationPageSkeleton;
