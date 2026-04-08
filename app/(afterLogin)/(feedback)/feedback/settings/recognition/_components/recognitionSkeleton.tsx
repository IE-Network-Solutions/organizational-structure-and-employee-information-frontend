'use client';

import { Skeleton } from 'antd';

const RecognitionSkeleton = () => {
  return (
    <div
      className="grid grid-cols-12 flex-col-reverse justify-between rounded-lg border border-[#D9D9D9] p-4"
      data-cy="settings-recognition-loading-content"
      id="settingsRecognitionLoadingContent"
    >
      <div className="col-span-12" data-cy="recognition-skeleton-main-col">
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          data-cy="recognition-skeleton-grid"
        >
          {Array.from({ length: 6 }).map((unusedValue, idx) => {
            void unusedValue;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[#D9D9D9] bg-white p-4"
                data-cy={`recognition-skeleton-card-${idx}`}
              >
                <div
                  className="flex items-start justify-between gap-3"
                  data-cy={`recognition-skeleton-card-row-${idx}`}
                >
                  <div
                    className="min-w-0 flex-1"
                    data-cy={`recognition-skeleton-card-body-${idx}`}
                  >
                    <Skeleton.Input
                      active
                      size="small"
                      className="!h-4 !w-[68%] !min-w-0"
                    />
                    <div
                      className="mt-3"
                      data-cy={`recognition-skeleton-card-subline-${idx}`}
                    >
                      <Skeleton.Input
                        active
                        size="small"
                        className="!h-6 !w-[44%] !min-w-0"
                      />
                    </div>
                  </div>
                  <Skeleton.Button
                    active
                    size="small"
                    className="!h-6 !w-6 !min-w-0"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecognitionSkeleton;
