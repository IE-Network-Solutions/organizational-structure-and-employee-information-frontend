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
import CheckControl from './_components/checkControls/inedx';
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
      <div className="h-auto w-auto px-5 pb-5 bg-gray-100">
        <PageHeader 
          title={<span className="text-[14px] sm:text-lg lg:text-xl text-gray-600">My Attendance</span>}
          description="Manage your Attendance"
        >
          <CheckControl />
        </PageHeader>
        <BlockWrapper className="p-0 mt-0 bg-transparent">
          <ApprovalTable />
        </BlockWrapper>

        <div className="mt-4 bg-white rounded-lg p-2 mx-2">
          <LeaveBalance />
        </div>

        <BlockWrapper className="mt-4 bg-white rounded-lg mx-2">
          <div className="p-2">
            <HistoryTable />
          </div>
        </BlockWrapper>

        <BlockWrapper className="p-6 mt-4 bg-white rounded-lg mx-2">
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
