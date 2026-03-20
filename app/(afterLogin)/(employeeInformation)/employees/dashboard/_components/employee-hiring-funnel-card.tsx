'use client';

import React from 'react';
import { Card } from 'antd';

type FunnelStage = {
  label: string;
  value: number;
  color: string; // Tailwind class or raw hex; we will set as inline style for the bar fill
  badge?: string; // e.g. "20%"
  percentOfMax: number; // 0..100 based on the maximum stage (Applied)
};

const StageRow: React.FC<{ stage: FunnelStage }> = ({ stage }) => {
  return (
    <div
      className="flex flex-col gap-2"
      id={`employee-hiring-funnel-stage-${stage.label}`}
      data-cy={`employee-hiring-funnel-stage-${stage.label}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{stage.label}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900">
            {stage.value}
          </span>
          {stage.badge ? (
            <span
              className="text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md px-2 py-1"
              id={`employee-hiring-funnel-stage-${stage.label}-badge`}
              data-cy={`employee-hiring-funnel-stage-${stage.label}-badge`}
            >
              {stage.badge}
            </span>
          ) : null}
        </div>
      </div>

      <div className="h-4 rounded-full bg-[#EEF2F6] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${stage.percentOfMax}%`,
            backgroundColor: stage.color,
          }}
          id={`employee-hiring-funnel-stage-${stage.label}-bar`}
          data-cy={`employee-hiring-funnel-stage-${stage.label}-bar`}
        />
      </div>
    </div>
  );
};

export default function EmployeeHiringFunnelCard() {
  // Values are taken from your attached screenshot. Replace with API/store values later.
  const stages: FunnelStage[] = [
    { label: 'Applied', value: 320, color: '#2F55C8', percentOfMax: 100 },
    { label: 'Screening', value: 240, color: '#7C3AED', badge: '20%', percentOfMax: 75 },
    { label: 'Interview', value: 160, color: '#F97316', badge: '10%', percentOfMax: 50 },
    { label: 'Offer', value: 80, color: '#3B82F6', badge: '5%', percentOfMax: 25 },
    { label: 'Hired', value: 32, color: '#84CC16', badge: '3%', percentOfMax: 10 },
  ];

  return (
    <Card
      className="shadow-sm border border-gray-200 rounded-lg w-full min-h-[355px]"
      bodyStyle={{ padding: 21 }}
      id="employee-hiring-funnel-card"
      data-cy="employee-hiring-funnel-card"
    >
      <h3 className="text-lg font-semibold text-gray-900" data-cy="hiring-funnel-title">
        Hiring Funnel
      </h3>
      <p className="mt-1 text-sm text-gray-500" data-cy="hiring-funnel-subtitle">
        10% overall conversion · Avg 5 days to hire
      </p>

      <div className="mt-2 flex flex-col gap-2" data-cy="hiring-funnel-stages">
        {stages.map((stage) => (
          <StageRow key={stage.label} stage={stage} />
        ))}
      </div>
    </Card>
  );
}

