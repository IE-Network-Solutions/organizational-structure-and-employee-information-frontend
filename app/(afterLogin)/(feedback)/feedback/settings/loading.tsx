'use client';

import { Skeleton } from 'antd';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function FeedbackSettingsLoading() {
  const { isMobile } = useIsMobile();

  return (
    <div
      className={isMobile ? 'space-y-3' : 'flex items-start gap-4'}
      data-cy="feedback-settings-route-loading"
      id="feedbackSettingsRouteLoading"
    >
      <div
        className={`rounded-lg border border-[#D9D9D9] bg-white p-4 ${
          isMobile ? '' : 'w-[260px] shrink-0'
        }`}
        data-cy="feedback-settings-loading-sidebar"
      >
        <div
          className="space-y-3"
          data-cy="feedback-settings-loading-sidebar-list"
        >
          {Array.from({ length: 3 }).map((unusedValue, idx) => {
            void unusedValue;
            return (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-[#D9D9D9] px-3 py-2.5"
                data-cy={`feedback-settings-loading-nav-item-${idx}`}
              >
                <div
                  className="flex items-center gap-3"
                  data-cy={`feedback-settings-loading-nav-item-row-${idx}`}
                >
                  <Skeleton.Button active size="small" className="!w-8 !h-8" />
                  <div
                    className="space-y-2"
                    data-cy={`feedback-settings-loading-nav-text-${idx}`}
                  >
                    <Skeleton.Input
                      active
                      size="small"
                      className="!w-24 !h-3 !min-w-0"
                    />
                    <Skeleton.Input
                      active
                      size="small"
                      className="!w-28 !h-2.5 !min-w-0"
                    />
                  </div>
                </div>
                <Skeleton.Button
                  active
                  size="small"
                  className="!w-7 !h-5 !min-w-0"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={isMobile ? '' : 'flex-1'}
        data-cy="feedback-settings-loading-main-wrap"
      >
        <div
          className={`rounded-lg border border-[#D9D9D9] bg-white ${
            isMobile ? 'p-3' : 'p-4'
          }`}
          data-cy="feedback-settings-loading-main-panel"
        >
          <Skeleton.Input
            active
            className={`!h-10 !min-w-0 ${isMobile ? '!w-full' : '!w-[320px]'}`}
          />
          <div
            className="mt-3 space-y-2.5"
            data-cy="feedback-settings-loading-rows"
          >
            {Array.from({ length: 8 }).map((unusedValue, idx) => {
              void unusedValue;
              return (
                <div
                  key={idx}
                  className="flex items-start justify-between rounded-lg border border-[#D9D9D9] px-4 py-3"
                  data-cy={`feedback-settings-loading-row-${idx}`}
                >
                  <div
                    className="min-w-0 flex-1 pr-3"
                    data-cy={`feedback-settings-loading-row-body-${idx}`}
                  >
                    <Skeleton.Input
                      active
                      size="small"
                      className="!h-3 !w-[55%] !min-w-0"
                    />
                    <div
                      className="mt-2"
                      data-cy={`feedback-settings-loading-row-subline-${idx}`}
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
}
