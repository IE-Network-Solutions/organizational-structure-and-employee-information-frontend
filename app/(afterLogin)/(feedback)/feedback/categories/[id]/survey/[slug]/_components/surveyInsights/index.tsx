'use client';
/* eslint-disable local-rules/data-cy-required, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */

import { Avatar, Segmented, Skeleton, Tooltip } from 'antd';
import { AimOutlined, PieChartOutlined } from '@ant-design/icons';
import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useGetFormsByID } from '@/store/server/features/feedback/form/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useFetchedAllIndividualResponsesByFormId,
  useGetAllActionPlan,
  useGetAllSummaryResultByformId,
} from '@/store/server/features/organization-development/categories/queries';
import {
  employeeFullName,
  normalizeActionPlanListItem,
  normalizeActionPlanListPayload,
  normalizeStatus,
  pickActionPlanDeadlineRaw,
  responsibleIds,
} from '../actionPlanListNormalize';
import {
  inferSubmissionTotalFromResponseRows,
  inferSubmissionTotalFromSummary,
  lastNDaysSubmissionCounts,
  normalizeSummaryResultPayload,
  pickInvitedTotal,
} from './surveyInsightsData';

interface SurveyInsightsProps {
  formId: string;
}

function SectionCard({
  title,
  subtitle,
  children,
  className,
  'data-cy': dataCy,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  'data-cy'?: string;
}) {
  return (
    <section
      className={`w-full min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5 ${className ?? ''}`}
      data-cy={dataCy}
    >
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {subtitle ? (
        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ActionPlanMetricBar({
  label,
  count,
  total,
  barClassName,
  'data-cy': dataCy,
}: {
  label: string;
  count: number;
  total: number;
  barClassName: string;
  'data-cy': string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0;
  return (
    <div
      className="rounded-lg border border-gray-100 bg-white p-3.5 shadow-sm"
      data-cy={dataCy}
    >
      <div
        className="mb-2 flex items-center justify-between gap-2"
        data-cy={`${dataCy}-header`}
      >
        <span
          className="text-sm font-medium text-slate-600"
          data-cy={`${dataCy}-label`}
        >
          {label}
        </span>
        <span
          className="text-xl font-bold tabular-nums tracking-tight text-slate-900"
          data-cy={`${dataCy}-count`}
        >
          {count}
        </span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
        data-cy={`${dataCy}-track`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${barClassName}`}
          data-cy={`${dataCy}-fill`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {total > 0 ? (
        <p
          className="mt-1.5 text-[11px] text-slate-400"
          data-cy={`${dataCy}-caption`}
        >
          {pct}% of {total} plan{total === 1 ? '' : 's'}
        </p>
      ) : (
        <p
          className="mt-1.5 text-[11px] text-slate-400"
          data-cy={`${dataCy}-caption-empty`}
        >
          No action plans
        </p>
      )}
    </div>
  );
}

type TrendRange = 'week' | 'month';

const TREND_DAYS: Record<TrendRange, number> = { week: 7, month: 30 };

export default function SurveyInsights({ formId }: SurveyInsightsProps) {
  const [trendRange, setTrendRange] = useState<TrendRange>('week');

  const { data: formData, isLoading: formLoading } = useGetFormsByID(formId);
  const { data: summaryRaw, isLoading: summaryLoading } =
    useGetAllSummaryResultByformId(formId);
  const { data: individualRaw, isLoading: individualLoading } =
    useFetchedAllIndividualResponsesByFormId(formId);
  const { data: actionPlanRaw, isLoading: actionPlansLoading } =
    useGetAllActionPlan(formId);
  const { data: employeeData, isLoading: usersLoading } = useGetAllUsers();

  const summaryRows = useMemo(
    () => normalizeSummaryResultPayload(summaryRaw),
    [summaryRaw],
  );

  const responseRows = useMemo(
    () => normalizeSummaryResultPayload(individualRaw),
    [individualRaw],
  );

  const actionPlanRows = useMemo(() => {
    return normalizeActionPlanListPayload(actionPlanRaw).map(
      normalizeActionPlanListItem,
    );
  }, [actionPlanRaw]);

  const userById = useMemo(() => {
    const map = new Map<string, any>();
    for (const u of employeeData?.items ?? []) {
      if (u?.id) map.set(String(u.id), u);
    }
    return map;
  }, [employeeData?.items]);

  const totalResponses = useMemo(() => {
    const fromRows = inferSubmissionTotalFromResponseRows(responseRows);
    if (fromRows > 0) return fromRows;
    return inferSubmissionTotalFromSummary(summaryRows);
  }, [responseRows, summaryRows]);

  const invitedTotal = useMemo(() => pickInvitedTotal(formData), [formData]);

  const completionPct = useMemo(() => {
    if (invitedTotal == null || invitedTotal <= 0) return null;
    return Math.min(100, Math.round((totalResponses / invitedTotal) * 100));
  }, [totalResponses, invitedTotal]);

  const trendDayCount = TREND_DAYS[trendRange];

  const trendCounts = useMemo(
    () => lastNDaysSubmissionCounts(responseRows, trendDayCount),
    [responseRows, trendDayCount],
  );

  const trendMax = useMemo(() => Math.max(...trendCounts, 1), [trendCounts]);

  const trendTotal = useMemo(
    () => trendCounts.reduce((a, b) => a + b, 0),
    [trendCounts],
  );

  const trendDayLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 0; i < trendDayCount; i++) {
      const d = dayjs().subtract(trendDayCount - 1 - i, 'day');
      if (trendRange === 'week') {
        labels.push(d.format('ddd'));
      } else {
        const showLabel =
          i === 0 || i === trendDayCount - 1 || i % 5 === 0 || d.date() === 1;
        labels.push(showLabel ? d.format('M/D') : '');
      }
    }
    return labels;
  }, [trendDayCount, trendRange]);

  const actionStats = useMemo(() => {
    const today = dayjs().startOf('day');
    let resolved = 0;
    let pending = 0;
    let overdue = 0;
    const ownerCounts = new Map<string, number>();
    const ownerResolvedCounts = new Map<string, number>();

    for (const item of actionPlanRows) {
      const st = normalizeStatus(item?.status);
      if (st === 'resolved') resolved += 1;
      else if (st === 'pending') pending += 1;

      if (st !== 'resolved') {
        const dl = pickActionPlanDeadlineRaw(item);
        if (dl != null && dl !== '') {
          const d = dayjs(dl as string | number | Date);
          if (d.isValid() && d.endOf('day').isBefore(today)) overdue += 1;
        }
      }

      for (const uid of responsibleIds(item)) {
        ownerCounts.set(uid, (ownerCounts.get(uid) ?? 0) + 1);
        if (st === 'resolved') {
          ownerResolvedCounts.set(uid, (ownerResolvedCounts.get(uid) ?? 0) + 1);
        }
      }
    }

    const responsibleOwners = [...ownerCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => {
        const u = userById.get(String(id));
        const name = u ? employeeFullName(u).trim() : '';
        const displayName = name || `User ${String(id).slice(0, 8)}`;
        return {
          key: id,
          name: displayName,
          profileImage: (u?.profileImage ?? u?.profile_image) as
            | string
            | undefined,
          initial: displayName.trim()[0]?.toUpperCase() || '?',
          count,
          resolvedCount: ownerResolvedCounts.get(id) ?? 0,
        };
      });

    return {
      resolved,
      pending,
      overdue,
      totalPlans: actionPlanRows.length,
      responsibleOwners,
    };
  }, [actionPlanRows, userById]);

  const responsesBlockLoading =
    summaryLoading || individualLoading || formLoading;
  const actionBlockLoading = actionPlansLoading || usersLoading;

  return (
    <div
      className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col bg-white"
      data-cy="survey-insights-root"
    >
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className="w-full pb-8 pt-0 lg:pt-4">
          <div className="flex w-full min-w-0 flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-5">
            <SectionCard
              title="Responses"
              subtitle={undefined}
              className="min-h-0 flex-1 lg:min-w-0"
              data-cy="survey-insights-section-responses"
            >
              {responsesBlockLoading ? (
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm"
                      >
                        <Skeleton active paragraph={{ rows: 3 }} />
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col gap-3 sm:gap-4"
                  data-cy="survey-insights-responses-metrics"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8ECFF] text-[#1E3A8A]"
                          aria-hidden
                        >
                          <AimOutlined className="text-[22px]" />
                        </div>
                        <p
                          className="text-3xl font-bold leading-none tabular-nums tracking-tight text-slate-900"
                          data-cy="survey-insights-total-responses"
                        >
                          {totalResponses}
                        </p>
                      </div>
                      <p className="mt-4 text-sm font-medium leading-snug text-slate-500">
                        Total responses
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {invitedTotal != null && invitedTotal > 0
                          ? `${totalResponses} of ${invitedTotal} invited`
                          : 'Submissions recorded for this survey'}
                      </p>
                      <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-[#1E40AF] transition-[width] duration-500 ease-out"
                          style={{
                            width: `${
                              invitedTotal != null && invitedTotal > 0
                                ? Math.min(
                                    100,
                                    Math.round(
                                      (totalResponses / invitedTotal) * 100,
                                    ),
                                  )
                                : 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                      {completionPct != null ? (
                        <>
                          <div className="flex items-start justify-between gap-4">
                            <div
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8ECFF] text-[#1E3A8A]"
                              aria-hidden
                            >
                              <PieChartOutlined className="text-[22px]" />
                            </div>
                            <p className="text-3xl font-bold leading-none tabular-nums tracking-tight text-slate-900">
                              {completionPct}%
                            </p>
                          </div>
                          <p className="mt-4 text-sm font-medium leading-snug text-slate-500">
                            Completion rate
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-400">
                            Share of invited participants who submitted
                          </p>
                          <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-[#1E40AF] transition-[width] duration-500 ease-out"
                              style={{ width: `${completionPct}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-4">
                            <div
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8ECFF] text-[#1E3A8A]"
                              aria-hidden
                            >
                              <PieChartOutlined className="text-[22px]" />
                            </div>
                            <p className="text-3xl font-bold leading-none tabular-nums text-slate-300">
                              —
                            </p>
                          </div>
                          <p className="mt-4 text-sm font-medium leading-snug text-slate-500">
                            Completion rate
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-400">
                            Add an invited audience on the form to show
                            completion vs. invites.
                          </p>
                          <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                            <div className="h-full w-0 rounded-full bg-[#1E40AF]" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.04]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Submissions trend
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Segmented
                          size="small"
                          value={trendRange}
                          onChange={(v) => setTrendRange(v as TrendRange)}
                          options={[
                            { label: 'Week', value: 'week' },
                            { label: 'Month', value: 'month' },
                          ]}
                          className="!bg-slate-100/80 [&_.ant-segmented-item-selected]:!bg-white [&_.ant-segmented-item-selected]:!text-[#1E40AF]"
                          data-cy="survey-insights-trend-range"
                        />
                        {trendTotal > 0 ? (
                          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-600">
                            {trendTotal} total
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div
                      className={
                        trendRange === 'month'
                          ? 'mt-3 min-w-0 overflow-x-auto pb-1 scrollbar-hide'
                          : 'mt-3 min-w-0'
                      }
                    >
                      <div
                        className={`grid gap-1 sm:gap-1.5 ${
                          trendRange === 'week'
                            ? 'grid-cols-7'
                            : 'min-w-[520px]'
                        }`}
                        style={
                          trendRange === 'month'
                            ? {
                                gridTemplateColumns: `repeat(${trendDayCount}, minmax(14px, 1fr))`,
                              }
                            : undefined
                        }
                        role="img"
                        aria-label={`Submissions per day for the last ${trendDayCount} days`}
                      >
                        {trendCounts.map((v, i) => {
                          const isToday = i === trendCounts.length - 1;
                          const h = Math.max(6, (v / trendMax) * 100);
                          const label = trendDayLabels[i];
                          const dayTitle = dayjs()
                            .subtract(trendDayCount - 1 - i, 'day')
                            .format('MMM D, YYYY');
                          return (
                            <div
                              key={i}
                              className="flex min-w-0 flex-col items-center gap-1 sm:gap-1.5"
                            >
                              <span
                                className={`min-h-[14px] text-center text-[10px] font-semibold tabular-nums text-slate-500 ${
                                  trendRange === 'month' ? 'sm:text-[9px]' : ''
                                }`}
                                aria-label={`Responses on ${dayTitle}: ${v}`}
                              >
                                {trendRange === 'week'
                                  ? String(v)
                                  : v > 0
                                    ? String(v)
                                    : '\u00a0'}
                              </span>
                              <div
                                className={`flex w-full items-end justify-center ${
                                  trendRange === 'week'
                                    ? 'h-20 sm:h-24'
                                    : 'h-14 sm:h-20'
                                }`}
                              >
                                <Tooltip
                                  title={`Responses on ${dayTitle}: ${v}`}
                                  placement="top"
                                >
                                  <div
                                    className={`w-full rounded-t-sm transition-colors sm:rounded-t-md ${
                                      trendRange === 'month'
                                        ? 'max-w-none'
                                        : 'max-w-[36px] sm:max-w-none'
                                    } ${
                                      v > 0
                                        ? 'bg-[#1E40AF]/60'
                                        : 'bg-[#1E40AF]/30'
                                    }`}
                                    style={{
                                      height: `${h}%`,
                                      minHeight: v > 0 ? 4 : 2,
                                    }}
                                  />
                                </Tooltip>
                              </div>
                              <span
                                className={`min-h-[14px] w-full text-center font-medium capitalize text-slate-400 ${
                                  trendRange === 'week'
                                    ? 'text-[10px]'
                                    : 'text-[8px] leading-tight sm:text-[9px]'
                                }`}
                              >
                                {label || '\u00a0'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <p className="mt-2 border-t border-slate-100 pt-2.5 text-xs leading-relaxed text-slate-500">
                      {trendTotal > 0
                        ? 'Submissions per day (created date).'
                        : `No data in the last ${trendDayCount} days.`}
                    </p>
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Action plans"
              className="min-h-0 flex-1 lg:min-w-0"
              data-cy="survey-insights-section-action-plans"
            >
              {actionBlockLoading ? (
                <div
                  className="space-y-3"
                  data-cy="survey-insights-action-plans-stats-skeleton"
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gray-100 bg-white p-3.5 shadow-sm"
                    >
                      <Skeleton
                        active
                        paragraph={{ rows: 1 }}
                        title={{ width: '40%' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div
                    className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
                    data-cy="survey-insights-action-plans-stats-bars"
                  >
                    <ActionPlanMetricBar
                      data-cy="survey-insights-action-plan-metric-resolved"
                      label="Resolved"
                      count={actionStats.resolved}
                      total={actionStats.totalPlans}
                      barClassName="bg-emerald-600"
                    />
                    <ActionPlanMetricBar
                      data-cy="survey-insights-action-plan-metric-pending"
                      label="Pending"
                      count={actionStats.pending}
                      total={actionStats.totalPlans}
                      barClassName="bg-amber-500"
                    />
                    <ActionPlanMetricBar
                      data-cy="survey-insights-action-plan-metric-overdue"
                      label="Overdue"
                      count={actionStats.overdue}
                      total={actionStats.totalPlans}
                      barClassName="bg-red-600"
                    />
                  </div>
                  <div className="mt-5 min-h-0">
                    <div className="mb-2 flex items-baseline justify-between gap-2 text-sm font-medium text-gray-800">
                      <span>Action plan assignees and completion</span>
                      {actionStats.responsibleOwners.length > 0 ? (
                        <span className="text-xs font-normal tabular-nums text-gray-400">
                          {actionStats.responsibleOwners.length} total
                        </span>
                      ) : null}
                    </div>
                    {actionStats.responsibleOwners.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        No action plans yet.
                      </p>
                    ) : (
                      <div
                        className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
                        data-cy="survey-insights-action-plans-owners-table"
                      >
                        <div
                          className="max-h-64 overflow-y-auto overflow-x-hidden px-3 py-2 pr-1 scrollbar-hide"
                          data-cy="survey-insights-action-plans-owners-scroll"
                        >
                          <ul
                            className="divide-y divide-gray-100"
                            data-cy="survey-insights-action-plans-owners-list"
                          >
                            {actionStats.responsibleOwners.map((o) => {
                              const completionPct =
                                o.count > 0
                                  ? Math.min(
                                      100,
                                      Math.round(
                                        (o.resolvedCount / o.count) * 100,
                                      ),
                                    )
                                  : 0;
                              return (
                                <li
                                  key={o.key}
                                  className="flex gap-3 py-3 first:pt-2"
                                  data-cy={`survey-insights-action-plans-owner-row-${o.key}`}
                                >
                                  <Avatar
                                    src={o.profileImage}
                                    size={36}
                                    className="mt-0.5 shrink-0 bg-[#E8ECFF] text-[#1E3A8A]"
                                    data-cy={`survey-insights-action-plans-owner-avatar-${o.key}`}
                                  >
                                    {o.initial}
                                  </Avatar>
                                  <div
                                    className="min-w-0 flex-1 space-y-1.5"
                                    data-cy={`survey-insights-action-plans-owner-metrics-${o.key}`}
                                  >
                                    <p
                                      className="truncate text-sm font-medium text-gray-800"
                                      title={o.name}
                                      data-cy={`survey-insights-action-plans-owner-name-${o.key}`}
                                    >
                                      {o.name}
                                    </p>
                                    <div
                                      className="flex items-center gap-2.5"
                                      data-cy={`survey-insights-action-plans-owner-completion-row-${o.key}`}
                                    >
                                      <div
                                        className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100"
                                        data-cy={`survey-insights-action-plans-owner-completion-track-${o.key}`}
                                      >
                                        <div
                                          className="h-full rounded-full bg-emerald-600 transition-[width] duration-500 ease-out"
                                          data-cy={`survey-insights-action-plans-owner-completion-fill-${o.key}`}
                                          style={{ width: `${completionPct}%` }}
                                        />
                                      </div>
                                      <span
                                        className="shrink-0 text-xs font-semibold tabular-nums text-slate-600"
                                        data-cy={`survey-insights-action-plans-owner-completion-fraction-${o.key}`}
                                      >
                                        {o.count > 0
                                          ? `${o.resolvedCount}/${o.count}`
                                          : '—'}
                                      </span>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
