'use client';

import React, { useMemo } from 'react';
import { Card, Tag } from 'antd';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import {
  useDashboardPayrollStore,
  type AllowanceBenefitTab,
} from '@/store/uistate/features/payroll/dashboardPayroll';

ChartJS.register(ArcElement, Tooltip);

const SEGMENT_COLORS = [
  '#FACC15',
  '#60A5FA',
  '#2DD4BF',
  '#FB923C',
  '#A78BFA',
  '#34D399',
  '#F472B6',
  '#818CF8',
];

type BreakdownRow = {
  label: string;
  amount: number;
  count: number;
  color: string;
};

function buildMockRows(
  prefix: string,
  tab: AllowanceBenefitTab,
): BreakdownRow[] {
  const baseAmount = tab === 'allowance' ? 9_845_875 : 9_845_875;
  return Array.from({ length: 8 }, (unused, i) => ({
    label: `${prefix} ${i + 1}`,
    amount: baseAmount + i * 12_000,
    count: 200,
    color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
  }));
}

function formatInt(n: number) {
  return n.toLocaleString();
}

export default function PieChart({
  'data-cy': dataCy = 'dashboard-payroll-pie-chart',
}: {
  'data-cy'?: string;
}) {
  const allowanceBenefitTab = useDashboardPayrollStore(
    (s) => s.allowanceBenefitTab,
  );
  const setAllowanceBenefitTab = useDashboardPayrollStore(
    (s) => s.setAllowanceBenefitTab,
  );

  const rows = useMemo(
    () =>
      allowanceBenefitTab === 'allowance'
        ? buildMockRows('Allowance Type', 'allowance')
        : buildMockRows('Benefit Type', 'benefit'),
    [allowanceBenefitTab],
  );

  const totalAmount = useMemo(
    () => rows.reduce((sum, r) => sum + r.amount, 0),
    [rows],
  );

  const chartData: ChartData<'doughnut'> = useMemo(
    () => ({
      labels: rows.map((r) => r.label),
      datasets: [
        {
          data: rows.map((r) => r.amount),
          backgroundColor: rows.map((r) => r.color),
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6,
        },
      ],
    }),
    [rows],
  );

  const chartOptions: ChartOptions<'doughnut'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
    }),
    [],
  );

  const title =
    allowanceBenefitTab === 'allowance'
      ? 'Allowance Details'
      : 'Benefit Details';

  return (
    <Card
      className="rounded-lg border border-gray-200 shadow-sm"
      styles={{ body: { padding: '14px 16px 16px' } }}
      data-cy={dataCy}
    >
      <div
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
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
          aria-label="Allowance or benefit breakdown"
        >
          <Tag
            bordered
            onClick={() => setAllowanceBenefitTab('allowance')}
            className="m-0 cursor-pointer border border-solid text-xs opacity-100 transition-colors"
            style={{
              margin: 0,
              height: 22,
              minWidth: 67,
              lineHeight: '20px',
              paddingTop: 1,
              paddingBottom: 1,
              paddingLeft: 8,
              paddingRight: 8,
              borderRadius: 4,
              borderWidth: 1,
              color:
                allowanceBenefitTab === 'allowance' ? '#1677ff' : undefined,
              borderColor:
                allowanceBenefitTab === 'allowance' ? '#1677ff' : undefined,
            }}
            data-cy={`${dataCy}-toggle-allowance`}
          >
            Allowance
          </Tag>
          <Tag
            bordered
            onClick={() => setAllowanceBenefitTab('benefit')}
            className="m-0 cursor-pointer border border-solid text-xs opacity-100 transition-colors"
            style={{
              margin: 0,
              height: 22,
              minWidth: 52,
              lineHeight: '20px',
              paddingTop: 1,
              paddingBottom: 1,
              paddingLeft: 8,
              paddingRight: 8,
              borderRadius: 4,
              borderWidth: 1,
              color: allowanceBenefitTab === 'benefit' ? '#1677ff' : undefined,
              borderColor:
                allowanceBenefitTab === 'benefit' ? '#1677ff' : undefined,
            }}
            data-cy={`${dataCy}-toggle-benefit`}
          >
            Benefit
          </Tag>
        </div>
      </div>

      <div
        className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-6"
        data-cy={`${dataCy}-body`}
      >
        <div
          className="relative mx-auto flex h-[220px] w-full max-w-[280px] items-center justify-center sm:h-[240px] sm:max-w-[300px] lg:mx-0 lg:w-[42%] lg:max-w-none lg:shrink-0"
          data-cy={`${dataCy}-chart-wrap`}
        >
          <div className="absolute inset-0" data-cy={`${dataCy}-chart-canvas`}>
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          <div
            className="pointer-events-none relative z-10 flex max-w-[140px] flex-col items-center justify-center text-center"
            data-cy={`${dataCy}-chart-center`}
          >
            <span
              className="text-lg font-bold leading-tight text-gray-900 sm:text-xl"
              data-cy={`${dataCy}-chart-total`}
            >
              {formatInt(totalAmount)}
            </span>
          </div>
        </div>

        <div
          className="min-w-0 flex-1 space-y-3 lg:pt-1"
          data-cy={`${dataCy}-list`}
        >
          {rows.map((row) => {
            const pct =
              totalAmount > 0
                ? Math.min(100, Math.round((row.amount / totalAmount) * 100))
                : 0;
            const rowKey = row.label.replace(/\s+/g, '-').toLowerCase();
            return (
              <div
                key={row.label}
                className="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                data-cy={`${dataCy}-row-${rowKey}`}
              >
                <div
                  className="mb-1 flex items-center gap-2"
                  data-cy={`${dataCy}-row-header-${rowKey}`}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: row.color }}
                    data-cy={`${dataCy}-row-dot-${rowKey}`}
                  />
                  <span
                    className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-gray-800 opacity-100"
                    title={row.label}
                    data-cy={`${dataCy}-row-label-${rowKey}`}
                  >
                    {row.label}
                  </span>
                  <span
                    className="shrink-0 text-xs text-gray-600"
                    data-cy={`${dataCy}-row-count-${rowKey}`}
                  >
                    {row.count}
                  </span>
                  <span
                    className="shrink-0 text-right text-xs font-semibold text-gray-900 sm:text-sm"
                    data-cy={`${dataCy}-row-amount-${rowKey}`}
                  >
                    {formatInt(row.amount)}
                  </span>
                </div>
                <div
                  className="ml-4 h-1.5 overflow-hidden rounded-full bg-gray-100"
                  data-cy={`${dataCy}-row-bar-track-${rowKey}`}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: row.color,
                    }}
                    data-cy={`${dataCy}-row-bar-fill-${rowKey}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
