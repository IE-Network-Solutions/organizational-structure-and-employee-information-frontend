'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Skeleton } from 'antd';
import { FaPlus } from 'react-icons/fa';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { usePlanningAssignationStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/planning-assignation-drawer';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import { useOkrRuleStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/okr-rule';
import { useOKRSettingStore } from '@/store/uistate/features/okrplanning/okrSetting';

interface OkrSettingsLayoutProps {
  children: React.ReactNode;
}

function TabContentSkeleton({ activeTab }: { activeTab: string }) {
  const getSkeletonGridClass = () => {
    if (activeTab === 'okr-rules') {
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
    }
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
  };

  const getSkeletonCardClass = () => {
    if (activeTab === 'planning-assignation') {
      return '!py-2 !px-4 min-h-[80px] rounded-[8px] border border-[#d9d9d9]';
    }
    if (activeTab === 'criteria-management') {
      return '!py-3 !px-4 min-h-[78px] rounded-[8px] border border-[#d9d9d9]';
    }
    if (activeTab === 'target-assignment') {
      return '!py-2 !px-4 min-h-[112px] rounded-[8px] border border-[#d9d9d9]';
    }
    if (activeTab === 'okr-rules') {
      return '!py-3 !px-4 min-h-[78px] min-w-[323px] rounded-[8px] border border-[#d9d9d9]';
    }
    return '!p-5 rounded-[12px] border border-[#f0f0f0]';
  };

  return (
    <div
      className="w-full border border-[#f0f0f0] rounded-xl pt-5 px-8 pb-8 bg-white min-h-[400px]"
      data-cy="okr-settings-tab-loading-skeleton"
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
        className={getSkeletonGridClass()}
        data-cy="okr-settings-tab-loading-skeleton-cards-grid"
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            active
            paragraph={{ rows: 3 }}
            className={getSkeletonCardClass()}
            data-cy={`okr-settings-tab-loading-skeleton-card-${i}`}
          />
        ))}
      </div>
    </div>
  );
}

const OkrSettingsLayout: React.FC<OkrSettingsLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('okr-type');
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [pendingTabPath, setPendingTabPath] = useState<string | null>(null);
  const { setOpen: setPlanningOpen } = usePlanningAssignationStore();
  const { openDrawer: setCriteriaOpen } = useDrawerStore();
  const { setOpen: setOkrRuleOpen } = useOkrRuleStore();
  const { showNotReportedList } = useOKRSettingStore();

  const isPlanningAssignation = activeTab === 'planning-assignation';
  const isCriteriaManagement = activeTab === 'criteria-management';

  const handleAddAssignee = () => {
    setPlanningOpen(true);
  };

  const handleAddScoring = () => {
    setCriteriaOpen();
  };

  const handleAddRule = () => {
    setOkrRuleOpen(true);
  };

  const tabs = [
    {
      key: 'okr-type',
      label: 'OKR Type',
      path: '/okr/settings/okr-type',
    },
    {
      key: 'planning-assignation',
      label: 'Planning Assignation',
      path: '/okr/settings/planning-assignation',
    },
    {
      key: 'criteria-management',
      label: 'Criteria Management',
      path: '/okr/settings/criteria-management',
    },
    {
      key: 'target-assignment',
      label: 'Target Assignment',
      path: '/okr/settings/target-assignment',
    },
    {
      key: 'okr-rules',
      label: 'OKR Rules',
      path: '/okr/settings/define-okr-rule',
    },
  ];

  useEffect(() => {
    const tabMap: Record<string, string> = {
      'okr-type': 'okr-type',
      'planning-assignation': 'planning-assignation',
      'criteria-management': 'criteria-management',
      'target-assignment': 'target-assignment',
      'define-okr-rule': 'okr-rules',
    };

    // While router.push is in flight, pathname is still the previous route; use the
    // pending URL so the clicked tab stays highlighted with the skeleton.
    const pathForActiveTab =
      pendingTabPath && pathname !== pendingTabPath ? pendingTabPath : pathname;
    const lastKey = pathForActiveTab.split('/').filter(Boolean).pop() ?? '';

    if (tabMap[lastKey]) {
      setActiveTab(tabMap[lastKey]);
    }

    // Clear tab loading state once we've navigated to the target path
    if (pendingTabPath && pathname === pendingTabPath) {
      setIsTabLoading(false);
      setPendingTabPath(null);
    }
  }, [pathname, pendingTabPath]);

  const handleTabClick = (path: string, key: string) => {
    if (pathname === path) return;
    setActiveTab(key);
    setPendingTabPath(path);
    setIsTabLoading(true);
    router.push(path);
  };

  return (
    <div
      className="min-h-screen bg-white"
      id="okr-settings-layout-container-display-div"
      data-cy="okr-settings-layout-container-display-div"
    >
      <div
        className="w-full h-auto bg-white py-6 px-0"
        id="okr-settings-layout-wrapper-display-div"
        data-cy="okr-settings-layout-wrapper-display-div"
      >
        {/* Header Section */}
        {!showNotReportedList && (
          <div className="mb-4" data-cy="okr-settings-header-section">
            <h1
              className="text-[26px] font-bold text-[#262626] mb-2"
              id="okr-settings-header-title"
              data-cy="okr-settings-header-title"
            >
              Setting
            </h1>
            <p
              className="text-[15px] text-[#8c8c8c] mb-4"
              id="okr-settings-header-breadcrumb"
              data-cy="okr-settings-header-breadcrumb"
            >
              OKR / Settings
            </p>
            {/* Divider */}
            <div
              className="h-[1px] bg-[#f0f0f0]"
              data-cy="okr-settings-header-divider"
            />
          </div>
        )}

        {/* Tab Navigation */}
        {!showNotReportedList && (
          <div className="mb-6" data-cy="okr-settings-tab-navigation">
            <div
              className="flex items-end justify-between border-b border-[#f0f0f0] flex-nowrap"
              data-cy="okr-settings-tab-container"
            >
              <div
                className="flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide custom-tabs-scroll"
                data-cy="okr-settings-tabs-wrapper"
              >
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleTabClick(tab.path, tab.key)}
                      className={`pb-3 px-0 text-[15px] transition-colors relative flex-shrink-0 ${
                        isActive
                          ? 'text-[#2b54ad] font-semibold'
                          : 'text-[#595959] font-normal hover:text-[#262626]'
                      }`}
                      id={`okr-settings-tab-${tab.key}`}
                      data-cy={`okr-settings-tab-${tab.key}`}
                    >
                      {tab.label}
                      {isActive && (
                        <div
                          className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#2b54ad] z-10"
                          data-cy={`okr-settings-tab-indicator-${tab.key}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <div
                className="flex-shrink-0 ml-2 min-h-[52px] flex items-end"
                data-cy="okr-settings-tab-actions"
              >
                {activeTab === 'okr-type' && (
                  <div
                    className="h-[40px] mb-3 px-3 sm:px-6 rounded-lg invisible"
                    data-cy="okr-settings-tab-actions-placeholder"
                  />
                )}
                {isPlanningAssignation && (
                  <AccessGuard
                    permissions={[Permissions.AssignPlanningPeriod]}
                    data-cy="okr-settings-add-assignee-button-access-guard"
                  >
                    <Button
                      icon={<FaPlus />}
                      onClick={handleAddAssignee}
                      className="bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] h-[40px] px-3 sm:px-6 text-white border-none mb-3 rounded-lg flex items-center justify-center font-medium"
                      type="primary"
                      id="okr-settings-add-assignee-button"
                      data-cy="okr-settings-add-assignee-button"
                    >
                      <span
                        className="hidden sm:inline ml-2"
                        data-cy="okr-settings-add-assignee-button-text"
                      >
                        Add Assignee
                      </span>
                    </Button>
                  </AccessGuard>
                )}
                {isCriteriaManagement && (
                  <AccessGuard
                    permissions={[Permissions.CreateVpScoringConfigurations]}
                    data-cy="okr-settings-add-scoring-button-access-guard"
                  >
                    <Button
                      icon={<FaPlus />}
                      onClick={handleAddScoring}
                      className="bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] h-[40px] px-3 sm:px-6 text-white border-none mb-3 rounded-lg flex items-center justify-center font-medium"
                      type="primary"
                      id="okr-settings-add-scoring-button"
                      data-cy="okr-settings-add-scoring-button"
                    >
                      <span
                        className="hidden sm:inline ml-2"
                        data-cy="okr-settings-add-scoring-button-text"
                      >
                        Add Scoring
                      </span>
                    </Button>
                  </AccessGuard>
                )}
                {activeTab === 'target-assignment' && (
                  <AccessGuard
                    permissions={[Permissions.AssignVpTargets]}
                    data-cy="okr-settings-add-assignment-button-access-guard"
                  >
                    <Button
                      icon={<FaPlus />}
                      onClick={handleAddScoring}
                      className="bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] h-[40px] px-3 sm:px-6 text-white border-none mb-3 rounded-lg flex items-center justify-center font-medium"
                      type="primary"
                      id="okr-settings-add-assignment-button"
                      data-cy="okr-settings-add-assignment-button"
                    >
                      <span
                        className="hidden sm:inline ml-2"
                        data-cy="okr-settings-add-assignment-button-text"
                      >
                        Assignment
                      </span>
                    </Button>
                  </AccessGuard>
                )}
                {activeTab === 'okr-rules' && (
                  <AccessGuard
                    permissions={[Permissions.CreateOkrRule]}
                    data-cy="okr-settings-add-rule-button-access-guard"
                  >
                    <Button
                      icon={<FaPlus />}
                      onClick={handleAddRule}
                      className="bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] h-[40px] px-3 sm:px-6 text-white border-none mb-3 rounded-lg flex items-center justify-center font-medium"
                      type="primary"
                      id="okr-settings-add-rule-button"
                      data-cy="okr-settings-add-rule-button"
                    >
                      <span
                        className="hidden sm:inline ml-2"
                        data-cy="okr-settings-add-rule-button-text"
                      >
                        Add Rule
                      </span>
                    </Button>
                  </AccessGuard>
                )}
              </div>
            </div>
          </div>
        )}

        <style jsx data-cy="okr-settings-tabs-style">{`
          .custom-tabs-scroll::-webkit-scrollbar {
            display: none;
          }
          .custom-tabs-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        {/* Content Area */}
        <div
          className="w-full"
          id="okr-settings-layout-children-wrapper-display-div"
          data-cy="okr-settings-layout-children-wrapper-display-div"
        >
          {isTabLoading ? (
            <TabContentSkeleton activeTab={activeTab} />
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default OkrSettingsLayout;
