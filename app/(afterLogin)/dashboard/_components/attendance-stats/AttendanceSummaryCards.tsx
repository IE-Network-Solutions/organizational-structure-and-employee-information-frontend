'use client';

import React from 'react';
import { MdHowToReg, MdOutlineSchedule, MdFreeBreakfast } from 'react-icons/md';

import AttendanceStatCard from './AttendanceStatCard';
import ClosedDaysCard from './ClosedDaysCard';
import { LuCalendarClock } from 'react-icons/lu';

type AttendanceSummaryCardsProps = {
  daysPresent?: { present: number; total: number };
  lateArrivals?: number;
  leavesTaken?: { taken: number; annualTotal: number };
  closedDays?: {
    count: number;
    periodLabel: string;
    items: Array<{ date: string; name: string }>;
  };
};

const DEFAULT_CLOSED_DAYS = [
  { date: '18th March', name: "International Woman's Day" },
];

export default function AttendanceSummaryCards({
  daysPresent = { present: 19, total: 22 },
  lateArrivals = 2,
  leavesTaken = { taken: 3, annualTotal: 20 },
  closedDays = {
    count: 4,
    periodLabel: 'this month',
    items: DEFAULT_CLOSED_DAYS,
  },
}: AttendanceSummaryCardsProps) {
  const DaysPresentValue = (
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
  );
  const LateArrivalsValue = (
    <>
      <span
        className="text-xl text-black font-semibold"
        data-cy="attendance-summary-late-arrivals-value"
      >
        {lateArrivals}
      </span>
    </>
  );
  const LeavesTakenValue = (
    <>
      <span
        className="text-xl text-black font-semibold"
        data-cy="attendance-summary-leaves-taken-value-current"
      >
        {leavesTaken.taken}
      </span>
      <span
        className="text-gray-500"
        data-cy="attendance-summary-leaves-taken-value-sep"
      >
        {' '}
        /{' '}
      </span>
      <span
        className="text-gray-500"
        data-cy="attendance-summary-leaves-taken-value-total"
      >
        {leavesTaken.annualTotal}
      </span>
    </>
  );
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5"
      data-cy="attendance-summary-cards"
    >
      <AttendanceStatCard
        title="Days Present"
        value={DaysPresentValue}
        icon={<MdHowToReg size={24} />}
        iconBgClassName="bg-greenlight  text-greenbg"
        dataCy="attendance-summary-days-present"
      />

      <AttendanceStatCard
        title="Late Arrivals"
        value={LateArrivalsValue}
        footer="this month"
        icon={<MdOutlineSchedule size={24} />}
        iconBgClassName="bg-lightorange text-orangebg"
        dataCy="attendance-summary-late-arrivals"
      />

      <AttendanceStatCard
        title="Leaves Taken"
        value={LeavesTakenValue}
        footer={`annual`}
        icon={<MdFreeBreakfast size={24} />}
        iconBgClassName="bg-lightblue text-blue"
        dataCy="attendance-summary-leaves-taken"
      />

      <ClosedDaysCard
        title="Closed Days"
        count={closedDays.count}
        periodLabel={closedDays.periodLabel}
        items={closedDays.items}
        icon={<LuCalendarClock size={24} />}
        iconBgClassName="bg-light_purple text-purple"
        dataCy="attendance-summary-closed-days"
      />
    </div>
  );
}
