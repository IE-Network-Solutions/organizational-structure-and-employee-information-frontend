'use client';

import { Skeleton } from 'antd';

const DefineMeetingTypeSkeleton = () => {
  return (
    <div
      className="border border-[#D9D9D9] rounded-lg p-4"
      data-cy="settings-define-meeting-type-loading"
      id="settingsDefineMeetingTypeLoading"
    >
      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        data-cy="define-meeting-type-skeleton-grid"
      >
        {Array.from({ length: 6 }).map((unusedValue, idx) => {
          void unusedValue;
          return (
            <div
              key={idx}
              className="rounded-xl border border-[#D9D9D9] bg-white px-4 h-12 flex items-center justify-between gap-3"
              data-cy={`define-meeting-type-skeleton-card-${idx}`}
            >
              <Skeleton.Input
                active
                size="small"
                className="!h-4 !w-[70%] !min-w-0"
              />
              <Skeleton.Button
                active
                size="small"
                className="!h-6 !w-6 !min-w-0"
              />
            </div>
          );
        })}
      </div>

      <div
        className="mt-4 flex justify-end gap-2"
        data-cy="define-meeting-type-skeleton-actions"
      >
        <Skeleton.Button active size="small" className="!h-8 !w-20 !min-w-0" />
        <Skeleton.Button active size="small" className="!h-8 !w-8 !min-w-0" />
        <Skeleton.Button active size="small" className="!h-8 !w-8 !min-w-0" />
      </div>
    </div>
  );
};

export default DefineMeetingTypeSkeleton;
