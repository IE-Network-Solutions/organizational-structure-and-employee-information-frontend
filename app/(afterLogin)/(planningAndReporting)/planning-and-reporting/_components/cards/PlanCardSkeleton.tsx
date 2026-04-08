import React from 'react';

function TaskRowSkeleton({
  width = 'w-3/5',
  rowPadding = 'py-2',
}: {
  width?: string;
  /** Slightly taller rows for reporting skeleton */
  rowPadding?: string;
}) {
  return (
    <div
      data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-taskrow"
      className={[
        'flex items-center gap-2.5 rounded-lg px-2.5',
        rowPadding,
      ].join(' ')}
    >
      <div
        data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-18"
        className="h-[18px] w-[18px] rounded-[5px] bg-[#F1F2F6] flex-shrink-0"
      />
      <div
        data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-19"
        className={`h-3 ${width} bg-[#F1F2F6] rounded`}
      />
      <div
        data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-20"
        className="flex items-center flex-shrink-0 ml-auto gap-3"
      >
        <div
          data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-21"
          className="h-3 w-10 bg-[#F1F2F6] rounded-full"
        />
        <div
          data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-22"
          className="h-3 w-5 bg-[#F1F2F6] rounded"
        />
        <div
          data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-23"
          className="h-3 w-5 bg-[#F1F2F6] rounded"
        />
      </div>
    </div>
  );
}

type PlanCardSkeletonProps = {
  /** Reporting tab: a bit more vertical space (extra row + padding). */
  reporting?: boolean;
};

export default function PlanCardSkeleton({
  reporting = false,
}: PlanCardSkeletonProps) {
  const taskPad = reporting ? 'py-2.5' : 'py-2';
  const taskBlockPb = reporting ? 'pb-3' : 'pb-2';
  const footerPy = reporting ? 'py-2.5' : 'py-2';

  return (
    <div
      data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-42"
      className="rounded-xl border border-[#F1F2F6] bg-white animate-pulse overflow-hidden"
    >
      {/* Header */}
      <div
        data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-header"
        className={
          reporting ? 'px-4 pt-4 pb-3.5 md:px-5' : 'px-4 pt-3.5 pb-3 md:px-5'
        }
      >
        <div
          data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-49"
          className="flex items-center justify-between gap-2"
        >
          <div
            data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-50"
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-51"
              className="h-9 w-9 rounded-full bg-[#F1F2F6] flex-shrink-0"
            />
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-52"
              className="flex flex-col gap-1.5 min-w-0 flex-1"
            >
              <div
                data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-53"
                className="h-3.5 w-28 bg-[#F1F2F6] rounded"
              />
              <div
                data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-54"
                className="h-2.5 w-20 bg-[#F1F2F6] rounded"
              />
            </div>
          </div>
          <div
            data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-57"
            className="h-5 w-16 bg-[#F1F2F6] rounded-full"
          />
        </div>
      </div>

      {/* Column titles placeholder */}
      <div
        data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-62"
        className="px-3 md:px-4"
      >
        <div
          data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-63"
          className="flex items-center px-2.5 pb-1 mb-0.5 mt-1"
        >
          <div
            data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-64"
            className="h-2.5 w-32 bg-[#F1F2F6] rounded"
          />
        </div>
      </div>

      {/* Task rows */}
      <div
        data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-69"
        className={['px-3 md:px-4 space-y-[2px]', taskBlockPb].join(' ')}
      >
        <TaskRowSkeleton width="w-4/5" rowPadding={taskPad} />
        <TaskRowSkeleton width="w-3/5" rowPadding={taskPad} />
        <TaskRowSkeleton width="w-2/3" rowPadding={taskPad} />
        {reporting ? (
          <TaskRowSkeleton width="w-3/4" rowPadding={taskPad} />
        ) : null}
      </div>

      {/* Footer */}
      <div
        data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-footer"
        className={['border-t border-[#F1F2F6] px-4 md:px-5', footerPy].join(
          ' ',
        )}
      >
        <div
          data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-84"
          className="flex items-center gap-2"
        >
          <div
            data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-85"
            className="h-3 w-20 bg-[#F1F2F6] rounded"
          />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for inline plan edit while plan + hierarchy load (matches draft task list layout). */
export function InlinePlanningEditSkeleton() {
  return (
    <ul
      className="flex min-h-[240px] list-none flex-col gap-2.5 p-3 animate-pulse md:gap-3 md:p-4 md:px-5"
      data-cy="inline-plan-edit-loading"
    >
      {[1, 2, 3].map((i) => (
        <li
          key={i}
          data-cy={`planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-li-inline-edit-${i}`}
          className="rounded-xl border border-[#F1F2F6] bg-white px-3.5 py-3 md:px-4 md:py-3.5"
        >
          <div
            data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-104"
            className="flex items-start gap-3"
          >
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-105"
              className="h-[18px] w-[18px] flex-shrink-0 rounded-[5px] bg-[#F1F2F6]"
            />
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-106"
              className="flex min-w-0 flex-1 flex-col gap-2"
            >
              <div
                data-cy={`planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-inline-title-${i}`}
                className={`h-3.5 rounded bg-[#F1F2F6] ${
                  i === 1 ? 'w-4/5' : i === 2 ? 'w-3/5' : 'w-2/3'
                }`}
              />
              <div
                data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-112"
                className="h-4 max-w-sm w-3/5 rounded bg-[#F1F2F6]"
              />
              <div
                data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-113"
                className="flex flex-wrap items-center gap-2 pt-1"
              >
                <div
                  data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-114"
                  className="h-5 w-16 rounded-full bg-[#F1F2F6]"
                />
                <div
                  data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-115"
                  className="h-5 w-12 rounded-full bg-[#F1F2F6]"
                />
                <div
                  data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-116"
                  className="h-5 w-20 rounded-full bg-[#F1F2F6]"
                />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function KRPanelSkeleton() {
  return (
    <div
      data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-128"
      className="flex flex-col h-full animate-pulse"
    >
      {/* KR header */}
      <div
        data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-130"
        className="bg-white border-b border-[#F1F2F6] px-4 py-3.5 flex-shrink-0"
      >
        <div
          data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-131"
          className="flex items-center justify-between"
        >
          <div
            data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-132"
            className="flex items-center gap-2"
          >
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-133"
              className="h-7 w-7 rounded-lg bg-[#F1F2F6]"
            />
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-134"
              className="flex flex-col gap-1"
            >
              <div
                data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-135"
                className="h-3 w-20 bg-[#F1F2F6] rounded"
              />
              <div
                data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-136"
                className="h-2 w-28 bg-[#F1F2F6] rounded"
              />
            </div>
          </div>
          <div
            data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-139"
            className="h-5 w-8 bg-[#F1F2F6] rounded-lg"
          />
        </div>
      </div>

      {/* KR cards */}
      <div
        data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-144"
        className="flex-1 px-2 py-2 space-y-2"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            data-cy={`planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-kr-card-${i}`}
            className="rounded-xl border border-[#F1F2F6] bg-white p-3"
          >
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-150"
              className="flex items-start justify-between gap-2 mb-2"
            >
              <div
                data-cy={`planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-kr-card-title-${i}`}
                className={`h-3 ${i % 2 === 0 ? 'w-4/5' : 'w-3/5'} bg-[#F1F2F6] rounded`}
              />
              <div
                data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-154"
                className="h-4 w-10 bg-[#F1F2F6] rounded-md flex-shrink-0"
              />
            </div>
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-156"
              className="h-[5px] w-full rounded-full bg-[#F1F2F6] mb-2"
            />
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-157"
              className="h-2 w-16 bg-[#F1F2F6] rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
