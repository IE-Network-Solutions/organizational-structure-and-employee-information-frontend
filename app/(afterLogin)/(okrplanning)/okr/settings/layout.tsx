'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from 'antd';
import { FaPlus } from 'react-icons/fa';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { usePlanningAssignationStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/planning-assignation-drawer';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import { useOkrRuleStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/okr-rule';
import { useAverageOkrRuleAssignmentStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/average-okr-rule-assignment';
import { useOKRSettingStore } from '@/store/uistate/features/okrplanning/okrSetting';
import CustomBreadcrumb from '@/components/common/breadCramp';
import Link from 'next/link';
import { useBscUiStore } from '@/store/uistate/features/bsc';

interface OkrSettingsLayoutProps {
  children: React.ReactNode;
}

const OkrSettingsLayout: React.FC<OkrSettingsLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('okr-type');
  const [pendingTabPath, setPendingTabPath] = useState<string | null>(null);
  const { setOpen: setPlanningOpen } = usePlanningAssignationStore();
  const { openDrawer: setCriteriaOpen } = useDrawerStore();
  const { setOpen: setOkrRuleOpen } = useOkrRuleStore();
  const {
    setOpen: setAverageOkrRuleAssignmentOpen,
    setAssignment: setAverageOkrRuleAssignment,
  } = useAverageOkrRuleAssignmentStore();
  const { showNotReportedList } = useOKRSettingStore();
  const { openCreateSetup } = useBscUiStore();

  const isPlanningAssignation = activeTab === 'planning-assignation';
  const isCriteriaManagement = activeTab === 'criteria-management';
  const isAverageOkrRuleAssignment = activeTab === 'okr-rule-assignment';
  const isBscSetup = activeTab === 'bsc-setup';
  const isBscRoleDetail = pathname.includes('/bsc-setup/role/');

  const handleAddAssignee = () => {
    setPlanningOpen(true);
  };

  const handleAddScoring = () => {
    setCriteriaOpen();
  };

  const handleAddRule = () => {
    setOkrRuleOpen(true);
  };

  const handleAddAssignment = () => {
    setAverageOkrRuleAssignment(null);
    setAverageOkrRuleAssignmentOpen(true);
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
    {
      key: 'okr-rule-assignment',
      label: 'OKR rule assignment',
      path: '/okr/settings/assign-average-okr-rule',
    },
    {
      key: 'bsc-setup',
      label: 'BSC Setup',
      path: '/okr/settings/bsc-setup',
    },
  ];

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
      'assign-average-okr-rule': 'okr-rule-assignment',
      'bsc-setup': 'bsc-setup',
      'bsc-kpi-library': 'bsc-setup',
      'bsc-cycles': 'bsc-setup',
    };

    if (pathname.includes('/okr/settings/bsc-setup')) {
      setActiveTab('bsc-setup');
    } else if (tabMap[lastKey]) {
      setActiveTab(tabMap[lastKey]);
    }

    if (pendingTabPath && pathname === pendingTabPath) {
      setPendingTabPath(null);
    }
  }, [pathname, pendingTabPath]);

  const handleTabClick = (path: string, key: string) => {
    if (pathname === path) return;
    setActiveTab(key);
    setPendingTabPath(path);
    router.push(path);
  };

  return (
    <div
      className="min-h-screen bg-white"
      id="okr-settings-layout-container-display-div"
      data-cy="okr-settings-layout-container-display-div"
    >
      <div
        className="w-full h-auto bg-white"
        id="okr-settings-layout-wrapper-display-div"
        data-cy="okr-settings-layout-wrapper-display-div"
      >
        {/* Header Section */}
        {!showNotReportedList && (
          <div className="mb-4" data-cy="okr-settings-header-section">
            <CustomBreadcrumb
              title={
                <span
                  id="okr-settings-header-title"
                  data-cy="okr-settings-header-title"
                >
                  Setting
                </span>
              }
              subtitle={
                <div
                  className="flex items-center gap-2 mt-1"
                  data-cy="okr-settings-breadcrumb-subtitle-row"
                >
                  <Link
                    className=" !text-gray-400"
                    data-cy="weekly-priority-breadcrumb-okr"
                    href="/okr"
                  >
                    OKR
                  </Link>
                  <span data-cy="weekly-priority-breadcrumb-separator">/</span>
                  <span
                    className=" !text-gray-800"
                    data-cy="weekly-priority-breadcrumb-current"
                  >
                    Settings
                  </span>
                </div>
              }
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
                {isAverageOkrRuleAssignment && (
                  <Button
                    icon={<FaPlus />}
                    onClick={handleAddAssignment}
                    className="bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] h-[40px] px-3 sm:px-6 text-white border-none mb-3 rounded-lg flex items-center justify-center font-medium"
                    type="primary"
                    id="okr-settings-add-average-okr-rule-assignment-button"
                    data-cy="okr-settings-add-average-okr-rule-assignment-button"
                  >
                    <span
                      className="hidden sm:inline ml-2"
                      data-cy="okr-settings-add-average-okr-rule-assignment-button-text"
                    >
                      Add Assignment
                    </span>
                  </Button>
                )}
                {isBscSetup && !isBscRoleDetail && (
                  <Button
                    icon={<FaPlus />}
                    onClick={openCreateSetup}
                    className="bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] h-[40px] px-3 sm:px-6 text-white border-none mb-3 rounded-lg flex items-center justify-center font-medium"
                    type="primary"
                    id="okr-settings-add-bsc-setup-button"
                    data-cy="bsc-setup-add"
                  >
                    <span className="hidden sm:inline ml-2">Add Setup</span>
                  </Button>
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
          {children}
        </div>
      </div>
    </div>
  );
};

export default OkrSettingsLayout;
