'use client';

import ClosedDaysSummaryCard from './ClosedDaysSummaryCard';
import DaysPresentCard from './DaysPresentCard';
import LateArrivalsCard from './LateArrivalsCard';
import LeavesTakenCard from './LeavesTakenCard';

/**
 * The full attendance KPI row. Each card is also registered as a standalone
 * dashboard widget, so on `/dashboard` they are placed individually rather
 * than through this component.
 */
export default function AttendanceSummaryCards() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5"
      data-cy="attendance-summary-cards"
    >
      <DaysPresentCard />
      <LateArrivalsCard />
      <LeavesTakenCard />
      <ClosedDaysSummaryCard />
    </div>
  );
}
