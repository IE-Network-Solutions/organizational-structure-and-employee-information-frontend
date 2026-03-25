'use client';

import React, { useMemo } from 'react';
import { Card, Skeleton } from 'antd';
import { useGetRecruitmentStages } from '@/store/server/features/recruitment/dashboard/queries';

const STAGE_BAR_COLORS = [
  '#4A6CF7',
  '#FA916B',
  '#42D29D',
  '#FDBA74',
  '#A78BFA',
  '#34D399',
];

type FunnelStageRow = {
  label: string;
  value: number;
  percentOfMax: number;
  color: string;
  badge?: string;
};

type StageRowProps = { stage: FunnelStageRow };

const StageRow: React.FC<StageRowProps> = ({ stage }) => {
  return (
    <div
      className="flex flex-col gap-2"
      id={`employee-hiring-funnel-stage-${stage.label}`}
      data-cy={`employee-hiring-funnel-stage-${stage.label}`}
    >
      <div
        className="flex items-center justify-between"
        data-cy={`employee-hiring-funnel-stage-${stage.label}-row`}
      >
        <span
          className="text-sm font-medium text-gray-600"
          data-cy={`employee-hiring-funnel-stage-${stage.label}-label`}
        >
          {stage.label}
        </span>
        <div
          className="flex items-center gap-3"
          data-cy={`employee-hiring-funnel-stage-${stage.label}-value-wrapper`}
        >
          <span
            className="text-sm font-semibold text-gray-900"
            data-cy={`employee-hiring-funnel-stage-${stage.label}-value`}
          >
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

      <div
        className="h-4 rounded-full bg-[#EEF2F6] overflow-hidden"
        data-cy={`employee-hiring-funnel-stage-${stage.label}-bar-track`}
      >
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
  const { data: stagesData, isLoading: loading } = useGetRecruitmentStages();

  const stages = useMemo(() => {
    const list = stagesData?.stageList ?? [];
    if (list.length === 0) return [];
    const max = Math.max(...list.map((s: { count: number }) => s.count), 0);
    return list.map(
      (s: { name: string; count: number }, i: number): FunnelStageRow => ({
        label: s.name,
        value: s.count,
        percentOfMax: max > 0 ? (s.count / max) * 100 : 0,
        color: STAGE_BAR_COLORS[i % STAGE_BAR_COLORS.length],
      }),
    );
  }, [stagesData]);

  const subtitle = useMemo(() => {
    const total = stages.reduce(
      (sum: number, s: FunnelStageRow) => sum + s.value,
      0,
    );
    return total > 0
      ? `${total.toLocaleString()} candidates across stages`
      : 'Hiring pipeline overview';
  }, [stages]);

  return (
    <Card
      className="shadow-sm border border-gray-200 rounded-lg w-full min-h-[355px]"
      bodyStyle={{ padding: 21 }}
      id="employee-hiring-funnel-card"
      data-cy="employee-hiring-funnel-card"
    >
      <h3
        className="text-lg font-semibold text-gray-900"
        data-cy="hiring-funnel-title"
      >
        Hiring Funnel
      </h3>
      <p
        className="mt-1 text-sm text-gray-500"
        data-cy="hiring-funnel-subtitle"
      >
        {loading ? (
          <Skeleton.Button active size="small" className="!w-48" />
        ) : (
          subtitle
        )}
      </p>

      <div className="mt-2 flex flex-col gap-2" data-cy="hiring-funnel-stages">
        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : stages.length === 0 ? (
          <p
            className="text-sm text-gray-500 py-6 text-center"
            data-cy="employee-hiring-funnel-empty"
          >
            No hiring funnel data for this period.
          </p>
        ) : (
          stages.map((stage: FunnelStageRow) => (
            <StageRow key={stage.label} stage={stage} />
          ))
        )}
      </div>
    </Card>
  );
}
