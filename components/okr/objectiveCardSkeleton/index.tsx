import React from 'react';

type ObjectiveCardSkeletonProps = {
  /** Number of skeleton cards to render. */
  count?: number;
  /**
   * When true, show the assignee block placeholder on the right side
   * (used for Team/Company tabs where assignee is shown).
   */
  showAssignee?: boolean;
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
    className={`animate-pulse rounded bg-shell-tint ${className}`}
    data-cy={dataCy}
  />
);

/** Loading placeholder with the same shape as `ObjectiveCard`. */
export const ObjectiveCardSkeleton: React.FC<ObjectiveCardSkeletonProps> = ({
  count = 3,
  showAssignee = false,
  'data-cy': dataCy = 'okr-objective-card-skeleton-list',
}) => {
  return (
    <div
      className="flex w-full flex-col"
      data-cy={dataCy}
      id="okr-objective-card-skeleton-list"
    >
      {Array.from({ length: count }).map((unusedValue, idx) => {
        void unusedValue;
        return (
          <div
            key={idx}
            className="mb-7 border-b border-shell-line pb-7"
            data-cy={`okr-objective-card-skeleton-${idx}`}
          >
            <div
              className="mb-4 flex items-start gap-3"
              data-cy={`okr-objective-card-skeleton-card-body-${idx}`}
            >
              <div
                className="hidden h-9 w-9 shrink-0 animate-pulse rounded-md bg-shell-tint sm:block"
                data-cy={`okr-objective-card-skeleton-icon-${idx}`}
              />
              <div
                className="flex min-w-0 flex-1 flex-col gap-2.5"
                data-cy={`okr-objective-card-skeleton-content-${idx}`}
              >
                <ShimmerLine
                  className="h-5 w-3/5"
                  data-cy={`okr-objective-card-skeleton-title-${idx}`}
                />
                <div
                  className="flex flex-wrap items-center gap-4"
                  data-cy={`okr-objective-card-skeleton-badges-row-${idx}`}
                >
                  <ShimmerLine
                    className="h-3.5 w-28"
                    data-cy={`okr-objective-card-skeleton-badge-progress-${idx}`}
                  />
                  <ShimmerLine
                    className="h-3.5 w-40"
                    data-cy={`okr-objective-card-skeleton-badge-kr-${idx}`}
                  />
                  <ShimmerLine
                    className="h-3.5 w-24"
                    data-cy={`okr-objective-card-skeleton-badge-days-${idx}`}
                  />
                </div>
              </div>
              {showAssignee ? (
                <div
                  className="hidden items-center gap-2.5 sm:flex"
                  data-cy={`okr-objective-card-skeleton-assignee-${idx}`}
                >
                  <div
                    className="h-9 w-9 animate-pulse rounded-full bg-shell-tint"
                    data-cy={`okr-objective-card-skeleton-assignee-avatar-${idx}`}
                  />
                  <div
                    className="flex flex-col gap-1.5"
                    data-cy={`okr-objective-card-skeleton-assignee-text-${idx}`}
                  >
                    <ShimmerLine
                      className="h-3.5 w-28"
                      data-cy={`okr-objective-card-skeleton-assignee-name-${idx}`}
                    />
                    <ShimmerLine
                      className="h-3 w-20"
                      data-cy={`okr-objective-card-skeleton-assignee-meta-${idx}`}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div
              className="overflow-x-auto"
              data-cy={`okr-objective-card-skeleton-key-results-${idx}`}
            >
              <div
                className="w-full min-w-[720px] md:min-w-[900px]"
                data-cy={`okr-objective-card-skeleton-key-results-inner-${idx}`}
              >
                <div
                  className="h-10 bg-shell-band"
                  data-cy={`okr-objective-card-skeleton-key-results-header-${idx}`}
                />
                <div
                  className="divide-y divide-shell-line"
                  data-cy={`okr-objective-card-skeleton-key-results-body-${idx}`}
                >
                  {Array.from({ length: 3 }).map((unusedRow, rowIdx) => {
                    void unusedRow;
                    return (
                      <div
                        key={rowIdx}
                        className="flex items-center gap-6 px-4 py-4"
                        data-cy={`okr-objective-card-skeleton-kr-row-${idx}-${rowIdx}`}
                      >
                        <ShimmerLine
                          className="h-3.5 w-72"
                          data-cy={`okr-objective-card-skeleton-kr-row-col-0-${idx}-${rowIdx}`}
                        />
                        <ShimmerLine
                          className="h-3.5 w-16"
                          data-cy={`okr-objective-card-skeleton-kr-row-col-1-${idx}-${rowIdx}`}
                        />
                        <ShimmerLine
                          className="h-3.5 w-10"
                          data-cy={`okr-objective-card-skeleton-kr-row-col-2-${idx}-${rowIdx}`}
                        />
                        <ShimmerLine
                          className="h-1.5 w-36"
                          data-cy={`okr-objective-card-skeleton-kr-row-col-3-${idx}-${rowIdx}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ObjectiveCardSkeleton;
