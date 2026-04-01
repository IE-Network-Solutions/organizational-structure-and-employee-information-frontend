'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from 'antd';
import { Activity } from 'lucide-react';
import {
  MdHistory,
  MdAccountBalance,
  MdAccountBalanceWallet,
  MdCardGiftcard,
} from 'react-icons/md';

type ActionItem = {
  key: string;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  iconWrapClass: string;
};

const ACTIONS: ActionItem[] = [
  {
    key: 'pay-period-updated',
    title: 'Pay Period Updated',
    description: 'Jordan Lee Updated the new pay period',
    time: '2 hours ago',
    iconWrapClass: 'bg-violet-100 text-violet-600',
    icon: <MdHistory className="h-[18px] w-[18px]" aria-hidden />,
  },
  {
    key: 'pension-contribution',
    title: 'Pension Contribution Created',
    description: 'Micheal Demeke Created Pension Contribution',
    time: '4 hours ago',
    iconWrapClass: 'bg-blue-100 text-blue-600',
    icon: <MdAccountBalance className="h-[18px] w-[18px]" aria-hidden />,
  },
  {
    key: 'settlement-tracking',
    title: 'Settlement Tracking Updated',
    description: 'Nahom Bekle Updated Settlement Tracking',
    time: 'Yesterday',
    iconWrapClass: 'bg-violet-100 text-violet-600',
    icon: <MdHistory className="h-[18px] w-[18px]" aria-hidden />,
  },
  {
    key: 'payroll-created',
    title: 'Payroll Created',
    description: 'Audit Log Created',
    time: 'Yesterday',
    iconWrapClass: 'bg-gray-100 text-gray-800',
    icon: <MdAccountBalanceWallet className="h-[18px] w-[18px]" aria-hidden />,
  },
  {
    key: 'incentives-created',
    title: 'Incentives Created',
    description: 'Incentives Created',
    time: '2 days ago',
    iconWrapClass: 'bg-pink-100 text-pink-600',
    icon: <MdCardGiftcard className="h-[18px] w-[18px]" aria-hidden />,
  },
];

export default function ActionCards({
  'data-cy': dataCy = 'dashboard-payroll-action-cards',
}: {
  'data-cy'?: string;
}) {
  return (
    <Card
      className="h-full rounded-lg border border-gray-200 shadow-sm"
      styles={{ body: { padding: '14px 14px 16px' } }}
      data-cy={dataCy}
    >
      <div
        className="mb-4 flex items-center justify-between gap-2"
        data-cy={`${dataCy}-header`}
      >
        <div
          className="flex min-w-0 items-center gap-2"
          data-cy={`${dataCy}-header-title-row`}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-700"
            data-cy={`${dataCy}-header-icon`}
            aria-hidden
          >
            <Activity className="h-4 w-4" strokeWidth={2} />
          </span>
          <h3
            className="truncate text-sm font-bold text-gray-900"
            data-cy={`${dataCy}-title`}
          >
            Recent Actions
          </h3>
        </div>
        <Link
          href="/payroll"
          className="shrink-0 text-xs font-medium text-[#2563EB] hover:text-blue-700"
          data-cy={`${dataCy}-view-all`}
        >
          View All
        </Link>
      </div>

      <ul className="m-0 list-none p-0" data-cy={`${dataCy}-timeline`}>
        {ACTIONS.map((item, index) => {
          const isLast = index === ACTIONS.length - 1;
          return (
            <li
              key={item.key}
              className="relative flex gap-3"
              data-cy={`${dataCy}-item-${item.key}`}
            >
              <div
                className="flex w-10 shrink-0 flex-col items-center"
                data-cy={`${dataCy}-rail-${item.key}`}
              >
                <div
                  className={`z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.iconWrapClass}`}
                  data-cy={`${dataCy}-icon-wrap-${item.key}`}
                >
                  {item.icon}
                </div>
                {!isLast ? (
                  <div
                    className="mt-1 w-px flex-1 min-h-[12px] bg-gray-200"
                    aria-hidden
                    data-cy={`${dataCy}-connector-${item.key}`}
                  />
                ) : null}
              </div>
              <div
                className="min-w-0 flex-1 pb-5 last:pb-0"
                data-cy={`${dataCy}-content-${item.key}`}
              >
                <p
                  className="max-w-[473px] font-bold text-gray-900 opacity-100"
                  style={{
                    fontSize: '14px',
                    lineHeight: '18px',
                    minHeight: 18,
                  }}
                  data-cy={`${dataCy}-item-title-${item.key}`}
                >
                  {item.title}
                </p>
                <p
                  className="mt-0.5 max-w-[375px] text-gray-500 opacity-100"
                  style={{
                    fontSize: '13px',
                    lineHeight: '22px',
                    minHeight: 22,
                  }}
                  data-cy={`${dataCy}-item-desc-${item.key}`}
                >
                  {item.description}
                </p>
                <p
                  className="mt-1 text-xs text-gray-400"
                  data-cy={`${dataCy}-item-time-${item.key}`}
                >
                  {item.time}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
