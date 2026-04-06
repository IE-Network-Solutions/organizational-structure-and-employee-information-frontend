'use client';

import LeaveBalance from '../_components/leaveBalance';
import HistoryTable from '../_components/historyTable';

export default function LeavePage() {
  return (
    <div
      id="time-attendance-my-timesheet-leave-page"
      data-cy="time-attendance-my-timesheet-leave-page"
      className="space-y-6 w-full max-w-full"
    >
      <section
        id="time-attendance-my-timesheet-leave-balance-section"
        data-cy="time-attendance-my-timesheet-leave-balance-section"
      >
        <LeaveBalance />
      </section>
      <section
        id="time-attendance-my-timesheet-leave-requests-section"
        data-cy="time-attendance-my-timesheet-leave-requests-section"
      >
        <HistoryTable />
      </section>
    </div>
  );
}
