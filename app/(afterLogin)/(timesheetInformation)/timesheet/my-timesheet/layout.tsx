'use client';

import { FC, ReactNode, useEffect, useMemo } from 'react';
import { Tabs, Breadcrumb, Button } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
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
import WorkFromHomeRequestSidebar from './_components/workFromHomeRequestSidebar';
import { useIsMobile } from '@/hooks/useIsMobile';
import RemoteAttendanceCameraModals from '@/components/common/remoteAttendanceCameraModals';

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

  const breadcrumbItems = useMemo(() => {
    const items: { title: ReactNode }[] = [
      {
        title: (
          <Link
            href="/timesheet"
            data-cy="time-attendance-my-timesheet-breadcrumb-timesheet-link"
          >
            Time and Attendance
          </Link>
        ),
      },
      {
        title: (
          <Link
            href={`${MY_TIMESHEET_BASE}/overview`}
            data-cy="time-attendance-my-timesheet-breadcrumb-my-timesheet-link"
          >
            My Timesheet
          </Link>
        ),
      },
    ];
    if (pathname.includes('/work-from-home')) {
      items.push({
        title: (
          <span data-cy="time-attendance-my-timesheet-breadcrumb-work-from-home">
            Work From Home
          </span>
        ),
      });
    }
    return items;
  }, [pathname]);

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
        className="min-h-screen bg-white"
        data-cy="time-attendance-my-timesheet-layout-inner"
        id="time-attendance-my-timesheet-layout-inner"
      >
        <div
          data-cy="time-attendance-my-timesheet-header-container"
          id="time-attendance-my-timesheet-header-container"
        >
          <div data-cy="time-attendance-my-timesheet-header-actions">
            <div data-cy="time-attendance-my-timesheet-header-title-area">
              <CustomBreadcrumb
                title={
                  <span
                    data-cy="time-attendance-my-timesheet-page-title"
                    id="time-attendance-my-timesheet-page-title"
                  >
                    My Timesheet
                  </span>
                }
                subtitle={
                  <Breadcrumb
                    className="mt-2 mb-0"
                    items={breadcrumbItems}
                    data-cy="time-attendance-my-timesheet-breadcrumb"
                  />
                }
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

        {!pathname.includes('/work-from-home') && (
          <div
            className="bg-white mb-4"
            data-cy="time-attendance-my-timesheet-tabs-container"
            id="time-attendance-my-timesheet-tabs-container"
          >
            <div
              className="px-0"
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
        )}

        <div
          className="px-0 pb-6"
          data-cy="time-attendance-my-timesheet-content-wrapper"
          id="time-attendance-my-timesheet-content-wrapper"
        >
          {children}
        </div>
      </div>

      <ViewAttendanceSidebar data-cy="time-attendance-my-timesheet-view-attendance-sidebar" />
      <LeaveRequestSidebar data-cy="time-attendance-my-timesheet-leave-request-sidebar" />
      <WorkFromHomeRequestSidebar data-cy="time-attendance-my-timesheet-work-from-home-request-sidebar" />
      <LeaveRequestDetail data-cy="time-attendance-my-timesheet-leave-request-detail" />
      <CheckOutSidebar data-cy="time-attendance-my-timesheet-check-out-sidebar" />
      <RemoteAttendanceCameraModals />
    </div>
  );
};

export default MyTimesheetLayout;
