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

function TabContentSkeleton() {
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
      item: {
        key: 'planning-assignation',
        icon: !isMobile ? (
          <TbLayoutList
            data-cy="okr-settings-layout-planning-assignation-icon-display-icon"
            className={
              currentItem === 'planning-assignation'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p
            className="font-bold text-sm text-gray-900"
            data-cy="okr-settings-layout-planning-assignation-label-display-label"
          >
            Planning Assignation
          </p>
        ),
        className: currentItem === 'planning-assignation' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/planning-assignation',
    },
    {
      item: {
        key: 'define-okr-rule',
        icon: !isMobile ? (
          <TbTargetArrow
            data-cy="okr-settings-layout-define-okr-rule-icon-display-icon"
            className={
              currentItem === 'define-okr-rule'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p
            className="font-bold text-sm text-gray-900"
            data-cy="okr-settings-layout-define-okr-rule-label-display-label"
          >
            Define OKR Rule
          </p>
        ),
        className: currentItem === 'define-okr-rule' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/define-okr-rule',
    },
    {
      item: {
        key: 'criteria-management',
        icon: !isMobile ? (
          <TbTarget
            data-cy="okr-settings-layout-criteria-management-icon-display-icon"
            className={
              currentItem === 'criteria-management'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p
            className="font-bold text-sm text-gray-900"
            data-cy="okr-settings-layout-criteria-management-label-display-label"
          >
            Criteria Management
          </p>
        ),
        className: currentItem === 'criteria-management' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/criteria-management',
    },

    {
      item: {
        key: 'target-assignment',
        icon: !isMobile ? (
          <HiOutlineBriefcase
            className={
              currentItem === 'target-assignment'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p
            className="font-bold text-sm text-gray-900"
            data-cy="okr-settings-layout-target-assignment-label"
          >
            Target Assignment
          </p>
        ),
        className: currentItem === 'target-assignment' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/target-assignment',
    },
    {
      item: {
        key: 'target-assignment',
        icon: !isMobile ? (
          <HiOutlineBriefcase
            data-cy="okr-settings-layout-target-assignment-icon-display-icon"
            className={
              currentItem === 'target-assignment'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p
            className="font-bold text-sm text-gray-900"
            data-cy="okr-settings-layout-target-assignment-label-display-label"
          >
            Target Assignment
          </p>
        ),
        className: currentItem === 'target-assignment' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/target-assignment',
    },
    {
      item: {
        key: 'define-appreciation',
        icon: !isMobile ? (
          <TbAward
            data-cy="okr-settings-layout-define-appreciation-icon-display-icon"
            className={
              currentItem === 'define-appreciation'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p
            className="font-bold text-sm text-gray-900"
            data-cy="okr-settings-layout-define-appreciation-label-display-label"
          >
            Define Appreciation
          </p>
        ),
        className: currentItem === 'define-appreciation' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/define-appreciation',
    },
    {
      item: {
        key: 'define-reprimand',
        icon: !isMobile ? (
          <TbShieldCheck
            data-cy="okr-settings-layout-define-reprimand-icon-display-icon"
            className={
              currentItem === 'define-reprimand'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p
            className="font-bold text-sm text-gray-900"
            data-cy="okr-settings-layout-define-reprimand-label-display-label"
          >
            Define Reprimand
          </p>
        ),
        className: currentItem === 'define-reprimand' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/define-reprimand',
    },
    {
      item: {
        key: 'edit-access',
        icon: !isMobile ? (
          <TbEdit
            data-cy="okr-settings-layout-edit-access-icon-display-icon"
            className={
              currentItem === 'edit-access' ? 'text-[#4DAEF0]' : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p
            className="font-bold text-sm text-gray-900"
            data-cy="okr-settings-layout-edit-access-label-display-label"
          >
            Edit Access
          </p>
        ),
        className: currentItem === 'edit-access' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/edit-access',
    },
    {
      item: {
        key: 'okr-type',
        icon: !isMobile ? (
          <TbTarget
            data-cy="okr-settings-layout-okr-type-icon-display-icon"
            className={
              currentItem === 'okr-type' ? 'text-[#4DAEF0]' : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p
            className="font-bold text-sm text-gray-900"
            data-cy="okr-settings-layout-okr-type-label-display-label"
          >
            OKR Type
          </p>
        ),
        className: currentItem === 'okr-type' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/okr-type',
    },
    {
      item: {
        key: 'check-in-rule',
        icon: !isMobile ? (
          <BiCheckDouble
            data-cy="okr-settings-layout-check-in-rule-icon-display-icon"
            className={
              currentItem === 'check-in-rule'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p
            className="font-bold text-sm text-gray-900"
            data-cy="okr-settings-layout-check-in-rule-label-display-label"
          >
            Check-in Rule
          </p>
        ),
        className: currentItem === 'check-in-rule' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/check-in-rule',
    },
  ]);

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastKey = pathSegments[pathSegments.length - 1];

    // Map pathname to tab key
    const tabMap: Record<string, string> = {
      'okr-type': 'okr-type',
      'planning-assignation': 'planning-assignation',
      'criteria-management': 'criteria-management',
      'target-assignment': 'target-assignment',
      'define-okr-rule': 'okr-rules',
    };

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
      className="min-h-screen bg-[#fafafa] p-3"
      id="okr-settings-layout-container-display-div"
      data-cy="okr-settings-layout-container-display-div"
    >
      <div
        className=" w-full h-auto"
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
                className="flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide pr-4 custom-tabs-scroll"
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
                className="flex-shrink-0 ml-2"
                data-cy="okr-settings-tab-actions"
              >
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
          {isTabLoading ? <TabContentSkeleton /> : children}
        </div>
      </div>
    </div>
  );
};

export default OkrSettingsLayout;
