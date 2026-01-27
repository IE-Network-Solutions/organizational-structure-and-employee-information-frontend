'use client';

import React from 'react';
import StatsCards from './StatsCards';
import LeaveSection from './LeaveSection';
import AttendanceReport from './AttendanceReport';
import LeaveRequest from './LeaveRequest';
import EmployeeAttendanceTable from './EmployeeAttendance';
import { useSearchParams } from 'next/navigation';
import UserLeaveBalance from './UserLeaveBalance';

export default function AdminPanel() {
  const searchParams = useSearchParams();
  const hasEmployeeAttendance = searchParams.has('employeeAttendance');
  const hasUser = searchParams.has('user');

  return (
    <div
      className="space-y-4"
      id="time-attendance-admin-panel-layout-div"
      data-cy="time-attendance-admin-panel-layout-div"
    >
      {hasEmployeeAttendance && !hasUser ? (
        <EmployeeAttendanceTable data-cy="time-attendance-admin-panel-employee-attendance-table" />
      ) : hasEmployeeAttendance && hasUser ? (
        <UserLeaveBalance data-cy="time-attendance-admin-panel-user-leave-balance" />
      ) : (
        <>
          <StatsCards data-cy="time-attendance-admin-panel-stats-cards" />
          <LeaveSection data-cy="time-attendance-admin-panel-leave-section" />
          <AttendanceReport data-cy="time-attendance-admin-panel-attendance-report" />
          <LeaveRequest data-cy="time-attendance-admin-panel-leave-request" />
        </>
      )}
    </div>
  );
}
