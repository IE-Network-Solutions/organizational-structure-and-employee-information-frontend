'use client';

import React, { useMemo } from 'react';
import { Button, Tabs } from 'antd';
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
  KpiLibraryItem,
  ScorecardStatus,
  TargetLogic,
} from '@/types/bsc';
import { normalizeRatio } from '@/utils/bsc/scoring';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';
import PerspectiveKpiCard, {
  ScorecardKpiRow,
} from './_components/PerspectiveKpiCard';
import EmployeeKpiTable from './_components/EmployeeKpiTable';
import ScorecardPeriodFilter from './_components/ScorecardPeriodFilter';
import TeamKpiReview from './_components/TeamKpiReview';
import PerspectivesCatalog from '@/app/(afterLogin)/(okrplanning)/okr/settings/bsc-perspectives/_components/PerspectivesCatalog';
import ScorecardsCatalog from '@/app/(afterLogin)/(okrplanning)/okr/settings/bsc-setup/_components/ScorecardsCatalog';

function currentMonthName(): string {
  return new Date().toLocaleString('en-US', { month: 'long' });
}

function currentYear(): number {
  return new Date().getFullYear();
}

function daysUntil(endDate?: string | null): number | null {
  if (!endDate) return null;
  const diff = Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  return Number.isFinite(diff) ? Math.max(0, diff) : null;
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

  const activeScorecard: EmployeeScorecard | null =
    visibleScorecards[0] || null;

  const evaluated = Boolean(
    activeScorecard &&
    (activeScorecard.status === ScorecardStatus.Scored ||
      activeScorecard.status === ScorecardStatus.Completed ||
      activeScorecard.finalEvaluation?.compositeScore != null),
  );

  const cycle = useMemo(
    () =>
      (cycles || []).find((c) => c.id === activeScorecard?.cycleId) ||
      (cycles || []).find((c) =>
        assignedKpis.some((k) => k.evaluationConfigId === c.id),
      ),
    [cycles, activeScorecard, assignedKpis],
  );

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
        const logic = target.targetLogic || catalog?.targetLogic || TargetLogic.HigherBetter;
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
        assignmentSource: 'shared',
      };
    });
    return rows.sort(
      (a, b) =>
        (order.get(a.perspective || '') ?? 99) -
        (order.get(b.perspective || '') ?? 99),
    );
  }, [activeScorecard, allKpis, assignedKpis, perspectiveNames]);

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
            : 'mine';
  const isCompactTabBar = isMobile || isTablet;

  const myScorecardFilters = <ScorecardPeriodFilter />;

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
          daysLeft={daysUntil(cycle?.endDate)}
          evaluated={evaluated}
          scorecard={activeScorecard}
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
        <span className="hidden sm:inline ml-2">Add Perspective</span>
      </Button>
    ) : activeTab === 'bsc' ? (
      <Button
        icon={<FaPlus />}
        onClick={openCreateSetup}
        className="bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] h-9 px-3 sm:px-4 text-white border-none rounded-lg flex items-center justify-center font-medium"
        type="primary"
        data-cy="bsc-setup-add"
      >
        <span className="hidden sm:inline ml-2">Add</span>
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
                <Link className="!text-gray-800" href="/okr">
                  Performance
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
                  My Scorecard
                </span>
              </li>
            </ol>
          </nav>
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={(key) =>
          setScorecardTab(key as 'mine' | 'team' | 'all' | 'kpis' | 'bsc')
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
