'use client';

import { MdOutlineFreeBreakfast } from 'react-icons/md';
import AttendanceStatCard from './AttendanceStatCard';
import AttendanceStatCardSkeleton from './AttendanceStatCardSkeleton';
import { useAttendanceSummary } from './useAttendanceSummary';

export default function LeavesTakenCard() {
  const { leavesCarouselSlides, showSkeleton } = useAttendanceSummary();

  if (showSkeleton) {
    return (
      <AttendanceStatCardSkeleton dataCy="attendance-summary-leaves-taken-skeleton" />
    );
  }

  return (
    <AttendanceStatCard
      title="Leaves Taken"
      value={null}
      carouselSlides={leavesCarouselSlides}
      icon={<MdOutlineFreeBreakfast size={24} />}
      iconBgClassName="bg-lightblue text-blue"
      dataCy="attendance-summary-leaves-taken"
    />
  );
}
