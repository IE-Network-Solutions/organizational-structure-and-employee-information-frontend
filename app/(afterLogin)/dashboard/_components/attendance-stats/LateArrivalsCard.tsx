'use client';

import { MdOutlineSchedule } from 'react-icons/md';
import AttendanceStatCard from './AttendanceStatCard';
import AttendanceStatCardSkeleton from './AttendanceStatCardSkeleton';
import { useAttendanceSummary } from './useAttendanceSummary';

export default function LateArrivalsCard() {
  const { lateArrivals, lateArrivalsFooter, showSkeleton } =
    useAttendanceSummary();

  if (showSkeleton) {
    return (
      <AttendanceStatCardSkeleton dataCy="attendance-summary-late-arrivals-skeleton" />
    );
  }

  return (
    <AttendanceStatCard
      title="Late Arrivals"
      value={
        <span
          className="text-xl text-black font-semibold"
          data-cy="attendance-summary-late-arrivals-value"
        >
          {lateArrivals}
        </span>
      }
      footer={lateArrivalsFooter}
      icon={<MdOutlineSchedule size={24} />}
      iconBgClassName="bg-lightorange text-orangebg"
      dataCy="attendance-summary-late-arrivals"
    />
  );
}
