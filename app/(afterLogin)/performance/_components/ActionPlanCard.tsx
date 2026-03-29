'use client';

import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { ActionPlanCardSkeleton } from './PerformanceCardSkeletons';
import { useGetActionPlansDashboard } from '@/store/server/features/performance/action-plans/queries';
import { useGetActiveMonth } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useGetActiveSession } from '@/store/server/features/okrplanning/okr/target/queries';

const GREEN = '#10b981';
const ORANGE = '#f59e0b';
const RED = '#ef4444';

type ActionPlanCardProps = {
  sessionId?: string | null;
  monthId?: string | null;
};

export default function ActionPlanCard({
  sessionId: sessionIdProp,
  monthId: monthIdProp,
}: ActionPlanCardProps) {
  const { data: activeSession, isLoading: activeSessionLoading } =
    useGetActiveSession();
  const { data: activeMonth, isLoading: activeMonthLoading } =
    useGetActiveMonth();

  const resolvedSessionId =
    sessionIdProp ??
    (activeSession as { id?: string } | undefined)?.id ??
    undefined;
  const resolvedMonthId =
    monthIdProp ?? (activeMonth as { id?: string } | undefined)?.id ?? undefined;

  const { data, isLoading: dashboardLoading, isError } =
    useGetActionPlansDashboard(resolvedSessionId, resolvedMonthId);

  const contextLoading =
    (sessionIdProp == null && activeSessionLoading) ||
    (monthIdProp == null && activeMonthLoading);
  const showSpinner =
    contextLoading ||
    (Boolean(resolvedSessionId && resolvedMonthId) && dashboardLoading);

  const resolved = data?.resolved ?? 0;
  const pending = data?.pending ?? 0;
  const unresolved = data?.unresolved ?? 0;
  const resolvedPct = data?.resolvedPercentage ?? 0;
  const pctDiff = data?.resolvedPercentagePointDifferenceFromPreviousMonth;

  const sum = resolved + pending + unresolved;
  const resolvedWidth = sum ? (resolved / sum) * 100 : 0;
  const pendingWidth = sum ? (pending / sum) * 100 : 0;
  const unresolvedWidth = sum ? (unresolved / sum) * 100 : 0;

  const missingContext =
    !resolvedSessionId || !resolvedMonthId
      ? 'Active session or month is not available.'
      : null;

  const hasMonthOverMonth =
    pctDiff !== null && pctDiff !== undefined && !Number.isNaN(pctDiff);
  const diffFormatted = hasMonthOverMonth
    ? `${pctDiff > 0 ? '+' : ''}${pctDiff}%`
    : null;

  return (
    <section
      className="h-[177px] rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      data-cy="performance-action-plan-card"
    >
      <h2 className="mb-2 text-base font-bold text-black">Action Plan</h2>

      {showSpinner ? (
        <ActionPlanCardSkeleton />
      ) : missingContext ? (
        <p className="text-sm text-gray-500">{missingContext}</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Failed to load action plans.</p>
      ) : (
        <>
          <div className="mb-2">
            <div className="flex items-center justify-between gap-4">
              <div className="text-3xl font-bold tabular-nums tracking-tight text-gray-900">
                {resolvedPct}
                <span className="text-3xl font-bold"> %</span>
              </div>
              {hasMonthOverMonth ? (
                <div className="flex shrink-0 items-center gap-1">
                  {pctDiff > 0 ? (
                    <TrendingUp
                      className="h-5 w-5 shrink-0 text-emerald-600"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                  ) : pctDiff < 0 ? (
                    <TrendingDown
                      className="h-5 w-5 shrink-0 text-red-500"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                  ) : null}
                  <span
                    className={`text-sm font-medium ${
                      pctDiff > 0
                        ? 'text-emerald-600'
                        : pctDiff < 0
                          ? 'text-red-500'
                          : 'text-gray-600'
                    }`}
                  >
                    {diffFormatted}
                  </span>
                  <span className="text-sm text-gray-500">Last Month</span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">— vs last month</span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Action plan resolved this month
            </p>
          </div>

          <div
            className="mt-3 flex h-4 sm:h-3 w-full rounded-full overflow-hidden bg-gray-100"
            data-cy="performance-action-plan-segmented-bar"
            aria-label="Action plan breakdown"
          >
            <div
              className="h-full bg-[#10B981] rounded-r-full"
              style={{ width: `${resolvedWidth}%` }}
              data-cy="performance-action-plan-segment-resolved"
              title={`Resolved ${resolved}`}
            />
            <div
              className="h-full bg-orange rounded-full"
              style={{ width: `${pendingWidth}%` }}
              data-cy="performance-action-plan-segment-pending"
              title={`Pending ${pending}`}
            />
            <div
              className="h-full bg-red-500 rounded-full"
              style={{ width: `${unresolvedWidth}%` }}
              data-cy="performance-action-plan-segment-unresolved"
              title={`Unresolved ${unresolved}`}
            />
          </div>

          <div className="mt-3 flex gap-10 text-xs font-medium">
            <div className="text-start" style={{ color: GREEN }}>
              Resolved {resolved}
            </div>
            <div className="text-start" style={{ color: ORANGE }}>
              Pending {pending}
            </div>
            <div className="text-start" style={{ color: RED }}>
              Unresolved {unresolved}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
