import React from 'react';

type ObjectiveCardSkeletonProps = {
  /** Number of skeleton cards to render. */
  count?: number;
  /**
   * When true, show the assignee block placeholder on the right side
   * (used for Team/Company tabs where assignee is shown).
   */
  showAssignee?: boolean;
  /** When true, render the expanded key-results section placeholder. */
  expanded?: boolean;
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

export const ObjectiveCardSkeleton: React.FC<ObjectiveCardSkeletonProps> = ({
  count = 3,
  showAssignee = false,
  expanded = true,
  'data-cy': dataCy = 'okr-objective-card-skeleton-list',
}) => {
  return (
    <div
      className="flex flex-col w-full"
      data-cy={dataCy}
      id="okr-objective-card-skeleton-list"
    >
      /**eslint-disable-next-line */   
      {Array.from({ length: count }).map((unusedValue, idx) => (
        void unusedValue,
        <div
          key={idx}
          className="mb-6"
          data-cy={`okr-objective-card-skeleton-${idx}`}
        >
          <div
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            data-cy={`okr-objective-card-skeleton-card-${idx}`}
          >
            <div
              className={expanded ? 'p-6 pb-2' : 'p-6'}
              data-cy={`okr-objective-card-skeleton-card-body-${idx}`}
            >
              <div
                className="flex items-start justify-between gap-4"
                data-cy={`okr-objective-card-skeleton-card-body-row-${idx}`}
              >
                {/* Left content */}
                <div
                  className="min-w-0 flex-1"
                  data-cy={`okr-objective-card-skeleton-left-${idx}`}
                >
                  <div
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    data-cy={`okr-objective-card-skeleton-left-stack-${idx}`}
                  >
                    <div
                      className="flex min-w-0 flex-1 items-center gap-5"
                      data-cy={`okr-objective-card-skeleton-left-main-${idx}`}
                    >
                      {/* Expand/collapse button placeholder */}
                      <div
                        className="h-6 w-6 min-h-6 min-w-6 shrink-0 rounded-[4px] border border-gray-200 bg-gray-50"
                        data-cy={`okr-objective-card-skeleton-expand-${idx}`}
                      />

                      <div
                        className="flex min-w-0 flex-1 flex-col gap-y-2"
                        data-cy={`okr-objective-card-skeleton-content-${idx}`}
                      >
                        {/* Badges row */}
                        <div
                          className="flex flex-wrap items-center gap-2"
                          data-cy={`okr-objective-card-skeleton-badges-row-${idx}`}
                        >
                          <ShimmerLine
                            className="h-6 w-40"
                            data-cy={`okr-objective-card-skeleton-badge-progress-${idx}`}
                          />
                          <ShimmerLine
                            className="h-6 w-52"
                            data-cy={`okr-objective-card-skeleton-badge-kr-${idx}`}
                          />
                          <ShimmerLine
                            className="hidden sm:block h-6 w-28"
                            data-cy={`okr-objective-card-skeleton-badge-days-${idx}`}
                          />
                        </div>

                        {/* Title row */}
                        <div
                          className="flex items-center justify-between gap-2"
                          data-cy={`okr-objective-card-skeleton-title-row-${idx}`}
                        >
                          <ShimmerLine
                            className="h-6 w-3/5"
                            data-cy={`okr-objective-card-skeleton-title-${idx}`}
                          />
                          {/* Actions menu button placeholder */}
                          <div
                            className="h-6 w-6 shrink-0 rounded-[4px] border border-gray-200 bg-gray-50"
                            data-cy={`okr-objective-card-skeleton-actions-${idx}`}
                          />
                        </div>

                        {/* Mobile days-left line placeholder */}
                        <div
                          className="flex items-center gap-2 sm:hidden"
                          data-cy={`okr-objective-card-skeleton-days-mobile-row-${idx}`}
                        >
                          <div
                            className="h-4 w-4 rounded bg-gray-200 animate-pulse"
                            data-cy={`okr-objective-card-skeleton-days-mobile-icon-${idx}`}
                          />
                          <ShimmerLine
                            className="h-4 w-32"
                            data-cy={`okr-objective-card-skeleton-days-mobile-${idx}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right side (assignee/actions) */}
                    <div
                      className="flex flex-shrink-0 items-center justify-end gap-3 sm:ml-auto"
                      data-cy={`okr-objective-card-skeleton-right-${idx}`}
                    >
                      {showAssignee ? (
                        <div
                          className="hidden sm:flex items-center gap-3"
                          data-cy={`okr-objective-card-skeleton-assignee-${idx}`}
                        >
                          <div
                            className="h-10 w-10 rounded-full bg-gray-200 animate-pulse border border-gray-200"
                            data-cy={`okr-objective-card-skeleton-assignee-avatar-${idx}`}
                          />
                          <div
                            className="flex flex-col gap-2"
                            data-cy={`okr-objective-card-skeleton-assignee-text-${idx}`}
                          >
                            <ShimmerLine
                              className="h-4 w-28"
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
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded key-results section placeholder */}
            {expanded ? (
              <div
                className="mt-4 border-t border-gray-200 overflow-x-auto"
                data-cy={`okr-objective-card-skeleton-key-results-${idx}`}
              >
                <div
                  className="min-w-[900px] w-full"
                  data-cy={`okr-objective-card-skeleton-key-results-inner-${idx}`}
                >
                  <div
                    className="bg-gray-50 px-6 py-3 flex gap-4"
                    data-cy={`okr-objective-card-skeleton-key-results-header-${idx}`}
                  >
                    <ShimmerLine
                      className="h-4 w-64"
                      data-cy={`okr-objective-card-skeleton-key-results-header-col-0-${idx}`}
                    />
                    <ShimmerLine
                      className="h-4 w-24"
                      data-cy={`okr-objective-card-skeleton-key-results-header-col-1-${idx}`}
                    />
                    <ShimmerLine
                      className="h-4 w-20"
                      data-cy={`okr-objective-card-skeleton-key-results-header-col-2-${idx}`}
                    />
                    <ShimmerLine
                      className="h-4 w-24"
                      data-cy={`okr-objective-card-skeleton-key-results-header-col-3-${idx}`}
                    />
                    <ShimmerLine
                      className="h-4 w-56"
                      data-cy={`okr-objective-card-skeleton-key-results-header-col-4-${idx}`}
                    />
                  </div>
                  <div
                    className="divide-y divide-gray-200 bg-white"
                    data-cy={`okr-objective-card-skeleton-key-results-body-${idx}`}
                  >
                    {Array.from({ length: 3 }).map((unusedRow, rowIdx) => (
                      void unusedRow,
                      <div
                        key={rowIdx}
                        className="px-6 py-4 flex items-center gap-4"
                        data-cy={`okr-objective-card-skeleton-kr-row-${idx}-${rowIdx}`}
                      >
                        <ShimmerLine
                          className="h-4 w-72"
                          data-cy={`okr-objective-card-skeleton-kr-row-col-0-${idx}-${rowIdx}`}
                        />
                        <ShimmerLine
                          className="h-4 w-24"
                          data-cy={`okr-objective-card-skeleton-kr-row-col-1-${idx}-${rowIdx}`}
                        />
                        <ShimmerLine
                          className="h-4 w-20"
                          data-cy={`okr-objective-card-skeleton-kr-row-col-2-${idx}-${rowIdx}`}
                        />
                        <ShimmerLine
                          className="h-4 w-24"
                          data-cy={`okr-objective-card-skeleton-kr-row-col-3-${idx}-${rowIdx}`}
                        />
                        <ShimmerLine
                          className="h-4 w-56"
                          data-cy={`okr-objective-card-skeleton-kr-row-col-4-${idx}-${rowIdx}`}
                        />
                        <div
                          className="ml-auto h-6 w-6 rounded-[4px] border border-gray-200 bg-gray-50"
                          data-cy={`okr-objective-card-skeleton-kr-row-actions-${idx}-${rowIdx}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ObjectiveCardSkeleton;
