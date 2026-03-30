'use client';

import React, { useMemo } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import { TopOkrPerformersCardSkeleton } from './PerformanceCardSkeletons';
import { useGetOkrTotalSummaryLeaderboard } from '@/store/server/features/performance/okr-total-summary/queries';
import { useGetActiveSession } from '@/store/server/features/okrplanning/okr/target/queries';

/** API sometimes returns noisy strings; extract first usable http(s) URL if present. */
function avatarSrcFromApi(raw: string | null | undefined): string | undefined {
  if (raw == null) return undefined;
  const s = String(raw).trim();
  if (!s) return undefined;
  const m = s.match(/https?:\/\/[^\s<>"']+/i);
  return m ? m[0] : undefined;
}

function formatOkrScore(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(2)}%`;
}

type TopOkrPerformersCardProps = {
  sessionId?: string | null;
};

export default function TopOkrPerformersCard({
  sessionId: sessionIdProp,
}: TopOkrPerformersCardProps) {
  const { data: activeSession, isLoading: activeSessionLoading } =
    useGetActiveSession();

  const resolvedSessionId =
    sessionIdProp ??
    (activeSession as { id?: string } | undefined)?.id ??
    undefined;

  const {
    data,
    isLoading: leaderboardLoading,
    isError,
  } = useGetOkrTotalSummaryLeaderboard(resolvedSessionId);

  const contextLoading = sessionIdProp == null && activeSessionLoading;
  const showSpinner =
    contextLoading || (Boolean(resolvedSessionId) && leaderboardLoading);

  const performers = useMemo(() => data?.performers ?? [], [data?.performers]);

  const missingSession =
    !resolvedSessionId && !showSpinner
      ? 'Active session is not available.'
      : null;

  return (
    <section
      className="h-[406px] rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
      data-cy="performance-top-okr-performers-card"
    >
      <h2 className="mb-4 text-base font-bold text-black">
        Top OKR Performers
      </h2>
      {showSpinner ? (
        <TopOkrPerformersCardSkeleton />
      ) : missingSession ? (
        <p className="text-sm text-gray-500">{missingSession}</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Failed to load leaderboard.</p>
      ) : (
        <ul className="scrollbar-none h-[340px] space-y-3 overflow-y-auto">
          {performers.length === 0 ? (
            <li className="text-sm text-gray-500">
              No performers for this session.
            </li>
          ) : (
            performers.map((person) => {
              const src = avatarSrcFromApi(person.avatarUrl);
              return (
                <li
                  key={person.userId}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar
                      size={36}
                      src={src}
                      icon={!src ? <UserOutlined /> : undefined}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {person.fullName}
                      </p>
                      <p className="truncate text-xs font-normal text-gray-500">
                        {person.roleLabel || person.position}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-gray-900">
                    {formatOkrScore(person.okrScorePercent)}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </section>
  );
}
