'use client';

import React from 'react';

/**
 * Background skeleton matching the modal reference images:
 * Left sidebar (dark grey + skeleton list), top header, main area with
 * four image placeholder boxes and two large content blocks with folder icon.
 */
const OnboardingModalBackground: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div
      className={`absolute inset-0 z-0 overflow-hidden flex bg-[#e5e7eb] ${className}`}
      aria-hidden
      data-cy="onboarding-modal-background"
    >
      {/* Left sidebar - same as body #e5e7eb with skeleton menu */}
      <aside
        className="w-[220px] flex-shrink-0 bg-[#e5e7eb] flex flex-col py-4 px-3 pointer-events-none"
        data-cy="onboarding-modal-sidebar"
      >
        {/* Active item - blue bar */}
        <div
          className="h-9 bg-[#3B82F6] rounded-md mb-3 w-full"
          data-cy="onboarding-sidebar-active-bar"
        />
        {/* Grey blocks */}
        <div
          className="h-9 bg-[#d1d5db] rounded-md mb-2 w-4/5"
          data-cy="onboarding-sidebar-block-1"
        />
        <div
          className="h-9 bg-[#d1d5db] rounded-md mb-2 w-3/5"
          data-cy="onboarding-sidebar-block-2"
        />
        <div
          className="border-t border-[#d1d5db] my-3"
          data-cy="onboarding-sidebar-divider"
        />
        {/* Skeleton list - varying length bars */}
        {[0.95, 0.7, 0.85, 0.6, 0.9, 0.75, 0.65, 0.8, 0.7, 0.55, 0.9, 0.6].map(
          (w, i) => (
            <div
              key={i}
              className="h-4 bg-[#d1d5db] rounded mb-2"
              style={{ width: `${w * 100}%` }}
              data-cy={`onboarding-sidebar-skeleton-${i}`}
            />
          ),
        )}
      </aside>

      {/* Right side: top bar + main content */}
      <div
        className="flex-1 flex flex-col min-w-0"
        data-cy="onboarding-modal-right"
      >
        {/* Top header - same as body #e5e7eb */}
        <header
          className="h-12 flex-shrink-0 bg-[#e5e7eb] flex items-center px-4 gap-2"
          data-cy="onboarding-modal-header"
        >
          <div
            className="w-16 h-6 bg-[#3B82F6]/60 rounded"
            data-cy="onboarding-header-bar-1"
          />
          <div
            className="w-12 h-6 bg-[#d1d5db] rounded"
            data-cy="onboarding-header-bar-2"
          />
          <div
            className="w-12 h-6 bg-[#d1d5db] rounded"
            data-cy="onboarding-header-bar-3"
          />
        </header>

        {/* Main content - placeholder layout (no scroll) */}
        <div
          className="flex-1 p-6 flex flex-col gap-6 overflow-hidden min-h-0 bg-[#e5e7eb]"
          data-cy="onboarding-modal-main"
        >
          {/* Four image placeholder boxes in a row */}
          <div
            className="grid grid-cols-4 gap-4 w-full flex-shrink-0"
            data-cy="onboarding-placeholder-grid"
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-lg border border-[#d1d5db] bg-[#f3f4f6] flex flex-col items-center justify-center"
                data-cy={`onboarding-placeholder-box-${i}`}
              >
                {/* Mountain/landscape placeholder icon */}
                <svg
                  className="w-14 h-14 text-[#9ca3af] self-center"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                  data-cy={`onboarding-placeholder-icon-${i}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    data-cy="onboarding-placeholder-path"
                  />
                </svg>
                <div
                  className="flex gap-1.5 mt-2"
                  data-cy={`onboarding-placeholder-dots-${i}`}
                >
                  <span
                    className="w-2 h-2 rounded-full bg-[#9ca3af]"
                    data-cy={`onboarding-dot-${i}-1`}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-[#9ca3af]"
                    data-cy={`onboarding-dot-${i}-2`}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-[#9ca3af]"
                    data-cy={`onboarding-dot-${i}-3`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Two large content blocks with folder/document icon */}
          <div
            className="flex-1 grid grid-cols-1 gap-6 min-h-[200px]"
            data-cy="onboarding-content-blocks"
          >
            <div
              className="min-h-[200px] rounded-lg border border-[#d1d5db] bg-[#f3f4f6] flex items-end justify-center pb-8"
              data-cy="onboarding-content-block-1"
            >
              <svg
                className="w-12 h-12 text-[#9ca3af]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
                data-cy="onboarding-folder-icon-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  data-cy="onboarding-folder-path-1"
                />
              </svg>
            </div>
            <div
              className="min-h-[200px] rounded-lg border border-[#d1d5db] bg-[#f3f4f6] flex items-end justify-center pb-8"
              data-cy="onboarding-content-block-2"
            >
              <svg
                className="w-12 h-12 text-[#9ca3af]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
                data-cy="onboarding-folder-icon-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  data-cy="onboarding-folder-path-2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Dimmed overlay so background reads as wireframe behind modal */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ backgroundColor: 'rgba(75, 85, 99, 0.35)' }}
        data-cy="onboarding-modal-overlay"
      />
    </div>
  );
};

export default OnboardingModalBackground;
