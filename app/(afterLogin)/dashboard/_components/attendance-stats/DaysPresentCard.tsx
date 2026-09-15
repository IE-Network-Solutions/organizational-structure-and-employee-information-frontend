'use client';

import { MdHowToReg } from 'react-icons/md';
import AttendanceStatCard from './AttendanceStatCard';
import AttendanceStatCardSkeleton from './AttendanceStatCardSkeleton';
import { useAttendanceSummary } from './useAttendanceSummary';

export default function DaysPresentCard() {
  const { daysPresent, showSkeleton } = useAttendanceSummary();

  if (showSkeleton) {
    return (
      <AttendanceStatCardSkeleton dataCy="attendance-summary-days-present-skeleton" />
    );
  }

  return (
    <AttendanceStatCard
      title="Days Present"
      value={
        <>
          <span
            className="text-xl text-black font-semibold"
            data-cy="attendance-summary-days-present-value-current"
          >
            {daysPresent.present}
          </span>
          <span
            className="text-gray-500"
            data-cy="attendance-summary-days-present-value-sep"
          >
            {' '}
            /{' '}
          </span>
          <span
            className="text-gray-500"
            data-cy="attendance-summary-days-present-value-total"
          >
            {daysPresent.total}
          </span>
        </>
      }
      icon={<MdHowToReg size={24} />}
      iconBgClassName="bg-greenlight  text-greenbg"
      dataCy="attendance-summary-days-present"
    />
  );
}
