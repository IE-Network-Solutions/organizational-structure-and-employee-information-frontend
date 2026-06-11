'use client';
import { FC, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { Breadcrumb, Button, Tabs, TabsProps } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';
import { FaPlus } from 'react-icons/fa';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import AddIcon from '@mui/icons-material/Add';
import { useGetAttendanceNotificationTypes } from '@/store/server/features/timesheet/attendanceNotificationType/queries';
import { useApprovalStore } from '@/store/uistate/features/approval';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';

interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const TimesheetSettingsLayout: FC<TimesheetSettingsLayoutProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const { openDrawer } = useScheduleStore();

  const {
    setIsShowClosedDateSidebar,
    setSelectedClosedDate,
    setIsShowBreakTypeSidebar,
    setIsShowTypeAndPoliciesSidebar,
    setIsShowLocationSidebar,
    setIsShowCreateRuleSidebar,
    setAttendanceNotificationType,
    setIsShowNewAccrualRuleSidebar,
    setIsShowCarryOverRuleSidebar,
  } = useTimesheetSettingsStore();

  const { setOpenModal } = useApprovalStore();

  const getActiveKey = () => {
    if (pathname.includes('/closed-date')) return 'closed-date';
    if (pathname.includes('/break-type')) return 'break-type';
    if (pathname.includes('/leave-types-and-policies'))
      return 'leave-types-and-policies';
    if (pathname.includes('/allowed-areas')) return 'allowed-areas';
    if (pathname.includes('/attendance-rules')) return 'attendance-rules';
    // if (pathname.includes('/imported-logs')) return 'imported-logs';
    if (pathname.includes('/accrual-rule')) return 'accrual-rule';
    if (pathname.includes('/carry-over-rule')) return 'carry-over-rule';
    if (pathname.includes('/approvals')) return 'approvals';
    if (pathname.includes('/time-zone')) return 'time-zone';
    if (pathname.includes('/workSchedule')) return 'workSchedule';
    if (pathname.includes('/zkt-addon')) return 'zkt-addon';
    return 'closed-date';
  };

  const activeKey = getActiveKey();

  const handleTabChange = (key: string) => {
    switch (key) {
      case 'closed-date':
        router.push('/timesheet/settings/closed-date');
        break;
      case 'break-type':
        router.push('/timesheet/settings/break-type');
        break;
      case 'leave-types-and-policies':
        router.push('/timesheet/settings/leave-types-and-policies');
        break;
      case 'allowed-areas':
        router.push('/timesheet/settings/allowed-areas');
        break;
      case 'attendance-rules':
        router.push('/timesheet/settings/attendance-rules');
        break;
      case 'imported-logs':
        router.push('/timesheet/settings/imported-logs');
        break;
      case 'accrual-rule':
        router.push('/timesheet/settings/accrual-rule');
        break;
      case 'carry-over-rule':
        router.push('/timesheet/settings/carry-over-rule');
        break;
      case 'approvals':
        router.push('/timesheet/settings/approvals');
        break;
      case 'time-zone':
        router.push('/timesheet/settings/time-zone');
        break;
      case 'workSchedule':
        router.push('/timesheet/settings/workSchedule');
        break;
      case 'zkt-addon':
        router.push('/timesheet/settings/zkt-addon');
        break;
      default:
        router.push('/timesheet/settings/closed-date');
    }
  };
  const { data: attendanceTypeData } = useGetAttendanceNotificationTypes();

  useEffect(() => {
    setAttendanceNotificationType(attendanceTypeData?.items ?? []);
  }, [attendanceTypeData]);

  const items: TabsProps['items'] = [
    {
      key: 'closed-date',
      label: (
        <div
          className={`text-base font-normal m-0 ${activeKey === 'closed-date' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="time-attendance-settings-closed-date-tab-label"
          id="time-attendance-settings-closed-date-tab-label"
        >
          Closed Date
        </div>
      ),
    },
    {
      key: 'break-type',
      label: (
        <div
          className={`text-base font-normal m-0 ${activeKey === 'break-type' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="time-attendance-settings-break-type-tab-label"
          id="time-attendance-settings-break-type-tab-label"
        >
          Break Type
        </div>
      ),
    },
    {
      key: 'leave-types-and-policies',
      label: (
        <div
          className={`text-base font-normal m-0 ${activeKey === 'leave-types-and-policies' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="time-attendance-settings-leave-types-and-policies-tab-label"
          id="time-attendance-settings-leave-types-and-policies-tab-label"
        >
          Leave Types & Policies
        </div>
      ),
    },
    {
      key: 'allowed-areas',
      label: (
        <div
          className={`text-base font-normal m-0 ${activeKey === 'allowed-areas' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="time-attendance-settings-allowed-areas-tab-label"
          id="time-attendance-settings-allowed-areas-tab-label"
        >
          Allowed Areas
        </div>
      ),
    },
    {
      key: 'attendance-rules',
      label: (
        <div
          className={`text-base font-normal m-0 ${activeKey === 'attendance-rules' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="time-attendance-settings-attendance-rules-tab-label"
          id="time-attendance-settings-attendance-rules-tab-label"
        >
          Attendance Rules
        </div>
      ),
    },
    // {
    //   key: 'imported-logs',
    //   label: (
    //     <div
    //       className={`text-base font-normal m-0 ${activeKey === 'imported-logs' ? 'text-primary' : 'text-gray-800'}`}
    //       data-cy="time-attendance-settings-imported-logs-tab-label"
    //       id="time-attendance-settings-imported-logs-tab-label"
    //     >
    //       Imported Logs
    //     </div>
    //   ),
    // },
    {
      key: 'accrual-rule',
      label: (
        <div
          className={`text-base font-normal m-0 ${activeKey === 'accrual-rule' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="time-attendance-settings-accrual-rule-tab-label"
          id="time-attendance-settings-accrual-rule-tab-label"
        >
          Accrual Rule
        </div>
      ),
    },
    {
      key: 'carry-over-rule',
      label: (
        <div
          className={`text-base font-normal m-0 ${activeKey === 'carry-over-rule' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="time-attendance-settings-carry-over-rule-tab-label"
          id="time-attendance-settings-carry-over-rule-tab-label"
        >
          Carry-over Rule
        </div>
      ),
    },
    {
      key: 'approvals',
      label: (
        <div
          className={`text-base font-normal m-0 ${activeKey === 'approvals' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="time-attendance-settings-approvals-tab-label"
          id="time-attendance-settings-approvals-tab-label"
        >
          Approval Workflow
        </div>
      ),
    },
    {
      key: 'time-zone',
      label: (
        <div
          className={`text-base font-normal m-0 ${activeKey === 'time-zone' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="time-attendance-settings-time-zone-tab-label"
          id="time-attendance-settings-time-zone-tab-label"
        >
          Time Zone
        </div>
      ),
    },
    {
      key: 'workSchedule',
      label: (
        <div
          className={`text-base font-normal m-0 ${activeKey === 'workSchedule' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="time-attendance-settings-workschedule-tab-label"
          id="time-attendance-settings-workschedule-tab-label"
        >
          Work Schedule
        </div>
      ),
    },
    {
      key: 'zkt-addon',
      label: (
        <div
          className={`text-base font-normal m-0 ${activeKey === 'zkt-addon' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="time-attendance-settings-zkt-addon-tab-label"
          id="time-attendance-settings-zkt-addon-tab-label"
        >
          ZKT addon
        </div>
      ),
    },
  ];

  return (
    <div
      className=""
      id="time-attendance-settings-layout-wrapper"
      data-cy="time-attendance-settings-layout-wrapper"
    >
      <div data-cy="time-attendance-settings-header-container">
        <div
          id="time-attendance-settings-page-header-container"
          data-cy="time-attendance-settings-page-header-container"
        >
          <CustomBreadcrumb
            title={
              <span
                data-cy="time-attendance-settings-page-header-title"
                id="time-attendance-settings-page-header-title"
              >
                Settings
              </span>
            }
            subtitle={
              <Breadcrumb
                className="mt-2 mb-4"
                items={[
                  {
                    title: (
                      <Link
                        href="/timesheet/settings/closed-date"
                        data-cy="time-attendance-settings-breadcrumb-timesheet-link"
                      >
                        Timesheet
                      </Link>
                    ),
                  },
                  {
                    title: 'Settings',
                  },
                ]}
                data-cy="time-attendance-settings-breadcrumb"
              />
            }
          />
        </div>
      </div>

      <div
        className=""
        id="time-attendance-settings-layout-content"
        data-cy="time-attendance-settings-layout-content"
      >
        <div
          className="bg-white mb-4"
          data-cy="time-attendance-settings-tabs-container"
          id="time-attendance-settings-tabs-container"
        >
          <div data-cy="time-attendance-settings-tabs-wrapper">
            <Tabs
              activeKey={activeKey}
              onChange={handleTabChange}
              items={items}
              moreIcon={false}
              tabBarStyle={{
                marginBottom: 0,
                marginLeft: 0,
                paddingLeft: 0,
                paddingRight: 0,
              }}
              tabBarExtraContent={
                activeKey === 'closed-date' ? (
                  <AccessGuard
                    permissions={[Permissions.CreateClosedDate]}
                    data-cy="time-attendance-settings-closed-date-add-button-access-guard"
                  >
                    <Button
                      className="h-10 text-base font-normal"
                      icon={
                        <AddIcon
                          data-cy="time-attendance-settings-branches-add-btn-icon"
                          id="time-attendance-settings-branches-add-btn-icon"
                        />
                      }
                      type="primary"
                      onClick={() => {
                        setSelectedClosedDate(null);
                        setIsShowClosedDateSidebar(true);
                      }}
                      data-cy="time-attendance-settings-branches-add-btn"
                      id="time-attendance-settings-branches-add-btn"
                    >
                      {!isMobile && 'Add Closed Date'}
                    </Button>
                  </AccessGuard>
                ) : activeKey === 'break-type' ? (
                  <AccessGuard
                    permissions={[Permissions.CreateBreakType]}
                    data-cy="time-attendance-settings-break-type-add-button-access-guard"
                  >
                    <Button
                      className="h-10 text-base font-normal"
                      icon={
                        <AddIcon
                          data-cy="time-attendance-settings-break-type-create-btn-icon"
                          id="time-attendance-settings-break-type-create-btn-icon"
                        />
                      }
                      type="primary"
                      onClick={() => {
                        setIsShowBreakTypeSidebar(true);
                      }}
                      data-cy="time-attendance-settings-break-type-create-btn"
                      id="time-attendance-settings-break-type-create-btn"
                    >
                      {!isMobile && 'Add Break Type'}
                    </Button>
                  </AccessGuard>
                ) : activeKey === 'leave-types-and-policies' ? (
                  <AccessGuard
                    permissions={[Permissions.CreateLeaveType]}
                    data-cy="time-attendance-settings-leave-types-and-policies-add-button-access-guard"
                  >
                    <Button
                      type="primary"
                      icon={
                        <AddIcon data-cy="time-attendance-settings-leave-types-and-policies-add-button-icon" />
                      }
                      id={`createNewTypesAndPoliciesButtonId`}
                      data-cy="time-attendance-settings-leave-types-and-policies-add-button-id"
                      onClick={() => setIsShowTypeAndPoliciesSidebar(true)}
                      className="h-10 w-10 sm:w-auto"
                    >
                      <span
                        className="hidden md:inline"
                        id="time-attendance-settings-leave-types-and-policies-add-button-label"
                        data-cy="time-attendance-settings-leave-types-and-policies-add-button-label"
                      >
                        {!isMobile && 'Add Type'}
                      </span>
                    </Button>
                  </AccessGuard>
                ) : activeKey === 'allowed-areas' ? (
                  <AccessGuard
                    permissions={[Permissions.CreateAllowedArea]}
                    data-cy="time-attendance-settings-allowed-areas-add-button-access-guard"
                  >
                    <Button
                      icon={
                        <AddIcon data-cy="time-attendance-settings-allowed-areas-add-button-icon" />
                      }
                      className="h-10 w-10 sm:w-auto"
                      type="primary"
                      id="time-attendance-settings-allowed-areas-add-button"
                      data-cy="time-attendance-settings-allowed-areas-add-button"
                      onClick={() => setIsShowLocationSidebar(true)}
                    >
                      <span
                        id="time-attendance-settings-allowed-areas-add-button-label"
                        data-cy="time-attendance-settings-allowed-areas-add-button-label"
                        className="hidden md:inline"
                      >
                        {!isMobile && 'Add Location'}
                      </span>
                    </Button>
                  </AccessGuard>
                ) : activeKey === 'attendance-rules' ? (
                  <AccessGuard
                    permissions={[Permissions.CreateAttendanceRule]}
                    data-cy="time-attendance-settings-attendance-rules-add-rule-button-access-guard"
                  >
                    <Button
                      id="time-attendance-settings-attendance-rules-add-rule-button"
                      data-cy="time-attendance-settings-attendance-rules-add-rule-button"
                      type="primary"
                      icon={
                        <AddIcon data-cy="time-attendance-settings-attendance-rules-add-rule-button-icon" />
                      }
                      className="h-10 text-base font-normal"
                      onClick={() => setIsShowCreateRuleSidebar(true)}
                    >
                      <span
                        id="time-attendance-settings-attendance-rules-add-rule-button-label"
                        data-cy="time-attendance-settings-attendance-rules-add-rule-button-label"
                        className="hidden md:inline"
                      >
                        {!isMobile && 'Add Rule'}
                      </span>
                    </Button>
                  </AccessGuard>
                ) : activeKey === 'accrual-rule' ? (
                  <AccessGuard
                    permissions={[Permissions.CreateLeaveAccrual]}
                    data-cy="time-attendance-settings-accrual-rule-add-button-access-guard"
                  >
                    <Button
                      size="large"
                      type="primary"
                      id="time-attendance-settings-accrual-rule-add-button"
                      data-cy="time-attendance-settings-accrual-rule-add-button"
                      icon={
                        <AddIcon data-cy="time-attendance-settings-accrual-rule-add-button-icon" />
                      }
                      className="h-10 w-10 sm:w-auto"
                      onClick={() => setIsShowNewAccrualRuleSidebar(true)}
                    >
                      <span
                        id="time-attendance-settings-accrual-rule-add-button-label"
                        data-cy="time-attendance-settings-accrual-rule-add-button-label"
                        className="hidden md:inline"
                      >
                        {!isMobile && 'Add Accrual Rule'}
                      </span>
                    </Button>
                  </AccessGuard>
                ) : activeKey === 'carry-over-rule' ? (
                  <AccessGuard
                    permissions={[Permissions.CreateCarryOverRule]}
                    data-cy="time-attendance-settings-carry-over-rule-add-button-access-guard"
                  >
                    <Button
                      size="large"
                      type="primary"
                      id="carryOver"
                      data-cy="time-attendance-settings-carry-over-rule-add-button-id"
                      icon={
                        <AddIcon data-cy="time-attendance-settings-carry-over-rule-add-button-icon" />
                      }
                      className="h-10 w-10 sm:w-auto"
                      onClick={() => setIsShowCarryOverRuleSidebar(true)}
                    >
                      <span
                        data-cy="timesheet-settings-carry-over-rule-page-tsx-page-span-48"
                        className="hidden md:inline"
                      >
                        {!isMobile && 'Add Carry-over Rule'}
                      </span>
                    </Button>
                  </AccessGuard>
                ) : activeKey === 'approvals' ? (
                  <AccessGuard
                    permissions={[Permissions.CreateApprovalWorkFlow]}
                    data-cy="time-attendance-settings-approvals-add-button-access-guard"
                  >
                    <Button
                      title="Set Approval"
                      id="time-attendance-settings-approvals-add-button"
                      data-cy="time-attendance-settings-approvals-add-button"
                      className="h-10 w-10 sm:w-auto "
                      icon={
                        <FaPlus data-cy="time-attendance-settings-approvals-add-button-icon" />
                      }
                      onClick={() => setOpenModal(true)}
                      type="primary"
                    >
                      <span
                        id="time-attendance-settings-approvals-add-button-label"
                        data-cy="time-attendance-settings-approvals-add-button-label"
                        className="hidden sm:inline"
                      >
                        {!isMobile && 'Set Approval'}
                      </span>
                    </Button>
                  </AccessGuard>
                ) : activeKey === 'workSchedule' ? (
                  <AccessGuard
                    permissions={[Permissions.CreateWorkingSchedule]}
                    data-cy="org-settings-work-schedule-create-btn"
                    id="org-settings-work-schedule-create-btn"
                  >
                    <Button
                      type="primary"
                      className="h-10 w-10 sm:w-auto"
                      icon={
                        <FaPlus
                          data-cy="org-organization-settings-workschedule-page-faplus-1"
                          id="org-organization-settings-workschedule-page-faplus-1"
                        />
                      }
                      onClick={openDrawer}
                      data-cy="org-settings-work-schedule-create-btn"
                      id="org-settings-work-schedule-create-btn"
                    >
                      <span
                        className="hidden lg:inline"
                        data-cy="org-settings-work-schedule-create-btn-text"
                        id="org-settings-work-schedule-create-btn-text"
                      >
                        Create work Schedule
                      </span>
                    </Button>
                  </AccessGuard>
                ) : null
              }
              className="[&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab-btn]:py-2 [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-wrap]:!px-0 [&_.ant-tabs-nav-list]:!px-0 [&_.ant-tabs-nav-wrap]:before:!left-0 [&_.ant-tabs-nav-wrap]:after:!right-0"
              data-cy="time-attendance-settings-tabs"
              id="time-attendance-settings-tabs"
            />
          </div>
        </div>

        <div
          data-cy="timesheet-settings-content-wrapper"
          id="timesheet-settings-content-wrapper"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default TimesheetSettingsLayout;
