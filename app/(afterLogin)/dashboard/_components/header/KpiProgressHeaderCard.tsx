'use client';

import { useMemo } from 'react';
import { Card, Progress } from 'antd';
import { useRouter } from 'next/navigation';
import { useGetBscScorecards } from '@/store/server/features/bsc/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { EmployeeScorecard, ScorecardStatus } from '@/types/bsc';
import { isScorecardEvaluated } from '@/utils/bsc/rollup';

const cardShellClass =
  'flex flex-col gap-4 h-[115px] min-w-[260px] flex-none shadow-none rounded-lg border border-[#D9D9D9] bg-white p-3 md:min-w-0';

function currentMonthName(): string {
  return new Date().toLocaleString('en-US', { month: 'long' });
}

function currentYear(): number {
  return new Date().getFullYear();
}

export function computeKpiProgressPercent(
  scorecard: EmployeeScorecard | null | undefined,
): number {
  if (!scorecard) return 0;

  if (scorecard.finalEvaluation?.compositeScore != null) {
    return Math.min(Number(scorecard.finalEvaluation.compositeScore), 100);
  }

  // Only show a score after the evaluation flow is finished (finalize).
  if (!isScorecardEvaluated(scorecard)) return 0;

  const fromServerScores = scorecard.targets.filter(
    (t) => t.score != null && Number.isFinite(Number(t.score)),
  );
  if (fromServerScores.length) {
    const weightSum = fromServerScores.reduce(
      (sum, t) => sum + (t.weightPercentage || 0),
      0,
    );
    if (weightSum <= 0) return 0;
    const weighted = fromServerScores.reduce(
      (sum, t) => sum + (Number(t.score) * (t.weightPercentage || 0)) / weightSum,
      0,
    );
    return Math.min(weighted, 100);
  }

  return 0;
}

function pickCurrentScorecard(
  scorecards: EmployeeScorecard[] | undefined,
  userId: string | undefined,
): EmployeeScorecard | null {
  const list = scorecards || [];
  const mine = userId ? list.filter((s) => s.userId === userId) : [];
  const cards = mine.length
    ? mine
    : list.filter((s) => s.userId === 'demo-user');
  if (!cards.length) return null;

  const thisMonth = currentMonthName();
  const year = currentYear();
  return (
    cards.find(
      (s) =>
        s.periodMonthName?.toLowerCase() === thisMonth.toLowerCase() &&
        (s.periodYear == null || s.periodYear === year),
    ) ||
    cards.find((s) => s.status === ScorecardStatus.Active) ||
    cards[0] ||
    null
  );
}

type KpiProgressHeaderCardProps = {
  /** When set, use this scorecard instead of auto-picking the current period. */
  scorecard?: EmployeeScorecard | null;
  label?: string;
  /** When false, the card is not clickable (e.g. already on My Scorecard). */
  navigateOnClick?: boolean;
  loading?: boolean;
  className?: string;
  dataCy?: string;
};

export default function KpiProgressHeaderCard({
  scorecard: scorecardProp,
  label = 'KPI Progress',
  navigateOnClick = true,
  loading: loadingProp,
  className,
  dataCy = 'okr-card-kpi-progress',
}: KpiProgressHeaderCardProps = {}) {
  const { userId } = useAuthenticationStore();
  const { data: scorecards, isLoading: scorecardsLoading } =
    useGetBscScorecards();
  const router = useRouter();

  const progress = useMemo(() => {
    const scorecard =
      scorecardProp !== undefined
        ? scorecardProp
        : pickCurrentScorecard(scorecards, userId);
    return computeKpiProgressPercent(scorecard);
  }, [scorecardProp, scorecards, userId]);

  const isLoading =
    loadingProp ?? (scorecardProp !== undefined ? false : scorecardsLoading);

  const display = Number.isFinite(progress)
    ? Math.abs(progress % 1) < 1e-9
      ? String(Math.round(progress))
      : progress.toFixed(2)
    : '0';

  const clickable = navigateOnClick;

  return (
    <Card
      loading={isLoading}
      bordered={false}
      bodyStyle={{ padding: 0 }}
      className={`${cardShellClass} ${
        clickable ? 'cursor-pointer' : 'cursor-default'
      } ${className || ''}`}
      onClick={clickable ? () => router.push('/bsc/my-scorecard') : undefined}
      data-cy={dataCy}
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
          {label}
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
