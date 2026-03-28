'use client';

import React, { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions, Plugin } from 'chart.js';
import { Card, Tag } from 'antd';
import { useDashboardPayrollStore } from '@/store/uistate/features/payroll/dashboardPayroll';

const variablePayLineShadowPlugin: Plugin<'line'> = {
  id: 'variablePayLineShadow',
  beforeDatasetsDraw: (chart) => {
    const chartType = (chart.config as { type?: string }).type;
    if (chartType !== 'line') return;
    const { ctx } = chart;
    ctx.save();
    ctx.shadowColor = 'rgba(139, 92, 246, 0.45)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
  },
  afterDatasetsDraw: (chart) => {
    const chartType = (chart.config as { type?: string }).type;
    if (chartType !== 'line') return;
    chart.ctx.restore();
  },
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  variablePayLineShadowPlugin,
);

const MONTHS = [
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

/** Stack bottom → top; Benefit / Allowance colors per design reference. */
const SERIES = {
  allowance: { label: 'Allowance', color: '#61dafb', value: 70 },
  benefit: { label: 'Benefit', color: '#ffb761', value: 75 },
  incentive: { label: 'Incentive', color: '#9B8CFF', value: 45 },
  netPay: { label: 'Net Pay', color: '#2563EB', value: 25 },
  grossPay: { label: 'Gross Pay', color: '#60A5FA', value: 25 },
} as const;

const LEGEND_ORDER = [
  SERIES.allowance.label,
  SERIES.benefit.label,
  SERIES.incentive.label,
  SERIES.netPay.label,
  SERIES.grossPay.label,
] as const;

const LEGEND_ITEMS = LEGEND_ORDER.map((label) => {
  const entry = Object.values(SERIES).find((s) => s.label === label)!;
  return { label, color: entry.color };
});

const STACK_ORDER: (keyof typeof SERIES)[] = [
  'benefit',
  'incentive',
  'allowance',
  'netPay',
  'grossPay',
];

/** Mock monthly variable pay (0–100 scale) — replace with API when available. */
const VARIABLE_PAY_VALUES = [48, 88, 32, 100, 23, 51, 56, 68, 23, 76, 18, 29];

export default function Graph({
  'data-cy': dataCy = 'payroll-dashboard-graph',
}: {
  'data-cy'?: string;
}) {
  const salaryChartView = useDashboardPayrollStore((s) => s.salaryChartView);
  const setSalaryChartView = useDashboardPayrollStore(
    (s) => s.setSalaryChartView,
  );

  const barData = useMemo(
    () => ({
      labels: MONTHS,
      datasets: STACK_ORDER.map((key) => ({
        label: SERIES[key].label,
        data: MONTHS.map(() => SERIES[key].value),
        backgroundColor: SERIES[key].color,
        borderWidth: 0,
        borderRadius: 0,
      })),
    }),
    [],
  );

  const barOptions: ChartOptions<'bar'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 2, right: 4, bottom: 0, left: 0 },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      datasets: {
        bar: {
          barPercentage: 0.4,
          categoryPercentage: 0.55,
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: {
            display: true,
            color: '#E5E7EB',
            borderDash: [4, 4],
          },
          ticks: {
            font: { size: 9 },
            maxRotation: 0,
          },
        },
        y: {
          stacked: true,
          min: 0,
          max: 300,
          ticks: {
            stepSize: 50,
            font: { size: 9 },
            padding: 4,
          },
          grid: {
            color: '#E5E7EB',
            borderDash: [4, 4],
          },
        },
      },
    }),
    [],
  );

  const lineData = useMemo(
    () => ({
      labels: MONTHS,
      datasets: [
        {
          label: 'Total Variable Pay',
          data: VARIABLE_PAY_VALUES,
          borderColor: '#A78BFA',
          backgroundColor: 'rgba(167, 139, 250, 0.12)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#8B5CF6',
          pointBorderWidth: 2,
          pointHoverRadius: 5,
        },
      ],
    }),
    [],
  );

  const lineOptions: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 4, right: 4, bottom: 0, left: 0 },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        x: {
          grid: {
            color: '#E5E7EB',
            borderDash: [3, 3],
          },
          ticks: {
            font: { size: 9 },
            maxRotation: 0,
          },
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            font: { size: 9 },
            padding: 4,
          },
          grid: {
            color: '#E5E7EB',
            borderDash: [3, 3],
          },
        },
      },
    }),
    [],
  );

  const title =
    salaryChartView === 'salary-breakdown' ? 'Salary' : 'Total Variable Pay';

  return (
    <Card
      className="rounded-lg border border-gray-200 shadow-sm"
      styles={{ body: { padding: '10px 12px 12px' } }}
      data-cy={dataCy}
    >
      <div
        className="mb-2 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:items-center sm:justify-between"
        data-cy={`${dataCy}-header`}
      >
        <h3
          className="text-base font-semibold text-gray-900"
          data-cy={`${dataCy}-title`}
        >
          {title}
        </h3>
        <div
          className="inline-flex items-center gap-1"
          data-cy={`${dataCy}-toggle`}
          role="group"
          aria-label="Salary breakdown or variable pay"
        >
          <Tag
            bordered
            onClick={() => setSalaryChartView('salary-breakdown')}
            className="m-0 cursor-pointer border border-solid text-xs opacity-100 transition-colors"
            style={{
              margin: 0,
              height: 22,
              minWidth: 104,
              lineHeight: '20px',
              paddingTop: 1,
              paddingBottom: 1,
              paddingLeft: 8,
              paddingRight: 8,
              borderRadius: 4,
              borderWidth: 1,
              color:
                salaryChartView === 'salary-breakdown' ? '#1677ff' : undefined,
              borderColor:
                salaryChartView === 'salary-breakdown' ? '#1677ff' : undefined,
            }}
            data-cy={`${dataCy}-toggle-salary-breakdown`}
          >
            Salary Breakdown
          </Tag>
          <Tag
            bordered
            onClick={() => setSalaryChartView('variable-pay')}
            className="m-0 cursor-pointer border border-solid text-xs opacity-100 transition-colors"
            style={{
              margin: 0,
              height: 22,
              minWidth: 76,
              lineHeight: '20px',
              paddingTop: 1,
              paddingBottom: 1,
              paddingLeft: 8,
              paddingRight: 8,
              borderRadius: 4,
              borderWidth: 1,
              color: salaryChartView === 'variable-pay' ? '#1677ff' : undefined,
              borderColor:
                salaryChartView === 'variable-pay' ? '#1677ff' : undefined,
            }}
            data-cy={`${dataCy}-toggle-variable-pay`}
          >
            Variable Pay
          </Tag>
        </div>
      </div>
      {salaryChartView === 'salary-breakdown' ? (
        <div
          className="mb-1 flex h-[28px] w-full max-w-[620px] flex-nowrap items-center gap-1 overflow-x-auto opacity-100"
          data-cy={`${dataCy}-legend`}
        >
          {LEGEND_ITEMS.map((item) => (
            <div
              key={item.label}
              className="box-border flex h-[28px] w-[79px] shrink-0 items-center gap-1 p-1 opacity-100"
              data-cy={`${dataCy}-legend-item-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <span
                className="inline-block shrink-0 border border-[#d9d9d9] opacity-100"
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: item.color,
                }}
                aria-hidden
                data-cy={`${dataCy}-legend-swatch-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
              />
              <span
                className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-normal leading-5 text-[#595959] opacity-100"
                title={item.label}
                data-cy={`${dataCy}-legend-label-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <div
        className="h-[168px] w-full min-w-0 sm:h-[200px]"
        data-cy={`${dataCy}-chart`}
      >
        {salaryChartView === 'salary-breakdown' ? (
          <Bar data={barData} options={barOptions} />
        ) : (
          <Line data={lineData} options={lineOptions} />
        )}
      </div>
    </Card>
  );
}
