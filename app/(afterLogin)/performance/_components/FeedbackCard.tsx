'use client';
/* eslint-disable local-rules/data-cy-required */

import React, { useEffect, useMemo, useState } from 'react';
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
import { Select } from 'antd';
import { FeedbackCardSkeleton } from './PerformanceCardSkeletons';
import { useGetFeedbackStatsDashboard } from '@/store/server/features/performance/feedback-stats/queries';
import { useGetActiveMonth } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useGetActiveSession } from '@/store/server/features/okrplanning/okr/target/queries';
import { MdOutlineStar, MdReportGmailerrorred } from 'react-icons/md';

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
        color: '#374151',
        usePointStyle: true,
        boxWidth: 8,
        boxHeight: 8,
        padding: 24,
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
              fillStyle: stroke,
              strokeStyle: stroke,
              lineWidth: 0,
              lineDash: [] as number[],
              hidden: !chart.isDatasetVisible(i),
              index: i,
              datasetIndex: i,
              pointStyle: 'rectRounded' as const,
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
      <div className="flex w-[48%] min-w-0 shrink-0 flex-col justify-center pr-4">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 flex items-center justify-center rounded-[4px] ${title==='Total Appreciation' ? 'text-greenbg bg-greenlight' : 'text-errorbg  bg-errorlight '}`}>
            {title==='Total Appreciation' ? <MdOutlineStar size={16}/> : <MdReportGmailerrorred size={16}/>}
            </div>
        <p className="text-sm text-black/45 font-normal">{title}</p>
        </div>
        <p className={`mt-1 text-3xl font-bold leading-tight ${totalClass}`}>
          {total}
        </p>
      </div>
      <div className="grid min-h-[66px] min-w-0 flex-1 grid-cols-2 items-center border-l border-gray-200 pl-5">
        <div className="flex flex-col justify-center">
          <span className="text-sm text-black/45 font-normal">KPI</span>
          <p className="mt-1 text-xl font-bold text-gray-900">{kpi}</p>
        </div>
        <div className="flex flex-col justify-center md:pl-4 pl-0">
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
  monthOptions?: Array<{ id: string; name?: string | null; active?: boolean }>;
  onMonthChange?: (monthId: string) => void;
};

export default function FeedbackCard({
  sessionId: sessionIdProp,
  monthId: monthIdProp,
  monthOptions,
}: FeedbackCardProps) {
  const { data: activeSession, isLoading: activeSessionLoading } =
    useGetActiveSession();
  const { data: activeMonth, isLoading: activeMonthLoading } =
    useGetActiveMonth();

  const [isMonthListOpen, setIsMonthListOpen] = useState(false);
  const [selectedMonthIdLocal, setSelectedMonthIdLocal] = useState<
    string | null
  >(() => {
    const last = monthOptions?.length
      ? monthOptions[monthOptions.length - 1]
      : null;
    return last?.id ? String(last.id) : null;
  });

  useEffect(() => {
    if (sessionIdProp == null) return;
    if (!monthOptions?.length) return;

    const last = monthOptions[monthOptions.length - 1];
    if (last?.id) setSelectedMonthIdLocal(String(last.id));
    setIsMonthListOpen(false);
  }, [sessionIdProp, monthOptions?.length]);

  const orderedMonthsForUi = useMemo(() => {
    const months = monthOptions ?? [];
    if (!months.length) return [];
    const activeId =
      selectedMonthIdLocal ??
      (activeMonth && 'id' in activeMonth ? String(activeMonth.id) : null);
    if (!activeId) return months;

    return [
      ...months.filter((m) => String(m.id) === activeId),
      ...months.filter((m) => String(m.id) !== activeId),
    ];
  }, [monthOptions, activeMonth, selectedMonthIdLocal]);

  const resolvedMonthIdForUi = useMemo(() => {
    if (selectedMonthIdLocal) return String(selectedMonthIdLocal);
    if (activeMonth && 'id' in activeMonth)
      return String((activeMonth as any).id);
    return null;
  }, [selectedMonthIdLocal, activeMonth]);

  useEffect(() => {
    if (selectedMonthIdLocal) return;
    if ((monthOptions?.length ?? 0) > 0) return;
    if (!activeMonthLoading) {
      const id = (activeMonth as { id?: string } | undefined)?.id;
      if (id) setSelectedMonthIdLocal(String(id));
    }
  }, [activeMonthLoading, activeMonth, selectedMonthIdLocal, monthOptions]);

  useEffect(() => {
    if (!selectedMonthIdLocal) return;
    const exists = (monthOptions ?? []).some(
      (m) => String(m.id) === String(selectedMonthIdLocal),
    );
    if (!exists) setSelectedMonthIdLocal(null);
  }, [monthOptions, selectedMonthIdLocal]);

  const selectedMonthName = useMemo(() => {
    if (!resolvedMonthIdForUi) return null;
    const match = orderedMonthsForUi.find(
      (m) => String(m.id) === resolvedMonthIdForUi,
    );
    return match?.name ?? null;
  }, [orderedMonthsForUi, resolvedMonthIdForUi]);

  const resolvedSessionId =
    sessionIdProp ??
    (activeSession as { id?: string } | undefined)?.id ??
    undefined;

  const lastMonthIdFromOptions = monthOptions?.length
    ? String(monthOptions[monthOptions.length - 1].id)
    : null;

  const hasMonthOptionsProp = monthOptions !== undefined;

  // IMPORTANT:
  // - If `monthOptions` is provided, the backend expects the month to belong
  //   to the selected session.
  // - So we must not fall back to `activeMonth.id` when monthOptions is empty
  //   or when we don't have a valid month from monthOptions yet.
  const resolvedMonthId =
    selectedMonthIdLocal ??
    monthIdProp ??
    lastMonthIdFromOptions ??
    (hasMonthOptionsProp
      ? undefined
      : (activeMonth as { id?: string } | undefined)?.id);

  const {
    data,
    isLoading: statsLoading,
    isError,
  } = useGetFeedbackStatsDashboard(resolvedSessionId, resolvedMonthId);

  const contextLoading =
    (sessionIdProp == null && activeSessionLoading) ||
    (resolvedMonthId == null && activeMonthLoading);
  const showSpinner =
    contextLoading ||
    (Boolean(resolvedSessionId && resolvedMonthId) && statsLoading);

  const summary = data?.summary;
  const series = useMemo(() => data?.series ?? [], [data?.series]);

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
          backgroundColor: 'transparent',
          tension: 0,
          borderWidth: 1.2,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 4.2,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#1D4ED8',
          pointBorderWidth: 2,
        },
        {
          label: 'Reprimand',
          data: series.map((p) => p.reprimand),
          borderColor: '#FF7875',
          backgroundColor: 'transparent',
          tension: 0,
          borderWidth: 1.2,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 4.2,
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
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm min-h-[477px]"
      data-cy="performance-feedback-card"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Feedback</h2>

        {orderedMonthsForUi.length > 0 && (
          <>
            <Select
              id="performance-feedback-month-select"
              data-cy="performance-feedback-month-select"
              className="block sm:hidden w-[150px]"
              size="small"
              placeholder="Select Month"
              value={resolvedMonthIdForUi ?? undefined}
              onChange={(value) => {
                setIsMonthListOpen(false);
                setSelectedMonthIdLocal(String(value));
              }}
              options={orderedMonthsForUi.map((m) => ({
                value: String(m.id),
                label: m.name ?? String(m.id),
              }))}
            />

            {!isMonthListOpen && (
              <button
                type="button"
                onClick={() => setIsMonthListOpen(true)}
                aria-expanded={isMonthListOpen}
                aria-controls="performance-feedback-month-items"
                className="hidden sm:block px-3 py-1 text-xs rounded border transition bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-50"
                id="performance-feedback-month-active-toggle"
                data-cy="performance-feedback-month-active-toggle"
              >
                {selectedMonthName ??
                  (activeMonth as { name?: string } | undefined)?.name ??
                  'Select Month'}
              </button>
            )}

            {isMonthListOpen && (
              <div
                id="performance-feedback-month-items"
                data-cy="performance-feedback-month-items"
                className="hidden sm:flex flex-nowrap items-center gap-2 justify-end overflow-x-auto"
              >
                {orderedMonthsForUi.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setIsMonthListOpen(false);
                      setSelectedMonthIdLocal(String(m.id));
                    }}
                    className={[
                      'px-3 py-1 text-xs rounded border transition flex-shrink-0',
                      resolvedMonthIdForUi === String(m.id)
                        ? 'bg-gray-100 text-gray-900 border-gray-300'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                    ].join(' ')}
                    id={`performance-feedback-month-item-${m.name ?? m.id}`}
                    data-cy={`performance-feedback-month-item-${m.name ?? m.id}`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

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

          <div className="h-[268px] w-full">
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
