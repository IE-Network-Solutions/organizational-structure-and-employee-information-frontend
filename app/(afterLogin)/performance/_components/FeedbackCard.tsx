'use client';

import React from 'react';
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

/** Colored glow: shadow tint matches each dataset's line color (not a neutral gray). */
const lineGlowPlugin: Plugin<'line'> = {
  id: 'feedbackLineGlow',
  beforeDatasetDraw(chart, args) {
    const { ctx } = chart;
    const ds = chart.data.datasets[args.index];
    const lineColor =
      typeof ds.borderColor === 'string' ? ds.borderColor : '#2563EB';
    ctx.save();
    ctx.shadowColor = hexToRgba(lineColor, 0.55);
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
  },
  afterDatasetDraw(chart) {
    chart.ctx.restore();
  },
};

const lineData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Appreciation',
      data: [98, 26, 26, 11],
      borderColor: '#2563EB',
      backgroundColor: '#FFFFFF',
      tension: 0.35,
      borderWidth: 2,
      fill: false,
      pointRadius: 5,
      pointHoverRadius: 6,
      pointBackgroundColor: '#FFFFFF',
      pointBorderColor: '#2563EB',
      pointBorderWidth: 2,
    },
    {
      label: 'Reprimand',
      data: [56, 89, 64, 80],
      borderColor: '#F87171',
      backgroundColor: '#FFFFFF',
      tension: 0.35,
      borderWidth: 2,
      fill: false,
      pointRadius: 5,
      pointHoverRadius: 6,
      pointBackgroundColor: '#FFFFFF',
      pointBorderColor: '#F87171',
      pointBorderWidth: 2,
    },
  ],
};

const lineOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
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
              fillStyle: stroke,
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
      grid: {
        display: true,
        drawOnChartArea: true,
        color: 'rgba(0, 0, 0, 0.08)',
      },
      border: {
        display: true,
        color: '#E5E7EB',
        width: 1,
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
      max: 100,
      ticks: {
        stepSize: 20,
        color: '#6B7280',
        font: { size: 12 },
      },
      grid: {
        display: true,
        drawOnChartArea: true,
        color: 'rgba(0, 0, 0, 0.08)',
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
  kpi = 120,
  engagement = 120,
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

export default function FeedbackCard() {
  return (
    <section
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm h-[456px]"
      data-cy="performance-feedback-card"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Feedback</h2>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <StatBlock
          title="Total Appreciation"
          total={120}
          totalClass="text-blue"
        />
        <StatBlock
          title="Total Reprimand"
          total={120}
          totalClass="text-red-400"
        />
      </div>

      <div className="h-[247px] w-full">
        <Line
          data={lineData}
          options={lineOptions}
          plugins={[lineGlowPlugin]}
        />
      </div>
    </section>
  );
}
