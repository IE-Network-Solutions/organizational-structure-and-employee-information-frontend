'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Progress } from 'antd';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { ActionPlanCardSkeleton } from './PerformanceCardSkeletons';
import { useGetActionPlansDashboard } from '@/store/server/features/performance/action-plans/queries';
import { useGetActiveMonth } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useGetActiveSession } from '@/store/server/features/okrplanning/okr/target/queries';

const GREEN = '#10b981';
const ORANGE = '#f59e0b';
const RED = '#ef4444';

const FALLBACK_ACTION_PLAN_PERFORMERS = [
  {
    id: '1',
    name: 'Emily Chen',
    role: 'Product Designer',
    survey: 34,
    meeting: 14,
    score: 80,
  },
  {
    id: '2',
    name: 'Emily Chen',
    role: 'Product Designer',
    survey: 34,
    meeting: 14,
    score: 80,
  },
  {
    id: '3',
    name: 'Emily Chen',
    role: 'Product Designer',
    survey: 34,
    meeting: 14,
    score: 20,
  },
  {
    id: '3',
    name: 'Emily Chen',
    role: 'Product Designer',
    survey: 34,
    meeting: 14,
    score: 20,
  },
  {
    id: '3',
    name: 'Emily Chen',
    role: 'Product Designer',
    survey: 34,
    meeting: 14,
    score: 20,
  },
];

type ActionPlanCardProps = {
  sessionId?: string | null;
  monthId?: string | null;
  monthOptions?: Array<{ id: string; name?: string | null; active?: boolean }>;
  onMonthChange?: (monthId: string) => void;
};

export default function ActionPlanCard({
  sessionId: sessionIdProp,
  monthId: monthIdProp,
  monthOptions,
}: ActionPlanCardProps) {
  const { data: activeSession, isLoading: activeSessionLoading } =
    useGetActiveSession();
  const { data: activeMonth, isLoading: activeMonthLoading } =
    useGetActiveMonth();

  const [isMonthListOpen, setIsMonthListOpen] = useState(false);
  const [selectedMonthIdLocal, setSelectedMonthIdLocal] = useState<
    string | null
  >(() => {
    const last = monthOptions?.length
      ? monthOptions[monthOptions.length - 1]
      : null;
    return last?.id ? String(last.id) : null;
  });

  useEffect(() => {
    if (sessionIdProp == null) return;
    if (!monthOptions?.length) return;

    const last = monthOptions[monthOptions.length - 1];
    if (last?.id) setSelectedMonthIdLocal(String(last.id));
    setIsMonthListOpen(false);
  }, [sessionIdProp, monthOptions?.length]);

  const resolvedSessionId =
    sessionIdProp ??
    (activeSession as { id?: string } | undefined)?.id ??
    undefined;

  const lastMonthIdFromOptions = monthOptions?.length
    ? String(monthOptions[monthOptions.length - 1].id)
    : null;

  const resolvedMonthId =
    selectedMonthIdLocal ??
    lastMonthIdFromOptions ??
    monthIdProp ??
    (activeMonth as { id?: string } | undefined)?.id ??
    undefined;

  const orderedMonthsForUi = useMemo(() => {
    const months = monthOptions ?? [];
    if (!months.length) return [];

    const activeMonthId =
      selectedMonthIdLocal ??
      (activeMonth && typeof activeMonth === 'object' && 'id' in activeMonth
        ? String((activeMonth as any).id)
        : null);
    if (!activeMonthId) return months;

    return [
      ...months.filter((m) => String(m.id) === activeMonthId),
      ...months.filter((m) => String(m.id) !== activeMonthId),
    ];
  }, [monthOptions, activeMonth, selectedMonthIdLocal]);

  const resolvedMonthIdForUi = useMemo(() => {
    if (resolvedMonthId !== undefined && resolvedMonthId !== null) {
      return String(resolvedMonthId);
    }
    return null;
  }, [resolvedMonthId]);

  const selectedMonthName = useMemo(() => {
    if (!resolvedMonthIdForUi) return null;
    const match = orderedMonthsForUi.find(
      (m) => String(m.id) === resolvedMonthIdForUi,
    );
    return match?.name ?? null;
  }, [orderedMonthsForUi, resolvedMonthIdForUi]);

  const {
    data,
    isLoading: dashboardLoading,
    isError,
  } = useGetActionPlansDashboard(resolvedSessionId, resolvedMonthId);

  const contextLoading =
    (sessionIdProp == null && activeSessionLoading) ||
    (resolvedMonthId == null && activeMonthLoading);
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
  const diffFormatted = hasMonthOverMonth ? `${Math.abs(pctDiff)}%` : null;

  useEffect(() => {
    if (selectedMonthIdLocal) return;
    if ((monthOptions?.length ?? 0) > 0) return;
    if (!activeMonthLoading) {
      const id = (activeMonth as { id?: string } | undefined)?.id;
      if (id) setSelectedMonthIdLocal(String(id));
    }
  }, [activeMonthLoading, activeMonth, selectedMonthIdLocal, monthOptions]);

  useEffect(() => {
    if (!selectedMonthIdLocal) return;
    const exists = (monthOptions ?? []).some(
      (m) => String(m.id) === String(selectedMonthIdLocal),
    );
    if (!exists) setSelectedMonthIdLocal(null);
  }, [monthOptions, selectedMonthIdLocal]);

  return (
    <section
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm h-[444px]"
      data-cy="performance-action-plan-card"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-black">Action Plan</h2>

        {orderedMonthsForUi.length > 0 && (
          <>
            {!isMonthListOpen && (
              <button
                type="button"
                onClick={() => setIsMonthListOpen(true)}
                aria-expanded={isMonthListOpen}
                aria-controls="performance-action-plan-month-items"
                className="px-3 py-1 text-xs rounded border transition bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-50"
                id="performance-action-plan-month-active-toggle"
                data-cy="performance-action-plan-month-active-toggle"
              >
                {selectedMonthName ??
                  (activeMonth as { name?: string } | undefined)?.name ??
                  'Select Month'}
              </button>
            )}

            {isMonthListOpen && (
              <div
                id="performance-action-plan-month-items"
                data-cy="performance-action-plan-month-items"
                className="flex flex-nowrap items-center gap-2 justify-end overflow-x-auto"
              >
                {orderedMonthsForUi.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setIsMonthListOpen(false);
                      setSelectedMonthIdLocal(String(m.id));
                    }}
                    className={[
                      'px-3 py-1 text-xs rounded border transition flex-shrink-0',
                      resolvedMonthIdForUi === String(m.id)
                        ? 'bg-gray-100 text-gray-900 border-gray-300'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                    ].join(' ')}
                    id={`performance-action-plan-month-item-${m.name ?? m.id}`}
                    data-cy={`performance-action-plan-month-item-${m.name ?? m.id}`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

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
                  {pctDiff >= 0 ? (
                    <TrendingUp
                      className="h-4 w-4 shrink-0 text-red-400"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                  ) : (
                    <TrendingDown
                      className="h-4 w-4 shrink-0 text-red-400"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                  )}
                  <span className="text-sm font-medium text-red-400">
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
            className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-gray-100"
            data-cy="performance-action-plan-segmented-bar"
            aria-label="Action plan breakdown"
          >
            <div
              className="h-full rounded-l-full bg-[#10B981]"
              style={{ width: `${resolvedWidth}%` }}
              data-cy="performance-action-plan-segment-resolved"
              title={`Resolved ${resolved}`}
            />
            <div
              className="h-full bg-orange"
              style={{ width: `${pendingWidth}%` }}
              data-cy="performance-action-plan-segment-pending"
              title={`Pending ${pending}`}
            />
            <div
              className="h-full rounded-r-full bg-red-500"
              style={{ width: `${unresolvedWidth}%` }}
              data-cy="performance-action-plan-segment-unresolved"
              title={`Unresolved ${unresolved}`}
            />
          </div>

          <div className="mt-3 flex gap-10 text-sm font-medium">
            <div className="text-start" style={{ color: GREEN }}>
              Resolved {resolved}
            </div>
            <div className="text-start" style={{ color: ORANGE }}>
              Pending {pending}
            </div>
            <div className="text-start" style={{ color: RED }}>
              unresolved {unresolved}
            </div>
          </div>

          <div className="my-4 h-px w-full bg-gray-200" />

          <ul className="space-y-2 h-[230px] overflow-y-auto scrollbar-none">
            {FALLBACK_ACTION_PLAN_PERFORMERS.map((performer) => (
              <li key={performer.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      size={40}
                      icon={<UserOutlined />}
                      className="shrink-0 bg-gray-200 text-gray-500"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-2xl font-semibold leading-none text-gray-900 sm:text-lg">
                        {performer.name}
                      </p>
                      <p className="truncate pt-1 text-sm text-gray-500">
                        {performer.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-md border border-gray-300 bg-gray-50 px-3 py-1 text-sm text-gray-600">
                      Survey:{performer.survey}
                    </span>
                    <span className="rounded-md border border-gray-300 bg-gray-50 px-3 py-1 text-sm text-gray-600">
                      Meeting:{performer.meeting}
                    </span>
                  </div>
                </div>

                <div className="flex flex-row-reverse items-center">
                  <span className="w-9 text-right text-xl text-gray-600 sm:text-base">
                    {performer.score}%
                  </span>
                  <div className="flex-1">
                    <Progress
                      percent={performer.score}
                      showInfo={false}
                      strokeColor="#1E40AF"
                      trailColor="#e5e7eb"
                      strokeWidth={6}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
