'use client';

import { useMemo } from 'react';
import { Skeleton } from 'antd';
import dayjs from 'dayjs';
import { AlarmClock, CalendarX2 } from 'lucide-react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';
import { AttendanceRequestBody } from '@/store/server/features/timesheet/attendance/interface';
import ShellStat from '@/components/homeUi/ShellStat';

const PAST_DAYS = 30;

export default function AttendanceSummaryCards() {
  const { userId } = useAuthenticationStore();
  const end = dayjs();
  const start = end.subtract(PAST_DAYS, 'day');

  const filter: Partial<AttendanceRequestBody['filter']> = {
    userIds: [userId ?? ''],
    date: { from: start.format('YYYY-MM-DD'), to: end.format('YYYY-MM-DD') },
  };

  const { data, isFetching } = useGetAttendances(
    { page: 1, limit: 500 },
    { filter },
    true,
    true,
  );

  const counts = useMemo(() => {
    const items = data?.items ?? [];
    const lateArrivals = items.filter((r) => (r.lateByMinutes ?? 0) > 0).length;
    const absents = items.filter((r) => r.isAbsent === true).length;
    return { lateArrivals, absents };
  }, [data?.items]);

  const loadingValue = (
    <Skeleton.Button
      active
      size="small"
      style={{ width: 48, height: 28 }}
      data-cy="my-timesheet-attendance-summary-loading"
    />
  );

  return (
    <div
      className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
      data-cy="my-timesheet-attendance-summary-cards"
      id="my-timesheet-attendance-summary-cards"
    >
      <ShellStat
        icon={AlarmClock}
        label="Late Arrivals"
        value={isFetching ? loadingValue : counts.lateArrivals}
        caption="In the past 30 days"
        tone={!isFetching && counts.lateArrivals > 0 ? 'danger' : 'default'}
        data-cy="my-timesheet-attendance-summary-late-arrivals"
      />
      <ShellStat
        icon={CalendarX2}
        label="Absents"
        value={isFetching ? loadingValue : counts.absents}
        caption="In the past 30 days"
        tone={!isFetching && counts.absents > 0 ? 'danger' : 'default'}
        data-cy="my-timesheet-attendance-summary-absents"
      />
    </div>
  );
}
