'use client';

import { Skeleton } from 'antd';

export function FeedbackPerformersCardSkeleton() {
  return (
    <ul
      className="scrollbar-none h-[265px] space-y-4 overflow-y-auto"
      aria-hidden
    >
      {[0, 1, 2, 3].map((i) => (
        <li
          key={i}
          className="mt-1 rounded-xl border border-gray-200 bg-white p-2"
        >
          <div className="flex items-center gap-3">
            <Skeleton.Avatar active size={36} />
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton.Input
                    active
                    size="small"
                    className="!mb-0 !h-4 !w-[120px] !min-w-0"
                  />
                  <Skeleton.Input
                    active
                    size="small"
                    className="!h-3 !w-[88px] !min-w-0"
                  />
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Skeleton.Input
                    active
                    size="small"
                    className="!h-5 !w-10 !min-w-0"
                  />
                  <Skeleton.Input
                    active
                    size="small"
                    className="!h-3 !w-11 !min-w-0"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex w-full gap-2">
              <Skeleton.Input
                active
                size="small"
                className="!h-[6px] !min-h-0 !min-w-0 !flex-1 !rounded-full"
              />
              <Skeleton.Input
                active
                size="small"
                className="!h-[6px] !min-h-0 !min-w-0 !flex-1 !rounded-full"
              />
            </div>
            <div className="flex gap-2">
              <Skeleton.Input
                active
                size="small"
                className="!h-3 !min-w-0 !flex-1"
              />
              <Skeleton.Input
                active
                size="small"
                className="!h-3 !min-w-0 !flex-1"
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ActionPlanCardSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="mb-2">
        <div className="flex items-center justify-between gap-4">
          <Skeleton.Input
            active
            size="default"
            className="!h-9 !w-[72px] !min-w-0"
          />
          <Skeleton.Input
            active
            size="small"
            className="!h-5 !w-[140px] !min-w-0"
          />
        </div>
        <Skeleton.Input
          active
          size="small"
          className="!mt-3 !h-4 !w-[220px] !min-w-0"
        />
      </div>
      <Skeleton.Input
        active
        size="small"
        className="!h-3 !w-full !min-w-0 !rounded-full"
      />
      <div className="mt-3 flex gap-10">
        <Skeleton.Input
          active
          size="small"
          className="!h-3 !w-20 !min-w-0"
        />
        <Skeleton.Input
          active
          size="small"
          className="!h-3 !w-20 !min-w-0"
        />
        <Skeleton.Input
          active
          size="small"
          className="!h-3 !w-24 !min-w-0"
        />
      </div>
    </div>
  );
}

function FeedbackStatBlockSkeleton() {
  return (
    <div className="flex min-h-[95px] flex-1 items-center rounded-xl border border-gray-200 bg-white px-5 py-4">
      <div className="flex w-[44%] min-w-0 shrink-0 flex-col justify-center gap-2 pr-4">
        <Skeleton.Input
          active
          size="small"
          className="!h-3 !w-28 !min-w-0"
        />
        <Skeleton.Input
          active
          size="default"
          className="!h-8 !w-16 !min-w-0"
        />
      </div>
      <div className="grid min-h-[66px] min-w-0 flex-1 grid-cols-2 items-center border-l border-gray-200 pl-5">
        <div className="flex flex-col justify-center gap-2">
          <Skeleton.Input
            active
            size="small"
            className="!h-3 !w-8 !min-w-0"
          />
          <Skeleton.Input
            active
            size="small"
            className="!h-6 !w-10 !min-w-0"
          />
        </div>
        <div className="flex flex-col justify-center gap-2 pl-4">
          <Skeleton.Input
            active
            size="small"
            className="!h-3 !w-24 !min-w-0"
          />
          <Skeleton.Input
            active
            size="small"
            className="!h-6 !w-10 !min-w-0"
          />
        </div>
      </div>
    </div>
  );
}

export function FeedbackCardSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <FeedbackStatBlockSkeleton />
        <FeedbackStatBlockSkeleton />
      </div>
      <div className="h-[247px] w-full rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
        <Skeleton
          active
          title={false}
          paragraph={{
            rows: 7,
            width: ['100%', '92%', '100%', '88%', '100%', '94%', '100%'],
          }}
        />
      </div>
    </div>
  );
}

export function OkrProgressCardSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-4 flex flex-wrap gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton.Input
              active
              size="small"
              className="!h-2 !w-2 !min-w-0 !rounded-none"
            />
            <Skeleton.Input
              active
              size="small"
              className="!h-3 !w-20 !min-w-0"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-center gap-[100px] md:flex-row md:items-center">
        <div className="mx-auto flex h-[284px] w-[284px] shrink-0 items-center justify-center md:mx-0">
          <Skeleton.Avatar active shape="circle" size={220} />
        </div>
        <div className="scrollbar-none h-[281px] min-w-0 flex-1 space-y-7 overflow-y-auto py-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="mb-1 flex justify-between gap-3">
                <Skeleton.Input
                  active
                  size="small"
                  className="!h-4 !min-w-0 !flex-1 !max-w-[200px]"
                />
                <Skeleton.Input
                  active
                  size="small"
                  className="!h-4 !w-10 !min-w-0 shrink-0"
                />
              </div>
              <Skeleton.Input
                active
                size="small"
                className="!h-2 !w-full !min-w-0 !rounded-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TopOkrPerformersCardSkeleton() {
  return (
    <ul
      className="scrollbar-none h-[265px] space-y-3 overflow-y-auto"
      aria-hidden
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <li
          key={i}
          className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Skeleton.Avatar active size={36} />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton.Input
                active
                size="small"
                className="!h-4 !w-36 !min-w-0 max-w-full"
              />
              <Skeleton.Input
                active
                size="small"
                className="!h-3 !w-28 !min-w-0 max-w-full"
              />
            </div>
          </div>
          <Skeleton.Input
            active
            size="small"
            className="!h-5 !w-14 !min-w-0 shrink-0"
          />
        </li>
      ))}
    </ul>
  );
}
