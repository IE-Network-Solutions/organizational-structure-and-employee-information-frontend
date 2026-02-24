'use client';

import AttendanceSummaryCards from '../_components/attendance/AttendanceSummaryCards';
import AttendanceTable from '../_components/attendanceTable';

export default function AttendancePage() {
  return (
    <div
      id="time-attendance-my-timesheet-attendance-page"
      data-cy="time-attendance-my-timesheet-attendance-page"
    >
      <AttendanceSummaryCards />
      <AttendanceTable variant="myTimesheet" />
    </div>
  );
}
