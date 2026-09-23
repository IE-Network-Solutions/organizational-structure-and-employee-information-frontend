'use client';

import { Clock3 } from 'lucide-react';
import ShellSection from '@/components/homeUi/ShellSection';
import AttendanceSummaryCards from '../_components/attendance/AttendanceSummaryCards';
import AttendanceTable from '../_components/attendanceTable';

export default function AttendancePage() {
  return (
    <div
      id="time-attendance-my-timesheet-attendance-page"
      data-cy="time-attendance-my-timesheet-attendance-page"
    >
      <AttendanceSummaryCards />
      <ShellSection
        icon={Clock3}
        title="Attendance Records"
        data-cy="time-attendance-my-timesheet-attendance-records"
      >
        <AttendanceTable variant="myTimesheet" />
      </ShellSection>
    </div>
  );
}
