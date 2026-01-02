'use client';
import React, { useEffect } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import HistoryTable from './_components/historyTable';
import AttendanceTable from './_components/attendanceTable';
import LeaveBalance from './_components/leaveBalance';
import ViewAttendanceSidebar from './_components/viewAttendanceSidebar';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import CheckOutSidebar from './_components/checkOutSidebar';
import CheckControl from './_components/checkControls/index';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import { useGetAllowedAreas } from '@/store/server/features/timesheet/allowedArea/queries';
import LeaveRequestSidebar from './_components/leaveRequestSidebar';
import { useGetBreakTypes } from '@/store/server/features/timesheet/breakType/queries';
import ApprovalTable from './_components/approvalTable';
import LeaveRequestDetail from './_components/leaveRequestDetail';
import { useIsMobile } from '@/hooks/useIsMobile';

const MyTimesheet = () => {
  const { setLeaveTypes, setAllowedAreas, setBreakTypes } =
    useMyTimesheetStore();
  const { data: leaveTypesData } = useGetLeaveTypes();
  const { data: allowAreasData } = useGetAllowedAreas();
  const { data: breakTypeData } = useGetBreakTypes();

  useEffect(() => {
    setLeaveTypes(leaveTypesData?.items ?? []);
  }, [leaveTypesData]);

  useEffect(() => {
    setAllowedAreas(allowAreasData?.items ?? []);
  }, [allowAreasData]);

  useEffect(() => {
    setBreakTypes(breakTypeData?.items ?? []);
  }, [breakTypeData]);

  const { isMobile } = useIsMobile();
  return (
    <div
      id="time-attendance-my-timesheet-page-container"
      data-cy="time-attendance-my-timesheet-page-container"
      className="bg-[#f5f5f5]"
    >
      <div
        id="time-attendance-my-timesheet-page-header-container"
        data-cy="time-attendance-my-timesheet-page-header-container"
        // className={`${isMobile ? 'h-auto' : 'h-full w-auto pr-0 pb-6 pl-3'} `}
      >
        <PageHeader
          data-cy="time-attendance-my-timesheet-page-header-component"
          title="My Attendance"
          description="Manage your Attendance"
        >
          <CheckControl data-cy="time-attendance-my-timesheet-page-check-control-component" />
        </PageHeader>
        <BlockWrapper
          data-cy="time-attendance-my-timesheet-page-approval-table-block-wrapper"
          className="mt-[20px]"
        >
          <ApprovalTable data-cy="time-attendance-my-timesheet-page-approval-table-component" />
        </BlockWrapper>

        <div
          id="time-attendance-my-timesheet-page-leave-balance-container"
          data-cy="time-attendance-my-timesheet-page-leave-balance-container"
          className={`${isMobile ? 'mt-2' : 'mt-4'}`}
        >
          <LeaveBalance data-cy="time-attendance-my-timesheet-page-leave-balance-component" />
        </div>

        <BlockWrapper
          data-cy="time-attendance-my-timesheet-page-history-table-block-wrapper"
          padding="p-2"
          className="mt-[30px]"
        >
          <HistoryTable data-cy="time-attendance-my-timesheet-page-history-table-component" />
        </BlockWrapper>

        <BlockWrapper
          data-cy="time-attendance-my-timesheet-page-attendance-table-block-wrapper"
          className="mt-6"
        >
          <AttendanceTable data-cy="time-attendance-my-timesheet-page-attendance-table-component" />
        </BlockWrapper>
      </div>

      <ViewAttendanceSidebar data-cy="time-attendance-my-timesheet-page-view-attendance-sidebar-component" />
      <LeaveRequestSidebar data-cy="time-attendance-my-timesheet-page-leave-request-sidebar-component" />
      <LeaveRequestDetail data-cy="time-attendance-my-timesheet-page-leave-request-detail-component" />
      <CheckOutSidebar data-cy="time-attendance-my-timesheet-page-check-out-sidebar-component" />
    </div>
  );
};

export default MyTimesheet;
