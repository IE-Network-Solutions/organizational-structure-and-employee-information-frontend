'use client';

import React, { useMemo } from 'react';
import {
  MdHowToReg,
  MdOutlineSchedule,
  MdOutlineFreeBreakfast,
} from 'react-icons/md';
import { LuCalendarClock } from 'react-icons/lu';
import { Skeleton } from 'antd';
import dayjs from 'dayjs';

import AttendanceStatCard, {
  type AttendanceStatCarouselSlide,
} from './AttendanceStatCard';
import ClosedDaysCard from './ClosedDaysCard';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetDashboardEmployeeSummary } from '@/store/server/features/dashboard/employee-summary/queries';
import type { ClosedDayInActiveMonth } from '@/store/server/features/dashboard/employee-summary/interface';
import { DATE_FORMAT } from '@/utils/constants';

function mapClosedDayItem(row: ClosedDayInActiveMonth): {
  date: string;
  name: string;
} {
  const name = row.name ?? row.title ?? row.holidayName ?? '';
  const raw = row.date ?? row.holidayDate;
  const date =
    raw && dayjs(raw).isValid() ? dayjs(raw).format(DATE_FORMAT) : (raw ?? '');
  return { date, name };
}

function AttendanceSummarySkeleton() {
  return (
    <div
      className="bg-white rounded-lg border border-[#E5E7EB] p-3 h-[109px]"
      data-cy="attendance-summary-card-skeleton"
    >
      <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
    </div>
  );
}

export function DaysPresentKpiCard() {
  const { showSkeleton, daysPresent } = useAttendanceSummaryData();
  if (showSkeleton) return <AttendanceSummarySkeleton />;
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

export function LateArrivalsKpiCard() {
  const { showSkeleton, lateArrivals, lateArrivalsFooter } =
    useAttendanceSummaryData();
  if (showSkeleton) return <AttendanceSummarySkeleton />;
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

export function LeavesTakenKpiCard() {
  const { showSkeleton, leavesCarouselSlides } = useAttendanceSummaryData();
  if (showSkeleton) return <AttendanceSummarySkeleton />;
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

export function ClosedDaysKpiCard() {
  const { showSkeleton, closedDays } = useAttendanceSummaryData();
  if (showSkeleton) return <AttendanceSummarySkeleton />;
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

function useAttendanceSummaryData() {
  const userId = useAuthenticationStore((s) => s.userId);
  const { data, isLoading } = useGetDashboardEmployeeSummary(
    userId || undefined,
  );

  const {
    daysPresent,
    lateArrivals,
    leavesCarouselSlides,
    closedDays,
    lateArrivalsFooter,
  } = useMemo(() => {
    const activeLabel = data?.activeMonth?.name ?? 'active month';

    if (!data?.users?.length) {
      const emptyLeavesSlide: AttendanceStatCarouselSlide = {
        id: 'none',
        value: (
          <div
            data-cy="attendance-summary-leaves-taken-value-current-none"
            className="flex items-center gap-1 flex-wrap"
          >
            <span
              className="text-xl text-black font-semibold"
              data-cy="attendance-summary-leaves-taken-value-current-none"
            >
              0
            </span>
            <span
              className="text-gray-500"
              data-cy="attendance-summary-leaves-taken-value-sep-none"
            >
              /
            </span>
            <span
              className="text-gray-500"
              data-cy="attendance-summary-leaves-taken-value-total-none"
            >
              0
            </span>
          </div>
        ),
        footer: 'No leave taken',
      };

      return {
        daysPresent: { present: 0, total: 0 },
        lateArrivals: 0,
        leavesCarouselSlides: [emptyLeavesSlide],
        closedDays: {
          count: 0,
          periodLabel: activeLabel,
          items: [] as Array<{ date: string; name: string }>,
        },
        lateArrivalsFooter: activeLabel,
      };
    }

    const row = data.users.find((u) => u.userId === userId) ?? data.users[0];

    const leavesWithTaken = row.leavesByType.filter((l) => l.takenDays > 0);
    const leavesCarouselSlides: AttendanceStatCarouselSlide[] =
      leavesWithTaken.length > 0
        ? leavesWithTaken.map((leave) => ({
            id: leave.leaveTypeId,
            value: (
              <div
                data-cy={`attendance-summary-leaves-taken-value-current-${leave.leaveTypeId}`}
                className="flex items-center gap-1"
              >
                <span
                  className="text-xl text-black font-semibold"
                  data-cy={`attendance-summary-leaves-taken-value-current-${leave.leaveTypeId}`}
                >
                  {leave.takenDays}
                </span>
                <span
                  className="text-gray-500 mt-1"
                  data-cy={`attendance-summary-leaves-taken-value-sep-${leave.leaveTypeId}`}
                >
                  /
                </span>
                <span
                  className="text-gray-500 mt-1"
                  data-cy={`attendance-summary-leaves-taken-value-total-${leave.leaveTypeId}`}
                >
                  {leave.entitledDaysPerYear}
                </span>
              </div>
            ),
            footer: leave.leaveTypeTitle,
          }))
        : [
            {
              id: 'none',
              value: (
                <div
                  data-cy="attendance-summary-leaves-taken-value-current-none"
                  className="flex items-center gap-1 flex-wrap"
                >
                  <span
                    className="text-xl text-black font-semibold"
                    data-cy="attendance-summary-leaves-taken-value-current-none"
                  >
                    0
                  </span>
                  <span
                    className="text-gray-500"
                    data-cy="attendance-summary-leaves-taken-value-sep-none"
                  >
                    /
                  </span>
                  <span
                    className="text-gray-500"
                    data-cy="attendance-summary-leaves-taken-value-total-none"
                  >
                    0
                  </span>
                </div>
              ),
              footer: 'No leave taken',
            },
          ];

    const closedItems = (data.closedDaysInActiveMonth ?? []).map(
      mapClosedDayItem,
    );

    return {
      daysPresent: {
        present: row.daysPresent,
        total: row.expectedWorkingDaysInMonth,
      },
      lateArrivals: row.lateArrivalsCount,
      leavesCarouselSlides,
      closedDays: {
        count: closedItems.length,
        periodLabel: activeLabel,
        items: closedItems,
      },
      lateArrivalsFooter: activeLabel,
    };
  }, [data, userId]);

  const showSkeleton = !userId || (isLoading && !data);

  return {
    showSkeleton,
    daysPresent,
    lateArrivals,
    leavesCarouselSlides,
    closedDays,
    lateArrivalsFooter,
  };
}

export default function AttendanceSummaryCards() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      data-cy="attendance-summary-cards"
    >
      <DaysPresentKpiCard />
      <LateArrivalsKpiCard />
      <LeavesTakenKpiCard />
      <ClosedDaysKpiCard />
    </div>
  );
}
