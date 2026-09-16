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
      className={[
        'flex items-center gap-2.5 rounded-lg px-2.5',
        rowPadding,
      ].join(' ')}
      data-cy="plan-card-skeleton-task-row-root"
    >
      <div
        className="h-[18px] w-[18px] rounded-[5px] bg-[#F1F2F6] flex-shrink-0"
        data-cy="plan-card-skeleton-task-row-icon"
      />
      <div
        className={`h-3 ${width} bg-[#F1F2F6] rounded`}
        data-cy="plan-card-skeleton-task-row-line"
      />
      <div
        className="flex items-center flex-shrink-0 ml-auto gap-3"
        data-cy="plan-card-skeleton-task-row-tags"
      >
        <div
          className="h-3 w-10 bg-[#F1F2F6] rounded-full"
          data-cy="plan-card-skeleton-task-row-tag-a"
        />
        <div
          className="h-3 w-5 bg-[#F1F2F6] rounded"
          data-cy="plan-card-skeleton-task-row-tag-b"
        />
        <div
          className="h-3 w-5 bg-[#F1F2F6] rounded"
          data-cy="plan-card-skeleton-task-row-tag-c"
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
      className="rounded-xl border border-[#F1F2F6] bg-white animate-pulse overflow-hidden"
      data-cy="plan-card-skeleton-root"
    >
      {/* Header */}
      <div
        className={
          reporting ? 'px-4 pt-4 pb-3.5 md:px-5' : 'px-4 pt-3.5 pb-3 md:px-5'
        }
        data-cy="plan-card-skeleton-header"
      >
        <div
          className="flex items-center justify-between gap-2"
          data-cy="plan-card-skeleton-header-row"
        >
          <div
            className="flex items-center gap-3 flex-1 min-w-0"
            data-cy="plan-card-skeleton-header-user"
          >
            <div
              className="h-9 w-9 rounded-full bg-[#F1F2F6] flex-shrink-0"
              data-cy="plan-card-skeleton-header-avatar"
            />
            <div
              className="flex flex-col gap-1.5 min-w-0 flex-1"
              data-cy="plan-card-skeleton-header-text"
            >
              <div
                className="h-3.5 w-28 bg-[#F1F2F6] rounded"
                data-cy="plan-card-skeleton-header-title-bar"
              />
              <div
                className="h-2.5 w-20 bg-[#F1F2F6] rounded"
                data-cy="plan-card-skeleton-header-subtitle-bar"
              />
            </div>
          </div>
          <div
            className="h-5 w-16 bg-[#F1F2F6] rounded-full"
            data-cy="plan-card-skeleton-header-pill"
          />
        </div>
      </div>

      {/* Column titles placeholder */}
      <div
        className="px-3 md:px-4"
        data-cy="plan-card-skeleton-column-titles-wrap"
      >
        <div
          className="flex items-center px-2.5 pb-1 mb-0.5 mt-1"
          data-cy="plan-card-skeleton-column-titles-inner"
        >
          <div
            className="h-2.5 w-32 bg-[#F1F2F6] rounded"
            data-cy="plan-card-skeleton-column-title-bar"
          />
        </div>
      </div>

      {/* Task rows */}
      <div
        className={['px-3 md:px-4 space-y-[2px]', taskBlockPb].join(' ')}
        data-cy="plan-card-skeleton-task-block"
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
        className={['border-t border-[#F1F2F6] px-4 md:px-5', footerPy].join(
          ' ',
        )}
        data-cy="plan-card-skeleton-footer"
      >
        <div
          className="flex items-center gap-2"
          data-cy="plan-card-skeleton-footer-row"
        >
          <div
            className="h-3 w-20 bg-[#F1F2F6] rounded"
            data-cy="plan-card-skeleton-footer-bar"
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
          className="rounded-xl border border-[#F1F2F6] bg-white px-3.5 py-3 md:px-4 md:py-3.5"
          data-cy={`inline-plan-edit-skeleton-item-${i}`}
        >
          <div
            className="flex items-start gap-3"
            data-cy={`inline-plan-edit-skeleton-item-row-${i}`}
          >
            <div
              className="h-[18px] w-[18px] flex-shrink-0 rounded-[5px] bg-[#F1F2F6]"
              data-cy={`inline-plan-edit-skeleton-item-icon-${i}`}
            />
            <div
              className="flex min-w-0 flex-1 flex-col gap-2"
              data-cy={`inline-plan-edit-skeleton-item-body-${i}`}
            >
              <div
                className={`h-3.5 rounded bg-[#F1F2F6] ${
                  i === 1 ? 'w-4/5' : i === 2 ? 'w-3/5' : 'w-2/3'
                }`}
                data-cy={`inline-plan-edit-skeleton-item-line-1-${i}`}
              />
              <div
                className="h-4 max-w-sm w-3/5 rounded bg-[#F1F2F6]"
                data-cy={`inline-plan-edit-skeleton-item-line-2-${i}`}
              />
              <div
                className="flex flex-wrap items-center gap-2 pt-1"
                data-cy={`inline-plan-edit-skeleton-item-tags-${i}`}
              >
                <div
                  className="h-5 w-16 rounded-full bg-[#F1F2F6]"
                  data-cy={`inline-plan-edit-skeleton-item-pill-1-${i}`}
                />
                <div
                  className="h-5 w-12 rounded-full bg-[#F1F2F6]"
                  data-cy={`inline-plan-edit-skeleton-item-pill-2-${i}`}
                />
                <div
                  className="h-5 w-20 rounded-full bg-[#F1F2F6]"
                  data-cy={`inline-plan-edit-skeleton-item-pill-3-${i}`}
                />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function KRPanelSkeletonBody() {
  return (
    <div
      className="flex-1 px-2 py-2 space-y-2"
      data-cy="kr-panel-skeleton-cards"
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-[#F1F2F6] bg-white p-3"
          data-cy={`kr-panel-skeleton-card-${i}`}
        >
          <div
            className="flex items-start justify-between gap-2 mb-2"
            data-cy={`kr-panel-skeleton-card-row-${i}`}
          >
            <div
              className={`h-3 ${i % 2 === 0 ? 'w-4/5' : 'w-3/5'} bg-[#F1F2F6] rounded`}
              data-cy={`kr-panel-skeleton-card-line-${i}`}
            />
            <div
              className="h-4 w-10 bg-[#F1F2F6] rounded-md flex-shrink-0"
              data-cy={`kr-panel-skeleton-card-badge-${i}`}
            />
          </div>
          <div
            className="h-[5px] w-full rounded-full bg-[#F1F2F6] mb-2"
            data-cy={`kr-panel-skeleton-card-progress-${i}`}
          />
          <div
            className="h-2 w-16 bg-[#F1F2F6] rounded"
            data-cy={`kr-panel-skeleton-card-foot-${i}`}
          />
        </div>
      ))}
    </div>
  );
}

function KRPanelSkeletonHeader({ split = false }: { split?: boolean }) {
  return (
    <div
      className={
        split
          ? 'hidden lg:flex lg:col-start-1 lg:row-start-1 h-9 min-h-9 items-center justify-between gap-2 px-1 animate-pulse'
          : 'bg-white border-b border-[#F1F2F6] px-4 py-3.5 flex-shrink-0 animate-pulse'
      }
      data-cy="kr-panel-skeleton-header"
    >
      <div
        className="flex min-w-0 flex-1 items-center gap-2"
        data-cy="kr-panel-skeleton-header-row"
      >
        <div
          className={`rounded-lg bg-[#F1F2F6] ${split ? 'h-6 w-6' : 'h-7 w-7'}`}
          data-cy="kr-panel-skeleton-header-icon"
        />
        <div
          className="flex min-w-0 flex-col gap-1"
          data-cy="kr-panel-skeleton-header-text"
        >
          <div
            className={`bg-[#F1F2F6] rounded ${split ? 'h-3 w-40' : 'h-3 w-20'}`}
            data-cy="kr-panel-skeleton-header-bar-1"
          />
          {!split ? (
            <div
              className="h-2 w-28 bg-[#F1F2F6] rounded"
              data-cy="kr-panel-skeleton-header-bar-2"
            />
          ) : null}
        </div>
      </div>
      <div
        className="h-5 w-8 bg-[#F1F2F6] rounded-lg"
        data-cy="kr-panel-skeleton-header-action"
      />
    </div>
  );
}

export function KRPanelSkeleton({
  layout = 'stacked',
}: {
  layout?: 'stacked' | 'split';
}) {
  if (layout === 'split') {
    return (
      <>
        <KRPanelSkeletonHeader split />
        <div
          className="hidden min-h-0 flex-col overflow-hidden rounded-xl border border-[#F1F2F6] bg-[#FAFBFC] animate-pulse lg:col-start-1 lg:row-start-2 lg:flex lg:h-full"
          data-cy="kr-panel-skeleton-root"
        >
          <KRPanelSkeletonBody />
        </div>
      </>
    );
  }

  return (
    <div
      className="flex h-full flex-col animate-pulse"
      data-cy="kr-panel-skeleton-root"
    >
      <KRPanelSkeletonHeader />
      <KRPanelSkeletonBody />
    </div>
  );
}
