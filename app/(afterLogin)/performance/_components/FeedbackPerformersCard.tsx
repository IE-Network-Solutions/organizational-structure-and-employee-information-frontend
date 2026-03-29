'use client';

import React, { useMemo } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import { FeedbackPerformersCardSkeleton } from './PerformanceCardSkeletons';
import { useGetFeedbackStatsPerformers } from '@/store/server/features/performance/feedback-stats/queries';
import type { FeedbackStatsPerformer } from '@/store/server/features/performance/feedback-stats/interface';
import { useGetActiveMonth } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useGetActiveSession } from '@/store/server/features/okrplanning/okr/target/queries';

const ENGAGEMENT_BAR = '#C4B5FD';
const KPI_BAR = '#3B82F6';
const ENGAGEMENT_LABEL = '#7C3AED';
const KPI_LABEL = '#2563EB';

function SegmentedBar({
  engagementCount,
  kpiCount,
}: Pick<FeedbackStatsPerformer, 'engagementCount' | 'kpiCount'>) {
  const sum = engagementCount + kpiCount;
  const engFlex = sum > 0 ? engagementCount : 1;
  const kpiFlex = sum > 0 ? kpiCount : 1;

  return (
    <div className="flex w-full gap-2">
      <div
        className="flex min-w-0 flex-1 flex-col gap-2"
        style={{ flex: `${engFlex} 1 0%` }}
      >
        <div
          className="h-[6px] w-full rounded-full"
          style={{ backgroundColor: ENGAGEMENT_BAR }}
          title={`Engagement ${engagementCount}`}
        />
        <p
          className="text-center text-xs font-medium"
          style={{ color: ENGAGEMENT_LABEL }}
        >
          Engagement {engagementCount}
        </p>
      </div>
      <div
        className="flex min-w-0 flex-1 flex-col gap-2"
        style={{ flex: `${kpiFlex} 1 0%` }}
      >
        <div
          className="h-[6px] w-full rounded-full"
          style={{ backgroundColor: KPI_BAR }}
          title={`KPI ${kpiCount}`}
        />
        <p
          className="text-center text-xs font-medium"
          style={{ color: KPI_LABEL }}
        >
          KPI {kpiCount}
        </p>
      </div>
    </div>
  );
}

type FeedbackPerformersCardProps = {
  sessionId?: string | null;
  monthId?: string | null;
};

export default function FeedbackPerformersCard({
  sessionId: sessionIdProp,
  monthId: monthIdProp,
}: FeedbackPerformersCardProps) {
  const { data: activeSession, isLoading: activeSessionLoading } =
    useGetActiveSession();
  const { data: activeMonth, isLoading: activeMonthLoading } =
    useGetActiveMonth();

  const resolvedSessionId =
    sessionIdProp ??
    (activeSession as { id?: string } | undefined)?.id ??
    undefined;
  const resolvedMonthId =
    monthIdProp !== undefined
      ? monthIdProp
      : ((activeMonth as { id?: string } | undefined)?.id ?? undefined);

  const { data, isLoading: performersLoading, isError } =
    useGetFeedbackStatsPerformers(resolvedSessionId, resolvedMonthId);

  const contextLoading =
    (sessionIdProp == null && activeSessionLoading) ||
    (monthIdProp === undefined && activeMonthLoading);
  const showSpinner =
    contextLoading ||
    (Boolean(resolvedSessionId) && performersLoading);

  const performers = useMemo(() => data?.performers ?? [], [data?.performers]);

  const missingSession =
    !resolvedSessionId && !showSpinner
      ? 'Active session is not available.'
      : null;

  return (
    <section
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm h-[345px]"
      data-cy="performance-feedback-performers-card"
    >
      <h2 className="mb-4 text-base font-bold text-black">
        Feedback Performers
      </h2>
      {showSpinner ? (
        <FeedbackPerformersCardSkeleton />
      ) : missingSession ? (
        <p className="text-sm text-gray-500">{missingSession}</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Failed to load performers.</p>
      ) : (
        <ul className="scrollbar-none h-[265px] space-y-4 overflow-y-auto">
          {performers.length === 0 ? (
            <li className="text-sm text-gray-500">No performers for this period.</li>
          ) : (
            performers.map((p) => (
              <li
                key={p.userId}
                className="mt-1 rounded-xl border border-gray-200 bg-white p-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    size={36}
                    src={p.profileImageUrl ?? undefined}
                    icon={!p.profileImageUrl ? <UserOutlined /> : undefined}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-normal text-black">{p.name}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {p.jobTitle}
                        </p>
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
                <SegmentedBar
                  engagementCount={p.engagementCount}
                  kpiCount={p.kpiCount}
                />
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
}
