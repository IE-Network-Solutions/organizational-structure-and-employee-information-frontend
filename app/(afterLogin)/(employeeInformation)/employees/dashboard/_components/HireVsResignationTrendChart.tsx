'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, DatePicker, Skeleton } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useGetHireResignationTrendWithTenant } from '@/store/server/features/employees/approval/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type Plugin,
} from 'chart.js';

const { RangePicker } = DatePicker;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const barBackgroundPlugin: Plugin<'bar'> = {
  id: 'barBackgroundPlugin',
  beforeDatasetsDraw(chart) {
    const yScale = chart.scales.y;
    if (!yScale) return;

    const zeroPixel = yScale.getPixelForValue(0);
    const maxFromOptions = (
      chart.options.scales?.y as { max?: number } | undefined
    )?.max;
    const maxValue =
      typeof maxFromOptions === 'number' ? maxFromOptions : yScale.max;
    const topPixel = yScale.getPixelForValue(maxValue);

    const targetIndexes = chart.data.datasets
      .map((dataset, index) => ({ label: dataset.label, index }))
      .filter(({ label }) => label === 'Hire' || label === 'Resignation')
      .map(({ index }) => index);

    const { ctx } = chart;
    ctx.save();
    ctx.fillStyle = '#F0F0F0';

    targetIndexes.forEach((datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((barElement) => {
        const { x, width } = barElement.getProps(['x', 'width'], true);
        const left = x - width / 2;
        const height = zeroPixel - topPixel;
        ctx.fillRect(left, topPixel, width, height);
      });
    });

    ctx.restore();
  },
};

export default function HireVsResignationTrendChart({
  'data-cy': dataCy = 'hire-vs-resignation-trend',
}: {
  'data-cy'?: string;
}) {
  const {
    hireResignationTrendRange,
    setHireResignationTrendRange,
    hireResignationTrendIsMobile: isMobile,
    setHireResignationTrendIsMobile: setIsMobile,
  } = TimeAndAttendaceDashboardStore();

  const range = useMemo<[Dayjs, Dayjs] | null>(() => {
    if (!hireResignationTrendRange) return null;
    const start = dayjs(hireResignationTrendRange[0]);
    const end = dayjs(hireResignationTrendRange[1]);
    if (!start.isValid() || !end.isValid()) return null;
    return [start, end];
  }, [hireResignationTrendRange]);

  const selectedStartDate = range?.[0]?.format('YYYY-MM-DD');
  const selectedEndDate = range?.[1]?.format('YYYY-MM-DD');

  const { data: trendData, isLoading } = useGetHireResignationTrendWithTenant({
    ...(selectedStartDate ? { startDate: selectedStartDate } : {}),
    ...(selectedEndDate ? { endDate: selectedEndDate } : {}),
  });
  const chartStartDate =
    selectedStartDate ?? dayjs().startOf('year').format('YYYY-MM-DD');
  const chartEndDate = selectedEndDate ?? dayjs().format('YYYY-MM-DD');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const handleViewportChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, [setIsMobile]);

  const chartRows = useMemo(() => {
    const raw = trendData as unknown;
    if (Array.isArray(raw)) return raw;
    if (
      raw &&
      typeof raw === 'object' &&
      Array.isArray((raw as { data?: unknown }).data)
    ) {
      return (raw as { data: unknown[] }).data;
    }
    return [];
  }, [trendData]);

  /** Build x-axis months from selected range, or from API rows when no range is selected. */
  const monthKeysAndLabels = useMemo(() => {
    const keys: string[] = [];

    if (selectedStartDate && selectedEndDate) {
      const start = dayjs(chartStartDate).startOf('month');
      const end = dayjs(chartEndDate).startOf('month');
      let cur = start;
      while (cur.isBefore(end) || cur.isSame(end, 'month')) {
        keys.push(cur.format('YYYY-MM'));
        cur = cur.add(1, 'month');
      }
    } else {
      const dataKeys = Array.from(
        new Set(
          chartRows
            .map((row) => {
              const item = row as Record<string, unknown>;
              const y = item.year;
              const m = item.month;
              if (y != null && m != null) {
                const year = Number(y);
                let monthNum = Number(m);
                if (!Number.isFinite(year) || !Number.isFinite(monthNum))
                  return null;
                if (monthNum >= 1 && monthNum <= 12) monthNum -= 1;
                return dayjs().year(year).month(monthNum).format('YYYY-MM');
              }
              const ym = item.yearMonth ?? item.period;
              if (typeof ym === 'string' && /^\d{4}-\d{2}/.test(ym)) {
                return ym.slice(0, 7);
              }
              return null;
            })
            .filter((monthKey): monthKey is string => Boolean(monthKey)),
        ),
      ).sort((a, b) => a.localeCompare(b));
      keys.push(...dataKeys);
    }

    if (keys.length === 0) {
      keys.push(dayjs(chartStartDate).format('YYYY-MM'));
    }
    const labels = keys.map((k) => dayjs(`${k}-01`).format('MMM'));
    return { monthKeys: keys, labels };
  }, [
    chartRows,
    chartStartDate,
    chartEndDate,
    selectedStartDate,
    selectedEndDate,
  ]);

  const rowMonthKey = useCallback(
    (item: Record<string, unknown>): string | null => {
      const y = item.year;
      const m = item.month;
      if (y != null && m != null) {
        const year = Number(y);
        let monthNum = Number(m);
        if (!Number.isFinite(year) || !Number.isFinite(monthNum)) return null;
        if (monthNum >= 1 && monthNum <= 12) monthNum -= 1;
        return dayjs().year(year).month(monthNum).format('YYYY-MM');
      }
      const ym = item.yearMonth ?? item.period;
      if (typeof ym === 'string' && /^\d{4}-\d{2}/.test(ym)) {
        return ym.slice(0, 7);
      }
      const labelish = item.month ?? item.monthName ?? item.label ?? item.name;
      if (labelish != null) {
        const parsed = dayjs(String(labelish));
        if (parsed.isValid()) return parsed.format('YYYY-MM');
      }
      return null;
    },
    [],
  );

  const hireResignForMonth = useCallback(
    (monthKey: string) => {
      let hire = 0;
      let resignation = 0;
      for (const row of chartRows) {
        const item = row as Record<string, unknown>;
        const rk = rowMonthKey(item);
        if (rk !== monthKey) continue;
        const hv = item.hire ?? item.hired ?? item.hireCount ?? item.hires;
        const rv =
          item.resignation ??
          item.resignations ??
          item.resignationCount ??
          item.resigned;
        const hn = Number(hv);
        const rn = Number(rv);
        if (Number.isFinite(hn)) hire += hn;
        if (Number.isFinite(rn)) resignation += rn;
      }
      return { hire, resignation };
    },
    [chartRows, rowMonthKey],
  );

  const chartData = useMemo(() => {
    const { monthKeys, labels } = monthKeysAndLabels;

    const hireByIndex = (() => {
      const out = monthKeys.map((key) => hireResignForMonth(key).hire);
      const hasMatch = chartRows.some(
        (row) => rowMonthKey(row as Record<string, unknown>) != null,
      );
      if (!hasMatch && chartRows.length === monthKeys.length) {
        return monthKeys.map((monthKey, i) => {
          const matchedIndex = chartRows.findIndex(
            (row) => rowMonthKey(row as Record<string, unknown>) === monthKey,
          );
          const item = chartRows[
            matchedIndex >= 0 ? matchedIndex : i
          ] as Record<string, unknown>;
          const v = item.hire ?? item.hired ?? item.hireCount ?? item.hires;
          const n = Number(v);
          return Number.isFinite(n) ? n : 0;
        });
      }
      return out;
    })();

    const resignationByIndex = (() => {
      const out = monthKeys.map((key) => hireResignForMonth(key).resignation);
      const hasMatch = chartRows.some(
        (row) => rowMonthKey(row as Record<string, unknown>) != null,
      );
      if (!hasMatch && chartRows.length === monthKeys.length) {
        return monthKeys.map((monthKey, i) => {
          const matchedIndex = chartRows.findIndex(
            (row) => rowMonthKey(row as Record<string, unknown>) === monthKey,
          );
          const item = chartRows[
            matchedIndex >= 0 ? matchedIndex : i
          ] as Record<string, unknown>;
          const v =
            item.resignation ??
            item.resignations ??
            item.resignationCount ??
            item.resigned;
          const n = Number(v);
          return Number.isFinite(n) ? n : 0;
        });
      }
      return out;
    })();

    return {
      labels,
      datasets: [
        {
          label: 'Hire',
          data: hireByIndex,
          backgroundColor: 'rgba(29, 78, 216, 0.95)',
          maxBarThickness: 17.29,
          barPercentage: 0.7,
          categoryPercentage: 0.7,
          borderSkipped: false,
          borderRadius: {
            topLeft: 100,
            topRight: 100,
            bottomLeft: 0,
            bottomRight: 0,
          },
        },
        {
          label: 'Resignation',
          data: resignationByIndex,
          backgroundColor: 'rgba(239, 68, 68, 0.95)',
          maxBarThickness: 17.29,
          barPercentage: 0.7,
          categoryPercentage: 0.7,
          borderSkipped: false,
          borderRadius: {
            topLeft: 100,
            topRight: 100,
            bottomLeft: 0,
            bottomRight: 0,
          },
        },
      ],
    };
  }, [chartRows, hireResignForMonth, monthKeysAndLabels, rowMonthKey]);

  const yAxisMax = useMemo(() => {
    const datasets = chartData.datasets;
    const all = [
      ...(datasets[0]?.data ?? []),
      ...(datasets[1]?.data ?? []),
    ] as number[];
    const peak = Math.max(0, ...all);
    if (peak === 0) return 100;
    return Math.ceil(peak / 25) * 25;
  }, [chartData]);

  const yAxisStep = useMemo(() => {
    const baseStep = Math.max(2, Math.ceil(yAxisMax / 6));
    return baseStep % 2 === 0 ? baseStep : baseStep + 1;
  }, [yAxisMax]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            boxWidth: isMobile ? 8 : 10,
            boxHeight: isMobile ? 8 : 10,
            padding: isMobile ? 8 : 10,
            font: {
              size: isMobile ? 11 : 12,
            },
          },
        },
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: yAxisMax,
          border: {
            display: true,
            color: '#D1D5DB',
            dash: [2, 4],
          },
          ticks: {
            stepSize: yAxisStep,
            font: {
              size: isMobile ? 10 : 12,
            },
          },
          grid: {
            color: '#D1D5DB',
            borderDash: [1, 6],
          },
        },
        x: {
          border: {
            display: true,
            color: '#D1D5DB',
            dash: [2, 4],
          },
          grid: {
            display: true,
            color: '#D1D5DB',
            borderDash: [1, 6],
          },
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: false,
            font: {
              size: isMobile ? 10 : 12,
            },
          },
        },
      },
    }),
    [isMobile, yAxisMax, yAxisStep],
  );

  return (
    <Card
      className="shadow-sm border border-gray-200 rounded-lg min-h-[355px] w-full h-full"
      bodyStyle={{ padding: 21 }}
      id="hire-vs-resignation-trend-card"
      data-cy={dataCy}
    >
      <div
        className="mb-2 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start sm:gap-4"
        id="hire-vs-resignation-trend-header"
        data-cy="hire-vs-resignation-trend-header"
      >
        <div data-cy="hire-vs-resignation-trend-title-wrap">
          <h3
            className="text-[16px] font-bold  text-gray-900"
            data-cy="hire-vs-resignation-trend-title"
          >
            Hire vs Resignation Trend
          </h3>
        </div>

        <RangePicker
          value={range}
          onChange={(dates) =>
            setHireResignationTrendRange(
              dates && dates[0] && dates[1]
                ? [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]
                : null,
            )
          }
          className="h-9 w-full sm:w-auto"
          id="hire-vs-resignation-trend-date-range"
          data-cy="hire-vs-resignation-trend-date-range"
        />
      </div>

      <div
        className="h-[220px] sm:h-[330px]"
        id="hire-vs-resignation-trend-chart-wrapper"
        data-cy="hire-vs-resignation-trend-chart-wrapper"
      >
        {isLoading ? (
          <div
            className="flex h-full items-center justify-center"
            data-cy="hire-vs-resignation-trend-loading"
          >
            <Skeleton active />
          </div>
        ) : (
          <Bar
            options={options as any}
            data={chartData as any}
            plugins={[barBackgroundPlugin]}
            id="hire-vs-resignation-trend-chart"
            data-cy="hire-vs-resignation-trend-chart"
            style={{
              opacity: 1,
              transform: 'rotate(0deg)',
              width: '100%',
              height: '100%',
            }}
          />
        )}
      </div>
    </Card>
  );
}
