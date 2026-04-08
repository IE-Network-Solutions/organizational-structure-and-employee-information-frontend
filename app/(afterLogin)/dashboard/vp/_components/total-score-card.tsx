'use client';

import {
  useGetVpScoreCalculate,
  useGetVPScore,
} from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Skeleton } from 'antd';

const TotalScoreCard = () => {
  const userId = useAuthenticationStore.getState().userId;
  const { data: vpScore, isLoading: isScoreLoading } = useGetVPScore(userId);
  const { isLoading: isRefreshing, isRefetching } = useGetVpScoreCalculate(
    userId,
    false,
  );

  const score = Number(vpScore?.score ?? 0);
  const previousScore = Number(vpScore?.previousScore ?? 0);
  const target = Number(vpScore?.maxScore ?? 0);
  const delta = score - previousScore;
  const achievedWidth = target > 0 ? Math.min((score / target) * 100, 100) : 0;

  return (
    <div
      className="rounded-lg border border-[#e6e6e6] bg-white px-5 py-4"
      data-cy="vp-total-score-card"
    >
      <div
        className="flex items-start justify-between gap-3"
        data-cy="vp-total-score-header"
      >
        <div data-cy="vp-total-score-main">
          {/* <div className="flex items-center gap-2">
            <p className="text-sm text-[#595959]">Total VP Score</p>
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              loading={isRefreshing || isRefetching}
              onClick={() => refetch()}
              className="!text-[#8c8c8c]"
            />
          </div> */}
          <div
            className="flex items-end gap-2 mt-2"
            data-cy="vp-total-score-value-row"
          >
            {(isScoreLoading && !vpScore) || isRefreshing || isRefetching ? (
              <Skeleton active paragraph={false} title={{ width: 120 }} />
            ) : (
              <>
                <h2
                  className="text-[30px] leading-[30px] font-semibold text-[#1f1f1f]"
                  data-cy="vp-total-score-value"
                >
                  {score.toFixed(2)}%
                </h2>
                <span
                  className="text-sm text-[#10B981] "
                  data-cy="vp-total-score-achieved-label"
                >
                  Achieved
                </span>
              </>
            )}
          </div>
        </div>
        <span
          className={`rounded border px-2 py-1 text-xs ${
            delta >= 0
              ? 'border-[#b7eb8f] bg-[#f6ffed] text-[#389e0d]'
              : 'border-[#ffa39e] bg-[#fff1f0] text-[#ff4d4f]'
          }`}
          data-cy="vp-total-score-delta"
        >
          {delta >= 0 ? '+' : ''}
          {delta.toFixed(2)} vs last month
        </span>
      </div>

      <div
        className="mt-4 h-3.5 w-full overflow-hidden rounded-full bg-[#f0f0f0]"
        data-cy="vp-total-score-progress-track"
      >
        <div
          className="h-full w-full bg-[#3b82f6]"
          data-cy="vp-total-score-progress-target"
        >
          <div
            className="h-full bg-[#10b981]"
            style={{ width: `${achievedWidth}%` }}
            data-cy="vp-total-score-progress-achieved"
          />
        </div>
      </div>

      <div
        className="flex items-center gap-6 text-xs text-[#8c8c8c] mt-2"
        data-cy="vp-total-score-legend"
      >
        <div
          className="flex items-center gap-1.5"
          data-cy="vp-total-score-legend-achieved"
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-[#10b981]"
            data-cy="vp-total-score-legend-achieved-dot"
          />
          Achieved{' '}
          <span
            className="text-[#595959]"
            data-cy="vp-total-score-legend-achieved-value"
          >
            {score.toFixed(2)}%
          </span>
        </div>
        <div
          className="flex items-center gap-1.5"
          data-cy="vp-total-score-legend-target"
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-[#3b82f6]"
            data-cy="vp-total-score-legend-target-dot"
          />
          Target{' '}
          <span
            className="text-[#595959]"
            data-cy="vp-total-score-legend-target-value"
          >
            {target}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default TotalScoreCard;
