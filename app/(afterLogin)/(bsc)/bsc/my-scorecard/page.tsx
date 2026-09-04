'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Select, Tabs } from 'antd';
import type { RenderTabBar } from 'rc-tabs/es/interface';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';
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
import EmployeeKpiTable from './_components/EmployeeKpiTable';
import ScorecardPeriodFilter from './_components/ScorecardPeriodFilter';
import TeamKpiReview from './_components/TeamKpiReview';
import CheckinQueue from './_components/CheckinQueue';
import PerspectivesCatalog from '@/app/(afterLogin)/(okrplanning)/okr/settings/bsc-perspectives/_components/PerspectivesCatalog';
import ScorecardsCatalog from '@/app/(afterLogin)/(okrplanning)/okr/settings/bsc-setup/_components/ScorecardsCatalog';
import { buildCheckinQueue } from '@/utils/bsc/checkin';

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
  const { userId } = useAuthenticationStore();
  const {
    myScorecardSessionId,
    myScorecardMonthId,
    myScorecardSessionMonths,
    scorecardTab,
    setScorecardTab,
    openCreateSetup,
    openCreatePerspective,
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

  const { data: scorecards, isLoading: scorecardsLoading } =
    useGetBscScorecards();
  const { data: allKpis, isLoading: kpisLoading } = useGetBscKpiLibrary();
  const { data: cycles } = useGetBscCycles();
  const { data: allocations } = useGetBscRolePerspectives();
  const [selectedScorecardId, setSelectedScorecardId] = useState<
    string | undefined
  >();

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

  const checkinCount = useMemo(() => {
    const preferred = userId || 'demo-user';
    const primary = buildCheckinQueue(scorecards, preferred, cycleById);
    if (primary.length || preferred === 'demo-user') return primary.length;
    return buildCheckinQueue(scorecards, 'demo-user', cycleById).length;
  }, [scorecards, userId, cycleById]);

  const loading = scorecardsLoading || kpisLoading;
  const activeTab =
    scorecardTab === 'kpis' && canManageBscAdmin
      ? 'kpis'
      : scorecardTab === 'bsc' && canManageBscAdmin
        ? 'bsc'
        : scorecardTab === 'all' && canViewAllEmployeeKpi
          ? 'all'
          : scorecardTab === 'team' && canViewTeamKpi
            ? 'team'
            : scorecardTab === 'checkin'
              ? 'checkin'
              : 'mine';
  const isCompactTabBar = isMobile || isTablet;

  const myScorecardFilters = (
    <div className="flex flex-wrap items-center gap-2">
      {scorecardOptions.length > 1 ? (
        <Select
          className="w-full min-w-[200px] sm:w-[280px]"
          value={selectedScorecardId}
          options={scorecardOptions}
          onChange={setSelectedScorecardId}
          showSearch
          optionFilterProp="label"
          placeholder="Scorecard context"
          data-cy="bsc-my-scorecard-context-select"
        />
      ) : null}
      <ScorecardPeriodFilter />
    </div>
  );

  const contextLabel = activeScorecard
    ? scorecardContextLabel(activeScorecard, cycle)
    : null;

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
        <PerspectiveKpiCard
          title="KPI Progress"
          kpis={kpiRows}
          scorecard={activeScorecard}
          cadence={cycle?.cadence}
          contextLabel={contextLabel}
        />
      )}
    </div>
  );

  const tabLabel = (key: string, label: string) => (
    <div
      className={`text-base font-normal m-0 ${
        activeTab === key ? 'text-okr-primary font-semibold' : 'text-gray-800'
      }`}
      data-cy={`bsc-scorecard-tab-${key}`}
    >
      {label}
    </div>
  );

  const tabItems = [
    {
      key: 'mine',
      label: tabLabel('mine', 'My Scorecard'),
      children: myScorecardBody,
    },
    {
      key: 'checkin',
      label: tabLabel(
        'checkin',
        checkinCount > 0 ? `Check-in (${checkinCount})` : 'Check-in',
      ),
      children: (
        <div data-cy="bsc-checkin-tab-content">
          <CheckinQueue />
        </div>
      ),
    },
    ...(canManageBscAdmin
      ? [
          {
            key: 'kpis',
            label: tabLabel('kpis', 'KPIs'),
            children: (
              <div data-cy="bsc-kpis-admin-tab-content">
                <PerspectivesCatalog />
              </div>
            ),
          },
          {
            key: 'bsc',
            label: tabLabel('bsc', 'BSC'),
            children: (
              <div data-cy="bsc-setup-admin-tab-content">
                <ScorecardsCatalog />
              </div>
            ),
          },
        ]
      : []),
    ...(canViewTeamKpi
      ? [
          {
            key: 'team',
            label: tabLabel('team', 'Team KPI'),
            children: <TeamKpiReview />,
          },
        ]
      : []),
    ...(canViewAllEmployeeKpi
      ? [
          {
            key: 'all',
            label: tabLabel('all', 'All Employee KPI'),
            children: (
              <div data-cy="bsc-all-employee-kpi-tab-content">
                <EmployeeKpiTable />
              </div>
            ),
          },
        ]
      : []),
  ];

  const adminTabActions =
    activeTab === 'kpis' ? (
      <Button
        icon={<FaPlus />}
        onClick={openCreatePerspective}
        className="bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] h-9 px-3 sm:px-4 text-white border-none rounded-lg flex items-center justify-center font-medium"
        type="primary"
        data-cy="bsc-perspective-add"
      >
        <span
          className="hidden sm:inline ml-2"
          data-cy="-bsc-bsc-my-scorecard-page-span-1"
        >
          Add Perspective
        </span>
      </Button>
    ) : activeTab === 'bsc' ? (
      <Button
        icon={<FaPlus />}
        onClick={openCreateSetup}
        className="bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] h-9 px-3 sm:px-4 text-white border-none rounded-lg flex items-center justify-center font-medium"
        type="primary"
        data-cy="bsc-setup-add"
      >
        <span
          className="hidden sm:inline ml-2"
          data-cy="-bsc-bsc-my-scorecard-page-span-2"
        >
          Add scorecard
        </span>
      </Button>
    ) : null;

  const tabBarExtraContent =
    activeTab === 'mine'
      ? isCompactTabBar
        ? { right: myScorecardFilters }
        : myScorecardFilters
      : adminTabActions
        ? isCompactTabBar
          ? { right: adminTabActions }
          : adminTabActions
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

  return (
    <div className="w-full" data-cy="bsc-my-scorecard-page">
      <CustomBreadcrumb
        titleClassName="!text-gray-900"
        title={
          <span
            data-cy="-bsc-bsc-my-scorecard-page-tsx-page-span-387"
            className="text-2xl font-bold text-gray-900"
          >
            KPI
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
                <Link className="!text-gray-800" href="/bsc/my-scorecard">
                  KPI
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
                  {activeTab === 'mine'
                    ? 'My Scorecard'
                    : activeTab === 'checkin'
                      ? 'Check-in'
                      : activeTab === 'kpis'
                        ? 'KPIs'
                        : activeTab === 'bsc'
                          ? 'BSC'
                          : activeTab === 'team'
                            ? 'Team KPI'
                            : activeTab === 'all'
                              ? 'All Employee KPI'
                              : 'My Scorecard'}
                </span>
              </li>
            </ol>
          </nav>
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={(key) =>
          setScorecardTab(
            key as 'mine' | 'checkin' | 'team' | 'all' | 'kpis' | 'bsc',
          )
        }
        items={tabItems}
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
