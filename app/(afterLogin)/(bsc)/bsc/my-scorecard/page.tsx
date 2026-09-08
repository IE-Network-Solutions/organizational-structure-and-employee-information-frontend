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
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  EmployeeScorecard,
  EvaluationCycle,
  KpiLibraryItem,
  ScorecardStatus,
  TargetLogic,
} from '@/types/bsc';
import { normalizeRatio } from '@/utils/bsc/scoring';
import { targetScorePercent } from '@/utils/bsc/rollup';
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

function kpiProgressPercent(
  actual: number | null | undefined,
  target: number | null | undefined,
  logic: TargetLogic,
): number {
  if (actual == null || target == null) return 0;
  const { ratio } = normalizeRatio(actual, target, logic);
  return Math.min(Math.max(ratio, 0), 1) * 100;
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
      if (tab === 'results' || tab === 'team' || tab === 'all') {
        return canViewTeamKpi || canViewAllEmployeeKpi ? 'results' : 'mine';
      }
      return tab;
    };

    const allowed = ensureAllowedTab(tabFromUrl);
    if (allowed !== tabFromUrl) {
      if (allowed === 'results') {
        router.replace(
          scorecardResultsHref(canViewAllEmployeeKpi ? 'all' : 'team'),
        );
      } else {
        router.replace(scorecardTabHref(allowed));
      }
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
    if (userId) {
      const matched = list.filter((s) => s.userId === userId);
      if (matched.length) return matched;
    }
    return list.filter((s) => s.userId === 'demo-user');
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

  const scorecardOptions = useMemo(() => {
    const pool = isHistoryFilterActive ? visibleScorecards : mine;
    return pool.map((card) => ({
      value: card.id,
      label: scorecardContextLabel(card, cycleById.get(card.cycleId)),
    }));
  }, [mine, visibleScorecards, isHistoryFilterActive, cycleById]);

  useEffect(() => {
    if (!scorecardOptions.length) {
      setSelectedScorecardId(undefined);
      return;
    }
    setSelectedScorecardId((prev) => {
      if (prev && scorecardOptions.some((o) => o.value === prev)) return prev;
      const preferred =
        visibleScorecards[0]?.id ||
        mine.find((s) => s.status === ScorecardStatus.Active)?.id ||
        scorecardOptions[0]?.value;
      return preferred;
    });
  }, [scorecardOptions, visibleScorecards, mine]);

  const activeScorecard: EmployeeScorecard | null = useMemo(() => {
    if (selectedScorecardId) {
      return (
        mine.find((s) => s.id === selectedScorecardId) ||
        visibleScorecards.find((s) => s.id === selectedScorecardId) ||
        null
      );
    }
    return visibleScorecards[0] || null;
  }, [selectedScorecardId, mine, visibleScorecards]);

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
          progress: kpiProgressPercent(actual, goal, logic),
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

    // Fallback when no scorecard targets exist yet (catalog / role preview).
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
        progress: 0,
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
    (scorecardTab === 'results' ||
      scorecardTab === 'team' ||
      scorecardTab === 'all') &&
    (canViewTeamKpi || canViewAllEmployeeKpi)
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

  const scorecardProgress = useMemo(
    () => computeKpiProgressPercent(activeScorecard),
    [activeScorecard],
  );

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
    ...(canViewTeamKpi || canViewAllEmployeeKpi
      ? [
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
        ]
      : []),
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
      router.push(scorecardResultsHref(canViewAllEmployeeKpi ? 'all' : 'team'));
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
