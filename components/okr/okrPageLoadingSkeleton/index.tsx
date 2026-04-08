import React from 'react';
import ObjectiveCardSkeleton from '../objectiveCardSkeleton';

type OkrPageLoadingSkeletonProps = {
  /** Number of objective cards to display as skeleton. */
  objectiveCount?: number;
  'data-cy'?: string;
};

const ShimmerLine = ({
  className,
  'data-cy': dataCy,
}: {
  className: string;
  'data-cy'?: string;
}) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    data-cy={dataCy}
  />
);

/**
 * OKR page loading skeleton.
 * Used during the initial OKR-mode check before tabs/cards are rendered.
 */
export const OkrPageLoadingSkeleton: React.FC<OkrPageLoadingSkeletonProps> = ({
  objectiveCount = 3,
  'data-cy': dataCy = 'okr-page-loading-skeleton',
}) => {
  return (
    <div
      id="okr-page-loading-skeleton"
      data-cy={dataCy}
      className="h-auto min-w-0 w-full overflow-x-hidden pb-4 md:pb-6"
    >
      {/* Header */}
      <div
        className="flex justify-between items-center mt-5 mb-6"
        data-cy="okr-page-loading-skeleton-header"
      >
        <div className="flex flex-col gap-2" data-cy="okr-page-loading-title">
          <ShimmerLine className="h-8 w-48" data-cy="okr-page-skel-title" />
          <div className="flex items-center gap-2" data-cy="okr-page-skel-bc">
            <ShimmerLine className="h-4 w-10" />
            <ShimmerLine className="h-4 w-3" />
            <ShimmerLine className="h-4 w-20" />
          </div>
        </div>

        {/* Header actions (Download + Create Objective) */}
        <div className="flex items-center gap-4" data-cy="okr-page-skel-actions">
          <div
            className="hidden sm:flex items-center gap-4"
            data-cy="okr-page-skel-actions-desktop"
          >
            <ShimmerLine
              className="h-[40px] w-[164px] rounded-lg"
              data-cy="okr-page-skel-action-download-desktop"
            />
            <ShimmerLine
              className="h-[40px] w-[164px] rounded-lg"
              data-cy="okr-page-skel-action-create-desktop"
            />
          </div>
          <div
            className="flex sm:hidden items-center gap-3"
            data-cy="okr-page-skel-actions-mobile"
          >
            <ShimmerLine
              className="h-8 w-8 rounded-lg"
              data-cy="okr-page-skel-action-download-mobile"
            />
            <ShimmerLine
              className="h-8 w-8 rounded-lg"
              data-cy="okr-page-skel-action-create-mobile"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gray-200" data-cy="okr-page-skel-divider" />

      {/* Tabs bar skeleton */}
      <div className="mt-6" data-cy="okr-page-skel-tabs">
        <div className="flex items-center gap-6" data-cy="okr-page-skel-tabs-row">
          <ShimmerLine className="h-6 w-20" data-cy="okr-page-skel-tab-1" />
          <ShimmerLine className="h-6 w-24" data-cy="okr-page-skel-tab-2" />
          <ShimmerLine className="h-6 w-28" data-cy="okr-page-skel-tab-3" />
          <ShimmerLine className="h-6 w-36" data-cy="okr-page-skel-tab-4" />
          <div
            className="ml-auto hidden md:flex items-center gap-2"
            data-cy="okr-page-skel-tabs-extra-desktop"
          >
            <ShimmerLine
              className="h-7 w-16 rounded-lg"
              data-cy="okr-page-skel-status-pill-1"
            />
            <ShimmerLine
              className="h-7 w-16 rounded-lg"
              data-cy="okr-page-skel-status-pill-2"
            />
            <ShimmerLine
              className="h-7 w-16 rounded-lg"
              data-cy="okr-page-skel-status-pill-3"
            />
            <ShimmerLine
              className="h-10 w-24 rounded-lg"
              data-cy="okr-page-skel-filter-desktop"
            />
          </div>
          <div className="ml-auto flex md:hidden" data-cy="okr-page-skel-tabs-extra-mobile">
            <ShimmerLine
              className="h-10 w-10 rounded-lg"
              data-cy="okr-page-skel-filter-mobile"
            />
          </div>
        </div>
      </div>

      {/* Objectives skeleton list */}
      <div className="mt-6" data-cy="okr-page-skel-objectives">
        <ObjectiveCardSkeleton
          data-cy="okr-page-skel-objective-cards"
          count={objectiveCount}
          showAssignee={false}
          expanded={true}
        />
      </div>
    </div>
  );
};

export default OkrPageLoadingSkeleton;

