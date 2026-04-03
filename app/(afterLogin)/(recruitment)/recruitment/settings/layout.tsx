'use client';
import { FC, ReactNode } from 'react';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { usePathname, useRouter } from 'next/navigation';
import {
  SettingsAddButtonProvider,
  useSettingsAddButton,
} from './SettingsAddButtonContext';
import { UserPlus } from 'lucide-react';

interface SettingsLayoutProps {
  children: ReactNode;
}

const TABS = [
  {
    key: 'status',
    label: 'Define Status',
    path: '/recruitment/settings/status',
  },
  {
    key: 'talentPoolCategoryTab',
    label: 'Talent Pool Category',
    path: '/recruitment/settings/talentPoolCategory/talentPoolCategoryTab',
  },
  {
    key: 'customFields',
    label: 'Template Questions',
    path: '/recruitment/settings/customFields',
  },
] as const;

const SettingsTabsAndContent: FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { addAction, addLabel, mobileOnly } = useSettingsAddButton();

  const isTabActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <div
      className="min-h-screen bg-white p-3"
      id="talent-acquisition-settings-layout-container"
      data-cy="talent-acquisition-settings-layout-container"
    >
      <div
        className="h-auto w-auto"
        id="talent-acquisition-settings-layout-header-wrapper"
        data-cy="talent-acquisition-settings-layout-header-wrapper"
      >
        <div
          id="talent-acquisition-settings-header"
          data-cy="talent-acquisition-settings-breadcrumb"
          className="border-b border-[#E5E7EB] pt-2 pb-4 mb-6"
        >
          <h1
            className="text-2xl font-bold text-gray-900 mb-1"
            data-cy="talent-acquisition-settings-title"
          >
            Settings
          </h1>
          <div
            className="flex items-center gap-1 text-[14px] font-normal"
            data-cy="talent-acquisition-settings-breadcrumb-path"
          >
            <span
              className="text-black/45"
              data-cy="talent-acquisition-settings-breadcrumb-parent"
            >
              Talent Acquisition
            </span>
            <span
              className="text-black/45"
              data-cy="talent-acquisition-settings-breadcrumb-separator"
            >
              /
            </span>
            <span
              className="text-black/70"
              data-cy="talent-acquisition-settings-breadcrumb-current"
            >
              Settings
            </span>
          </div>
        </div>

        <div
          className="flex items-stretch gap-0 border-b border-gray-200 mb-4 min-h-0"
          id="talent-acquisition-settings-tabs"
          data-cy="talent-acquisition-settings-tabs"
        >
          <div
            className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden"
            data-cy="talent-acquisition-settings-tabs-scroll"
          >
            <div
              className="flex gap-0 border-b-0 w-max min-h-full"
              data-cy="talent-acquisition-settings-tabs-inner"
            >
              {TABS.map((tab) => {
                const active = isTabActive(tab.path);
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => router.push(tab.path)}
                    data-cy={`talent-acquisition-settings-tab-${tab.key}`}
                    className={`px-4 py-3 text-base border-b-2 -mb-px flex-shrink-0 whitespace-nowrap transition-colors ${
                      active
                        ? 'font-bold text-[#1E40AF] border-[#1E40AF]'
                        : 'font-normal text-black/70 border-transparent hover:text-black/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {addAction && (
            <>
              {!mobileOnly && (
                <button
                  type="button"
                  onClick={() => addAction()}
                  className="hidden md:flex flex-shrink-0 items-center justify-center gap-2 h-9 px-4 rounded-lg bg-[#1E40AF] text-white text-base font-normal ml-4 self-center mb-1"
                  data-cy="talent-acquisition-settings-desktop-add-button"
                >
                  <UserPlus size={16} />
                  {addLabel && (
                    <span data-cy="talent-acquisition-settings-desktop-add-button-label">
                      {addLabel}
                    </span>
                  )}
                </button>
              )}
              {/* Mobile: circular icon-only button */}
              <button
                type="button"
                onClick={() => addAction()}
                className="md:hidden flex-shrink-0 h-10 px-4 rounded-lg bg-[#1E40AF] text-white flex items-center justify-center gap-1.5 ml-2 -mb-px"
                data-cy="talent-acquisition-settings-mobile-add-button"
                aria-label="Add"
              >
                <UserPlus size={20} />
              </button>
            </>
          )}
        </div>

        <div
          id="talent-acquisition-settings-layout-content-wrapper"
          data-cy="talent-acquisition-settings-layout-content-wrapper"
          className="flex-1"
        >
          <BlockWrapper
            padding="0px"
            className="h-max bg-white overflow-x-auto p-0"
            data-cy="talent-acquisition-settings-layout-block-wrapper-children"
          >
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

const SettingsLayout: FC<SettingsLayoutProps> = ({ children }) => {
  return (
    <SettingsAddButtonProvider>
      <SettingsTabsAndContent>{children}</SettingsTabsAndContent>
    </SettingsAddButtonProvider>
  );
};

export default SettingsLayout;
