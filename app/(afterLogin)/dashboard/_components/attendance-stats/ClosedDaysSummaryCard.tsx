'use client';

import { LuCalendarClock } from 'react-icons/lu';
import AttendanceStatCardSkeleton from './AttendanceStatCardSkeleton';
import ClosedDaysCard from './ClosedDaysCard';
import { useAttendanceSummary } from './useAttendanceSummary';

export default function ClosedDaysSummaryCard() {
  const { closedDays, showSkeleton } = useAttendanceSummary();

  if (showSkeleton) {
    return (
      <AttendanceStatCardSkeleton dataCy="attendance-summary-closed-days-skeleton" />
    );
  }

  return (
    <ClosedDaysCard
      title="Closed Days"
      count={closedDays.count}
      periodLabel={closedDays.periodLabel}
      items={closedDays.items}
      icon={<LuCalendarClock size={24} />}
      iconBgClassName="bg-light_purple text-purple"
      dataCy="attendance-summary-closed-days"
    />
  );
}
