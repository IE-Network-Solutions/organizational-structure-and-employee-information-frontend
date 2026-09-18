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
import { isScorecardEvaluated, targetScorePercent } from '@/utils/bsc/rollup';
import {
  filterScorecardsInSeries,
  latestScorecardPerSeries,
  scorecardContextLabel,
  scorecardProgramName,
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

function averageScoresForSeries(
  seriesCards: EmployeeScorecard[],
  cadence?: string,
): Map<string, { average: number; count: number; cadence?: string }> {
  const scoresByKpi = new Map<string, number[]>();
  for (const card of seriesCards) {
    for (const target of card.targets || []) {
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
  scoresByKpi.forEach((scores, kpiId) => {
    if (!scores.length) return;
    averages.set(kpiId, {
      average: scores.reduce((sum, value) => sum + value, 0) / scores.length,
      count: scores.length,
      cadence,
    });
  });
  return averages;
}

function buildKpiRowsForScorecard(
  card: EmployeeScorecard,
  catalogKpis: KpiLibraryItem[] | undefined,
  averageScoreByKpiId: Map<
    string,
    { average: number; count: number; cadence?: string }
  >,
  mockRoleFallback: KpiLibraryItem[],
): ScorecardKpiRow[] {
  const catalogById = new Map((catalogKpis || []).map((kpi) => [kpi.id, kpi]));
  const targets = card.targets || [];
  const perspectiveOrder = new Map<string, number>();
  for (const target of targets) {
    if (target.perspective && !perspectiveOrder.has(target.perspective)) {
      perspectiveOrder.set(target.perspective, perspectiveOrder.size);
    }
  }

  if (targets.length) {
    const rows: ScorecardKpiRow[] = targets.map((target) => {
      const catalog = catalogById.get(target.kpiLibraryId);
      const avgMeta = averageScoreByKpiId.get(target.kpiLibraryId);
      return {
        id: target.kpiLibraryId,
        name: target.kpiName,
        description: catalog?.description ?? null,
        perspective: target.perspective,
        weight: target.weightPercentage,
        target: target.targetValue ?? catalog?.defaultTarget ?? null,
        actual: target.actualValue ?? null,
        unit: target.measurementUnit || catalog?.measurementUnit || '',
        targetLogic:
          target.targetLogic ||
          catalog?.targetLogic ||
          TargetLogic.HigherBetter,
        progress: targetScorePercent(target),
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
        (perspectiveOrder.get(a.perspective || '') ?? 99) -
          (perspectiveOrder.get(b.perspective || '') ?? 99) ||
        a.name.localeCompare(b.name),
    );
  }

  if (USE_BSC_API || !mockRoleFallback.length) return [];

  return mockRoleFallback
    .map((kpi) => {
      const avgMeta = averageScoreByKpiId.get(kpi.id);
      return {
        id: kpi.id,
        name: kpi.name,
        description: kpi.description,
        perspective: kpi.perspective,
        weight: kpi.weight ?? kpi.suggestedWeight ?? 0,
        target: kpi.defaultTarget ?? null,
        actual: null,
        unit: kpi.measurementUnit || '',
        targetLogic: kpi.targetLogic,
        progress: null,
        averageScore: avgMeta?.average ?? null,
        averageCaption: avgMeta
          ? `Avg of ${avgMeta.count}${
              avgMeta.cadence ? ` ${avgMeta.cadence}` : ''
            } period${avgMeta.count === 1 ? '' : 's'}`
          : null,
        assignmentSource: 'shared' as const,
      };
    })
    .sort((a, b) =>
      (a.perspective || '').localeCompare(b.perspective || ''),
    );
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
  const [checkinInbox, setCheckinInbox] = useState<CheckinInbox>('mine');

  const cycleById = useMemo(() => {
    const map = new Map<string, EvaluationCycle>();
    for (const cycle of cycles || []) map.set(cycle.id, cycle);
    return map;
  }, [cycles]);

  const mine = useMemo(() => {
    const list = scorecards || [];
    if (USE_BSC_API) {
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
    return USE_BSC_API ? null : 'HR Director';
  }, [mine]);

  const mockRoleFallback = useMemo(() => {
    if (USE_BSC_API || !myRoleTitle) return [];
    return (allKpis || []).filter(
      (k) =>
        (k.positionTitle || '').toLowerCase() === myRoleTitle.toLowerCase(),
    );
  }, [allKpis, myRoleTitle]);

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

  /** Stack all distinct scorecards (My OKR style), not one at a time. */
  const cardsToShow = useMemo(() => {
    if (isHistoryFilterActive) return visibleScorecards;
    return latestScorecardPerSeries(visibleScorecards, cycleById);
  }, [visibleScorecards, cycleById, isHistoryFilterActive]);

  const scorecardCards = useMemo(() => {
    return cardsToShow.map((card) => {
      const cycle = cycleById.get(card.cycleId);
      const series = filterScorecardsInSeries(mine, card, cycleById);
      const averages = averageScoresForSeries(series, cycle?.cadence);
      const kpis = buildKpiRowsForScorecard(
        card,
        allKpis,
        averages,
        mockRoleFallback,
      );
      return {
        card,
        title: scorecardProgramName(card, cycle),
        contextLabel: scorecardContextLabel(card, cycle),
        kpis,
        progressPercent: !isScorecardEvaluated(card)
          ? undefined
          : computeKpiProgressPercent(card),
      };
    });
  }, [cardsToShow, cycleById, mine, allKpis, mockRoleFallback]);

  const loading = scorecardsLoading || kpisLoading;
  const activeTab =
    scorecardTab === 'results' ||
    scorecardTab === 'team' ||
    scorecardTab === 'all'
      ? 'results'
      : scorecardTab === 'checkin'
        ? 'checkin'
        : 'mine';

  const myScorecardFilters = <ScorecardPeriodFilter />;

  const myScorecardBody = (
    <div data-cy="bsc-my-scorecard-tab-content">
      {loading ? (
        <div
          data-cy="bsc-my-scorecard-loading"
          className="py-16 text-center text-gray-400"
        >
          Loading…
        </div>
      ) : !scorecardCards.length ? (
        <div
          data-cy="bsc-my-scorecard-empty"
          className="flex justify-center py-10"
        >
          <EmptyImage />
        </div>
      ) : (
        <div data-cy="bsc-my-scorecard-list" className="flex flex-col gap-2">
          {scorecardCards.map(
            ({ card, title, contextLabel, kpis, progressPercent }) => (
              <PerspectiveKpiCard
                key={card.id}
                title={title}
                kpis={kpis}
                scorecard={card}
                contextLabel={contextLabel}
                progressPercent={loading ? undefined : progressPercent}
              />
            ),
          )}
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
            data-cy="bsc-my-scorecard-title"
            className="text-2xl font-bold text-gray-900"
          >
            My Scorecard
          </span>
        }
        subtitle={
          <nav
            data-cy="bsc-my-scorecard-breadcrumb"
            aria-label="Breadcrumb"
            className="flex text-sm font-medium text-gray-500 mt-1"
          >
            <ol
              data-cy="bsc-my-scorecard-breadcrumb-list"
              className="flex items-center space-x-2"
            >
              <li data-cy="bsc-my-scorecard-breadcrumb-bsc">
                <Link
                  className="!text-gray-800"
                  href={scorecardTabHref('mine')}
                >
                  BSC
                </Link>
              </li>
              <li data-cy="bsc-my-scorecard-breadcrumb-sep">
                <span data-cy="bsc-my-scorecard-breadcrumb-sep-text" className="text-gray-400">
                  /
                </span>
              </li>
              <li data-cy="bsc-my-scorecard-breadcrumb-current">
                <span
                  data-cy="bsc-my-scorecard-breadcrumb-current-label"
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
