'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Tabs } from 'antd';
import type { RenderTabBar } from 'rc-tabs/es/interface';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { EmptyImage } from '@/components/emptyIndicator';
import {
  useGetBscCycles,
  useGetBscKpiLibrary,
  useGetBscRolePerspectives,
  useGetBscScorecard,
  useGetBscScorecardResults,
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import { USE_BSC_API } from '@/store/server/features/bsc/config';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  EmployeeScorecard,
  EvaluationCycle,
  KpiLibraryItem,
  ScorecardStatus,
  TargetLogic,
} from '@/types/bsc';
import { formatScore, isScorecardEvaluated, targetScorePercent } from '@/utils/bsc/rollup';
import {
  filterScorecardsInSeries,
  scorecardContextLabel,
} from '@/utils/bsc/series';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';
import PerspectiveKpiCard, {
  ScorecardKpiRow,
} from './_components/PerspectiveKpiCard';
import ScorecardPeriodFilter from './_components/ScorecardPeriodFilter';
import CheckinInboxToggle, {
  type CheckinInbox,
} from './_components/CheckinInboxToggle';
import CheckinQueue from './_components/CheckinQueue';
import ResultsKpiView from './_components/ResultsKpiView';
import { computeKpiProgressPercent } from '@/app/(afterLogin)/dashboard/_components/header/KpiProgressHeaderCard';
import {
  bscKpiAdminHref,
  parseScorecardTab,
  scorecardResultsHref,
  scorecardTabHref,
  type ScorecardTab,
} from '@/utils/bsc/scorecardTab';

function currentMonthName(): string {
  return new Date().toLocaleString('en-US', { month: 'long' });
}

function currentYear(): number {
  return new Date().getFullYear();
}

export default function MyBscScorecardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuthenticationStore();
  const {
    myScorecardSessionId,
    myScorecardMonthId,
    myScorecardSessionMonths,
    scorecardTab,
    setScorecardTab,
  } = useBscUiStore();
  const { isMobile, isTablet } = useIsMobile();
  const canViewAllEmployeeKpi = AccessGuard.checkAccess({
    permissions: [Permissions.ViewCompanyOkr],
  });
  const canViewTeamKpi = AccessGuard.checkAccess({
    permissions: [Permissions.ViewTeamOkr],
  });
  const canManageBscAdmin =
    AccessGuard.checkAccess({
      permissions: [Permissions.ManageBscCycles],
    }) ||
    AccessGuard.checkAccess({
      permissions: [Permissions.ManageBscKpiLibrary],
    }) ||
    AccessGuard.checkAccess({
      permissions: [Permissions.ViewCompanyOkr],
    });

  const tabFromUrl = parseScorecardTab(searchParams);

  useEffect(() => {
    if (scorecardTab !== tabFromUrl) {
      setScorecardTab(tabFromUrl);
    }
  }, [scorecardTab, setScorecardTab, tabFromUrl]);

  useEffect(() => {
    if (tabFromUrl === 'kpis' || tabFromUrl === 'bsc') {
      router.replace(
        canManageBscAdmin
          ? bscKpiAdminHref(tabFromUrl)
          : scorecardTabHref('mine'),
      );
      return;
    }

    const ensureAllowedTab = (tab: ScorecardTab): ScorecardTab => {
      // Results is always available (like My OKR). Team/All scopes are
      // permission-gated inside the Results view — same as Team/Company OKR.
      if (tab === 'team' || tab === 'all') return 'results';
      return tab;
    };

    const allowed = ensureAllowedTab(tabFromUrl);
    if (allowed !== tabFromUrl) {
      const scope =
        tabFromUrl === 'all'
          ? canViewAllEmployeeKpi
            ? 'all'
            : canViewTeamKpi
              ? 'team'
              : 'mine'
          : tabFromUrl === 'team'
            ? canViewTeamKpi
              ? 'team'
              : canViewAllEmployeeKpi
                ? 'all'
                : 'mine'
            : 'mine';
      router.replace(scorecardResultsHref(scope));
    }
  }, [
    canManageBscAdmin,
    canViewAllEmployeeKpi,
    canViewTeamKpi,
    router,
    tabFromUrl,
  ]);

  const { data: scorecards, isLoading: scorecardsLoading } =
    useGetBscScorecards();
  const { data: allKpis, isLoading: kpisLoading } = useGetBscKpiLibrary();
  const { data: cycles } = useGetBscCycles();
  const { data: allocations } = useGetBscRolePerspectives();
  const [selectedScorecardId, setSelectedScorecardId] = useState<
    string | undefined
  >();
  const [checkinInbox, setCheckinInbox] = useState<CheckinInbox>('mine');

  const cycleById = useMemo(() => {
    const map = new Map<string, EvaluationCycle>();
    for (const cycle of cycles || []) map.set(cycle.id, cycle);
    return map;
  }, [cycles]);

  const mine = useMemo(() => {
    const list = scorecards || [];
    if (USE_BSC_API) {
      // GET /bsc/my-scorecard is already scoped to the token user.
      // Do not re-filter against auth store userId or fall back to the full list —
      // a mismatch previously leaked every returned scorecard to "My Scorecard".
      return list;
    }
    if (userId) {
      const matched = list.filter((s) => s.userId === userId);
      if (matched.length) return matched;
    }
    return list.filter((s) => s.userId === 'demo-user');
  }, [scorecards, userId]);

  const myRoleTitle = useMemo(() => {
    const fromSc =
      mine.find((s) => s.status === ScorecardStatus.Active)?.positionTitle ||
      mine[0]?.positionTitle ||
      null;
    if (fromSc) return fromSc;
    // Mock-only default for local demo data.
    return USE_BSC_API ? null : 'HR Director';
  }, [mine]);

  /** KPIs assigned on the employee's scorecard only — never the full catalog. */
  const kpisFromScorecardTargets = (
    card: EmployeeScorecard | null | undefined,
  ): KpiLibraryItem[] => {
    if (!card?.targets?.length) return [];
    const seen = new Set<string>();
    const fromTargets: KpiLibraryItem[] = [];
    for (const t of card.targets) {
      if (seen.has(t.kpiLibraryId)) continue;
      seen.add(t.kpiLibraryId);
      fromTargets.push({
        id: t.kpiLibraryId,
        evaluationConfigId: card.cycleId,
        name: t.kpiName,
        description: null,
        perspective: t.perspective,
        targetLogic: t.targetLogic,
        measurementUnit: t.measurementUnit,
        positionTitle: card.positionTitle,
        defaultTarget: t.targetValue,
        weight: t.weightPercentage,
        createdAt: card.createdAt,
      });
    }
    return fromTargets;
  };

  const selectedMonth = useMemo(
    () =>
      myScorecardSessionMonths.find((m) => m.id === myScorecardMonthId) || null,
    [myScorecardSessionMonths, myScorecardMonthId],
  );

  const isHistoryFilterActive = Boolean(
    myScorecardSessionId || myScorecardMonthId,
  );

  const visibleScorecards = useMemo(() => {
    if (!mine.length) return [];
    if (!isHistoryFilterActive) {
      // Keep every Active assignment so the Scorecard filter can switch
      // between company / department / role templates in the same period.
      const active = mine.filter((s) => s.status === ScorecardStatus.Active);
      if (active.length) return active;

      const thisMonth = currentMonthName();
      const year = currentYear();
      const byCalendarMonth = mine.filter(
        (s) =>
          s.periodMonthName?.toLowerCase() === thisMonth.toLowerCase() &&
          (s.periodYear == null || s.periodYear === year),
      );
      if (byCalendarMonth.length) return byCalendarMonth;
      return mine;
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

  const scorecardOptions = useMemo(() => {
    return visibleScorecards.map((card) => ({
      value: card.id,
      label: scorecardContextLabel(card, cycleById.get(card.cycleId)),
    }));
  }, [visibleScorecards, cycleById]);

  // Stable key so refetches with the same ids do not reset the user's pick.
  const scorecardOptionKey = scorecardOptions.map((o) => o.value).join('|');

  useEffect(() => {
    if (!scorecardOptions.length) {
      setSelectedScorecardId(undefined);
      return;
    }
    setSelectedScorecardId((prev) => {
      if (prev && scorecardOptions.some((o) => o.value === prev)) return prev;
      return scorecardOptions[0]?.value;
    });
    // scorecardOptionKey tracks option identity; scorecardOptions is read for lookup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scorecardOptionKey]);

  const listActiveScorecard: EmployeeScorecard | null = useMemo(() => {
    if (selectedScorecardId) {
      return (
        visibleScorecards.find((s) => s.id === selectedScorecardId) ||
        mine.find((s) => s.id === selectedScorecardId) ||
        null
      );
    }
    return visibleScorecards[0] || null;
  }, [selectedScorecardId, mine, visibleScorecards]);

  const { data: scorecardDetail } = useGetBscScorecard(
    listActiveScorecard?.id || '',
  );

  // Prefer detail (full targets) when the list payload is sparse.
  const activeScorecard: EmployeeScorecard | null = useMemo(() => {
    if (
      scorecardDetail &&
      listActiveScorecard &&
      scorecardDetail.id === listActiveScorecard.id
    ) {
      const detailTargets = scorecardDetail.targets || [];
      const listTargets = listActiveScorecard.targets || [];
      if (detailTargets.length >= listTargets.length) {
        return scorecardDetail;
      }
    }
    return listActiveScorecard;
  }, [listActiveScorecard, scorecardDetail]);

  /** Assigned KPIs = scorecard targets only (never role/catalog bleed). */
  const assignedKpis = useMemo(() => {
    const fromActive = kpisFromScorecardTargets(activeScorecard);
    if (fromActive.length) return fromActive;

    if (USE_BSC_API) {
      // API mode: empty assignment means empty UI — do not invent catalog KPIs.
      return [];
    }

    // Mock-only: preview library KPIs for the demo role title.
    if (!myRoleTitle) return [];
    return (allKpis || []).filter(
      (k) =>
        (k.positionTitle || '').toLowerCase() === myRoleTitle.toLowerCase(),
    );
  }, [activeScorecard, allKpis, myRoleTitle]);

  const { data: periodResults } = useGetBscScorecardResults(
    activeScorecard?.id || '',
  );

  const cycle = useMemo(
    () =>
      (cycles || []).find((c) => c.id === activeScorecard?.cycleId) ||
      (cycles || []).find((c) =>
        assignedKpis.some((k) => k.evaluationConfigId === c.id),
      ),
    [cycles, activeScorecard, assignedKpis],
  );

  const seriesCards = useMemo(() => {
    if (!activeScorecard) return [];
    return filterScorecardsInSeries(mine, activeScorecard, cycleById);
  }, [mine, activeScorecard, cycleById]);

  const averageScoreByKpiId = useMemo(() => {
    const scoresByKpi = new Map<string, number[]>();
    for (const card of seriesCards) {
      for (const target of card.targets) {
        const score = targetScorePercent(target);
        if (score == null) continue;
        const list = scoresByKpi.get(target.kpiLibraryId) || [];
        list.push(score);
        scoresByKpi.set(target.kpiLibraryId, list);
      }
    }
    const averages = new Map<
      string,
      { average: number; count: number; cadence?: string }
    >();
    const cadence = activeScorecard
      ? cycleById.get(activeScorecard.cycleId)?.cadence
      : undefined;
    scoresByKpi.forEach((scores, kpiId) => {
      if (!scores.length) return;
      averages.set(kpiId, {
        average: scores.reduce((sum, value) => sum + value, 0) / scores.length,
        count: scores.length,
        cadence,
      });
    });
    return averages;
  }, [seriesCards, activeScorecard, cycleById]);

  const allocation = useMemo(
    () =>
      (allocations || []).find((row) => {
        if (cycle && row.evaluationConfigId !== cycle.id) return false;
        if (!myRoleTitle) return false;
        return row.positionTitle.toLowerCase() === myRoleTitle.toLowerCase();
      }),
    [allocations, cycle, myRoleTitle],
  );

  const perspectiveNames = useMemo(() => {
    const fromScorecard = Array.from(
      new Set((activeScorecard?.targets || []).map((t) => t.perspective)),
    );
    if (fromScorecard.length) return fromScorecard;

    if (allocation?.weights) {
      const assigned = Object.entries(allocation.weights)
        .filter(([, weight]) => Number(weight) > 0)
        .map(([name]) => name);
      if (assigned.length) return assigned;
    }
    const names = new Set(assignedKpis.map((k) => k.perspective));
    return Array.from(names);
  }, [activeScorecard, allocation, assignedKpis]);

  const kpiRows = useMemo(() => {
    const order = new Map(perspectiveNames.map((name, index) => [name, index]));
    const catalogById = new Map((allKpis || []).map((kpi) => [kpi.id, kpi]));
    const targets = activeScorecard?.targets || [];

    // Prefer the person's scorecard targets (person weights, individual KPIs).
    if (targets.length) {
      const rows: ScorecardKpiRow[] = targets.map((target) => {
        const catalog = catalogById.get(target.kpiLibraryId);
        const actual = target.actualValue ?? null;
        const goal = target.targetValue ?? catalog?.defaultTarget ?? null;
        const logic =
          target.targetLogic ||
          catalog?.targetLogic ||
          TargetLogic.HigherBetter;
        const avgMeta = averageScoreByKpiId.get(target.kpiLibraryId);
        const finalizedScore = targetScorePercent(target);
        return {
          id: target.kpiLibraryId,
          name: target.kpiName,
          description: catalog?.description ?? null,
          perspective: target.perspective,
          weight: target.weightPercentage,
          target: goal,
          actual,
          unit: target.measurementUnit || catalog?.measurementUnit || '',
          targetLogic: logic,
          progress: finalizedScore,
          averageScore: avgMeta?.average ?? null,
          averageCaption: avgMeta
            ? `Avg of ${avgMeta.count}${
                avgMeta.cadence ? ` ${avgMeta.cadence}` : ''
              } period${avgMeta.count === 1 ? '' : 's'}`
            : null,
          targetId: target.id,
          approvalStatus: target.approvalStatus,
          assignmentSource: target.assignmentSource || 'shared',
        };
      });
      return rows.sort(
        (a, b) =>
          (order.get(a.perspective || '') ?? 99) -
            (order.get(b.perspective || '') ?? 99) ||
          a.name.localeCompare(b.name),
      );
    }

    // API mode: no targets ⇒ empty (do not show catalog / role library KPIs).
    if (USE_BSC_API || !assignedKpis.length) return [];

    // Mock-only fallback when no scorecard targets exist yet.
    const rows: ScorecardKpiRow[] = assignedKpis.map((kpi) => {
      const actual = null;
      const goal = kpi.defaultTarget ?? null;
      const avgMeta = averageScoreByKpiId.get(kpi.id);
      return {
        id: kpi.id,
        name: kpi.name,
        description: kpi.description,
        perspective: kpi.perspective,
        weight: kpi.weight ?? kpi.suggestedWeight ?? 0,
        target: goal,
        actual,
        unit: kpi.measurementUnit || '',
        targetLogic: kpi.targetLogic,
        progress: null,
        averageScore: avgMeta?.average ?? null,
        averageCaption: avgMeta
          ? `Avg of ${avgMeta.count}${
              avgMeta.cadence ? ` ${avgMeta.cadence}` : ''
            } period${avgMeta.count === 1 ? '' : 's'}`
          : null,
        assignmentSource: 'shared',
      };
    });
    return rows.sort(
      (a, b) =>
        (order.get(a.perspective || '') ?? 99) -
        (order.get(b.perspective || '') ?? 99),
    );
  }, [
    activeScorecard,
    allKpis,
    assignedKpis,
    averageScoreByKpiId,
    perspectiveNames,
  ]);

  const loading = scorecardsLoading || kpisLoading;
  const activeTab =
    scorecardTab === 'results' ||
    scorecardTab === 'team' ||
    scorecardTab === 'all'
      ? 'results'
      : scorecardTab === 'checkin'
        ? 'checkin'
        : 'mine';

  const myScorecardFilters = (
    <ScorecardPeriodFilter
      scorecardValue={selectedScorecardId}
      scorecardOptions={scorecardOptions}
      onScorecardChange={setSelectedScorecardId}
    />
  );

  const contextLabel = activeScorecard
    ? scorecardContextLabel(activeScorecard, cycle)
    : null;

  const scorecardProgress = useMemo(() => {
    if (!activeScorecard || !isScorecardEvaluated(activeScorecard)) {
      return undefined;
    }
    return computeKpiProgressPercent(activeScorecard);
  }, [activeScorecard]);

  const resultsSummary = useMemo(() => {
    if (!USE_BSC_API || !periodResults) return null;
    const current = periodResults.current as
      | { compositeScore?: number | null; periodLabel?: string; status?: string }
      | undefined;
    const average =
      typeof periodResults.averageScore === 'number'
        ? periodResults.averageScore
        : null;
    const historyLen = Array.isArray(periodResults.history)
      ? periodResults.history.length
      : 0;
    if (current?.compositeScore == null && average == null) return null;
    return {
      periodLabel: current?.periodLabel || null,
      currentScore:
        current?.compositeScore != null ? Number(current.compositeScore) : null,
      averageScore: average,
      historyLen,
      status: current?.status || null,
    };
  }, [periodResults]);

  const myScorecardBody = (
    <div data-cy="bsc-my-scorecard-tab-content">
      {loading ? (
        <div
          data-cy="-bsc-bsc-my-scorecard-page-tsx-page-div-299"
          className="py-16 text-center text-gray-400"
        >
          Loading…
        </div>
      ) : !kpiRows.length && !activeScorecard ? (
        <div
          data-cy="-bsc-bsc-my-scorecard-page-tsx-page-div-301"
          className="flex justify-center py-10"
        >
          <EmptyImage />
        </div>
      ) : (
        <div data-cy="page-div-497" className="flex flex-col gap-4">
          {resultsSummary ? (
            <div
              className="flex flex-wrap items-center gap-3 rounded-xl bg-[#F5F7FB] px-4 py-3 text-sm text-[#4d4d4d]"
              data-cy="bsc-my-scorecard-results-summary"
            >
              {resultsSummary.periodLabel ? (
                <span data-cy="bsc-my-scorecard-results-period">
                  {resultsSummary.periodLabel}
                </span>
              ) : null}
              {resultsSummary.currentScore != null ? (
                <span
                  className="font-semibold text-[#262626]"
                  data-cy="bsc-my-scorecard-results-current"
                >
                  Period score {formatScore(resultsSummary.currentScore)}
                </span>
              ) : (
                <span data-cy="bsc-my-scorecard-results-pending">
                  {resultsSummary.status || 'In progress'} — not scored yet
                </span>
              )}
              {resultsSummary.averageScore != null ? (
                <span data-cy="bsc-my-scorecard-results-average">
                  Avg {formatScore(resultsSummary.averageScore)}
                  {resultsSummary.historyLen
                    ? ` across ${resultsSummary.historyLen} period${
                        resultsSummary.historyLen === 1 ? '' : 's'
                      }`
                    : ''}
                </span>
              ) : null}
            </div>
          ) : null}
          <PerspectiveKpiCard
            title="KPI Progress"
            kpis={kpiRows}
            scorecard={activeScorecard}
            contextLabel={contextLabel}
            progressPercent={loading ? undefined : scorecardProgress}
          />
        </div>
      )}
    </div>
  );

  const isCompactTabBar = isMobile || isTablet;

  const tabLabel = (key: string, label: string) => (
    <div
      className={`text-sm font-medium ${
        activeTab === key ? 'text-okr-primary font-semibold' : 'text-gray-800'
      }`}
      data-cy={`bsc-scorecard-tab-${key}`}
    >
      {label}
    </div>
  );

  const scorecardSectionTabs = [
    {
      key: 'mine',
      label: tabLabel('mine', 'My Scorecard'),
      children: myScorecardBody,
    },
    {
      key: 'checkin',
      label: tabLabel('checkin', 'Check-in'),
      children: (
        <div data-cy="bsc-checkin-tab-content">
          <CheckinQueue inbox={checkinInbox} />
        </div>
      ),
    },
    {
      key: 'results',
      label: tabLabel('results', 'Results'),
      children: (
        <ResultsKpiView
          canViewTeamKpi={canViewTeamKpi}
          canViewAllEmployeeKpi={canViewAllEmployeeKpi}
        />
      ),
    },
  ];

  const checkinInboxToggle = (
    <CheckinInboxToggle value={checkinInbox} onChange={setCheckinInbox} />
  );

  const tabBarExtraContent =
    activeTab === 'mine'
      ? isCompactTabBar
        ? { right: myScorecardFilters }
        : myScorecardFilters
      : activeTab === 'checkin'
        ? isCompactTabBar
          ? { right: checkinInboxToggle }
          : checkinInboxToggle
        : undefined;

  const tabsClassName = [
    '[&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab-btn]:py-2 [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-wrap]:!px-0 [&_.ant-tabs-nav-list]:!px-0 [&_.ant-tabs-nav-wrap]:before:!left-0 [&_.ant-tabs-nav-wrap]:after:!right-0 [&_.ant-tabs-content-holder]:mt-6',
    isCompactTabBar
      ? '[&_.ant-tabs-nav]:min-w-0 [&_.ant-tabs-nav-wrap]:min-w-0 [&_.ant-tabs-nav-list]:!flex-nowrap [&_.ant-tabs-nav-wrap]:overflow-x-auto [&_.ant-tabs-nav-wrap]:scrollbar-none [&_.ant-tabs-extra-content]:!shrink-0'
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const compactRenderTabBar: RenderTabBar = (tabBarProps, defaultTabBar) => {
    const TabNavList = defaultTabBar;
    return (
      <div className="w-full min-w-0" data-cy="bsc-mobile-tab-bar-stack">
        <TabNavList {...tabBarProps} />
      </div>
    );
  };

  const activeTabLabel =
    activeTab === 'mine'
      ? 'My Scorecard'
      : activeTab === 'checkin'
        ? 'Check-in'
        : activeTab === 'results'
          ? 'Results'
          : 'My Scorecard';

  const handleScorecardSectionChange = (key: string) => {
    const next = key as ScorecardTab;
    setScorecardTab(next);
    if (next === 'results') {
      const scope = canViewAllEmployeeKpi
        ? 'all'
        : canViewTeamKpi
          ? 'team'
          : 'mine';
      router.push(scorecardResultsHref(scope));
      return;
    }
    router.push(scorecardTabHref(next));
  };

  return (
    <div className="w-full" data-cy="bsc-my-scorecard-page">
      <CustomBreadcrumb
        titleClassName="!text-gray-900"
        title={
          <span
            data-cy="-bsc-bsc-my-scorecard-page-tsx-page-span-387"
            className="text-2xl font-bold text-gray-900"
          >
            My Scorecard
          </span>
        }
        subtitle={
          <nav
            data-cy="-bsc-bsc-my-scorecard-page-tsx-page-nav-390"
            aria-label="Breadcrumb"
            className="flex text-sm font-medium text-gray-500 mt-1"
          >
            <ol
              data-cy="-bsc-bsc-my-scorecard-page-tsx-page-ol-394"
              className="flex items-center space-x-2"
            >
              <li data-cy="-bsc-bsc-my-scorecard-page-tsx-page-li-395">
                <Link
                  className="!text-gray-800"
                  href={scorecardTabHref('mine')}
                >
                  BSC
                </Link>
              </li>
              <li data-cy="-bsc-bsc-my-scorecard-page-tsx-page-li-400">
                <span
                  data-cy="-bsc-bsc-my-scorecard-page-tsx-page-span-401"
                  className="text-gray-400"
                >
                  /
                </span>
              </li>
              <li data-cy="-bsc-bsc-my-scorecard-page-tsx-page-li-403">
                <span
                  data-cy="-bsc-bsc-my-scorecard-page-tsx-page-span-404"
                  className="text-gray-900"
                >
                  {activeTabLabel}
                </span>
              </li>
            </ol>
          </nav>
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={handleScorecardSectionChange}
        items={scorecardSectionTabs}
        moreIcon={false}
        tabBarStyle={{
          marginBottom: 0,
          marginLeft: 0,
          paddingLeft: 0,
          paddingRight: 0,
        }}
        tabBarExtraContent={tabBarExtraContent}
        renderTabBar={isCompactTabBar ? compactRenderTabBar : undefined}
        className={tabsClassName}
        data-cy="bsc-scorecard-tabs"
        destroyInactiveTabPane
      />
    </div>
  );
}
