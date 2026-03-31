'use client';

import React from 'react';
import { Card } from 'antd';
import { useDashboardPayrollStore } from '@/store/uistate/features/payroll/dashboardPayroll';
import { useGetPayrollByPayPeriod } from '@/store/server/features/financeDashboard/queries';
import PayrollPaymentCardsSkeleton from './skeleton';

type PaymentRow = {
  key: string;
  label: string;
  color: string;
  value: number;
  percent: string;
};

function formatValue(n: number) {
  return n.toLocaleString();
}

export default function PaymentCards({
  'data-cy': dataCy = 'dashboard-payroll-payment-overview',
}: {
  'data-cy'?: string;
}) {
  const payPeriodId = useDashboardPayrollStore((s) => s.payPeriodId);
  const { data: payrollSummary, isLoading } = useGetPayrollByPayPeriod({
    limit: 1,
    page: 1,
    payPeriodId: payPeriodId ?? '',
  });

  const paymentRows: PaymentRow[] = [
    {
      key: 'total-basic-salary',
      label: 'Total Basic Salary',
      color: '#F7E17E',
      value: payrollSummary?.totalBasicSalaryAmount ?? 0,
      percent: `${payrollSummary?.keyMetricsPercentage?.totalBasicSalaryAmount ?? 0}%`,
    },
    {
      key: 'total-allowance',
      label: 'Total Allowance',
      color: '#EF4444',
      value: payrollSummary?.totalAllowanceAmount ?? 0,
      percent: `${payrollSummary?.keyMetricsPercentage?.totalAllowanceAmount ?? 0}%`,
    },
    {
      key: 'total-benefit',
      label: 'Total Benefit',
      color: '#F97316',
      value: payrollSummary?.totalMeritAmount ?? 0,
      percent: `${payrollSummary?.keyMetricsPercentage?.totalMeritAmount ?? 0}%`,
    },
    {
      key: 'total-incentive',
      label: 'Total Incentive',
      color: '#2563EB',
      value: payrollSummary?.totalIncentiveForAllEmployees ?? 0,
      percent: `${payrollSummary?.keyMetricsPercentage?.totalIncentiveForAllEmployees ?? 0}%`,
    },
    {
      key: 'total-deduction',
      label: 'Total Deduction',
      color: '#22C55E',
      value: payrollSummary?.totalDeductionsAmount ?? 0,
      percent: `${payrollSummary?.keyMetricsPercentage?.totalDeductionsAmount ?? 0}%`,
    },
    {
      key: 'total-payment',
      label: 'Total Payment',
      color: '#EC4899',
      value: payrollSummary?.totalGrossPaymentAmount ?? 0,
      percent: '100%',
    },
    {
      key: 'total-variable-pay',
      label: 'Total Variable Pay',
      color: '#9333EA',
      value: payrollSummary?.totalVpForAllEmployees ?? 0,
      percent: `${payrollSummary?.keyMetricsPercentage?.totalVpForAllEmployees ?? 0}%`,
    },
  
  ];
  if (isLoading) {
    return <PayrollPaymentCardsSkeleton data-cy={`${dataCy}-skeleton`} />;
  }

  return (
    <Card
      className="h-full rounded-lg border border-gray-200 shadow-sm"
      styles={{ body: { padding: '10px 10px 12px' } }}
      data-cy={dataCy}
    >
      <h3
        className="mb-2 text-[15px] font-bold leading-snug text-gray-900"
        data-cy={`${dataCy}-title`}
      >
        Payment Overview
      </h3>
      <div className="flex flex-col gap-2" data-cy={`${dataCy}-list`}>
        {paymentRows.map((row) => (
          <div
            key={row.key}
            className="flex items-center gap-2 rounded-md border border-gray-100 bg-white px-2 py-1.5"
            data-cy={`${dataCy}-row-${row.key}`}
          >
            <span
              className="h-[10px] w-[10px] shrink-0 rounded-sm border border-gray-200/90 opacity-90"
              style={{ backgroundColor: row.color }}
              data-cy={`${dataCy}-swatch-${row.key}`}
              aria-hidden
            />
            <span
              className="min-w-0 flex-1 text-[12px] font-normal leading-snug text-gray-600"
              data-cy={`${dataCy}-label-${row.key}`}
            >
              {row.label}
            </span>
            <div
              className="flex shrink-0 items-center gap-1.5 text-[12px] font-normal text-gray-700"
              data-cy={`${dataCy}-meta-${row.key}`}
            >
              <span data-cy={`${dataCy}-value-${row.key}`}>
                {formatValue(row.value)}
              </span>
              <span
                className="h-3 w-px bg-gray-200"
                aria-hidden
                data-cy={`${dataCy}-divider-${row.key}`}
              />
              <span
                className="text-gray-500"
                data-cy={`${dataCy}-percent-${row.key}`}
              >
                {row.percent}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
