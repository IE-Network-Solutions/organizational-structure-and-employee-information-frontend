'use client';

import React, { useMemo } from 'react';
import { Card, Tag } from 'antd';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import {
  useDashboardPayrollStore,
} from '@/store/uistate/features/payroll/dashboardPayroll';
import {
  useGetAllowanceDetailsOverview,
  useGetBenefitDetailsOverview,
} from '@/store/server/features/financeDashboard/queries';
import type { DetailsOverviewItem } from '@/store/server/features/financeDashboard/interface';
import PayrollPieChartSkeleton from './skeleton';

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
  entitledEmployeeCount: number;
};

function normalizeRows(items: DetailsOverviewItem[] | undefined): BreakdownRow[] {
  if (!items?.length) return [];

  return items.map((item, i) => ({
    label:
      item.label ??
      item.name ??
      item.typeName ??
      item.allowanceName ??
      item.benefitName ??
      `Type ${i + 1}`,
    amount: item.amount ?? item.totalAmount ?? item.value ?? 0,
    count: item.count ?? item.entitledEmployeeCount ?? 0,
    color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
    entitledEmployeeCount: item.entitledEmployeeCount ?? 0,
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
  const { data: allowanceDetails, isLoading: isLoadingAllowanceDetails } = useGetAllowanceDetailsOverview(
  );
  const { data: benefitDetails, isLoading: isLoadingBenefitDetails } = useGetBenefitDetailsOverview();
  const rows = useMemo(() => {
    // Defensive: If a details fetch is still loading, always return the same (empty) array shape.
    if (
      (allowanceBenefitTab === 'allowance' && !allowanceDetails) ||
      (allowanceBenefitTab !== 'allowance' && !benefitDetails)
    ) {
      return [];
    }
    if (allowanceBenefitTab === 'allowance') {
      return normalizeRows(allowanceDetails?.items);
    } else {
      return normalizeRows(benefitDetails?.items);
    }
  }, [allowanceBenefitTab, allowanceDetails, benefitDetails]);

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
          borderWidth: 0,
          borderColor: '#ffffff',
          hoverOffset: 2,
        },
      ],
    }),
    [rows],
  );

  const chartOptions: ChartOptions<'doughnut'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
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

  const isLoadingActiveTab =
    allowanceBenefitTab === 'allowance'
      ? isLoadingAllowanceDetails
      : isLoadingBenefitDetails;

  if (isLoadingActiveTab) {
    return <PayrollPieChartSkeleton data-cy={`${dataCy}-skeleton`} />;
  }

  return (
    <Card
      className="rounded-lg border border-gray-200 shadow-noe md:h-[410px] h-[510px]"
      bodyStyle={{ padding: '12px' }}
      data-cy={dataCy}
    >
      <div
        className="mb-4 flex gap-3 items-center justify-between"
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
        className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-6 items-center"
        data-cy={`${dataCy}-body`}
      >
        <div
          className="relative mx-auto flex h-[285px]  w-[285px] items-center justify-center  lg:mx-0 lg:w-[42%] lg:max-w-none lg:shrink-0"
          data-cy={`${dataCy}-chart-wrap`}
        >
          <div className="absolute inset-0" data-cy={`${dataCy}-chart-canvas`}>
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          <div
            className="pointer-events-none relative z-10 flex  flex-col items-center justify-center text-center"
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
          className="w-full space-y-3 lg:pt-1 md:h-[330px] h-[130px] overflow-y-auto scrollbar-none"
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
                className="last:border-0 last:pb-0"
                data-cy={`${dataCy}-row-${rowKey}`}
              >
                <div
                  className="mb-1 flex items-center gap-2"
                  data-cy={`${dataCy}-row-header-${rowKey}`}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: row.color }}
                    data-cy={`${dataCy}-row-dot-${rowKey}`}
                  />
                  <span
                    className="text-ellipsis whitespace-nowrap text-xs font-normal text-black/70 opacity-100"
                    title={row.label}
                    data-cy={`${dataCy}-row-label-${rowKey}`}
                  >
                    {row.label?.length > 20 ? row.label?.slice(0, 20) + '...' : row.label}
                  </span>
                  <div className="flex items-center gap-6 w-full">
                    <span
                      className="flex-1 text-end text-xs text-black/70"
                      data-cy={`${dataCy}-row-count-${rowKey}`}
                    >
                      {row.entitledEmployeeCount || 0}
                    </span>
                    <span
                      className="shrink-0 text-end text-xs font-semibold text-black/70 sm:text-sm w-[70px]"
                      data-cy={`${dataCy}-row-amount-${rowKey}`}
                    >
                      {formatInt(row.amount)}
                    </span>
                  </div>
                </div>
                <div
                  className="h-1 overflow-hidden rounded-full bg-gray-100"
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
