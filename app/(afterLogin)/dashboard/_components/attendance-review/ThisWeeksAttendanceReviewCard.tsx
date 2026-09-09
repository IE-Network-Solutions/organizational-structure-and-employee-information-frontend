'use client';

import React, { useLayoutEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, Progress, Spin } from 'antd';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';
import usePagination from '@/utils/usePagination';
import {
  AttendanceRecord,
  AttendanceRecordType,
} from '@/types/timesheet/attendance';
import { formatToAttendanceStatuses } from '@/helpers/formatTo';
import { calculateAttendanceRecordToTotalWorkTime } from '@/helpers/calculateHelper';

type AttendanceDayStatus = 'present' | 'late' | 'absent' | 'leave';

type AttendanceDayRow = {
  day: string;
  dateValue: string;
  hours: string;
  startTime: string;
  endTime: string;
  status: AttendanceDayStatus | null;
  workMs: number;
};

const statusDotClass: Record<AttendanceDayStatus, string> = {
  present: 'bg-green-500',
  late: 'bg-orange',
  absent: 'bg-red-500',
  leave: 'bg-indigo-500',
};

const statusPillClass: Record<AttendanceDayStatus, string> = {
  present: 'border border-greenbg bg-greenlight text-greenbg font-medium',
  late: 'border border-orangebg bg-lightorange text-orangebg font-medium',
  absent: 'border border-errorbg bg-errorlight text-errorbg font-medium',
  leave: 'border border-blue bg-lightblue text-blue font-medium',
};

const statusLabel: Record<AttendanceDayStatus, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  leave: 'Leave',
};

const TIME_ONLY_FORMAT = 'hh:mm A';

function recordToCardStatus(
  record: AttendanceRecord | undefined,
): AttendanceDayStatus {
  if (!record) return 'absent';
  if (record.isAbsent) return 'absent';
  const statuses = formatToAttendanceStatuses(record);
  if (statuses.some((s) => s.status === AttendanceRecordType.LATE))
    return 'late';
  return 'present';
}

function progressPercent(status: AttendanceDayStatus | null, workMs: number) {
  if (status == null) return 0;
  if (workMs > 0) {
    const capped = Math.min(
      100,
      Math.round((workMs / (8 * 60 * 60 * 1000)) * 100),
    );
    return Math.max(capped, 8);
  }
  return getBarWidth(status);
}

function getBarWidth(status: AttendanceDayStatus) {
  switch (status) {
    case 'present':
      return 88;
    case 'late':
      return 62;
    case 'absent':
      return 18;
    case 'leave':
      return 55;
    default:
      return 0;
  }
}

/** Local calendar date key for bucketing an attendance record (works for ISO and SQL datetime strings). */
function attendanceDateKey(isoOrLocalDateTime: string) {
  return dayjs(isoOrLocalDateTime).startOf('day').format('YYYY-MM-DD');
}

export default function ThisWeeksAttendanceReviewCard() {
  const { userId } = useAuthenticationStore();
  const rangeEnd = dayjs().startOf('day');
  const rangeStart = rangeEnd.subtract(6, 'day');
  const startDate = rangeStart.format('YYYY-MM-DD');
  const endDate = rangeEnd.format('YYYY-MM-DD');

  const { filter, setFilter } = useEmployeeAttendanceStore();

  const {
    page: currentPage,
    limit: pageSize,
    orderBy,
    orderDirection,
    setOrderBy,
    setOrderDirection,
  } = usePagination(1, 100);

  useLayoutEffect(() => {
    setOrderBy('startAt');
    setOrderDirection('ascend');
  }, [setOrderBy, setOrderDirection]);

  useLayoutEffect(() => {
    if (!userId) return;
    setFilter({
      userIds: [userId],
      date: {
        from: startDate,
        to: endDate,
      },
    });
  }, [userId, startDate, endDate, setFilter]);

  const isWeekUserFilterReady = Boolean(
    userId &&
    filter &&
    filter.userIds?.length === 1 &&
    filter.userIds[0] === userId &&
    filter.date?.from === startDate &&
    filter.date?.to === endDate,
  );

  const { data, isFetching } = useGetAttendances(
    { page: currentPage, limit: pageSize, orderBy, orderDirection },
    { filter },
    true,
    isWeekUserFilterReady,
  );

  const { rows, onTimeCount, onTimeDenominator, totalHoursDisplay } =
    useMemo(() => {
      const items = data?.items ?? [];
      const recordByDate = new Map<string, AttendanceRecord>();
      for (const item of items) {
        const dKey = attendanceDateKey(item.startAt);
        const prev = recordByDate.get(dKey);
        if (!prev || dayjs(item.startAt).isAfter(dayjs(prev.startAt))) {
          recordByDate.set(dKey, item);
        }
      }

      const today = dayjs().startOf('day');
      const daysInRange = rangeEnd.diff(rangeStart, 'day') + 1;
      const workWeekDays = Array.from({ length: daysInRange }, (item, i) =>
        rangeStart.add(i, 'day').startOf('day'),
      );

      const rowList: AttendanceDayRow[] = [];
      let onNum = 0;
      let onDen = 0;
      let totalMs = 0;

      for (const d of workWeekDays) {
        const dDay = d.startOf('day');
        const dKey = dDay.format('YYYY-MM-DD');
        const isFuture = dDay.isAfter(today);
        const record = recordByDate.get(dKey);

        if (!isFuture) onDen++;

        if (isFuture) {
          rowList.push({
            day: dDay.format('ddd'),
            dateValue: dKey,
            hours: '—',
            startTime: '—',
            endTime: '—',
            status: null,
            workMs: 0,
          });
          continue;
        }

        if (!record) {
          rowList.push({
            day: dDay.format('ddd'),
            dateValue: dKey,
            hours: '—',
            startTime: '—',
            endTime: '—',
            status: null,
            workMs: 0,
          });
          continue;
        }

        const workMs = calculateAttendanceRecordToTotalWorkTime(record);
        totalMs += workMs;
        const hoursDec = workMs / (60 * 60 * 1000);
        const cardStatus = recordToCardStatus(record);
        if (!record.isAbsent && record.lateByMinutes === 0) onNum++;

        const startClock = record.startAt
          ? dayjs(record.startAt).format(TIME_ONLY_FORMAT)
          : '—';
        let endClock = '—';
        if (record.endAt) {
          endClock = dayjs(record.endAt).format(TIME_ONLY_FORMAT);
        } else if (record.isOnGoing) {
          endClock = 'In progress';
        }

        rowList.push({
          day: dDay.format('ddd'),
          dateValue: dKey,
          hours:
            workMs > 0
              ? `Hours: ${hoursDec.toFixed(1)}h`
              : record.isAbsent
                ? '—'
                : 'Hours: 0h',
          startTime: startClock,
          endTime: endClock,
          status: cardStatus,
          workMs,
        });
      }

      rowList.sort(
        (a, b) => dayjs(b.dateValue).valueOf() - dayjs(a.dateValue).valueOf(),
      );

      const totalHoursDisplay =
        totalMs > 0 ? `${(totalMs / (60 * 60 * 1000)).toFixed(1)}h` : '0h';

      return {
        rows: rowList,
        onTimeCount: onNum,
        onTimeDenominator: onDen > 0 ? onDen : workWeekDays.length || 5,
        totalHoursDisplay,
      };
    }, [data?.items, rangeStart, rangeEnd]);

  return (
    <Card
      bordered={false}
      className="bg-white rounded-lg border border-[#E5E7EB] shadow-none h-full"
      bodyStyle={{ padding: 12 }}
      data-cy="this-weeks-attendance-review-card"
    >
      {/* Header */}
      <div
        className="flex items-start justify-between gap-4"
        data-cy="this-weeks-attendance-review-header"
      >
        <div
          className="flex items-center gap-5"
          data-cy="this-weeks-attendance-review-header-main"
        >
          <div data-cy="this-weeks-attendance-review-title-block">
            <div
              className="text-black font-semibold text-sm"
              data-cy="this-weeks-attendance-review-title"
            >
              This Weeks
            </div>
            <div
              className="text-black/45 font-normal text-xs mt-1"
              data-cy="this-weeks-attendance-review-subtitle"
            >
              Attendance Review
            </div>
          </div>
          <div
            className="flex items-center gap-2"
            data-cy="this-weeks-attendance-review-stats"
          >
            <div data-cy="this-weeks-attendance-review-on-time-block">
              <div
                className="text-black font-bold text-base leading-6 tabular-nums"
                data-cy="this-weeks-attendance-review-on-time-value"
              >
                {onTimeCount}/{onTimeDenominator}
              </div>
              <div
                className="text-black/45 font-normal text-xs mt-0.5"
                data-cy="this-weeks-attendance-review-on-time-label"
              >
                On time
              </div>
            </div>
            <div
              className="text-black/10"
              data-cy="this-weeks-attendance-review-divider-1"
            >
              |
            </div>
            <div data-cy="this-weeks-attendance-review-hours-block">
              <div
                className="text-black font-bold text-base leading-6 tabular-nums"
                data-cy="this-weeks-attendance-review-hours-value"
              >
                {totalHoursDisplay}
              </div>
              <div
                className="text-black/45 font-normal text-xs mt-0.5"
                data-cy="this-weeks-attendance-review-hours-label"
              >
                Total Hours
              </div>
            </div>
          </div>
        </div>

        <div
          className="text-right"
          data-cy="this-weeks-attendance-review-view-all-wrap"
        >
          <Link
            href="/timesheet/employee-attendance"
            className="text-[#2563EB] font-medium text-[12px] inline-block"
            data-cy="this-weeks-attendance-review-view-all"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Summary metrics row */}

      {/* Rows */}
      <Spin spinning={isFetching} size="small">
        <div
          className="mt-2 h-[270px] overflow-y-auto scrollbar-none"
          data-cy="this-weeks-attendance-review-rows"
        >
          {rows.map((row, idx) => {
            const barWidth = progressPercent(row.status, row.workMs);
            const dotClass =
              row.status != null ? statusDotClass[row.status] : 'bg-gray-300';
            return (
              <div
                key={row.dateValue}
                className="flex flex-col mb-3"
                data-cy={`this-weeks-attendance-review-row-${idx}`}
              >
                <div
                  className="py-0 flex items-center justify-between"
                  data-cy={`this-weeks-attendance-review-row-${idx}-content`}
                >
                  <div
                    className="flex items-center gap-2"
                    data-cy={`this-weeks-attendance-review-row-${idx}-left`}
                  >
                    <div
                      className="flex items-center gap-1"
                      data-cy={`this-weeks-attendance-review-row-${idx}-day-wrap`}
                    >
                      <span
                        className={`w-[5px] h-[5px] rounded-full ${dotClass}`}
                        data-cy={`this-weeks-attendance-review-row-${idx}-dot`}
                      />
                      <div
                        className="text-gray-500 text-[12px] font-medium w-[28px] capitalize"
                        data-cy={`this-weeks-attendance-review-row-${idx}-day`}
                      >
                        {row.day}
                      </div>
                      <div
                        className="text-gray-400 text-[11px]"
                        data-cy={`this-weeks-attendance-review-row-${idx}-date`}
                      >
                        {dayjs(row.dateValue).format('DD MMM')}
                      </div>
                    </div>
                    <div
                      className="text-black/10"
                      data-cy={`this-weeks-attendance-review-row-${idx}-divider`}
                    >
                      |
                    </div>
                    <div
                      className="flex items-center gap-3 flex-1 min-w-0"
                      data-cy={`this-weeks-attendance-review-row-${idx}-hours-wrap`}
                    >
                      <div
                        className="text-gray-600 text-[12px] whitespace-nowrap truncate"
                        data-cy={`this-weeks-attendance-review-row-${idx}-hours`}
                      >
                        {row.hours}
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-3 "
                    data-cy={`this-weeks-attendance-review-row-${idx}-right`}
                  >
                    <div
                      className="text-gray-600 text-[12px] whitespace-nowrap text-right"
                      data-cy={`this-weeks-attendance-review-row-${idx}-times`}
                    >
                      {row.startTime}
                      <span
                        className="mx-2 text-gray-400"
                        data-cy={`this-weeks-attendance-review-row-${idx}-time-sep`}
                      >
                        {'>'}
                      </span>
                      {row.endTime}
                    </div>
                    <div
                      className=" flex justify-start items-center"
                      data-cy={`this-weeks-attendance-review-row-${idx}-pill-wrap`}
                    >
                      {row.status != null ? (
                        <div
                          className={`px-2 h-[22px] flex items-center justify-center rounded-md text-[12px] whitespace-nowrap ${statusPillClass[row.status]}`}
                          aria-label={`${row.day} status ${row.status}`}
                          data-cy={`this-weeks-attendance-review-row-${idx}-status`}
                        >
                          {statusLabel[row.status]}
                        </div>
                      ) : (
                        <span
                          className="text-gray-400 text-[12px]"
                          data-cy={`this-weeks-attendance-review-row-${idx}-status`}
                        >
                          —
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Progress
                  percent={barWidth}
                  showInfo={false}
                  strokeColor={'#1E40AF'}
                  size={{ height: 4 }}
                />
              </div>
            );
          })}
        </div>
      </Spin>
    </Card>
  );
}
