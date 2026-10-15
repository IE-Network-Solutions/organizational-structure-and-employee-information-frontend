'use client';

import { useMemo } from 'react';
import dayjs from 'dayjs';
import type { AttendanceStatCarouselSlide } from './AttendanceStatCard';
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

/**
 * Shared source for the four attendance KPI cards. Each card is its own
 * dashboard widget, and React Query dedupes the single request behind them.
 */
export function useAttendanceSummary() {
  const userId = useAuthenticationStore((s) => s.userId);
  const { data, isLoading } = useGetDashboardEmployeeSummary(
    userId || undefined,
  );

  const summary = useMemo(() => {
    const activeLabel = data?.activeMonth?.name ?? 'active month';

    if (!data?.users?.length) {
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
        : [emptyLeavesSlide];

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

  return { ...summary, showSkeleton: !userId || (isLoading && !data) };
}
