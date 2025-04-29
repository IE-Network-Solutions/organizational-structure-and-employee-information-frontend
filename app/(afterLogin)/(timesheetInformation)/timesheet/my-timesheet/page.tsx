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

  return (
    <>
      <div className="h-auto w-auto pr-6 pb-6 pl-3 bg-gray-100" >
        <PageHeader title="My Attendance" description="Manage your Attendance" >
          <CheckControl />
        </PageHeader>
        <BlockWrapper className="mt-[-20px]">
          <ApprovalTable />
        </BlockWrapper>

        <div className="mt-4">
          <LeaveBalance />
        </div>

        <BlockWrapper className="mt-[30px]">
          <HistoryTable />
        </BlockWrapper>

        <BlockWrapper className="mt-6">
          <AttendanceTable />
        </BlockWrapper>
      </div>

      <ViewAttendanceSidebar />
      <LeaveRequestSidebar />
      <LeaveRequestDetail />
      <CheckOutSidebar />
    </>
  );
};

export default MyTimesheet;
