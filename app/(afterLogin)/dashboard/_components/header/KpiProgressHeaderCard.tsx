'use client';

import { useMemo } from 'react';
import { Card, Progress } from 'antd';
import { useRouter } from 'next/navigation';
import { useGetBscScorecards } from '@/store/server/features/bsc/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ScorecardStatus } from '@/types/bsc';
import { normalizeRatio } from '@/utils/bsc/scoring';

const cardShellClass =
  'flex flex-col gap-4 h-[115px] min-w-[260px] flex-none shadow-none rounded-lg border border-[#D9D9D9] bg-white p-3 md:min-w-0 cursor-pointer';

function currentMonthName(): string {
  return new Date().toLocaleString('en-US', { month: 'long' });
}

function currentYear(): number {
  return new Date().getFullYear();
}

export default function KpiProgressHeaderCard() {
  const { userId } = useAuthenticationStore();
  const { data: scorecards, isLoading } = useGetBscScorecards();
  const router = useRouter();

  const progress = useMemo(() => {
    const list = scorecards || [];
    const mine = userId ? list.filter((s) => s.userId === userId) : [];
    const cards = mine.length
      ? mine
      : list.filter((s) => s.userId === 'demo-user');
    if (!cards.length) return 0;

    const thisMonth = currentMonthName();
    const year = currentYear();
    const scorecard =
      cards.find(
        (s) =>
          s.periodMonthName?.toLowerCase() === thisMonth.toLowerCase() &&
          (s.periodYear == null || s.periodYear === year),
      ) ||
      cards.find((s) => s.status === ScorecardStatus.Active) ||
      cards[0];
    if (!scorecard) return 0;

    if (scorecard.finalEvaluation?.compositeScore != null) {
      return Math.min(scorecard.finalEvaluation.compositeScore, 100);
    }

    const evaluated =
      scorecard.status === ScorecardStatus.Scored ||
      scorecard.status === ScorecardStatus.Completed;
    if (!evaluated) {
      const withActual = scorecard.targets.filter((t) => t.actualValue != null);
      if (!withActual.length) return 0;
      const total = withActual.reduce((sum, t) => {
        const { ratio } = normalizeRatio(
          t.actualValue as number,
          t.targetValue,
          t.targetLogic,
        );
        return sum + Math.min(ratio, 1) * 100 * (t.weightPercentage / 100);
      }, 0);
      return Math.min(total, 100);
    }

    return Math.min(
      scorecard.targets.reduce((sum, t) => {
        if (t.actualValue == null) return sum;
        const { ratio } = normalizeRatio(
          t.actualValue,
          t.targetValue,
          t.targetLogic,
        );
        return sum + Math.min(ratio, 1) * t.weightPercentage;
      }, 0),
      100,
    );
  }, [scorecards, userId]);

  const display = Number.isFinite(progress)
    ? Math.abs(progress % 1) < 1e-9
      ? String(Math.round(progress))
      : progress.toFixed(2)
    : '0';

  return (
    <Card
      loading={isLoading}
      bordered={false}
      bodyStyle={{ padding: 0 }}
      className={cardShellClass}
      onClick={() => router.push('/bsc/my-scorecard')}
      data-cy="okr-card-kpi-progress"
    >
      <div
        className="flex items-center justify-between"
        data-cy="okr-card-header"
      >
        <div
          className="rounded-[4px] bg-[#E6F4FF] flex items-center justify-center w-[34px] h-[34px]"
          data-cy="okr-card-icon-container"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#1677FF"
            data-cy="okr-card-kpi-progress-icon"
          >
            <path
              data-cy="dashboard-components-header-kpiprogressheadercard-tsx-kpiprogressheadercard-path-113"
              d="M160-160v-320h160v320H160Zm240 0v-560h160v560H400Zm240 0v-200h160v200H640Z"
            />
          </svg>
        </div>
        <div
          className="font-semibold text-[27px] leading-7 tracking-normal text-gray-900"
          data-cy="okr-card-value"
        >
          {display}%
        </div>
      </div>
      <div className="flex flex-col mt-3" data-cy="okr-card-kpi-progress-body">
        <div
          className="text-gray-500 w-full font-normal text-base text-start"
          data-cy="okr-card-label"
        >
          KPI Progress
        </div>
        <div className="flex gap-2 items-center" data-cy="okr-card-details">
          <Progress
            percent={Number(progress || 0)}
            showInfo={false}
            strokeColor="#1f4fd8"
            trailColor="#e5e7eb"
          />
        </div>
      </div>
    </Card>
  );
}
