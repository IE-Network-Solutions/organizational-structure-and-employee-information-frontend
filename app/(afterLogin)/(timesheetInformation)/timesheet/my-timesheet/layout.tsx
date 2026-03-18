'use client';

import { FC, ReactNode, useEffect } from 'react';
import { Tabs, Breadcrumb, Button } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import type { TabsProps } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import { useGetAllowedAreas } from '@/store/server/features/timesheet/allowedArea/queries';
import { useGetBreakTypes } from '@/store/server/features/timesheet/breakType/queries';
import ViewAttendanceSidebar from './_components/viewAttendanceSidebar';
import CheckOutSidebar from './_components/checkOutSidebar';
import LeaveRequestSidebar from './_components/leaveRequestSidebar';
import LeaveRequestDetail from './_components/leaveRequestDetail';
import { useIsMobile } from '@/hooks/useIsMobile';

const MY_TIMESHEET_BASE = '/timesheet/my-timesheet';

interface MyTimesheetLayoutProps {
  children: ReactNode;
}

const MyTimesheetLayout: FC<MyTimesheetLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const {
    setLeaveTypes,
    setAllowedAreas,
    setBreakTypes,
    setIsShowLeaveRequestSidebar,
  } = useMyTimesheetStore();

  const { data: leaveTypesData } = useGetLeaveTypes();
  const { data: allowAreasData } = useGetAllowedAreas();
  const { data: breakTypeData } = useGetBreakTypes();

  useEffect(() => {
    setLeaveTypes(leaveTypesData?.items ?? []);
  }, [leaveTypesData, setLeaveTypes]);

  useEffect(() => {
    setAllowedAreas(allowAreasData?.items ?? []);
  }, [allowAreasData, setAllowedAreas]);

  useEffect(() => {
    setBreakTypes(breakTypeData?.items ?? []);
  }, [breakTypeData, setBreakTypes]);

  const getActiveKey = (): string => {
    if (pathname.includes('/overview')) return 'overview';
    if (pathname.includes('/attendance')) return 'attendance';
    if (pathname.includes('/leave')) return 'leave';
    if (pathname.includes('/my-approvals')) return 'my-approvals';
    return 'overview';
  };

  const handleTabChange = (key: string) => {
    switch (key) {
      case 'overview':
        router.push(`${MY_TIMESHEET_BASE}/overview`);
        break;
      case 'attendance':
        router.push(`${MY_TIMESHEET_BASE}/attendance`);
        break;
      case 'leave':
        router.push(`${MY_TIMESHEET_BASE}/leave`);
        break;
      case 'my-approvals':
        router.push(`${MY_TIMESHEET_BASE}/my-approvals`);
        break;
      default:
        router.push(`${MY_TIMESHEET_BASE}/overview`);
    }
  };

  const activeKey = getActiveKey();

  const tabItems: TabsProps['items'] = [
    {
      key: 'overview',
      label: (
        <div
          className={`text-base m-0 ${activeKey === 'overview' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="my-timesheet-overview-tab-label"
          id="my-timesheet-overview-tab-label"
        >
          Overview
        </div>
      ),
    },
    {
      key: 'attendance',
      label: (
        <div
          className={`text-base m-0 ${activeKey === 'attendance' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="my-timesheet-attendance-tab-label"
          id="my-timesheet-attendance-tab-label"
        >
          Attendance
        </div>
      ),
    },
    {
      key: 'leave',
      label: (
        <div
          className={`text-base m-0 ${activeKey === 'leave' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="my-timesheet-leave-tab-label"
          id="my-timesheet-leave-tab-label"
        >
          Leave
        </div>
      ),
    },
    {
      key: 'my-approvals',
      label: (
        <div
          className={`text-base m-0 ${activeKey === 'my-approvals' ? 'text-primary font-semibold' : 'text-gray-800'}`}
          data-cy="my-timesheet-my-approvals-tab-label"
          id="my-timesheet-my-approvals-tab-label"
        >
          My Approvals
        </div>
      ),
    },
  ];

  return (
    <div
      id="time-attendance-my-timesheet-layout"
      data-cy="time-attendance-my-timesheet-layout"
      className="min-h-screen bg-[#f5f5f5]"
    >
      <div
        className="min-h-screen bg-white mr-0 sm:mr-6"
        data-cy="time-attendance-my-timesheet-layout-inner"
        id="time-attendance-my-timesheet-layout-inner"
      >
        <div
          className="px-4 pt-4 pb-4 border-b border-gray-200"
          data-cy="time-attendance-my-timesheet-header-container"
          id="time-attendance-my-timesheet-header-container"
        >
          <div
            className="flex flex-wrap items-start justify-between gap-3"
            data-cy="time-attendance-my-timesheet-header-actions"
          >
            <div data-cy="time-attendance-my-timesheet-header-title-area">
              <h3
                className="text-gray-900 text-xl sm:text-2xl font-bold mb-0"
                data-cy="time-attendance-my-timesheet-page-title"
                id="time-attendance-my-timesheet-page-title"
              >
                My Timesheet
              </h3>
              <Breadcrumb
                className="mt-2 mb-0"
                items={[
                  {
                    title: (
                      <a
                        href="/timesheet"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push('/timesheet');
                        }}
                        data-cy="time-attendance-my-timesheet-breadcrumb-timesheet-link"
                      >
                        Time and Attendance
                      </a>
                    ),
                  },
                  {
                    title: 'My Timesheet',
                  },
                ]}
                data-cy="time-attendance-my-timesheet-breadcrumb"
               
              />
            </div>
            {activeKey === 'leave' && isMobile && (
              <AccessGuard permissions={[Permissions.SubmitLeaveRequest]}>
                <Button
                  type="primary"
                  size="large"
                  icon={<FaPlus />}
                  onClick={() => setIsShowLeaveRequestSidebar(true)}
                  className="shrink-0 h-10"
                  
                  data-cy="time-attendance-my-timesheet-new-request-button"
                >
                  New Request
                </Button>
              </AccessGuard>
            )}
          </div>
        </div>

        <div
          className="bg-white mb-4"
          data-cy="time-attendance-my-timesheet-tabs-container"
          id="time-attendance-my-timesheet-tabs-container"
        >
          <div
            className="px-4 pr-4 sm:pr-6"
            data-cy="time-attendance-my-timesheet-tabs-wrapper"
          >
            <Tabs
              activeKey={activeKey}
              onChange={handleTabChange}
              items={tabItems}
              tabBarStyle={{
                marginBottom: 0,
                marginLeft: 0,
                paddingLeft: 0,
                paddingRight: 0,
              }}
              className="[&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab-btn]:py-2 [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-wrap]:!px-0 [&_.ant-tabs-nav-list]:!px-0 [&_.ant-tabs-nav-wrap]:before:!left-0 [&_.ant-tabs-nav-wrap]:after:!right-0"
              data-cy="time-attendance-my-timesheet-tabs"
              id="time-attendance-my-timesheet-tabs"
            />
          </div>
        </div>

        <div
          className="px-4 pr-4 sm:pr-4 pb-6"
          data-cy="time-attendance-my-timesheet-content-wrapper"
          id="time-attendance-my-timesheet-content-wrapper"
        >
          {children}
        </div>
      </div>

      <ViewAttendanceSidebar data-cy="time-attendance-my-timesheet-view-attendance-sidebar" />
      <LeaveRequestSidebar data-cy="time-attendance-my-timesheet-leave-request-sidebar" />
      <LeaveRequestDetail data-cy="time-attendance-my-timesheet-leave-request-detail" />
      <CheckOutSidebar data-cy="time-attendance-my-timesheet-check-out-sidebar" />
    </div>
  );
};

export default MyTimesheetLayout;
