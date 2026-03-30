'use client';

import React from 'react';
import { Skeleton } from 'antd';

/**
 * Shown by Next.js when navigating between OKR settings tabs (e.g. OKR Type, Criteria Management).
 * Provides a consistent skeleton for the tab content area while the new page loads.
 */
function OkrSettingsLoading() {
  return (
    <div
      className="w-full border border-[#f0f0f0] rounded-xl pt-5 px-8 pb-8 bg-white min-h-[400px]"
      data-cy="okr-settings-tab-loading-skeleton"
      id="okr-settings-tab-loading-skeleton"
    >
      <div
        className="mb-6 flex gap-4 items-end"
        data-cy="okr-settings-tab-loading-skeleton-header"
      >
        <Skeleton.Input
          active
          size="large"
          className="!w-48 !min-w-0"
          data-cy="okr-settings-tab-loading-skeleton-input-large"
        />
        <Skeleton.Input
          active
          className="!w-32 !min-w-0"
          data-cy="okr-settings-tab-loading-skeleton-input"
        />
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        data-cy="okr-settings-tab-loading-skeleton-cards-grid"
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            active
            paragraph={{ rows: 3 }}
            className="!p-5 rounded-[12px] border border-[#f0f0f0]"
            data-cy={`okr-settings-tab-loading-skeleton-card-${i}`}
          />
        ))}
      </div>
    </div>
  );
}

export default OkrSettingsLoading;
