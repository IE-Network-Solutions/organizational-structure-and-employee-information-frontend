'use client';

import React, { FC, ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { Button } from 'antd';
import { FaPlus } from 'react-icons/fa';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';

interface IncentiveSettingsLayoutProps {
  children: ReactNode;
}

const VP_TABS = [
  {
    key: 'criteria-management',
    label: 'Criteria Management',
    path: '/incentives/settings/vp/criteria-management',
  },
] as const;

const IncentiveSettingsLayout: FC<IncentiveSettingsLayoutProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { openDrawer } = useDrawerStore();
  const [activeTab, setActiveTab] = useState<string>('criteria-management');

  useEffect(() => {
    const lastKey = pathname.split('/').filter(Boolean).pop();

    if (lastKey === 'criteria-management') {
      setActiveTab(lastKey);
      return;
    }

    if (lastKey === 'vp' || lastKey === 'settings') {
      setActiveTab('criteria-management');
    }
  }, [pathname]);

  const handleTabClick = (path: string, key: string) => {
    if (pathname === path) return;
    setActiveTab(key);
    router.push(path);
  };

  const isCriteriaManagement = activeTab === 'criteria-management';

  return (
    <div
      id="incentive-settings-layout-container"
      data-cy="incentive-settings-layout-container"
      className="min-h-screen bg-white"
    >
      <div
        className="w-full bg-white"
        id="incentive-settings-layout-wrapper"
        data-cy="incentive-settings-layout-wrapper"
      >
      <div className="mb-4" data-cy="incentive-settings-header-section">
        <CustomBreadcrumb
          title={
            <span
              id="incentive-settings-header-title"
              data-cy="incentive-settings-header-title"
            >
              Setting
            </span>
          }
          subtitle={
            <div
              className="flex items-center gap-2 mt-1"
              data-cy="incentive-settings-breadcrumb-subtitle-row"
            >
              <Link
                className=" !text-gray-400"
                href="/incentives"
                data-cy="incentive-settings-breadcrumb-incentives"
              >
                Incentives
              </Link>
              <span data-cy="incentive-settings-breadcrumb-separator">/</span>
              <span
                className=" !text-gray-800"
                data-cy="incentive-settings-breadcrumb-current"
              >
                Settings
              </span>
            </div>
          }
        />
      </div>

      <div className="mb-6" data-cy="incentive-settings-tab-navigation">
        <div
          className="flex items-end justify-between border-b border-[#f0f0f0] flex-nowrap"
          data-cy="incentive-settings-tab-container"
        >
          <div
            className="flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide pr-4"
            data-cy="incentive-settings-tabs-wrapper"
          >
            {VP_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabClick(tab.path, tab.key)}
                  className={`pb-3 px-0 text-[15px] transition-colors relative flex-shrink-0 ${
                    isActive
                      ? 'text-[#2b54ad] font-semibold'
                      : 'text-[#595959] font-normal hover:text-[#262626]'
                  }`}
                  id={`incentive-settings-tab-${tab.key}`}
                  data-cy={`incentive-settings-tab-${tab.key}`}
                >
                  {tab.label}
                  {isActive && (
                    <div
                      className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#2b54ad] z-10"
                      data-cy={`incentive-settings-tab-indicator-${tab.key}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div
            className="flex-shrink-0 ml-2"
            data-cy="incentive-settings-tab-actions"
          >
            {isCriteriaManagement && (
              <AccessGuard
                permissions={[Permissions.CreateVpScoringConfigurations]}
                data-cy="incentive-settings-add-scoring-access-guard"
              >
                <Button
                  icon={<FaPlus />}
                  onClick={() => openDrawer()}
                  className="bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] h-[40px] px-3 sm:px-6 text-white border-none mb-3 rounded-lg flex items-center justify-center font-medium"
                  type="primary"
                  id="incentive-settings-add-scoring-button"
                  data-cy="incentive-settings-add-scoring-button"
                >
                  <span
                    className="hidden sm:inline ml-2"
                    data-cy="incentive-settings-add-scoring-button-text"
                  >
                    Add Scoring
                  </span>
                </Button>
              </AccessGuard>
            )}
          </div>
        </div>
      </div>

      <div
        id="incentive-settings-content"
        data-cy="incentive-settings-content"
        className="w-full bg-white"
      >
        {children}
      </div>
      </div>
    </div>
  );
};

export default IncentiveSettingsLayout;
