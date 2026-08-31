'use client';

import React, { useMemo, useState } from 'react';
import { Col, Empty, Progress, Row, Segmented, Select } from 'antd';
import { FaEyeSlash, FaRegEye } from 'react-icons/fa';
import CustomBreadcrumb from '@/components/common/breadCramp';
import {
  useGetBscCycles,
  useGetBscKpiLibrary,
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  BscCadence,
  EmployeeScorecard,
  KpiLibraryItem,
  ScoreBreakdownItem,
  ScorecardStatus,
} from '@/types/bsc';
import { computeCompositeScore } from '@/utils/bsc/scoring';
import BscStatusTag from '../_components/BscStatusTag';

const { Option } = Select;

function currentMonthName(): string {
  return new Date().toLocaleString('en-US', { month: 'long' });
}

function currentYear(): number {
  return new Date().getFullYear();
}

function formatScore(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return Math.abs(value % 1) < 1e-9
    ? String(Math.round(value))
    : value.toFixed(2);
}

function kpiPoints(
  item: ScoreBreakdownItem | undefined,
  weightPercentage: number,
): number {
  if (!item) return 0;
  return Math.min(item.ratio, 1) * weightPercentage;
}

function scorecardDisplayTotal(scorecard: EmployeeScorecard): {
  total: number;
  pointsByTargetId: Record<string, number>;
} {
  const result = computeCompositeScore(scorecard.targets);
  const pointsByTargetId: Record<string, number> = {};
  let total = 0;
  for (const t of scorecard.targets) {
    const item = result.items.find((b) => b.targetId === t.id);
    const pts = kpiPoints(item, t.weightPercentage);
    pointsByTargetId[t.id] = pts;
    total += pts;
  }
  return { total: Math.min(total, 100), pointsByTargetId };
}

export default function MyBscScorecardPage() {
  const { userId } = useAuthenticationStore();
  const { data: activeFy } = useGetActiveFiscalYears();
  const {
    myScorecardSessionId,
    myScorecardMonthId,
    myScorecardSessionMonths,
    myKpiPeriodView,
    setMyScorecardSessionId,
    setMyScorecardMonthId,
    setMyScorecardSessionMonths,
    setMyKpiPeriodView,
  } = useBscUiStore();

  const { data: scorecards, isLoading: scorecardsLoading } =
    useGetBscScorecards();
  const { data: allKpis, isLoading: kpisLoading } = useGetBscKpiLibrary();
  const { data: cycles } = useGetBscCycles();

  const mine = useMemo(() => {
    const list = scorecards || [];
    const matched = userId ? list.filter((s) => s.userId === userId) : [];
    return matched.length ? matched : list;
  }, [scorecards, userId]);

  const myRoleTitle = useMemo(() => {
    const fromSc =
      mine.find((s) => s.status === ScorecardStatus.Active)?.positionTitle ||
      mine[0]?.positionTitle;
    return fromSc || 'HR Director';
  }, [mine]);

  const assignedKpis = useMemo(() => {
    const kpis = (allKpis || []).filter(
      (k) =>
        (k.positionTitle || '').toLowerCase() === myRoleTitle.toLowerCase(),
    );
    if (kpis.length) return kpis;
    // Fallback: unique KPIs from the user's scorecard targets
    const active =
      mine.find((s) => s.status === ScorecardStatus.Active) || mine[0];
    if (!active) return [];
    const seen = new Set<string>();
    const fromTargets: KpiLibraryItem[] = [];
    for (const t of active.targets) {
      if (seen.has(t.kpiLibraryId)) continue;
      seen.add(t.kpiLibraryId);
      fromTargets.push({
        id: t.kpiLibraryId,
        evaluationConfigId: active.cycleId,
        name: t.kpiName,
        description: null,
        perspective: t.perspective,
        targetLogic: t.targetLogic,
        measurementUnit: t.measurementUnit,
        positionTitle: active.positionTitle,
        defaultTarget: t.targetValue,
        weight: t.weightPercentage,
        createdAt: active.createdAt,
      });
    }
    return fromTargets;
  }, [allKpis, myRoleTitle, mine]);

  /** Month vs Quarter visibility — driven by evaluation setup cadence */
  const visibleAssignedKpis = useMemo(() => {
    if (myKpiPeriodView === 'month') {
      const monthlyConfigIds = new Set(
        (cycles || [])
          .filter((c) => c.cadence === BscCadence.Monthly)
          .map((c) => c.id),
      );
      const monthly = assignedKpis.filter((k) =>
        monthlyConfigIds.has(k.evaluationConfigId),
      );
      return monthly.length ? monthly : assignedKpis;
    }
    // Quarter view: prefer quarterly setups; if none, still show assigned KPIs
    // as the role's quarter-scoped expectations
    const quarterlyConfigIds = new Set(
      (cycles || [])
        .filter((c) => c.cadence === BscCadence.Quarterly)
        .map((c) => c.id),
    );
    const quarterly = assignedKpis.filter((k) =>
      quarterlyConfigIds.has(k.evaluationConfigId),
    );
    return quarterly.length ? quarterly : assignedKpis;
  }, [assignedKpis, cycles, myKpiPeriodView]);

  const activeSession = useMemo(() => {
    if (myScorecardSessionId) {
      return activeFy?.sessions?.find((s) => s.id === myScorecardSessionId);
    }
    return (
      activeFy?.sessions?.find((s) => (s as { active?: boolean }).active) ||
      activeFy?.sessions?.[0]
    );
  }, [activeFy, myScorecardSessionId]);

  const periodLabel = useMemo(() => {
    if (myKpiPeriodView === 'month') {
      const month =
        myScorecardSessionMonths.find((m) => m.id === myScorecardMonthId) ||
        activeSession?.months?.find((m) =>
          (m.name || '')
            .toLowerCase()
            .includes(currentMonthName().toLowerCase()),
        ) ||
        null;
      return month
        ? `${month.name} ${currentYear()}`
        : `${currentMonthName()} ${currentYear()}`;
    }
    if (activeSession?.name) {
      const monthNames = (activeSession.months || [])
        .map((m) => m.name)
        .filter(Boolean);
      return monthNames.length
        ? `${activeSession.name} · ${monthNames.join(', ')}`
        : activeSession.name;
    }
    return 'This quarter';
  }, [
    myKpiPeriodView,
    myScorecardMonthId,
    myScorecardSessionMonths,
    activeSession,
  ]);

  const selectedMonth = useMemo(
    () =>
      myScorecardSessionMonths.find((m) => m.id === myScorecardMonthId) ||
      null,
    [myScorecardSessionMonths, myScorecardMonthId],
  );

  const isHistoryFilterActive = Boolean(
    myScorecardSessionId || myScorecardMonthId,
  );

  const visibleScorecards = useMemo(() => {
    if (!mine.length) return [];
    if (!isHistoryFilterActive) {
      const thisMonth = currentMonthName();
      const year = currentYear();
      const current =
        mine.find(
          (s) =>
            s.periodMonthName?.toLowerCase() === thisMonth.toLowerCase() &&
            (s.periodYear == null || s.periodYear === year),
        ) ||
        mine.find((s) => s.status === ScorecardStatus.Active) ||
        mine[0];
      return current ? [current] : [];
    }
    if (selectedMonth?.name) {
      const monthName = selectedMonth.name.toLowerCase();
      return mine.filter(
        (s) =>
          s.periodMonthName?.toLowerCase() === monthName ||
          (s.cycleLabel || '').toLowerCase().includes(monthName),
      );
    }
    if (myScorecardSessionId && myScorecardSessionMonths.length) {
      const monthNames = new Set(
        myScorecardSessionMonths.map((m) => m.name.toLowerCase()),
      );
      return mine.filter(
        (s) =>
          (s.periodMonthName &&
            monthNames.has(s.periodMonthName.toLowerCase())) ||
          myScorecardSessionMonths.some((m) =>
            (s.cycleLabel || '').toLowerCase().includes(m.name.toLowerCase()),
          ),
      );
    }
    return mine;
  }, [
    mine,
    isHistoryFilterActive,
    selectedMonth,
    myScorecardSessionId,
    myScorecardSessionMonths,
  ]);

  const handleSessionChange = (sessionId: string | undefined) => {
    setMyScorecardSessionId(sessionId);
    setMyScorecardMonthId(undefined);
    if (!sessionId) {
      setMyScorecardSessionMonths([]);
      return;
    }
    const session = activeFy?.sessions?.find((s) => s.id === sessionId);
    setMyScorecardSessionMonths(session?.months || []);
  };

  const totalWeight = visibleAssignedKpis.reduce(
    (s, k) => s + (k.weight ?? k.suggestedWeight ?? 0),
    0,
  );

  const loading = scorecardsLoading || kpisLoading;

  return (
    <div className="p-4" data-cy="bsc-my-scorecard-page">
      <CustomBreadcrumb
        title="My Scorecard"
        subtitle="KPIs assigned to you for this month or quarter — filter to switch visibility"
      />

      {/* Primary filter: Month vs Quarter */}
      <div className="mt-5 mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          value={myKpiPeriodView}
          onChange={(v) => setMyKpiPeriodView(v as 'month' | 'quarter')}
          options={[
            { label: 'This Month', value: 'month' },
            { label: 'This Quarter', value: 'quarter' },
          ]}
          data-cy="bsc-kpi-period-view"
        />
        <span className="text-sm text-[#8F94A3]">{periodLabel}</span>
      </div>

      {/* Optional history filters (past performance) */}
      <Row gutter={[10, 16]} className="mb-6" data-cy="bsc-my-sc-filters">
        <Col xs={24} md={8} lg={6}>
          <Select
            placeholder="Session (history)"
            allowClear
            className="w-full h-10"
            value={myScorecardSessionId}
            onChange={handleSessionChange}
            data-cy="bsc-my-sc-session"
          >
            {activeFy?.sessions?.map((session) => (
              <Option key={session.id} value={session.id}>
                {session.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={8} lg={5}>
          <Select
            placeholder="Month (history)"
            allowClear
            className="w-full h-10"
            value={myScorecardMonthId}
            onChange={setMyScorecardMonthId}
            disabled={
              !myScorecardSessionId || myScorecardSessionMonths.length === 0
            }
            data-cy="bsc-my-sc-month"
          >
            {myScorecardSessionMonths.map((month) => (
              <Option key={month.id} value={month.id}>
                {month.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      {/* Performance — Total Score on top; click reveals KPI breakdown */}
      <section className="mb-10" data-cy="bsc-performance-section">
        <h3 className="mb-3 mt-0 text-[16px] font-semibold text-[#161A2C]">
          Performance
        </h3>
        {loading ? (
          <div className="py-8 text-center text-gray-400">Loading…</div>
        ) : !visibleScorecards.length ? (
          <Empty description="No performance data for this filter" />
        ) : (
          <div className="flex flex-col gap-4">
            {visibleScorecards.map((scorecard) => (
              <ScorecardCardsBlock
                key={scorecard.id}
                scorecard={scorecard}
                previous={
                  mine.find(
                    (s) =>
                      s.id !== scorecard.id &&
                      (s.status === ScorecardStatus.Completed ||
                        s.status === ScorecardStatus.Scored),
                  ) || null
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Assigned KPIs — elegant cards */}
      <section data-cy="bsc-assigned-kpis">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="m-0 text-[16px] font-semibold text-[#161A2C]">
              Assigned KPIs
            </h3>
            <p className="mt-1 mb-0 text-sm text-[#8F94A3]">
              {myRoleTitle}
              <span className="mx-1.5 text-[#CBD5E1]">·</span>
              {visibleAssignedKpis.length} KPI
              {visibleAssignedKpis.length === 1 ? '' : 's'}
              <span className="mx-1.5 text-[#CBD5E1]">·</span>
              Weight {Math.round(totalWeight)}%
            </p>
          </div>
          <span className="rounded-full border border-[#E0E7FF] bg-[#F8F7FF] px-3 py-1 text-[12px] font-semibold text-[#574CFF]">
            {myKpiPeriodView === 'month' ? 'Monthly' : 'Quarterly'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading…</div>
        ) : !visibleAssignedKpis.length ? (
          <Empty description="No KPIs assigned for this period" />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleAssignedKpis.map((kpi, index) => (
              <article
                key={kpi.id}
                className="flex flex-col rounded-xl bg-[#F9FAFB] p-5 transition-shadow hover:shadow-sm"
                data-cy={`bsc-assigned-kpi-${kpi.id}`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8F94A3]">
                    KPI {index + 1}
                  </span>
                  <span className="shrink-0 rounded-md border border-[#E5E7EB] bg-white px-2 py-0.5 text-[12px] font-semibold tabular-nums text-[#1E40AF]">
                    {kpi.weight ?? kpi.suggestedWeight ?? 0}%
                  </span>
                </div>
                <h4 className="m-0 text-[15px] font-semibold leading-snug text-[#161A2C]">
                  {kpi.name}
                </h4>
                {kpi.description && (
                  <p className="mt-2 mb-0 flex-1 text-[13px] leading-relaxed text-[#595959] line-clamp-3">
                    {kpi.description}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#EEF0F4] pt-3">
                  {kpi.defaultTarget != null && (
                    <span className="rounded-full border border-[#E5E7EB] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#475569]">
                      Target {kpi.defaultTarget}
                      {kpi.measurementUnit ? ` ${kpi.measurementUnit}` : ''}
                    </span>
                  )}
                  <span className="rounded-full border border-[#E5E7EB] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#475569]">
                    Weight {kpi.weight ?? kpi.suggestedWeight ?? 0}%
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ScorecardCardsBlock({
  scorecard,
  previous,
}: {
  scorecard: EmployeeScorecard;
  previous: EmployeeScorecard | null;
}) {
  const [expanded, setExpanded] = useState(false);

  const evaluated =
    scorecard.status === ScorecardStatus.Scored ||
    scorecard.status === ScorecardStatus.Completed ||
    Boolean(scorecard.finalEvaluation?.compositeScore != null);

  const computed = useMemo(
    () => scorecardDisplayTotal(scorecard),
    [scorecard],
  );
  const prevDisplay = useMemo(
    () => (previous ? scorecardDisplayTotal(previous) : null),
    [previous],
  );

  const totalScore = evaluated ? computed.total : 0;
  const pointsByTargetId = evaluated ? computed.pointsByTargetId : {};
  const previousScore = prevDisplay?.total ?? 0;
  const change = evaluated ? totalScore - previousScore : 0;
  const isNegative = change < 0;
  const totalPercentage = Math.min(totalScore, 100);

  return (
    <div data-cy={`bsc-scorecard-block-${scorecard.id}`}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-[15px] font-semibold text-[#161A2C]">
          {scorecard.cycleLabel}
        </span>
        <BscStatusTag status={scorecard.status} />
        {!evaluated && (
          <span className="text-[12px] text-[#8F94A3]">
            Evaluation pending (end of period)
          </span>
        )}
      </div>

      <div className="min-w-0 w-full overflow-x-auto scrollbar-none">
        <div className="flex w-max flex-nowrap items-center gap-4 lg:gap-6">
          {/* Single Total Score card on top — click reveals KPI cards */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={`flex w-[256px] flex-shrink-0 cursor-pointer flex-col justify-between border bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md ${
              expanded ? 'border-[#1E40AF]/40 ring-1 ring-[#1E40AF]/20' : 'border-gray-200'
            }`}
            style={{ height: '136px', borderRadius: '8px' }}
            data-cy="bsc-total-score-card"
            aria-expanded={expanded}
          >
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-gray-500">
                Total Score
              </span>
              <span className="flex items-center gap-1.5 text-[14px] font-medium text-gray-500">
                Out of 100%
                {expanded ? (
                  <FaEyeSlash className="text-gray-400" size={12} />
                ) : (
                  <FaRegEye className="text-gray-400" size={12} />
                )}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[28px] font-bold leading-none text-gray-800">
                {formatScore(totalScore)}
              </span>
              <Progress
                percent={totalPercentage}
                showInfo={false}
                strokeColor="#1e3a8a"
                trailColor="#f3f4f6"
                className="m-0 flex-1 [&_.ant-progress-inner]:!bg-gray-100"
                strokeWidth={8}
                strokeLinecap="round"
              />
            </div>
            <span
              className={`text-[12px] font-medium ${
                !evaluated
                  ? 'text-gray-400'
                  : !isNegative
                    ? 'text-green-500'
                    : 'text-red-500'
              }`}
            >
              {!evaluated ? (
                'Not evaluated yet'
              ) : (
                <>
                  {!isNegative ? '+' : ''}
                  {formatScore(change)}{' '}
                  <span className="font-normal text-gray-400">
                    vs last month
                  </span>
                </>
              )}
            </span>
          </button>

          {expanded &&
            scorecard.targets.map((target, index) => {
              const weight = target.weightPercentage;
              const kpiScore = evaluated
                ? pointsByTargetId[target.id] ?? 0
                : 0;
              const percent =
                weight > 0 ? Math.min((kpiScore / weight) * 100, 100) : 0;
              const prevTargetId = previous?.targets.find(
                (t) => t.kpiName === target.kpiName,
              )?.id;
              const prevPts =
                evaluated && prevTargetId && prevDisplay
                  ? prevDisplay.pointsByTargetId[prevTargetId] ?? 0
                  : 0;
              const monthChange = evaluated ? kpiScore - prevPts : 0;
              const isMonthChangeNegative = monthChange < 0;

              return (
                <div
                  key={target.id}
                  className="flex w-[256px] flex-shrink-0 flex-col justify-between border border-gray-200 bg-white p-4 shadow-sm"
                  style={{ height: '124px', borderRadius: '8px' }}
                  data-cy={`bsc-kpi-card-${index}`}
                >
                  <span className="truncate text-[14px] font-medium text-gray-500">
                    {target.kpiName}
                  </span>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 whitespace-nowrap text-[20px] font-bold leading-none text-gray-800">
                      {formatScore(kpiScore)}
                      <span className="ml-1 text-[12px] font-medium text-gray-400">
                        / {weight}
                      </span>
                    </span>
                    <Progress
                      percent={percent}
                      showInfo={false}
                      strokeColor="#1c3ca5"
                      trailColor="#f3f4f6"
                      className="m-0 min-w-0 flex-1 [&_.ant-progress-inner]:!bg-gray-100"
                      strokeWidth={8}
                      strokeLinecap="round"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-gray-500">
                      Weight {weight}%
                    </span>
                    <span
                      className={`text-[12px] font-medium ${
                        !evaluated
                          ? 'text-gray-400'
                          : !isMonthChangeNegative
                            ? 'text-green-500'
                            : 'text-red-500'
                      }`}
                    >
                      {!evaluated ? (
                        'Pending'
                      ) : (
                        <>
                          {!isMonthChangeNegative ? '+' : ''}
                          {formatScore(monthChange)}{' '}
                          <span className="font-normal text-gray-400">
                            vs last month
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
