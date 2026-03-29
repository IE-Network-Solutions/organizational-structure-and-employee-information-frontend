'use client';

import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type Plugin,
} from 'chart.js';
import { FeedbackCardSkeleton } from './PerformanceCardSkeletons';
import { useGetFeedbackStatsDashboard } from '@/store/server/features/performance/feedback-stats/queries';
import { useGetActiveMonth } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useGetActiveSession } from '@/store/server/features/okrplanning/okr/target/queries';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Colored glow under the line (soft drop shadow), tinted per dataset. */
const lineGlowPlugin: Plugin<'line'> = {
  id: 'feedbackLineGlow',
  beforeDatasetDraw(chart, args) {
    const { ctx } = chart;
    const ds = chart.data.datasets[args.index];
    const lineColor =
      typeof ds.borderColor === 'string' ? ds.borderColor : '#1D4ED8';
    ctx.save();
    ctx.shadowColor = hexToRgba(lineColor, 0.45);
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;
  },
  afterDatasetDraw(chart) {
    chart.ctx.restore();
  },
};

const dottedGrid = {
  display: true,
  drawOnChartArea: true,
  color: 'rgba(148, 163, 184, 0.55)',
  lineWidth: 1,
  borderDash: [4, 4],
};

const baseLineOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: { top: 6, right: 12, bottom: 4, left: 6 },
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'bottom',
      align: 'center',
      labels: {
        color: '#6B7280',
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family:
            'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        },
        generateLabels(chart) {
          const { data } = chart;
          if (!data.datasets.length) return [];
          return data.datasets.map((dataset, i) => {
            const stroke =
              typeof dataset.borderColor === 'string'
                ? dataset.borderColor
                : '#6B7280';
            return {
              text: dataset.label ?? '',
              fillStyle: '#FFFFFF',
              strokeStyle: stroke,
              lineWidth: 2,
              lineDash: [] as number[],
              hidden: !chart.isDatasetVisible(i),
              index: i,
              datasetIndex: i,
              pointStyle: 'circle' as const,
            };
          });
        },
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    x: {
      offset: true,
      grid: {
        ...dottedGrid,
      },
      border: {
        display: true,
        color: '#E5E7EB',
        dash: [4, 4],
        dashOffset: 0,
      },
      ticks: {
        color: '#6B7280',
        font: { size: 12 },
      },
    },
    y: {
      min: 0,
      ticks: {
        color: '#6B7280',
        font: { size: 12 },
      },
      grid: {
        ...dottedGrid,
      },
      border: {
        display: false,
        dash: [4, 4],
        dashOffset: 0,
      },
    },
  },
};

function StatBlock({
  title,
  total,
  totalClass,
  kpi = 0,
  engagement = 0,
}: {
  title: string;
  total: number;
  totalClass: string;
  kpi?: number;
  engagement?: number;
}) {
  return (
    <div className="flex min-h-[95px] flex-1 items-center rounded-xl border border-gray-200 bg-white px-5 py-4">
      <div className="flex w-[44%] min-w-0 shrink-0 flex-col justify-center pr-4">
        <p className="text-sm text-black/45 font-normal">{title}</p>
        <p className={`mt-1 text-3xl font-bold leading-tight ${totalClass}`}>
          {total}
        </p>
      </div>
      <div className="grid min-h-[66px] min-w-0 flex-1 grid-cols-2 items-center border-l border-gray-200 pl-5">
        <div className="flex flex-col justify-center">
          <span className="text-sm text-black/45 font-normal">KPI</span>
          <p className="mt-1 text-xl font-bold text-gray-900">{kpi}</p>
        </div>
        <div className="flex flex-col justify-center pl-4">
          <span className="text-sm text-black/45 font-normal">Engagement</span>
          <p className="mt-1 text-xl font-bold text-gray-900">{engagement}</p>
        </div>
      </div>
    </div>
  );
}

type FeedbackCardProps = {
  sessionId?: string | null;
  monthId?: string | null;
};

export default function FeedbackCard({
  sessionId: sessionIdProp,
  monthId: monthIdProp,
}: FeedbackCardProps) {
  const { data: activeSession, isLoading: activeSessionLoading } =
    useGetActiveSession();
  const { data: activeMonth, isLoading: activeMonthLoading } =
    useGetActiveMonth();

  const resolvedSessionId =
    sessionIdProp ??
    (activeSession as { id?: string } | undefined)?.id ??
    undefined;
  const resolvedMonthId =
    monthIdProp ?? (activeMonth as { id?: string } | undefined)?.id ?? undefined;

  const { data, isLoading: statsLoading, isError } = useGetFeedbackStatsDashboard(
    resolvedSessionId,
    resolvedMonthId,
  );

  const contextLoading =
    (sessionIdProp == null && activeSessionLoading) ||
    (monthIdProp == null && activeMonthLoading);
  const showSpinner =
    contextLoading || (Boolean(resolvedSessionId && resolvedMonthId) && statsLoading);

  const summary = data?.summary;
  const series = data?.series ?? [];

  const { chartYMax, yTickStep } = useMemo(() => {
    if (!series.length) return { chartYMax: 100, yTickStep: 20 };
    const peak = Math.max(
      ...series.flatMap((p) => [p.appreciation, p.reprimand]),
      0,
    );
    if (peak === 0) return { chartYMax: 100, yTickStep: 20 };
    const padded = Math.ceil(peak / 20) * 20;
    const chartYMax = Math.max(100, padded);
    const yTickStep = 20;
    return { chartYMax, yTickStep };
  }, [series]);

  const lineChartOptions = useMemo(
    () =>
      ({
        ...baseLineOptions,
        scales: {
          ...baseLineOptions.scales,
          y: {
            ...baseLineOptions.scales?.y,
            max: chartYMax,
            ticks: {
              ...baseLineOptions.scales?.y?.ticks,
              stepSize: yTickStep,
            },
          },
        },
      }) as ChartOptions<'line'>,
    [chartYMax, yTickStep],
  );

  const lineChartData = useMemo(
    () => ({
      labels: series.map((p) => p.label),
      datasets: [
        {
          label: 'Appreciation',
          data: series.map((p) => p.appreciation),
          borderColor: '#1D4ED8',
          backgroundColor: '#FFFFFF',
          tension: 0,
          borderWidth: 2.5,
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 6,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#1D4ED8',
          pointBorderWidth: 2,
        },
        {
          label: 'Reprimand',
          data: series.map((p) => p.reprimand),
          borderColor: '#FB7185',
          backgroundColor: '#FFFFFF',
          tension: 0,
          borderWidth: 2.5,
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 6,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#FB7185',
          pointBorderWidth: 2,
        },
      ],
    }),
    [series],
  );

  const missingContext =
    !resolvedSessionId || !resolvedMonthId
      ? 'Active session or month is not available.'
      : null;

  return (
    <section
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm h-[456px]"
      data-cy="performance-feedback-card"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Feedback</h2>

      {showSpinner ? (
        <FeedbackCardSkeleton />
      ) : missingContext ? (
        <p className="text-sm text-gray-500">{missingContext}</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Failed to load feedback stats.</p>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <StatBlock
              title="Total Appreciation"
              total={summary?.totalAppreciation ?? 0}
              totalClass="text-blue"
              kpi={summary?.appreciation?.kpi}
              engagement={summary?.appreciation?.engagement}
            />
            <StatBlock
              title="Total Reprimand"
              total={summary?.totalReprimand ?? 0}
              totalClass="text-red-400"
              kpi={summary?.reprimand?.kpi}
              engagement={summary?.reprimand?.engagement}
            />
          </div>

          <div className="h-[247px] w-full">
            {series.length > 0 ? (
              <Line
                data={lineChartData}
                options={lineChartOptions}
                plugins={[lineGlowPlugin]}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                No trend data for this period.
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
