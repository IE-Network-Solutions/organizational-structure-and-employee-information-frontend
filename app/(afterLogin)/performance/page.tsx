'use client';
/* eslint-disable local-rules/data-cy-required */

import React, { useEffect, useMemo, useState } from 'react';
import OkrProgressCard from './_components/OkrProgressCard';
import FeedbackCard from './_components/FeedbackCard';
import TopOkrPerformersCard from './_components/TopOkrPerformersCard';
import FeedbackPerformersCard from './_components/FeedbackPerformersCard';
import ActionPlanCard from './_components/actionPlan';
import { Select } from 'antd';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import RecentHrActions from '../(employeeInformation)/employees/dashboard/_components/recent-hr-actions';
import { useGetAggregateAuditPostLogs } from '@/store/server/features/tenant-management/audit-logs/queries';

export default function PerformanceDashboardPage() {
  const { data: activeFiscalYears } = useGetActiveFiscalYears();
  const modules = ['OKRAuditLog', 'CFRAuditLog', 'TNAAuditLog'];
  const {
    data: aggregateAuditLogsResponse,
    isLoading: isRecentActionsLoading,
  } = useGetAggregateAuditPostLogs({
    modules: modules,
    page: 1,
    limit: 5,
    orderBy: 'performedAt',
    orderDirection: 'DESC',
  });
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [isFiscalYearListOpen, setIsFiscalYearListOpen] = useState(false);
  const sessions = useMemo(() => {
    const cal = Array.isArray(activeFiscalYears)
      ? activeFiscalYears[0]
      : activeFiscalYears;

    const rawSessions =
      (cal as any)?.sessions ??
      (cal as any)?.data?.sessions ??
      (cal as any)?.items?.[0]?.sessions ??
      [];

    return Array.isArray(rawSessions) ? rawSessions : [];
  }, [activeFiscalYears]);

  const activeSession = useMemo(() => {
    if (!sessions.length) return null;
    return sessions.find((s: any) => Boolean(s?.active)) ?? sessions[0] ?? null;
  }, [sessions]);

  useEffect(() => {
    const activeSessionValue = activeSession?.id ?? activeSession?.name;
    if (!activeSessionValue) return;
    if (selectedSessionId) return;
    setSelectedSessionId(String(activeSessionValue));
  }, [activeSession, selectedSessionId]);

  const selectedSession = useMemo(() => {
    if (!selectedSessionId) return null;
    return (
      sessions.find(
        (s: any) => String(s?.id ?? s?.name) === String(selectedSessionId),
      ) ?? null
    );
  }, [sessions, selectedSessionId]);

  const orderedSessions = useMemo(() => {
    if (!sessions.length) return [];
    const activeSessionValue = activeSession?.id ?? activeSession?.name;
    if (!activeSessionValue) return sessions;

    return [
      ...sessions.filter(
        (s: any) => String(s?.id ?? s?.name) === String(activeSessionValue),
      ),
      ...sessions.filter(
        (s: any) => String(s?.id ?? s?.name) !== String(activeSessionValue),
      ),
    ];
  }, [sessions, activeSession]);

  const sessionId =
    selectedSessionId ??
    ((activeSession?.id ?? activeSession?.name)
      ? String(activeSession?.id ?? activeSession?.name)
      : null);

  const months = useMemo(() => {
    const rawMonths =
      (selectedSession as any)?.months ?? (activeSession as any)?.months ?? [];
    return Array.isArray(rawMonths) ? rawMonths : [];
  }, [selectedSession, activeSession]);

  const monthOptions = months;
  return (
    <div className="h-auto w-full " data-cy="performance-dashboard-page">
      <div className="">
        <div className="flex items-center py-4 justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Performance Dashboard
          </h1>
          <div
            className="flex items-end gap-2 justify-end"
            id="employee-leave-fiscal-year-list"
            data-cy="employee-leave-fiscal-year-list"
          >
            <label
              htmlFor="employee-leave-fiscal-year-select"
              className="sr-only"
            >
              Select quarter
            </label>
            <Select
              id="employee-leave-fiscal-year-select"
              data-cy="employee-leave-fiscal-year-select"
              className="block sm:hidden"
              size="small"
              placeholder="Select Quarter"
              value={selectedSessionId ?? undefined}
              onChange={(value) => {
                setSelectedSessionId(value ? String(value) : null);
                setIsFiscalYearListOpen(false);
              }}
              options={orderedSessions.map((session: any) => ({
                value: String(session.id ?? session.name),
                label: session.name,
              }))}
            />

            {!isFiscalYearListOpen && (
              <button
                type="button"
                onClick={() => setIsFiscalYearListOpen((prev) => !prev)}
                aria-expanded={isFiscalYearListOpen}
                aria-controls="employee-leave-fiscal-year-items"
                className="hidden sm:block px-3 py-1 text-xs rounded border transition bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-50"
                id="employee-leave-fiscal-year-active-toggle"
                data-cy="employee-leave-fiscal-year-active-toggle"
              >
                {selectedSession?.name ??
                  activeSession?.name ??
                  'Select Quarter'}
              </button>
            )}

            {isFiscalYearListOpen && (
              <div
                id="employee-leave-fiscal-year-items"
                data-cy="employee-leave-fiscal-year-items"
                className="hidden sm:flex flex-nowrap items-center gap-2 justify-end overflow-x-auto"
              >
                {orderedSessions.map((session: any) => (
                  <button
                    key={session.id || session.name}
                    type="button"
                    onClick={() => {
                      setSelectedSessionId(String(session.id ?? session.name));
                      setIsFiscalYearListOpen(false);
                    }}
                    className={[
                      'px-3 py-1 text-xs rounded border transition flex-shrink-0',
                      selectedSessionId === String(session.id ?? session.name)
                        ? 'bg-gray-100 text-gray-900 border-gray-300'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                    ].join(' ')}
                    id={`employee-leave-fiscal-year-item-${session.name}`}
                    data-cy={`employee-leave-fiscal-year-item-${session.name}`}
                  >
                    {session.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="flex flex-col gap-4 lg:col-span-2 lg:gap-6">
            <OkrProgressCard sessionId={sessionId} />
            <FeedbackCard sessionId={sessionId} monthOptions={monthOptions} />
            <ActionPlanCard sessionId={sessionId} monthOptions={monthOptions} />
          </div>
          <div className="flex flex-col gap-4 lg:gap-6">
            <TopOkrPerformersCard sessionId={sessionId} />
            <FeedbackPerformersCard
              sessionId={sessionId}
              monthOptions={monthOptions}
            />
            <RecentHrActions
              auditLogs={aggregateAuditLogsResponse?.items ?? []}
              isLoading={isRecentActionsLoading}
              auditLogModules={modules}
              height="444px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
