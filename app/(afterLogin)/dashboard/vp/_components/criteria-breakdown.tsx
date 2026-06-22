'use client';

import { Skeleton } from 'antd';
import { useGetVPScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import ViolationCard from './violation-card';

type VPCriteria = {
  name?: string;
  score?: number | string;
  weight?: number | string;
  previousScore?: number | string;
};

const toNumber = (value: number | string | undefined) => Number(value ?? 0);

const CriteriaBreakdown = () => {
  const userId = useAuthenticationStore.getState().userId;
  const { data: vpScore, isLoading } = useGetVPScore(userId);

  const criteria: VPCriteria[] = (vpScore?.criteria as VPCriteria[]) ?? [];
  const attendanceCriteria = criteria.find((item) =>
    (item.name ?? '').toLowerCase().includes('attendance'),
  );
  const metricCards = criteria.filter((item) => item !== attendanceCriteria);

  return (
    <div
      className="rounded-lg border border-[#e6e6e6] bg-white p-4"
      data-cy="vp-criteria-breakdown"
    >
      <h3
        className="text-base font-bold text-[#2b2b2b] mb-4"
        data-cy="vp-criteria-breakdown-title"
      >
        Criteria Breakdown
      </h3>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3"
        data-cy="vp-criteria-breakdown-top-row"
      >
        <div
          className="rounded-lg border border-[#f0f0f0] p-4"
          data-cy="vp-criteria-breakdown-attendance-card"
        >
        <div
          className="flex items-center justify-between gap-3"
          data-cy="vp-criteria-breakdown-attendance-header"
        >
          <p
            className="text-sm text-[#595959]"
            data-cy="vp-criteria-breakdown-attendance-name"
          >
            {attendanceCriteria?.name ?? 'Employee Attendance'}
          </p>
          {attendanceCriteria && (
            <span
              className={`rounded border px-2 py-1 text-xs ${
                toNumber(attendanceCriteria.score) -
                  toNumber(attendanceCriteria.previousScore) >=
                0
                  ? 'border-[#b7eb8f] bg-[#f6ffed] text-[#389e0d]'
                  : 'border-[#ffa39e] bg-[#fff1f0] text-[#ff4d4f]'
              }`}
              data-cy="vp-criteria-breakdown-attendance-delta"
            >
              {toNumber(attendanceCriteria.score) -
                toNumber(attendanceCriteria.previousScore) >=
              0
                ? '+'
                : ''}
              {(
                toNumber(attendanceCriteria.score) -
                toNumber(attendanceCriteria.previousScore)
              ).toFixed(2)}{' '}
              vs last month
            </span>
          )}
        </div>
        {attendanceCriteria?.score == 0 ? (
          <div
            className="mt-2 rounded-md border border-[#389e0d] bg-[#f6ffed] p-3"
            data-cy="vp-criteria-breakdown-attendance-positive"
          >
            <p
              className="text-sm text-[#389e0d]"
              data-cy="vp-criteria-breakdown-attendance-positive-text"
            >
              No Absences Recorded This month
            </p>
            <p
              className="text-xs text-[#8c8c8c] mt-1"
              data-cy="vp-criteria-breakdown-attendance-positive-points"
            >
              {toNumber(attendanceCriteria?.score).toFixed(2)} of{' '}
              {toNumber(attendanceCriteria?.weight).toFixed(2)} VP points
              deducted
            </p>
          </div>
        ) : (
          <div
            className="mt-2 rounded-md border border-[#ffccc7] bg-[#fff1f0] p-3"
            data-cy="vp-criteria-breakdown-attendance-negative"
          >
            <p
              className="text-sm text-[#ff4d4f]"
              data-cy="vp-criteria-breakdown-attendance-negative-text"
            >
              Attendance deductions impact your monthly VP.
            </p>
            <p
              className="text-xs text-[#8c8c8c] mt-1"
              data-cy="vp-criteria-breakdown-attendance-negative-points"
            >
              {toNumber(attendanceCriteria?.score).toFixed(2)} of{' '}
              {toNumber(attendanceCriteria?.weight).toFixed(2)} VP points
              deducted
            </p>
          </div>
        )}
        </div>

        <ViolationCard userId={userId} />
      </div>

      <div
        className="grid grid-cols-2 gap-3 md:grid-cols-3"
        data-cy="vp-criteria-breakdown-metrics-grid"
      >
        {isLoading ? (
          <>
            <Skeleton active paragraph={{ rows: 2 }} />
            <Skeleton active paragraph={{ rows: 2 }} />
            <Skeleton active paragraph={{ rows: 2 }} />
          </>
        ) : (
          metricCards.map((metric) => {
            const score = toNumber(metric.score);
            const weight = toNumber(metric.weight);
            const delta = score - toNumber(metric.previousScore);

            return (
              <div
                key={metric.name}
                className="rounded-lg border border-[#ededed] p-3 min-h-[88px]"
                data-cy={`vp-criteria-breakdown-metric-${String(
                  metric.name ?? 'unknown',
                )
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`}
              >
                <p
                  className="text-xs text-black/65"
                  data-cy="vp-criteria-breakdown-metric-name"
                >
                  {metric.name}
                </p>
                <p
                  className="mt-1"
                  data-cy="vp-criteria-breakdown-metric-score-row"
                >
                  <span
                    className="text-xl text-black/65 font-bold"
                    data-cy="vp-criteria-breakdown-metric-score"
                  >
                    {score.toFixed(2)}
                  </span>{' '}
                  <span
                    className="text-sm text-[#8c8c8c]"
                    data-cy="vp-criteria-breakdown-metric-weight-wrap"
                  >
                    /{' '}
                    <span
                      className="text-sm text-black/65"
                      data-cy="vp-criteria-breakdown-metric-weight"
                    >
                      {weight.toFixed(2)}
                    </span>
                  </span>
                </p>
                <p
                  className={`text-sm mt-1 ${delta >= 0 ? 'text-[#52c41a]' : 'text-[#ff4d4f]'}`}
                  data-cy="vp-criteria-breakdown-metric-delta"
                >
                  {delta >= 0 ? '+' : ''}
                  {delta.toFixed(2)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CriteriaBreakdown;
