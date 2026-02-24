'use client';

import { useMemo } from 'react';
import { Card } from 'antd';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';
import { AttendanceRequestBody } from '@/store/server/features/timesheet/attendance/interface';
import { MdOutlineWarningAmber } from 'react-icons/md';
import { CiCalendar } from 'react-icons/ci';
import { AiOutlineExclamationCircle } from 'react-icons/ai';

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

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
      data-cy="my-timesheet-attendance-summary-cards"
      id="my-timesheet-attendance-summary-cards"
    >
      <Card
        loading={isFetching}
        className="bg-red-50 border-red-100 [&_.ant-card-body]:!p-3"
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
          <div>
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
        loading={isFetching}
        className="bg-red-50 border-red-100 [&_.ant-card-body]:!p-3"
        data-cy="my-timesheet-attendance-summary-absents"
      >
        <div
          className="text-base font-semibold text-gray-900 mb-2"
          data-cy="my-timesheet-attendance-summary-absents-title"
        >
          Absents
        </div>
        <div
          className="flex items-start justify-between gap-3"
          data-cy="my-timesheet-attendance-summary-absents-content"
        >
          <div>
            <div
              className="text-4xl font-bold text-red-600"
              data-cy="my-timesheet-attendance-summary-absents-count"
            >
              {counts.absents}
            </div>
            <div
              className="text-base text-gray-600 mt-1"
              data-cy="my-timesheet-attendance-summary-absents-label"
            >
              In the past 30 days
            </div>
          </div>
          <div
            className="w-12 h-12 rounded-full border-2 border-[#D9F7BE] bg-[#D9F7BE] flex items-center justify-center shrink-0 text-red-600"
            data-cy="my-timesheet-attendance-summary-absents-icon"
          >
            <CiCalendar size={26} className="text-red-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
