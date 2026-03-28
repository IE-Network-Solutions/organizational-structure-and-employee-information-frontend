'use client';

import React from 'react';
import { Card } from 'antd';
import {
  MdAccountBalanceWallet,
  MdAttachMoney,
  MdCardGiftcard,
} from 'react-icons/md';
import { IoMdTrendingDown, IoMdTrendingUp } from 'react-icons/io';

type StatCardItem = {
  key: string;
  title: string;
  value: string;
  trendLabel: string;
  trendUp: boolean;
  icon: React.ReactNode;
  iconBgClass: string;
};

const STAT_CARDS: StatCardItem[] = [
  {
    key: 'total-amount',
    title: 'Total Amount',
    value: '9,057,640.86',
    trendLabel: '8% Since Last Pay Period',
    trendUp: true,
    icon: <MdAttachMoney className="text-[#2563EB]" size={16} />,
    iconBgClass: 'bg-[#E6F4FF]',
  },
  {
    key: 'net-paid-amount',
    title: 'Net Paid Amount',
    value: '5,617,593.69',
    trendLabel: '8% Since Last Pay Period',
    trendUp: false,
    icon: <MdAttachMoney className="text-[#2563EB]" size={16} />,
    iconBgClass: 'bg-[#E6F4FF]',
  },
  {
    key: 'total-allowance',
    title: 'Total Allowance',
    value: '1,083,779.31',
    trendLabel: '8% Since Last Pay Period',
    trendUp: true,
    icon: <MdAccountBalanceWallet className="text-[#16A34A]" size={16} />,
    iconBgClass: 'bg-[#DCFCE7]',
  },
  {
    key: 'total-benefit',
    title: 'Total Benefit',
    value: '95,346,231.00',
    trendLabel: '8% Since Last Pay Period',
    trendUp: true,
    icon: <MdCardGiftcard className="text-[#EA580C]" size={16} />,
    iconBgClass: 'bg-[#FFEDD5]',
  },
];

export default function Cards({
  'data-cy': dataCy = 'dashboard-payroll-cards',
}: {
  'data-cy'?: string;
}) {
  return (
    <div
      className="mx-auto mb-4 grid w-full max-w-[1130px] grid-cols-1 gap-[19px] opacity-100 sm:grid-cols-2 lg:grid-cols-4"
      style={{ minHeight: 130 }}
      data-cy={dataCy}
    >
      {STAT_CARDS.map((card) => (
        <Card
          key={card.key}
          className="h-[130px] rounded-lg border border-gray-200 shadow-sm"
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
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${card.iconBgClass}`}
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
                className="m-0 truncate text-lg font-bold leading-tight text-gray-900 sm:text-xl"
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
                  {card.trendLabel}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
