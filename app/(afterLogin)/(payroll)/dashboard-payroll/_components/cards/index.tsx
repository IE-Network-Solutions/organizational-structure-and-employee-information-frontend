'use client';

import React from 'react';
import { Card } from 'antd';
import {
  MdAttachMoney,
  MdCardGiftcard,
  MdMoney,
} from 'react-icons/md';
import { IoMdTrendingDown, IoMdTrendingUp } from 'react-icons/io';
import { useDashboardPayrollStore } from '@/store/uistate/features/payroll/dashboardPayroll';
import { useGetPayrollByPayPeriod } from '@/store/server/features/financeDashboard/queries';

type StatCardItem = {
  key: string;
  title: string;
  value: string;
  trendLabel: string;
  trendUp: boolean;
  icon: React.ReactNode;
  iconBgClass: string;
};

const formatCurrency = (value: number | undefined) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);

export default function PayrollCards({
  'data-cy': dataCy = 'dashboard-payroll-cards',
}: {
  'data-cy'?: string;
}) {
  const payPeriodId = useDashboardPayrollStore((s) => s.payPeriodId);
  const { data: payrollSummary } = useGetPayrollByPayPeriod({
    limit: 1,
    page: 1,
    payPeriodId: payPeriodId ?? '',
  });
  console.log(payrollSummary,"payrollSummary")

  const statCards: StatCardItem[] = [
    {
      key: 'total-amount',
      title: 'Total Amount',
      value: formatCurrency(payrollSummary?.totalGrossPaymentAmount),
      trendLabel: `${Math.abs(payrollSummary?.differenceFromLastPayPeriod?.totalGrossPaymentAmount ?? 0)}%`,
      trendUp:
        (payrollSummary?.differenceFromLastPayPeriod?.totalGrossPaymentAmount ?? 0) >=
        0,
      icon: <MdAttachMoney className="text-primary" size={16} />,
      iconBgClass: 'bg-[#E6F4FF]',
    },
    {
      key: 'net-paid-amount',
      title: 'Net Paid Amount',
      value: formatCurrency(payrollSummary?.totalNetPayAmount),
      trendLabel: `${Math.abs(payrollSummary?.differenceFromLastPayPeriod?.totalNetPayAmount ?? 0)}%`,
      trendUp:
        (payrollSummary?.differenceFromLastPayPeriod?.totalNetPayAmount ?? 0) >= 0,
      icon: <MdAttachMoney className="text-primary" size={16} />,
      iconBgClass: 'bg-[#E6F4FF]',
    },
    {
      key: 'total-allowance',
      title: 'Total Allowance',
      value: formatCurrency(payrollSummary?.totalAllowanceAmount),
      trendLabel: `${Math.abs(payrollSummary?.differenceFromLastPayPeriod?.totalAllowanceAmount ?? 0)}%`,
      trendUp:
        (payrollSummary?.differenceFromLastPayPeriod?.totalAllowanceAmount ?? 0) >=
        0,
      icon: <MdMoney className="text-[#16A34A]" size={16} />,
      iconBgClass: 'bg-[#DCFCE7]',
    },
    {
      key: 'total-benefit',
      title: 'Total Benefit',
      value: formatCurrency(payrollSummary?.totalMeritAmount),
      trendLabel: `${Math.abs(payrollSummary?.differenceFromLastPayPeriod?.totalMeritAmount ?? 0)}%`,
      trendUp:
        (payrollSummary?.differenceFromLastPayPeriod?.totalMeritAmount ?? 0) >= 0,
      icon: <MdCardGiftcard className="text-[#EA580C]" size={16} />,
      iconBgClass: 'bg-[#FFEDD5]',
    },
  ];

  return (
    <div
      className="mb-4 grid w-full grid-cols-1 gap-[19px] opacity-100 sm:grid-cols-2 lg:grid-cols-4"
      style={{ minHeight: 130 }}
      data-cy={dataCy}
    >
      {statCards.map((card) => (
        <Card
          key={card.key}
          className="h-[122px] rounded-lg border border-gray-200 shadow-sm"
          styles={{
            body: {
              padding: '12px 14px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
          data-cy={`${dataCy}-card-${card.key}`}
        >
          <div
            className="flex h-full min-h-0 flex-col justify-between"
            data-cy={`${dataCy}-body-${card.key}`}
          >
            <div
              className="flex h-6 max-w-[202px] shrink-0 items-center gap-2 overflow-hidden"
              style={{ opacity: 0.8 }}
              data-cy={`${dataCy}-title-frame-${card.key}`}
            >
              <span
                className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md ${card.iconBgClass}`}
                data-cy={`${dataCy}-icon-${card.key}`}
              >
                {card.icon}
              </span>
              <span
                className="min-w-0 truncate text-xs font-medium text-gray-600"
                data-cy={`${dataCy}-title-${card.key}`}
              >
                {card.title}
              </span>
            </div>
            <div
              className="flex max-w-[236px] min-h-[64px] shrink-0 flex-col justify-center gap-2 opacity-100"
              data-cy={`${dataCy}-value-frame-${card.key}`}
            >
              <p
                className="m-0 truncate text-lg font-bold leading-tight text-black/70 sm:text-xl"
                data-cy={`${dataCy}-value-${card.key}`}
              >
                {card.value}
              </p>
              <div
                className={`flex items-center gap-1 text-xs ${
                  card.trendUp ? 'text-[#16A34A]' : 'text-red-600'
                }`}
                data-cy={`${dataCy}-trend-${card.key}`}
              >
                {card.trendUp ? (
                  <IoMdTrendingUp
                    size={16}
                    className="shrink-0"
                    aria-hidden
                    data-cy={`${dataCy}-trend-icon-up-${card.key}`}
                  />
                ) : (
                  <IoMdTrendingDown
                    size={16}
                    className="shrink-0"
                    aria-hidden
                    data-cy={`${dataCy}-trend-icon-down-${card.key}`}
                  />
                )}
                <span data-cy={`${dataCy}-trend-text-${card.key}`}>
                  {card.trendLabel} <span className="text-black/45">Since Last Pay Period</span>
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
