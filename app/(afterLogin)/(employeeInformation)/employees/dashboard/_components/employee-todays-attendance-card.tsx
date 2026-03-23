'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Card, Spin } from 'antd';
import { MdFiberManualRecord } from 'react-icons/md';

import {
  TodayStatusSummaryParams,
  useGetTodayStatusSummary,
} from '@/store/server/features/employees/approval/queries';


type Period = 'Day' | 'Month' | 'Year' | 'Custom';

const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** API returns `{ count, percentage }` per bucket; tolerate plain numbers if ever used. */
type StatusBucket = { count: number; percentage?: number } | number | undefined;

function statusCount(value: StatusBucket): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  return Number(value.count) || 0;
}

function statusDisplayPercentage(
  value: StatusBucket,
  count: number,
  total: number,
): number {
  if (
    value != null &&
    typeof value === 'object' &&
    typeof value.percentage === 'number' &&
    !Number.isNaN(value.percentage)
  ) {
    return Math.round(value.percentage);
  }
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

function buildTodayStatusParams(
  displayPeriod: Period | null,
  selectedChip: string | null,
  period: Period | null,
): TodayStatusSummaryParams {
  const now = new Date();
  const eff: Period = displayPeriod ?? period ?? 'Day';

  const monthName =
    eff === 'Month' && selectedChip ? selectedChip : MONTH_ABBR[now.getMonth()];

  const dayOfWeek =
    eff === 'Day' && selectedChip ? selectedChip : DAY_NAMES[now.getDay()];

  const year =
    eff === 'Year' && selectedChip
      ? String(selectedChip)
      : String(now.getFullYear());

  const filterType = eff;

  return { monthName, dayOfWeek, year, filterType };
}

export default function EmployeeTodaysAttendanceCard() {
  const [period, setPeriod] = useState<Period | null>(null);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [displayPeriod, setDisplayPeriod] = useState<Period | null>(null);
  const [chipsAnim, setChipsAnim] = useState<'in' | 'out'>('in');
  const animTimerRef = useRef<number | null>(null);

  const apiParams = useMemo(
    () => buildTodayStatusParams(displayPeriod, selectedChip, period),
    [displayPeriod, selectedChip, period],
  );

  const { data: todayStatusData, isLoading } =
    useGetTodayStatusSummary(apiParams);
 console.log('todayStatusData', todayStatusData);
  const onTimeRaw = todayStatusData?.onTime as StatusBucket;
  const lateRaw = todayStatusData?.late as StatusBucket;
  const absentRaw = todayStatusData?.absent as StatusBucket;

  const onTimeCount = statusCount(onTimeRaw);
  const lateCount = statusCount(lateRaw);
  const absentCount = statusCount(absentRaw);

  const total = onTimeCount + lateCount + absentCount;
  const onTimePct = useMemo(
    () => statusDisplayPercentage(onTimeRaw, onTimeCount, total),
    [onTimeRaw, onTimeCount, total],
  );

  // Widths are based on counts, but the displayed percent is rounded (like the screenshot).
  const onTimeWidth = total ? (onTimeCount / total) * 100 : 0;
  const lateWidth = total ? (lateCount / total) * 100 : 0;
  const absentWidth = total ? (absentCount / total) * 100 : 0;
  const dayChips = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthChips = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const yearChips = Array.from({ length: 2026 - 2016 + 1 }, (_, i) =>
    String(2016 + i),
  );

  // Animate chip list transitions when user switches Day/Month/Year/Custom.
  React.useEffect(() => {
    if (period === null || displayPeriod === null) return;
    if (displayPeriod === period) return;
    setChipsAnim('out');
    if (animTimerRef.current) {
      window.clearTimeout(animTimerRef.current);
    }
    animTimerRef.current = window.setTimeout(() => {
      setDisplayPeriod(period);
      setChipsAnim('in');
    }, 150);
    return () => {
      if (animTimerRef.current) window.clearTimeout(animTimerRef.current);
      animTimerRef.current = null;
    };
  }, [period, displayPeriod]);

  const handlePeriodPillClick = (p: Period) => {
    setPeriod(p);
    setSelectedChip(null);
    if (displayPeriod === null) {
      // If list is closed, open it immediately (no fade delay).
      setDisplayPeriod(p);
      setChipsAnim('in');
    }
  };

  return (
    <Card
      className="shadow-sm border border-gray-200"
      bodyStyle={{ padding: 12 }}
      id="employee-todays-attendance-card"
      data-cy="employee-todays-attendance-card"
    >
      <Spin spinning={isLoading}>
        <div
          className="flex items-start justify-between gap-2 sm:gap-4"
          id="employee-todays-attendance-header-row"
          data-cy="employee-todays-attendance-header-row"
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h3
              className="truncate font-normal text-sm sm:text-base text-black/50 leading-6 tracking-normal"
              id="employee-todays-attendance-title"
              data-cy="employee-todays-attendance-title"
            >
              Today&apos;s Attendance
            </h3>
          </div>
          {displayPeriod == null ? (
            <div
              className="inline-flex shrink-0 items-center overflow-hidden"
              id="employee-todays-attendance-period-pill-group"
              data-cy="employee-todays-attendance-period-pill-group"
              role="tablist"
              aria-label="Attendance period"
            >
              {(['Day', 'Month', 'Year', 'Custom'] as Period[]).map((p) => {
                const isActive = p === period;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      handlePeriodPillClick(p);
                    }}
                    className={[
                      'px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium transition',
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-500 hover:bg-gray-50',
                    ].join(' ')}
                    id={`employee-todays-attendance-period-${p}`}
                    data-cy={`employee-todays-attendance-period-${p}`}
                    role="tab"
                    aria-selected={isActive}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              className={[
                'flex flex-wrap items-center gap-2 transition-all duration-150 ease-in-out',
                chipsAnim === 'out'
                  ? 'opacity-0 translate-y-1'
                  : 'opacity-100 translate-y-0',
              ].join(' ')}
              id="employee-todays-attendance-period-chips"
              data-cy="employee-todays-attendance-period-chips"
            >
              {displayPeriod === 'Day' &&
                dayChips.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedChip(d)}
                    className={[
                      'px-2 py-1 text-xs rounded border transition',
                      selectedChip === d
                        ? 'bg-gray-200 text-gray-900 border-gray-300'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                    ].join(' ')}
                    id={`employee-todays-attendance-chip-day-${d}`}
                    data-cy={`employee-todays-attendance-chip-day-${d}`}
                  >
                    {d}
                  </button>
                ))}

              {displayPeriod === 'Month' &&
                monthChips.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedChip(m)}
                    className={[
                      'px-2 py-1 text-xs rounded border transition',
                      selectedChip === m
                        ? 'bg-gray-200 text-gray-900 border-gray-300'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                    ].join(' ')}
                    id={`employee-todays-attendance-chip-month-${m}`}
                    data-cy={`employee-todays-attendance-chip-month-${m}`}
                  >
                    {m}
                  </button>
                ))}

              {displayPeriod === 'Year' &&
                yearChips.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setSelectedChip(y)}
                    className={[
                      'px-2 py-1 text-xs rounded border transition',
                      selectedChip === y
                        ? 'bg-gray-200 text-gray-900 border-gray-300'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                    ].join(' ')}
                    id={`employee-todays-attendance-chip-year-${y}`}
                    data-cy={`employee-todays-attendance-chip-year-${y}`}
                  >
                    {y}
                  </button>
                ))}

              {displayPeriod !== 'Custom' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedChip(null);
                    setDisplayPeriod(null);
                    setChipsAnim('in');
                  }}
                  className={[
                    'px-2 py-1 text-xs rounded border transition',
                    !selectedChip
                      ? 'bg-gray-200 text-gray-900 border-gray-300'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                  ].join(' ')}
                  id="employee-todays-attendance-chip-clear"
                  data-cy="employee-todays-attendance-chip-clear"
                >
                  X
                </button>
              )}

              {displayPeriod === 'Custom' && (
                <div
                  className="text-xs text-gray-500"
                  id="employee-todays-attendance-custom-placeholder"
                  data-cy="employee-todays-attendance-custom-placeholder"
                >
                  Custom range
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="mt-4 flex items-baseline gap-3"
          id="employee-todays-attendance-percent-row"
          data-cy="employee-todays-attendance-percent-row"
        >
          <div
            className="font-bold text-[36px] sm:text-[30px] leading-[2rem] tracking-normal text-gray-900"
            id="employee-todays-attendance-percent"
            data-cy="employee-todays-attendance-percent"
          >
            {onTimePct}%
          </div>
          <div
            className="font-normal text-base leading-6 tracking-normal text-[#10B981]"
            id="employee-todays-attendance-status-label"
            data-cy="employee-todays-attendance-status-label"
          >
            on time
          </div>
        </div>

        <div
          className="mt-3 flex h-4 sm:h-3 rounded-full overflow-hidden bg-gray-100"
          id="employee-todays-attendance-segmented-bar"
          data-cy="employee-todays-attendance-segmented-bar"
          aria-label="Attendance breakdown"
        >
          <div
            className="h-full bg-green-500 rounded-r-full"
            style={{ width: `${onTimeWidth}%` }}
            id="employee-todays-attendance-segment-on-time"
            data-cy="employee-todays-attendance-segment-on-time"
          />
          <div
            className="h-full bg-orange rounded-full"
            style={{ width: `${lateWidth}%` }}
            id="employee-todays-attendance-segment-late"
            data-cy="employee-todays-attendance-segment-late"
          />
          <div
            className="h-full bg-red-500 rounded-full"
            style={{ width: `${absentWidth}%` }}
            id="employee-todays-attendance-segment-absent"
            data-cy="employee-todays-attendance-segment-absent"
          />
        </div>

        <div
          className="mt-3 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-gray-600"
          id="employee-todays-attendance-legend"
          data-cy="employee-todays-attendance-legend"
        >
          <div
            className="flex items-center gap-2"
            id="legend-on-time"
            data-cy="legend-on-time"
          >
            <MdFiberManualRecord size={12} className="text-green-500" />
            <span
              className="text-black/50 font-medium"
              data-cy="legend-on-time-text"
            >
              On Time {onTimeCount}
            </span>
          </div>
          <div
            className="flex items-center gap-2"
            id="legend-late"
            data-cy="legend-late"
          >
            <MdFiberManualRecord size={12} className="text-orange" />
            <span
              className="text-black/50 font-medium"
              data-cy="legend-late-text"
            >
              Late {lateCount}
            </span>
          </div>
          <div
            className="flex items-center gap-2"
            id="legend-absent"
            data-cy="legend-absent"
          >
            <MdFiberManualRecord size={12} className="text-red-500" />
            <span
              className="text-black/50 font-medium"
              data-cy="legend-absent-text"
            >
              Absent {absentCount}
            </span>
          </div>
        </div>
      </Spin>
    </Card>
  );
}
