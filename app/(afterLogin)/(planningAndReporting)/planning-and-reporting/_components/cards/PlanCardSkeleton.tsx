import React from 'react';

export default function PlanCardSkeleton() {
  return (
    <div
      data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-5"
      className="animate-pulse rounded-lg border border-[#E0E0E0] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
    >
      {/* Header Skeleton */}
      <div
        data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-7"
        className="flex items-center justify-between mb-6"
      >
        <div
          data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-8"
          className="h-6 w-32 bg-gray-200 rounded"
        ></div>
        <div
          data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-9"
          className="h-8 w-16 bg-gray-200 rounded-lg"
        ></div>
      </div>

      {/* User Info & Status Skeleton */}
      <div
        data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-13"
        className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1"
      >
        <div
          data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-14"
          className="flex items-center gap-3"
        >
          <div
            data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-15"
            className="h-10 w-10 rounded-full bg-gray-200"
          ></div>
          <div
            data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-16"
            className="flex flex-col gap-2"
          >
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-17"
              className="h-4 w-24 bg-gray-200 rounded"
            ></div>
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-18"
              className="h-3 w-16 bg-gray-200 rounded"
            ></div>
          </div>
        </div>
        <div
          data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-21"
          className="flex items-center gap-3"
        >
          <div
            data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-22"
            className="h-8 w-24 bg-gray-200 rounded-full"
          ></div>
        </div>
      </div>

      {/* Key Result Skeleton */}
      <div
        data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-27"
        className="rounded-3xl border border-[#F1F2F6] bg-white p-6"
      >
        <div
          data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-28"
          className="pl-2"
        >
          {/* Summary Bar Skeleton */}
          <div
            data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-30"
            className="mb-5 flex gap-2"
          >
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-31"
              className="h-6 w-20 bg-gray-200 rounded-full"
            ></div>
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-32"
              className="h-6 w-20 bg-gray-200 rounded-full"
            ></div>
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-33"
              className="h-6 w-20 bg-gray-200 rounded-full"
            ></div>
          </div>

          {/* Title Skeleton */}
          <div
            data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-37"
            className="flex items-start gap-3 mb-6"
          >
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-38"
              className="h-6 w-6 bg-gray-200 rounded"
            ></div>
            <div
              data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-39"
              className="h-6 w-3/4 bg-gray-200 rounded"
            ></div>
          </div>

          {/* Tasks Skeleton */}
          <div
            data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-43"
            className="flex flex-col gap-4"
          >
            {[1, 2, 3].map((i) => (
              <div
                data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-45"
                key={i}
                className="flex items-center justify-between"
              >
                <div
                  data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-46"
                  className="h-4 w-1/2 bg-gray-200 rounded"
                ></div>
                <div
                  data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-47"
                  className="h-4 w-16 bg-gray-200 rounded"
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comments Skeleton */}
      <div
        data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-55"
        className="mt-6 flex items-center gap-3"
      >
        <div
          data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-56"
          className="flex -space-x-2"
        >
          <div
            data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-57"
            className="h-7 w-7 rounded-full bg-gray-200 border-2 border-white"
          ></div>
          <div
            data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-58"
            className="h-7 w-7 rounded-full bg-gray-200 border-2 border-white"
          ></div>
        </div>
        <div
          data-cy="planning-and-reporting-components-cards-plancardskeleton-tsx-plancardskeleton-div-60"
          className="h-4 w-20 bg-gray-200 rounded"
        ></div>
      </div>
    </div>
  );
}
