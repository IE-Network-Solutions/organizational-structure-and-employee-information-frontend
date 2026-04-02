'use client';

import React from 'react';
import { Card, Progress } from 'antd';

type AttendanceDayStatus = 'present' | 'late' | 'absent' | 'leave';

type AttendanceDayRow = {
  day: string;
  hours: string;
  startTime: string;
  endTime: string;
  status: AttendanceDayStatus;
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
  absent: 'Acent', // kept as screenshot typo
  leave: 'Leave',
};

const DEFAULT_ROWS: AttendanceDayRow[] = [
  {
    day: 'Mon',
    hours: 'Hours: 8hrs',
    startTime: '8:55 AM',
    endTime: '5:32 PM',
    status: 'present',
  },
  {
    day: 'Tus',
    hours: 'Hours: 8hrs',
    startTime: '8:55 AM',
    endTime: '5:32 PM',
    status: 'late',
  },
  {
    day: 'Wed',
    hours: 'Hours: 8hrs',
    startTime: '8:55 AM',
    endTime: '5:32 PM',
    status: 'absent',
  },
  {
    day: 'Thu',
    hours: 'Hours: 8hrs',
    startTime: '8:55 AM',
    endTime: '5:32 PM',
    status: 'leave',
  },
  {
    day: 'Fri',
    hours: 'Hours: 8hrs',
    startTime: '8:55 AM',
    endTime: '5:32 PM',
    status: 'present',
  },
];

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

export default function ThisWeeksAttendanceReviewCard() {
  return (
    <Card
      bordered={false}
      className="bg-white rounded-lg border border-[#E5E7EB] shadow-none h-[343px]"
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
            className="flex items-center gap-4"
            data-cy="this-weeks-attendance-review-stats"
          >
            <div data-cy="this-weeks-attendance-review-on-time-block">
              <div
                className="text-black font-bold text-base leading-6 tabular-nums"
                data-cy="this-weeks-attendance-review-on-time-value"
              >
                3/5
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
                42.8h
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
          <div
            className="text-[#2563EB] font-medium text-[12px]"
            data-cy="this-weeks-attendance-review-view-all"
          >
            View All
          </div>
        </div>
      </div>

      {/* Summary metrics row */}

      {/* Rows */}
      <div className="mt-2" data-cy="this-weeks-attendance-review-rows">
        {DEFAULT_ROWS.map((row, idx) => {
          const barWidth = getBarWidth(row.status);
          return (
            <div
              key={`${row.day}-${idx}`}
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
                      className={`w-[5px] h-[5px] rounded-full ${statusDotClass[row.status]}`}
                      data-cy={`this-weeks-attendance-review-row-${idx}-dot`}
                    />
                    <div
                      className="text-gray-500 text-[12px] font-medium w-[20px]"
                      data-cy={`this-weeks-attendance-review-row-${idx}-day`}
                    >
                      {row.day}
                    </div>
                  </div>
                  <div
                    className="text-black/10"
                    data-cy={`this-weeks-attendance-review-row-${idx}-divider`}
                  >
                    |
                  </div>
                  <div
                    className="flex items-center gap-3 flex-1"
                    data-cy={`this-weeks-attendance-review-row-${idx}-hours-wrap`}
                  >
                    <div
                      className="text-gray-600 text-[12px] whitespace-nowrap"
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
                    className="w-[50px] flex justify-start items-center"
                    data-cy={`this-weeks-attendance-review-row-${idx}-pill-wrap`}
                  >
                    <div
                      className={`px-2 h-[22px] flex items-center justify-center rounded-md text-[12px] whitespace-nowrap ${statusPillClass[row.status]}`}
                      aria-label={`${row.day} status ${row.status}`}
                      data-cy={`this-weeks-attendance-review-row-${idx}-status`}
                    >
                      {statusLabel[row.status]}
                    </div>
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
    </Card>
  );
}
