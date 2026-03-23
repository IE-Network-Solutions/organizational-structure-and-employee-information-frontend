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
  percentage: number;
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
          data-cy={`employee-hiring-funnel-stage-${stage.label}-value-wrap`}
        >
          <span
            className="text-sm font-semibold text-gray-900"
            data-cy={`employee-hiring-funnel-stage-${stage.label}-value`}
          >
            {stage.value}
          </span>
          {stage.percentage ? (
            <span
              className="text-xs font-medium text-black/65 bg-gray-100/50 border border-gray-200 rounded-md px-2 py-1"
              id={`employee-hiring-funnel-stage-${stage.label}-badge`}
              data-cy={`employee-hiring-funnel-stage-${stage.label}-badge`}
            >
              {Number(stage.percentage).toFixed(1)}%
            </span>
          ) : null}
        </div>
      </div>

      <div
        className="h-4 rounded-full bg-[#EEF2F6] overflow-hidden"
        data-cy={`employee-hiring-funnel-stage-${stage.label}-bar-bg`}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${stage.percentage}%`,
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
        percentage: max > 0 ? (s.count / max) * 100 : 0,
        color: STAGE_BAR_COLORS[i % STAGE_BAR_COLORS.length],
      }),
    );
  }, [stagesData]);

  const subtitle = useMemo(() => {
    const averagePercentage =
      stages.length > 0
        ? stages.reduce(
            (sum: number, s: FunnelStageRow) => sum + s.percentage,
            0,
          ) / stages.length
        : 0;
    return averagePercentage > 0
      ? `${Number(averagePercentage).toFixed(1)}% overall conversion · Avg 5 days to hire`
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
        className="text-[16px] font-bold text-gray-900"
        data-cy="hiring-funnel-title"
      >
        Hiring Funnel
      </h3>
      <p
        className="mt-1 text-xs text-black/45 font-normal"
        data-cy="hiring-funnel-subtitle"
      >
        {loading ? (
          <div className="mt-5" data-cy="hiring-funnel-subtitle-skeleton-wrap">
            <Skeleton.Button active size="small" className="!w-48" />
          </div>
        ) : (
          subtitle
        )}
      </p>

      <div className="mt-2 flex flex-col gap-2" data-cy="hiring-funnel-stages">
        {loading ? (
          <div className="mt-5" data-cy="hiring-funnel-stages-skeleton-wrap">
            <Skeleton active paragraph={{ rows: 5 }} />
          </div>
        ) : stages.length === 0 ? (
          <p
            className="text-sm text-gray-500 py-6 text-center"
            data-cy="hiring-funnel-empty-state"
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
