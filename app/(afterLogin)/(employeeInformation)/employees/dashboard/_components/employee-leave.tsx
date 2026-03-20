/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useGetAdminPendingLeaveRequests } from '@/store/server/features/timesheet/dashboard/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import dayjs from 'dayjs';
import randomColor from 'random-color';
import React, { useMemo, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';

type Period = 'Day' | 'Month' | 'Year' | 'Custom';

export default function EmployeeLeave() {
  const {
    userIdOnLeaveRequest,
    startDateOnLeaveRequest,
    endDateOnLeaveRequest,
    departmentOnLeaveRequest,
    leaveTypeOnLeaveRequest,
  } = TimeAndAttendaceDashboardStore();

  const [period, setPeriod] = useState<Period | null>(null);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [displayPeriod, setDisplayPeriod] = useState<Period | null>(null);
  const [chipsAnim, setChipsAnim] = useState<'in' | 'out'>('in');
  const animTimerRef = useRef<number | null>(null);

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
  const yearChips = Array.from(
    { length: 2026 - 2016 + 1 },
    (_, i) => String(2016 + i),
  );

  const queryParams = useMemo(
    () => ({
      userId: userIdOnLeaveRequest || undefined,
      startDate: startDateOnLeaveRequest || undefined,
      endDate: endDateOnLeaveRequest || undefined,
      departmentId: departmentOnLeaveRequest || undefined,
      leaveTypeId: leaveTypeOnLeaveRequest || undefined,
    }),
    [
      userIdOnLeaveRequest,
      startDateOnLeaveRequest,
      endDateOnLeaveRequest,
      departmentOnLeaveRequest,
      leaveTypeOnLeaveRequest,
    ],
  );

  const { data: pendingLeaveRequests } =
    useGetAdminPendingLeaveRequests(queryParams);

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
      setDisplayPeriod(p);
      setChipsAnim('in');
    }
  };

  const generateRandomColor = () => randomColor().hexString();
  const leaveTypeColors = useMemo(() => {
    const colors: { [key: string]: string } = {};
    return colors;
  }, []);

  const barData = useMemo(() => {
    const graphData = pendingLeaveRequests?.monthlyStats || [];

    const allMonths = Array.from({ length: 12 }, (notused, index) =>
      dayjs().month(index).format('MMM'),
    );

    const allLeaveTypes =
      graphData.length > 0 ? Object.keys(graphData[0].leaveTypes) : [];

    const monthDataMap = graphData.reduce((acc: any, item: any) => {
      acc[item.month] = item.leaveTypes;
      return acc;
    }, {});

    const datasets = allLeaveTypes.map((leaveType) => {
      const data = allMonths.map(
        (monthLabel) => monthDataMap[monthLabel]?.[leaveType] || 0,
      );

      if (!leaveTypeColors[leaveType]) {
        leaveTypeColors[leaveType] = generateRandomColor();
      }

      return {
        label: leaveType,
        data,
        backgroundColor: leaveTypeColors[leaveType],
        stack: 'leave',
        barThickness: 12,
      };
    });

    return {
      labels: allMonths,
      datasets,
    };
  }, [pendingLeaveRequests, leaveTypeColors]);

  const barOptions = useMemo(() => {
    let maxY = 100;
    if (pendingLeaveRequests?.monthlyStats) {
      const maxCount = Math.max(
        ...pendingLeaveRequests.monthlyStats.map((item: any) => item.count),
      );
      maxY = Math.ceil(maxCount * 1.2) || 10;
    }

    return {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 8,
            boxHeight: 8,
          },
        },
        datalabels: { display: false },
        title: {
          display: false,
          text: 'Leave Distribution',
        },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: false,
          },
          grid: {
            borderDash: [5, 5],
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          max: maxY,
          width: 5,
          grid: {
            borderDash: [5, 5],
          },
        },
      },
    };
  }, [pendingLeaveRequests]);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-[24px] font-semibold text-[#111827]">Leave</h3>

        {displayPeriod == null ? (
          <div
            className="inline-flex items-center overflow-hidden"
            id="employee-leave-period-pill-group"
            data-cy="employee-leave-period-pill-group"
            role="tablist"
            aria-label="Leave period"
          >
            {(['Day', 'Month', 'Year', 'Custom'] as Period[]).map((p) => {
              const isActive = p === period;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePeriodPillClick(p)}
                  className={[
                    'px-3 py-1 text-xs font-medium transition',
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-white text-gray-500 hover:bg-gray-50',
                  ].join(' ')}
                  id={`employee-leave-period-${p}`}
                  data-cy={`employee-leave-period-${p}`}
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
            id="employee-leave-period-chips"
            data-cy="employee-leave-period-chips"
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
                  id={`employee-leave-chip-day-${d}`}
                  data-cy={`employee-leave-chip-day-${d}`}
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
                  id={`employee-leave-chip-month-${m}`}
                  data-cy={`employee-leave-chip-month-${m}`}
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
                  id={`employee-leave-chip-year-${y}`}
                  data-cy={`employee-leave-chip-year-${y}`}
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
                id="employee-leave-chip-clear"
                data-cy="employee-leave-chip-clear"
              >
                X
              </button>
            )}

            {displayPeriod === 'Custom' && (
              <div
                className="text-xs text-gray-500"
                id="employee-leave-custom-placeholder"
                data-cy="employee-leave-custom-placeholder"
              >
                Custom range
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{ height: 320, width: '100%' }}
        id="time-attendance-leave-request-chart-container-div"
        data-cy="time-attendance-leave-request-chart-container-div"
      >
        <Bar
          data={barData}
          options={{ ...barOptions, maintainAspectRatio: false } as any}
          id="time-attendance-leave-request-chart-view-bar"
          data-cy="time-attendance-leave-request-chart-view-bar"
        />
      </div>
    </div>
  );
}
