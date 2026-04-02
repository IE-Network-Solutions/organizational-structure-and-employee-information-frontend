'use client';
/* eslint-disable local-rules/data-cy-required */

import React, { useEffect, useMemo, useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Select } from 'antd';
import { FeedbackPerformersCardSkeleton } from './PerformanceCardSkeletons';
import { useGetFeedbackStatsPerformers } from '@/store/server/features/performance/feedback-stats/queries';
import { useGetActiveMonth } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useGetActiveSession } from '@/store/server/features/okrplanning/okr/target/queries';
import Link from 'next/link';

const ENGAGEMENT_BAR = '#4096FF';
const KPI_BAR = '#1E40AF';
const ENGAGEMENT_LABEL = '#4096FF';
const KPI_LABEL = '#1E40AF';

function SegmentedBar({
  engagementCount,
  kpiCount,
  kpiScore,
}: {
  engagementCount: number;
  kpiCount: number;
  kpiScore: number;
}) {
  const sum = engagementCount + kpiCount;
  const kpiPct = sum > 0 ? (kpiCount / sum) * 100 : 0;
  const engPct = sum > 0 ? (engagementCount / sum) * 100 : 0;
  const kpiOnly = kpiCount > 0 && engagementCount === 0;
  const engOnly = engagementCount > 0 && kpiCount === 0;

  return (
    <div className="w-full">
      <div
        className="flex h-[6px] w-full overflow-hidden rounded-full bg-gray-100 gap-0.5"
        data-cy="performance-feedback-performers-segmented-bar"
        aria-label="KPI and engagement breakdown"
      >
        <div
          className={`h-[6px] shrink-0 ${kpiOnly ? 'rounded-full' : 'rounded-r-full'}`}
          style={{
            width: `${kpiPct}%`,
            backgroundColor: KPI_BAR,
          }}
          title={`KPI ${kpiCount} | Point ${kpiScore}`}
        />
        <div
          className={`h-[6px] shrink-0 ${engOnly ? 'rounded-full' : 'rounded-l-full'}`}
          style={{
            width: `${engPct}%`,
            backgroundColor: ENGAGEMENT_BAR,
          }}
          title={`Engagement ${engagementCount}`}
        />
      </div>
      <div className="mt-2 flex  gap-x-6 gap-y-1 text-xs font-medium items-center ">
        <p
          className="w-1/2 text-center flex items-center justify-center"
          style={{ color: KPI_LABEL }}
        >
          KPI {kpiCount} | Point {kpiScore}
        </p>
        <p className="w-1/2 text-center" style={{ color: ENGAGEMENT_LABEL }}>
          Engagement {engagementCount}
        </p>
      </div>
    </div>
  );
}

type FeedbackPerformersCardProps = {
  sessionId?: string | null;
  monthId?: string | null;
  monthOptions?: Array<{ id: string; name?: string | null; active?: boolean }>;
  onMonthChange?: (monthId: string) => void;
};

export default function FeedbackPerformersCard({
  sessionId: sessionIdProp,
  monthId: monthIdProp,
  monthOptions,
}: FeedbackPerformersCardProps) {
  const { data: activeSession, isLoading: activeSessionLoading } =
    useGetActiveSession();
  const { data: activeMonth, isLoading: activeMonthLoading } =
    useGetActiveMonth();

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

  const activeMonthIdForUi =
    activeMonth && typeof activeMonth === 'object' && 'id' in activeMonth
      ? String((activeMonth as any).id)
      : null;

  const orderedMonthsForUi = useMemo(() => {
    const months = monthOptions ?? [];
    if (!months.length) return [];

    const activeId =
      selectedMonthIdLocal ?? (activeMonthIdForUi ? activeMonthIdForUi : null);
    if (!activeId) return months;

    return [
      ...months.filter((m) => String(m.id) === activeId),
      ...months.filter((m) => String(m.id) !== activeId),
    ];
  }, [monthOptions, activeMonthIdForUi, selectedMonthIdLocal]);

  const resolvedMonthIdForUi = useMemo(() => {
    if (resolvedMonthId !== undefined && resolvedMonthId !== null)
      return String(resolvedMonthId);
    return null;
  }, [resolvedMonthId]);

  const {
    data,
    isLoading: performersLoading,
    isError,
  } = useGetFeedbackStatsPerformers(resolvedSessionId, resolvedMonthId);

  const contextLoading =
    (sessionIdProp == null && activeSessionLoading) ||
    (resolvedMonthId == null && activeMonthLoading);
  const showSpinner =
    contextLoading || (Boolean(resolvedSessionId) && performersLoading);

  const performers = useMemo(() => data?.performers ?? [], [data?.performers]);
  const missingSession =
    !resolvedSessionId && !showSpinner
      ? 'Active session is not available.'
      : null;

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
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm h-[477px]"
      data-cy="performance-feedback-performers-card"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-black">Feedback Performers</h2>
        <div className="flex items-center gap-2">
          {orderedMonthsForUi.length > 0 && (
            <>
              <Select
                id="performance-performers-month-select"
                data-cy="performance-performers-month-select"
                className="md:min-w-[90px] w-full h-[22px]"
                size="small"
                placeholder="Select Month"
                value={resolvedMonthIdForUi ?? undefined}
                onChange={(value) => {
                  setSelectedMonthIdLocal(String(value));
                }}
                options={orderedMonthsForUi.map((m) => ({
                  value: String(m.id),
                  label: m.name ?? String(m.id),
                }))}
              />

              {/* {!isMonthListOpen && (
              <button
                type="button"
                onClick={() => setIsMonthListOpen(true)}
                aria-expanded={isMonthListOpen}
                aria-controls="performance-performers-month-items"
                className="hidden sm:block px-3 py-1 text-xs rounded border transition bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-50"
                id="performance-performers-month-active-toggle"
                data-cy="performance-performers-month-active-toggle"
              >
                {selectedMonthName ??
                  (activeMonth as { name?: string } | undefined)?.name ??
                  'Select Month'}
              </button>
            )}

            {isMonthListOpen && (
              <div
                id="performance-performers-month-items"
                data-cy="performance-performers-month-items"
                className="hidden sm:flex flex-nowrap items-center gap-2 justify-end overflow-x-auto"
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
                    id={`performance-performers-month-item-${m.name ?? m.id}`}
                    data-cy={`performance-performers-month-item-${m.name ?? m.id}`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )} */}
            </>
          )}
          <Link
            className="text-primary text-sm font-normal w-full"
            href="/feedback/feedback"
          >
            View All
          </Link>
        </div>
      </div>
      {showSpinner ? (
        <FeedbackPerformersCardSkeleton />
      ) : missingSession ? (
        <p className="text-sm text-gray-500">{missingSession}</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Failed to load performers.</p>
      ) : (
        <ul className="scrollbar-none h-[400px] space-y-4 overflow-y-auto">
          {performers.length === 0 ? (
            <li className="text-sm text-gray-500">
              No performers for this period.
            </li>
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
                        <p className="text-sm font-normal text-black">
                          {p.name}
                        </p>
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
                  engagementCount={p.engagementCount || 0}
                  kpiCount={p.kpiCount || 0}
                  kpiScore={p.kpiScore || 0}
                />
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
}
