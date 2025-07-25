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
    <div className="space-y-4">
      {hasEmployeeAttendance && !hasUser ? (
        <EmployeeAttendanceTable />
      ) : hasEmployeeAttendance && hasUser ? (
        <UserLeaveBalance />
      ) : (
        <>
          <StatsCards />
          <LeaveSection />
          <AttendanceReport />
          <LeaveRequest />
        </>
      )}
    </div>
  );
}
