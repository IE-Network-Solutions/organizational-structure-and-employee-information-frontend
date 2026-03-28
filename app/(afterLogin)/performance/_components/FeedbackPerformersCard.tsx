'use client';

import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
type Performer = {
  name: string;
  title: string;
  total: number;
  engagement: number;
  kpi: number;
};

const performers: Performer[] = [
  { name: 'Emily Chen', title: 'Product Designer', total: 39, engagement: 26, kpi: 13 },
  { name: 'James Wilson', title: 'Sales Lead', total: 35, engagement: 22, kpi: 13 },
  { name: 'Maya Patel', title: 'Marketing', total: 32, engagement: 20, kpi: 12 },
];



const ENGAGEMENT_BAR = '#C4B5FD';
const KPI_BAR = '#3B82F6';
const ENGAGEMENT_LABEL = '#7C3AED';
const KPI_LABEL = '#2563EB';

function SegmentedBar({ engagement, kpi }: Pick<Performer, 'engagement' | 'kpi'>) {
  const sum = engagement + kpi;
  const engFlex = sum > 0 ? engagement : 1;
  const kpiFlex = sum > 0 ? kpi : 1;

  return (
    <div className="flex w-full gap-2">
      <div
        className="flex min-w-0 flex-1 flex-col gap-2"
        style={{ flex: `${engFlex} 1 0%` }}
      >
        <div
          className="h-[6px] w-full rounded-full"
          style={{ backgroundColor: ENGAGEMENT_BAR }}
          title={`Engagement ${engagement}`}
        />
        <p
          className="text-center text-xs font-medium"
          style={{ color: ENGAGEMENT_LABEL }}
        >
          Engagement {engagement}
        </p>
      </div>
      <div
        className="flex min-w-0 flex-1 flex-col gap-2"
        style={{ flex: `${kpiFlex} 1 0%` }}
      >
        <div
          className="h-[6px] w-full rounded-full"
          style={{ backgroundColor: KPI_BAR }}
          title={`KPI ${kpi}`}
        />
        <p
          className="text-center text-xs font-medium"
          style={{ color: KPI_LABEL }}
        >
          KPI {kpi}
        </p>
      </div>
    </div>
  );
}

export default function FeedbackPerformersCard() {
  return (
    <section
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm h-[345px]"
      data-cy="performance-feedback-performers-card"
    >
      <h2 className="mb-4 text-base font-bold text-black">
        Feedback Performers
      </h2>
      <ul className="space-y-4 h-[265px] overflow-y-auto scrollbar-none">
        {performers.map((p) => (
          <li
            key={p.name}
            className="rounded-xl border border-gray-200 bg-white p-2 mt-1"
          >
            <div className="flex items-center gap-3">
              <Avatar size={36} icon={<UserOutlined />} />
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-normal text-black">{p.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{p.title}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="text-sm font-bold tabular-nums text-black">
                      {p.total}
                    </span>
                    <span className="text-sm text-gray-500">Total</span>
                  </div>
                </div>
                
              </div>
            </div>
            <SegmentedBar engagement={p.engagement} kpi={p.kpi} />
          </li>
        ))}
      </ul>
    </section>
  );
}
