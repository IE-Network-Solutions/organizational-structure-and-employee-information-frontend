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
import {
  useGetMonthlyOverview,
  useGetMonthlyVariablePayOverview,
} from '@/store/server/features/financeDashboard/queries';
import type {
  MonthlyOverviewItem,
  MonthlyVariablePayOverviewItem,
} from '@/store/server/features/financeDashboard/interface';
import PayrollGraphSkeleton from './skeleton';

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
  basicSalary: { label: 'Basic Salary', color: '#F7E17E' },
  allowance: { label: 'Allowance', color: '#61dafb' },
  benefit: { label: 'Benefit', color: '#ffb761' },
  incentive: { label: 'Incentive', color: '#9B8CFF' },
  netPay: { label: 'Net Pay', color: '#2563EB' },
  grossPay: { label: 'Gross Pay', color: '#60A5FA' },
 
} as const;

const LEGEND_ORDER = [
  SERIES.basicSalary.label,
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
  'basicSalary',
  'allowance',
  'benefit',
  'incentive',
  'grossPay',
  'netPay',
];

export default function Graph({
  'data-cy': dataCy = 'payroll-dashboard-graph',
}: {
  'data-cy'?: string;
}) {
  const salaryChartView = useDashboardPayrollStore((s) => s.salaryChartView);
  const setSalaryChartView = useDashboardPayrollStore(
    (s) => s.setSalaryChartView,
  );
  const { data: monthlyOverview } = useGetMonthlyOverview();
  const { data: monthlyVariablePayOverview, isLoading: isLoadingMonthlyVariablePay } = useGetMonthlyVariablePayOverview();
  const isLoadingGraph = !monthlyOverview || isLoadingMonthlyVariablePay;

  const chartLabels = useMemo(
    () =>
      monthlyOverview?.items?.length
        ? monthlyOverview.items.map((item: MonthlyOverviewItem) =>
            item.monthName.slice(0, 3),
          )
        : MONTHS,
    [monthlyOverview],
  );

  const barData = useMemo(
    () => ({
      labels: chartLabels,
      datasets: STACK_ORDER.map((key) => {
        const monthlyValues = monthlyOverview?.items?.map(
          (item: MonthlyOverviewItem) => {
          if (key === 'basicSalary') return item.basicSalary;
          if (key === 'allowance') return item.totalAllowance;
          if (key === 'benefit') return item.totalBenefit;
          if (key === 'incentive') return item.totalIncentive;
          if (key === 'netPay') return item.netPay;
          return item.grossSalary;
          },
        );

        return {
          label: SERIES[key].label,
          data: monthlyValues?.length ? monthlyValues : MONTHS.map(() => 0),
          backgroundColor: SERIES[key].color,
          borderWidth: 0,
          borderRadius: 0,
        };
      }),
    }),
    [chartLabels, monthlyOverview],
  );

  const maxStackTotal = useMemo(() => {
    if (!monthlyOverview?.items?.length) return 300;

    const maxValue = Math.max(
      ...monthlyOverview.items.map(
        (item: MonthlyOverviewItem) =>
          item.basicSalary +
          item.totalAllowance +
          item.totalBenefit +
          item.totalIncentive +
          item.netPay +
          item.grossSalary,
      ),
    );

    if (!Number.isFinite(maxValue) || maxValue <= 0) return 300;
    return Math.ceil(maxValue * 1.1);
  }, [monthlyOverview]);
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
          max: maxStackTotal,
          ticks: {
            font: { size: 9 },
            padding: 4,
            callback: (value) => {
              if (typeof value !== 'number') return value;
              return new Intl.NumberFormat('en', {
                notation: 'compact',
                maximumFractionDigits: 1,
              }).format(value);
            },
          },
          grid: {
            color: '#E5E7EB',
            borderDash: [4, 4],
          },
        },
      },
    }),
    [maxStackTotal],
  );

  const lineData = useMemo(
    () => ({
      labels: chartLabels,
      datasets: [
        {
          label: 'Total Variable Pay',
          data:
            monthlyVariablePayOverview?.items?.length
              ? monthlyVariablePayOverview.items.map(
                  (item: MonthlyVariablePayOverviewItem) => item.totalVariablePay,
                )
              : MONTHS.map(() => 0),
          borderColor: '#A78BFA',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          tension: 0.3,
          fill: false,
          pointRadius: 3,
          pointBackgroundColor: '#ffffff',
          pointBorderWidth: 1,
          pointHoverRadius: 3,
        },
      ],
    }),
    [chartLabels, monthlyVariablePayOverview],
  );

  const maxVariablePay = useMemo(() => {
    if (!monthlyVariablePayOverview?.items?.length) return 100;

    const maxValue = Math.max(
      ...monthlyVariablePayOverview.items.map(
        (item: MonthlyVariablePayOverviewItem) => item.totalVariablePay,
      ),
    );

    if (!Number.isFinite(maxValue) || maxValue <= 0) return 100;
    return Math.ceil(maxValue * 1.15);
  }, [monthlyVariablePayOverview]);

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
          border: {
            color: '#E5E7EB',
            dash: [3, 3],
          },
          ticks: {
            font: { size: 9 },
            maxRotation: 0,
          },
        },
        y: {
          min: 0,
          max: maxVariablePay,
          ticks: {
            font: { size: 9 },
            padding: 4,
            callback: (value) => {
              if (typeof value !== 'number') return value;
              return new Intl.NumberFormat('en', {
                notation: 'compact',
                maximumFractionDigits: 1,
              }).format(value);
            },
          },
          grid: {
            color: '#E5E7EB',
            borderDash: [3, 3],
          },
          border: {
            color: '#E5E7EB',
            dash: [3, 3],
          },
        },
      },
    }),
    [maxVariablePay],
  );

  const title =
    salaryChartView === 'salary-breakdown' ? 'Salary' : 'Total Variable Pay';

  if (isLoadingGraph) {
    return <PayrollGraphSkeleton data-cy={`${dataCy}-skeleton`} />;
  }

  return (
    <Card
      className="rounded-lg border border-gray-200 shadow-sm  h-[333px]"
      styles={{ body: { padding: '12px' } }}
      data-cy={dataCy}
    >
      <div
        className="mb-2 flex  gap-2 sm:mb-3 flex-row items-center justify-between"
        data-cy={`${dataCy}-header`}
      >
        <h3
          className="text-base font-bold text-gray-900"
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
          className="mb-1 flex h-[28px] w-full max-w-[620px] flex-nowrap items-center gap-1 overflow-x-auto opacity-100 scrollbar-none"
          data-cy={`${dataCy}-legend`}
        >
          {LEGEND_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex h-[28px] w-[79px] shrink-0 items-center gap-2 p-1 opacity-100 "
              data-cy={`${dataCy}-legend-item-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <span
                className="inline-block shrink-0  opacity-100"
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: item.color,
                }}
                aria-hidden
                data-cy={`${dataCy}-legend-swatch-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
              />
              <span
                className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal leading-5 text-black/70 opacity-100"
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
        className="h-[228px] w-full min-w-0 sm:h-[228px]"
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
