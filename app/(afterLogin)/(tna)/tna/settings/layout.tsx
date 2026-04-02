'use client';
import { FC, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface TnaSettingsLayoutProps {
  children: ReactNode;
}

const TABS = [
  {
    key: 'course-category',
    label: 'Course Category',
    href: '/tna/settings/course-category',
  },
  {
    key: 'tna-category',
    label: 'TNA Category',
    href: '/tna/settings/tna-category',
  },
  {
    key: 'commitment-rule',
    label: 'Commitment Rule',
    href: '/tna/settings/commitment-rule',
  },
  {
    key: 'approvals',
    label: 'Approval Workflow',
    href: '/tna/settings/approvals',
  },
];

const TnaSettingsLayout: FC<TnaSettingsLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const activeTabKey =
    TABS.find((t) => pathname.includes(t.key))?.key ?? TABS[0].key;

  return (
    <div
      className="min-h-screen bg-white"
      id="tnaSettingsLayoutId"
      data-cy="tna-settings-layout"
    >
      {/* Title + breadcrumb */}
      <div className="px-6 pt-5 pb-0" data-cy="tna-settings-header">
        <h1
          className="text-[24px] font-bold text-black leading-tight"
          data-cy="tna-settings-title"
        >
          Settings
        </h1>
        <div
          className="flex items-center gap-1 mt-1"
          data-cy="tna-settings-breadcrumb"
        >
          <span
            data-cy="tna-settings-breadcrumb-root"
            className="text-[14px] font-normal text-[rgba(0,0,0,0.45)]"
          >
            Learning and Growth
          </span>
          <span
            data-cy="tna-settings-breadcrumb-separator"
            className="text-[14px] font-normal text-[rgba(0,0,0,0.45)] mx-0.5"
          >
            /
          </span>
          <span
            data-cy="tna-settings-breadcrumb-current"
            className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]"
          >
            Settings
          </span>
        </div>
      </div>

      {/* Horizontal tab bar — exactly like the reference image */}
      <div
        className="px-6 mt-5 border-b border-[#D9D9D9]"
        data-cy="tna-settings-tabs"
      >
        <div className="flex items-end gap-0" data-cy="tna-settings-tabs-inner">
          {TABS.map((tab) => {
            const isActive = activeTabKey === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => router.push(tab.href)}
                className={[
                  'relative px-4 pb-[10px] pt-0 text-[16px] whitespace-nowrap',
                  'transition-colors duration-150 bg-transparent border-none outline-none cursor-pointer',
                  isActive
                    ? 'text-[#1E40AF] font-bold'
                    : 'text-[rgba(0,0,0,0.7)] font-normal hover:text-[#1E40AF]',
                ].join(' ')}
                data-cy={`tna-settings-tab-${tab.key}`}
              >
                {tab.label}
                {isActive && (
                  <span
                    data-cy={`tna-settings-tab-indicator-${tab.key}`}
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1E40AF]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab page content */}
      <div className="px-6 pt-5" data-cy="tna-settings-content">
        {children}
      </div>
    </div>
  );
};

export default TnaSettingsLayout;
