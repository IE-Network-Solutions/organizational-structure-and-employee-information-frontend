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

  const filter = useMemo<Partial<AttendanceRequestBody['filter']>>(() => {
    const end = dayjs();
    const start = end.subtract(PAST_DAYS, 'day');
    return {
      userIds: [userId ?? ''],
      date: {
        from: start.format('YYYY-MM-DD'),
        to: end.format('YYYY-MM-DD'),
      },
    };
  }, [userId]);

  const queryData = useMemo(() => ({ page: 1, limit: 500 }), []);
  const body = useMemo(() => ({ filter }), [filter]);

  const { data, isLoading } = useGetAttendances(
    queryData,
    body,
    true,
    !!userId,
  );

  const showCardLoading = isLoading && !data;

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
      <Card
        loading={showCardLoading}
        className="bg-red-50 border-[#FFD6A8] [&_.ant-card-body]:!p-3"
        data-cy="my-timesheet-attendance-summary-late-arrivals"
      >
        <div
          className="text-base font-semibold text-gray-900 mb-2"
          data-cy="my-timesheet-attendance-summary-late-title"
        >
          Late Arrivals
        </div>
        <div
          className="flex items-start justify-between gap-3"
          data-cy="my-timesheet-attendance-summary-late-content"
        >
          <div data-cy="my-timesheet-attendance-summary-late-stats">
            <div
              className="text-4xl font-bold text-red-600"
              data-cy="my-timesheet-attendance-summary-late-count"
            >
              {counts.lateArrivals}
            </div>
            <div
              className="text-base text-gray-600 mt-1"
              data-cy="my-timesheet-attendance-summary-late-label"
            >
              In the past 30 days
            </div>
          </div>
          <div
            className="w-12 h-12 rounded-full border-2 border-[#D9F7BE] bg-[#D9F7BE] flex items-center justify-center shrink-0 text-red-600"
            data-cy="my-timesheet-attendance-summary-late-icon"
          >
            <AiOutlineExclamationCircle className="text-red-600" size={26} />
          </div>
        </div>
      </Card>

      <Card
        loading={showCardLoading}
        className="bg-red-50 border-[#FFD6A8] [&_.ant-card-body]:!p-3"
        data-cy="my-timesheet-attendance-summary-absents"
      />
    </div>
  );
}
