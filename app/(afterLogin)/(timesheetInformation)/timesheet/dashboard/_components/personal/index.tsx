'use client';
import React from 'react';

import PersonalStatusCard from './PersonalStatusCard';
import MyleaveBalance from './MyleaveBalance';
import MyLeaveRequest from './MyLeaveRequest';
import MyAttendanceReport from './MyAttendanceReport';

export default function PersonalDashboard() {
  return (
    <div
      className="space-y-4"
      id="time-attendance-personal-dashboard-container-view"
      data-cy="time-attendance-personal-dashboard-container-view"
    >
      {/* Summary Cards */}
      <PersonalStatusCard data-cy="time-attendance-personal-dashboard-status-card" />

      {/* Leave Balance */}
      <MyleaveBalance data-cy="time-attendance-personal-dashboard-leave-balance-card" />

      {/* Leave Requests and Attendance Report */}
      <div
        className="grid grid-cols-2 gap-4"
        id="time-attendance-personal-dashboard-split-grid"
        data-cy="time-attendance-personal-dashboard-split-grid"
      >
        <MyLeaveRequest data-cy="time-attendance-personal-dashboard-leave-request-card" />

        <MyAttendanceReport data-cy="time-attendance-personal-dashboard-attendance-report-card" />
      </div>
    </div>
  );
}
