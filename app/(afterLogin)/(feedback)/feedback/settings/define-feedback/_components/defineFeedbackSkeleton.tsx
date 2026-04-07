'use client';

import { Skeleton } from 'antd';
import { useIsMobile } from '@/hooks/useIsMobile';

const DefineFeedbackSkeleton = () => {
  const { isMobile } = useIsMobile();

  return (
    <div
      data-cy="settings-define-feedback-page-loading"
      id="settingsDefineFeedbackPageLoading"
      className={isMobile ? 'space-y-3' : 'flex items-start gap-4'}
    >
      <div
        className={`rounded-lg border border-[#D9D9D9] bg-white p-4 ${
          isMobile ? '' : 'w-[260px] shrink-0'
        }`}
        data-cy="define-feedback-skeleton-sidebar"
      >
        <div
          className="space-y-3"
          data-cy="define-feedback-skeleton-sidebar-list"
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-lg border border-[#D9D9D9] px-3 py-2.5"
              data-cy={`define-feedback-skeleton-sidebar-item-${item}`}
            >
              <div
                className="flex items-center gap-3"
                data-cy={`define-feedback-skeleton-sidebar-item-row-${item}`}
              >
                <Skeleton.Button active size="small" className="!w-8 !h-8" />
                <div
                  className="space-y-2"
                  data-cy={`define-feedback-skeleton-sidebar-item-text-${item}`}
                >
                  <Skeleton.Input
                    active
                    size="small"
                    className="!w-24 !min-w-0 !h-3"
                  />
                  <Skeleton.Input
                    active
                    size="small"
                    className="!w-28 !min-w-0 !h-2.5"
                  />
                </div>
              </div>
              <Skeleton.Button active size="small" className="!w-7 !h-5" />
            </div>
          ))}
        </div>
      </div>

      <div
        className={isMobile ? '' : 'flex-1'}
        data-cy="define-feedback-skeleton-main-wrap"
      >
        <div
          className={`rounded-lg border border-[#D9D9D9] bg-white ${
            isMobile ? 'p-3' : 'p-4'
          }`}
          data-cy="define-feedback-skeleton-main-panel"
        >
          <Skeleton.Input
            active
            className={`!h-10 !min-w-0 ${isMobile ? '!w-full' : '!w-[320px]'}`}
          />
          <div
            className="mt-3 space-y-2.5"
            data-cy="define-feedback-skeleton-rows"
          >
            {Array.from({ length: 8 }).map((unusedValue, idx) => {
              void unusedValue;
              return (
                <div
                  key={idx}
                  className="flex items-start justify-between rounded-lg border border-[#D9D9D9] px-4 py-3"
                  data-cy={`define-feedback-skeleton-row-${idx}`}
                >
                  <div
                    className="min-w-0 flex-1 pr-3"
                    data-cy={`define-feedback-skeleton-row-body-${idx}`}
                  >
                    <Skeleton.Input
                      active
                      size="small"
                      className="!h-3 !w-[55%] !min-w-0"
                    />
                    <div
                      className="mt-2"
                      data-cy={`define-feedback-skeleton-row-subline-${idx}`}
                    >
                      <Skeleton.Input
                        active
                        size="small"
                        className="!h-2.5 !w-[72%] !min-w-0"
                      />
                    </div>
                  </div>
                  <Skeleton.Button
                    active
                    size="small"
                    className="!w-6 !h-6 !min-w-0"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefineFeedbackSkeleton;
