/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useGetAdminPendingLeaveRequests } from '@/store/server/features/timesheet/dashboard/queries';
import { useGetAllCalendars } from '@/store/server/features/payroll/payroll/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import dayjs from 'dayjs';
import React, { useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

export default function EmployeeLeave() {
  const {
    userIdOnLeaveRequest,
    startDateOnLeaveRequest,
    endDateOnLeaveRequest,
    departmentOnLeaveRequest,
    leaveTypeOnLeaveRequest,
    leaveChartSelectedChip: selectedChip,
    setLeaveChartSelectedChip: setSelectedChip,
  } = TimeAndAttendaceDashboardStore();

  const { data: allCalendars } = useGetAllCalendars();

  const fiscalYears = useMemo(() => {
    const calendarsData =
      allCalendars?.items ||
      allCalendars?.data?.items ||
      allCalendars?.data ||
      allCalendars ||
      [];

    if (!Array.isArray(calendarsData)) return [];

    return calendarsData
      .map((calendar: any) => ({
        id: calendar?.id,
        name: calendar?.name || null,
        startDate: calendar?.startDate || null,
        endDate: calendar?.endDate || null,
        active: Boolean(calendar?.active || calendar?.isActive),
      }))
      .filter(
        (calendar: any) =>
          Boolean(calendar?.name) &&
          Boolean(calendar?.startDate) &&
          Boolean(calendar?.endDate),
      );
  }, [allCalendars]);

  const activeFiscalYear = useMemo(
    () => fiscalYears.find((fiscalYear: any) => fiscalYear.active) || null,
    [fiscalYears],
  );

  useEffect(() => {
    if (!selectedChip && activeFiscalYear?.name) {
      setSelectedChip(activeFiscalYear.name);
    }
  }, [activeFiscalYear, selectedChip, setSelectedChip]);

  const selectedFiscalYear = useMemo(
    () =>
      fiscalYears.find((fiscalYear: any) => fiscalYear.name === selectedChip) ||
      activeFiscalYear,
    [fiscalYears, selectedChip, activeFiscalYear],
  );

  const queryParams = useMemo(
    () => ({
      userId: userIdOnLeaveRequest || undefined,
      startDate:
        selectedFiscalYear?.startDate || startDateOnLeaveRequest || undefined,
      endDate:
        selectedFiscalYear?.endDate || endDateOnLeaveRequest || undefined,
      departmentId: departmentOnLeaveRequest || undefined,
      leaveTypeId: leaveTypeOnLeaveRequest || undefined,
    }),
    [
      userIdOnLeaveRequest,
      selectedFiscalYear,
      startDateOnLeaveRequest,
      endDateOnLeaveRequest,
      departmentOnLeaveRequest,
      leaveTypeOnLeaveRequest,
    ],
  );

  const { data: pendingLeaveRequests } =
    useGetAdminPendingLeaveRequests(queryParams);

  const leaveTypeColors = useMemo(() => {
    const colors: { [key: string]: string } =
      pendingLeaveRequests?.leaveTypeColors || {};
    return colors;
  }, [pendingLeaveRequests]);

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

      return {
        label: leaveType,
        data,
        backgroundColor: leaveTypeColors[leaveType] || '#1E40AF',
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
    <div
      className="border border-gray-200 rounded-lg p-4 bg-white"
      data-cy="employee-leave-card"
    >
      <div
        className="flex items-start justify-between gap-4 mb-3"
        data-cy="employee-leave-header-row"
      >
        <h3
          className="text-[16px] font-semibold text-black/90"
          data-cy="employee-leave-title"
        >
          Leave
        </h3>

        <div
          className="flex flex-wrap items-center gap-2 justify-end"
          id="employee-leave-fiscal-year-list"
          data-cy="employee-leave-fiscal-year-list"
        >
          {fiscalYears.map((fiscalYear: any) => (
            <button
              key={fiscalYear.id || fiscalYear.name}
              type="button"
              onClick={() => setSelectedChip(fiscalYear.name)}
              className={[
                'px-3 py-1 text-xs rounded border transition',
                selectedFiscalYear?.name === fiscalYear.name
                  ? 'bg-gray-100 text-gray-900 border-gray-300'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
              ].join(' ')}
              id={`employee-leave-fiscal-year-item-${fiscalYear.name}`}
              data-cy={`employee-leave-fiscal-year-item-${fiscalYear.name}`}
            >
              {fiscalYear.name}
            </button>
          ))}
        </div>
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
