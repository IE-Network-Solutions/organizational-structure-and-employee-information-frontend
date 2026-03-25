'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, DatePicker, Spin } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useGetHireResignationTrendWithTenant } from '@/store/server/features/employees/approval/queries';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
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

export default function HireVsResignationTrendChart({
  'data-cy': dataCy = 'hire-vs-resignation-trend',
}: {
  'data-cy'?: string;
}) {
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const startDate =
    range?.[0]?.format('YYYY-MM-DD') ??
    dayjs().startOf('year').format('YYYY-MM-DD');
  const endDate =
    range?.[1]?.format('YYYY-MM-DD') ?? dayjs().format('YYYY-MM-DD');

  const { data: trendData, isLoading } = useGetHireResignationTrendWithTenant({
    startDate,
    endDate,
  });

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
  }, []);

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

  /** One calendar month per tick from startDate through endDate (e.g. Aug 24–Aug 31 → Aug 2025). */
  const monthKeysAndLabels = useMemo(() => {
    const start = dayjs(startDate).startOf('month');
    const end = dayjs(endDate).startOf('month');
    const keys: string[] = [];
    let cur = start;
    while (cur.isBefore(end) || cur.isSame(end, 'month')) {
      keys.push(cur.format('YYYY-MM'));
      cur = cur.add(1, 'month');
    }
    if (keys.length === 0) {
      keys.push(dayjs(startDate).format('YYYY-MM'));
    }
    const labels = keys.map((k) => dayjs(`${k}-01`).format('MMM YYYY'));
    return { monthKeys: keys, labels };
  }, [startDate, endDate]);

  const rowMonthKey = (item: Record<string, unknown>): string | null => {
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
  };

  const hireResignForMonth = (monthKey: string) => {
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
  };

  const chartData = useMemo(() => {
    const { monthKeys, labels } = monthKeysAndLabels;

    const hireByIndex = (() => {
      const out = monthKeys.map((key) => hireResignForMonth(key).hire);
      const hasMatch = chartRows.some(
        (row) => rowMonthKey(row as Record<string, unknown>) != null,
      );
      if (!hasMatch && chartRows.length === monthKeys.length) {
        return monthKeys.map((unusedValue, i) => {
          const item = chartRows[i] as Record<string, unknown>;
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
        return monthKeys.map((unusedValue, i) => {
          const item = chartRows[i] as Record<string, unknown>;
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
          backgroundColor: '#1D4ED8',
          borderRadius: {
            topLeft: 25,
            topRight: 25,
            bottomLeft: 0,
            bottomRight: 0,
          },
        },
        {
          label: 'Resignation',
          data: resignationByIndex,
          backgroundColor: '#EF4444',
          borderRadius: {
            topLeft: 25,
            topRight: 25,
            bottomLeft: 0,
            bottomRight: 0,
          },
        },
      ],
    };
  }, [chartRows, monthKeysAndLabels, hireResignForMonth]);

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
          ticks: {
            stepSize: Math.max(5, Math.ceil(yAxisMax / 4)),
            font: {
              size: isMobile ? 10 : 12,
            },
          },
          grid: {
            color: '#E5E7EB',
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: isMobile,
            maxTicksLimit: isMobile ? 6 : 12,
            font: {
              size: isMobile ? 10 : 12,
            },
          },
        },
      },
    }),
    [isMobile, yAxisMax],
  );

  return (
    <Card
      className="shadow-sm border border-gray-200 rounded-lg min-h-[355px] w-full h-full"
      bodyStyle={{ padding: 16 }}
      id="hire-vs-resignation-trend-card"
      data-cy={dataCy}
    >
      <div
        className="mb-2 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start sm:gap-4"
        id="hire-vs-resignation-trend-header"
        data-cy="hire-vs-resignation-trend-header"
      >
        <div data-cy="hire-vs-resignation-trend-title-wrapper">
          <h3
            className="text-[16px] font-semibold text-gray-900"
            data-cy="hire-vs-resignation-trend-title"
          >
            Hire vs Resignation Trend
          </h3>
        </div>

        <RangePicker
          value={range}
          onChange={(dates) =>
            setRange(
              dates && dates[0] && dates[1] ? [dates[0], dates[1]] : null,
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
            <Spin size="large" />
          </div>
        ) : (
          <Bar
            options={options as any}
            data={chartData as any}
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
