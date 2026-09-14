'use client';

import { FC, useEffect } from 'react';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import { useGetAllowedAreas } from '@/store/server/features/timesheet/allowedArea/queries';
import { useGetBreakTypes } from '@/store/server/features/timesheet/breakType/queries';
import ViewAttendanceSidebar from '@/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/_components/viewAttendanceSidebar';
import CheckOutSidebar from '@/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/_components/checkOutSidebar';
import LeaveRequestSidebar from '@/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/_components/leaveRequestSidebar';
import LeaveRequestDetail from '@/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/_components/leaveRequestDetail';
import WorkFromHomeRequestSidebar from '@/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/_components/workFromHomeRequestSidebar';
import WorkFromHomeRequestDetailModal from '@/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/_components/workFromHome/WorkFromHomeRequestDetailModal';
import RemoteAttendanceCameraModals from '@/components/common/remoteAttendanceCameraModals';
import AttendanceLocationErrorModal from '@/components/common/attendanceLocationErrorModal';

const HomeTimesheetProviders: FC = () => {
  const { setLeaveTypes, setAllowedAreas, setBreakTypes } =
    useMyTimesheetStore();

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

  return (
    <>
      <ViewAttendanceSidebar data-cy="home-view-attendance-sidebar" />
      <LeaveRequestSidebar data-cy="home-leave-request-sidebar" />
      <WorkFromHomeRequestSidebar data-cy="home-work-from-home-request-sidebar" />
      <WorkFromHomeRequestDetailModal data-cy="home-work-from-home-request-detail-modal" />
      <LeaveRequestDetail data-cy="home-leave-request-detail" />
      <CheckOutSidebar data-cy="home-check-out-sidebar" />
      <RemoteAttendanceCameraModals />
      <AttendanceLocationErrorModal />
    </>
  );
};

export default HomeTimesheetProviders;
