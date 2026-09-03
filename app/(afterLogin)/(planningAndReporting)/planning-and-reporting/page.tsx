'use client';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { CloseOutlined } from '@ant-design/icons';
import { ConfigProvider, Drawer, Segmented } from 'antd';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { useFiscalYearSessionSync } from './_components/filters/useFiscalYearSessionSync';
import Planning from './_components/planning';
import PlanningToolbarFilters from './_components/planning/PlanningToolbarFilters';
import InlinePlanningWorkspace, {
  type InlinePlanningWorkspaceHandle,
} from './_components/planning/InlinePlanningWorkspace';
import { KRLeftPanel } from './_components/planning/PlanningPanelView';
import type { CommentThreadKind } from './_components/planning/PlanningPanelView';
import {
  getActiveUnreportedParentPlanContext,
  enrichPlanSummariesWithUserKeyResults,
  flattenObjectiveKeyResults,
  mergeUserKeyResultSources,
  normalizeUserKeyResultItems,
} from './_components/planning/mergeKRPanelGroups';
import { useGetUserKeyResult } from '@/store/server/features/okrplanning/okr/keyresult/queries';
import { useGetUserObjective } from '@/store/server/features/okrplanning/okr/objective/queries';
import { usePlanningData } from './_components/planning/usePlanningData';
import { usePlanningTargets } from './_components/planning/usePlanningTargets';
import { isPlanningTargetBlocked } from './_components/planning/buildPlanningTargets';
import {
  cadenceAssignmentByKind,
  DURATION_TAB_ITEMS,
} from './_components/planning/durationFilter';
import { useReportingData } from './_components/planning/useReportingData';
import { KRPanelSkeleton } from './_components/cards/PlanCardSkeleton';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetPlanningPeriodsHierarchy,
} from '@/store/server/features/okrPlanningAndReporting/queries';

import { useGetAssignedPlanningPeriodForUserId } from '@/store/server/features/employees/planning/planningPeriod/queries';
import { useOkrPlanningScope } from '@/hooks/useOkrPlanningScope';
import CreatePlan from './_components/createPlan';
import Reporting from './_components/reporting';
import CreateReport from './_components/createReport';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useSearchParams } from 'next/navigation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { isDeadlinePlanningMockEnabled } from '@/utils/deadlinePlanningMocks';
import {
  MOCK_KEY_RESULTS,
  UNLINKED_KR_ID,
} from './_components/prototype/mockPlanningConstants';
import type { PlanningTarget } from './_components/planning/buildPlanningTargets';

interface PlanningPeriod {
  id: string;
  userId: string;
  planningPeriod: {
    id: string;
    name: string;
    intervalLength: any;
  };
}

function Page() {
  useFiscalYearSessionSync();
  const searchParams = useSearchParams();
  const {
    setActiveTab,
    activeTab,
    activePlanPeriod,
    setActivePlanPeriod,
    setActivePlanPeriodId,
    setSelectedUser,
    setPlanningFilterPlanType,
    setPlanningFilterDepartment,
    setPage,
    setPageReporting,
    inlinePlanningMode,
    setInlinePlanningMode,
    mobilePlanComposerOpen,
    setMobilePlanComposerOpen,
    inlineEditPlanId,
    setInlineEditPlanId,
  } = PlanningAndReportingStore();

  const { fiscalYearId: keyResultFiscalYearId, sessionId: keyResultSessionId } =
    useOkrPlanningScope();

  const mockEnabled = isDeadlinePlanningMockEnabled();

  const { data: planningPeriods } = AllPlanningPeriods();
  const { data: defaultPlanningPeriods } = useDefaultPlanningPeriods();
  const { isMobile, isTablet } = useIsMobile();

  const { data: planningPeriodForUserId } =
    useGetAssignedPlanningPeriodForUserId();

  const hasPermission = AccessGuard.checkAccess({
    permissions: [
      Permissions.ViewDailyPlan,
      Permissions.ViewWeeklyPlan,
      Permissions.ViewMonthlyPlan,
    ],
  });

  const processedPlanningPeriods = useMemo(() => {
    const safePlanningPeriods = Array.isArray(planningPeriods)
      ? planningPeriods
      : [];
    const safeDefaultPlanningPeriods = Array.isArray(
      defaultPlanningPeriods?.items,
    )
      ? defaultPlanningPeriods.items
      : [];

    if (safePlanningPeriods.length === 0) return [];

    const existingUserId = safePlanningPeriods[0]?.userId || 'N/A';
    const existingPlanningPeriodIds = new Set(
      safePlanningPeriods.map(
        (item: PlanningPeriod) => item?.planningPeriod?.id,
      ),
    );

    const missingPlanningPeriods = safeDefaultPlanningPeriods
      .filter((item: any) => !existingPlanningPeriodIds.has(item.id))
      .map((item: any) => ({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: 'system',
        updatedBy: 'system',
        userId: existingUserId,
        tenantId: item.tenantId,
        planningPeriodId: item.id,
        planningPeriod: item,
      }));

    const mergedPlanningPeriods = [
      ...safePlanningPeriods,
      ...missingPlanningPeriods,
    ];

    mergedPlanningPeriods.sort(
      (a, b) =>
        a.planningPeriod.intervalLength - b.planningPeriod.intervalLength,
    );

    return hasPermission ? mergedPlanningPeriods : safePlanningPeriods;
  }, [planningPeriods, defaultPlanningPeriods, hasPermission]);

  const tabItems = useMemo(() => {
    return processedPlanningPeriods.map(
      (item: PlanningPeriod, index: number) => ({
        label: (
          <span
            data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-span-110"
            className="font-semibold text-sm"
          >
            {item.planningPeriod.name || 'No name available'}
          </span>
        ),
        id: item.planningPeriod.id,
        key: String(index + 1),
        children: null,
      }),
    );
  }, [processedPlanningPeriods]);

  useEffect(() => {
    const recipientUserId = useAuthenticationStore.getState().userId;
    const tab = (searchParams.get('tab') ?? '').toLowerCase();
    if (tab === 'report' || tab === 'reporting') {
      setActiveTab(2);
    } else if (tab === 'plan' || tab === 'planning') {
      setActiveTab(1);
    }

    const employeeIdParam = searchParams.get('employeeId');
    const userIdParam = searchParams.get('userId');
    const linkedEmployee = employeeIdParam || userIdParam || '';
    const onlyRecipientFallback =
      !employeeIdParam && !!userIdParam && userIdParam === recipientUserId;

    if (linkedEmployee && linkedEmployee !== 'all' && !onlyRecipientFallback) {
      setPlanningFilterPlanType('all');
      setPlanningFilterDepartment(undefined);
      setSelectedUser([linkedEmployee]);
      setPage(1);
      setPageReporting(1);
    }
  }, [
    searchParams,
    setActiveTab,
    setSelectedUser,
    setPlanningFilterPlanType,
    setPlanningFilterDepartment,
    setPage,
    setPageReporting,
  ]);

  useEffect(() => {
    const periodId =
      searchParams.get('planningPeriodId') ||
      searchParams.get('periodId') ||
      '';
    if (!periodId || tabItems.length === 0) return;
    const match = tabItems.find((item) => item.id === periodId);
    if (match?.key) {
      setActivePlanPeriod(Number(match.key));
      setActivePlanPeriodId(match.id);
    }
  }, [searchParams, tabItems, setActivePlanPeriod, setActivePlanPeriodId]);

  const selectedTab = tabItems.find(
    (item) => item.key === String(activePlanPeriod),
  );

  useEffect(() => {
    setActivePlanPeriodId(selectedTab?.id || '');
  }, [selectedTab?.id, setActivePlanPeriodId]);

  // ── Shared KR panel state (lives at page level, persists across tabs) ──
  const {
    planSummaries,
    transformedData,
    isLoading: planningLoading,
    userId,
  } = usePlanningData(activeTab === 1);

  const {
    data: userKeyResultsRaw,
    isLoading: userKeyResultsLoading,
    isFetching: userKeyResultsFetching,
    refetch: refetchUserKeyResults,
  } = useGetUserKeyResult(
    mockEnabled ? null : userId,
    keyResultFiscalYearId,
    keyResultSessionId,
    {
      staleTime: 30_000,
      keepPreviousData: true,
    },
  );

  // Same objective payload the OKR dashboard uses — fills metricType / milestones
  // when key-results/user returns thinner rows (daily / weekly / monthly alike).
  const {
    data: userObjectives,
    isLoading: userObjectivesLoading,
    isFetching: userObjectivesFetching,
  } = useGetUserObjective(
    mockEnabled ? '' : userId,
    100,
    1,
    '',
    keyResultFiscalYearId,
    keyResultSessionId ? [keyResultSessionId] : undefined,
    undefined,
    { enabled: !mockEnabled && !!userId },
  );

  const cadenceAssignments = useMemo(
    () =>
      cadenceAssignmentByKind(
        defaultPlanningPeriods?.items,
        Array.isArray(planningPeriods) ? planningPeriods : [],
      ),
    [defaultPlanningPeriods?.items, planningPeriods],
  );
  const weeklyPeriodId = cadenceAssignments.week.periodId;

  const { data: planningPeriodHierarchy } = useGetPlanningPeriodsHierarchy(
    mockEnabled ? '' : userId,
    mockEnabled ? '' : weeklyPeriodId || '',
  );

  const userKeyResultItems = useMemo(() => {
    if (mockEnabled) {
      return MOCK_KEY_RESULTS.filter((kr) => kr.id !== UNLINKED_KR_ID).map(
        (kr) => ({
          id: kr.id,
          title: kr.title,
          metricType: { name: 'Percentage' },
          milestones: [],
        }),
      );
    }
    return mergeUserKeyResultSources(
      normalizeUserKeyResultItems(userKeyResultsRaw),
      flattenObjectiveKeyResults(userObjectives?.items),
    );
  }, [mockEnabled, userKeyResultsRaw, userObjectives?.items]);

  const parentPlanContext = useMemo(
    () =>
      mockEnabled
        ? null
        : getActiveUnreportedParentPlanContext(planningPeriodHierarchy),
    [mockEnabled, planningPeriodHierarchy],
  );

  const { reportSummaries, reportingItems } = useReportingData(activeTab === 2);

  const enrichedPlanSummaries = useMemo(
    () =>
      enrichPlanSummariesWithUserKeyResults(planSummaries, userKeyResultItems),
    [planSummaries, userKeyResultItems],
  );
  const enrichedReportSummaries = useMemo(
    () =>
      enrichPlanSummariesWithUserKeyResults(
        reportSummaries,
        userKeyResultItems,
      ),
    [reportSummaries, userKeyResultItems],
  );

  const krPanelPlans =
    activeTab === 2 ? enrichedReportSummaries : enrichedPlanSummaries;
  const krPanelTransformedData =
    activeTab === 2 ? reportingItems : transformedData;

  const krPanelBlockingLoading = mockEnabled
    ? planningLoading
    : activeTab === 2
      ? (userKeyResultsLoading || userObjectivesLoading) &&
        reportSummaries.length === 0 &&
        planSummaries.length === 0
      : planningLoading ||
        ((userKeyResultsLoading || userObjectivesLoading) &&
          planSummaries.length === 0);

  const planKeyResultsForTargets = useMemo(() => {
    const byId = new Map<string, any>();
    for (const plan of enrichedPlanSummaries) {
      for (const kr of plan.keyResults ?? []) {
        if (!kr?.id) continue;
        const id = String(kr.id);
        const prev = byId.get(id);
        const ms = kr.milestones ?? [];
        if (!prev) {
          byId.set(id, kr);
          continue;
        }
        const prevMs = prev.milestones ?? [];
        if (Array.isArray(ms) && ms.length > (prevMs?.length ?? 0)) {
          byId.set(id, kr);
        }
      }
    }
    for (const kr of userKeyResultItems) {
      if (!kr?.id) continue;
      const id = String(kr.id);
      if (!byId.has(id)) byId.set(id, kr);
    }
    return Array.from(byId.values());
  }, [enrichedPlanSummaries, userKeyResultItems]);

  const {
    targets: livePlanningTargets,
    isLoading: planningTargetsLoading,
    isFetching: planningTargetsFetching,
    objectiveMilestonesByKrId,
    refetchObjectives,
  } = usePlanningTargets(
    userId,
    weeklyPeriodId || selectedTab?.id,
    userKeyResultItems,
    planKeyResultsForTargets,
  );

  const mockPlanningTargets: PlanningTarget[] = useMemo(
    () =>
      MOCK_KEY_RESULTS.filter((kr) => kr.id !== UNLINKED_KR_ID).map((kr) => ({
        id: `mock-target-${kr.id}`,
        keyResultId: kr.id,
        keyResultTitle: kr.title,
        milestoneId: null,
        milestoneTitle: null,
        parentTaskId: null,
        parentTaskTitle: null,
        isDailySlot: false,
        metricTypeName: 'Percentage',
      })),
    [],
  );

  const planningTargets = mockEnabled
    ? mockPlanningTargets
    : livePlanningTargets;

  // Soft refresh KR/objective milestone status when returning to this tab
  // (throttled to avoid refetch storms under concurrent usage).
  useEffect(() => {
    if (mockEnabled || !userId || typeof document === 'undefined') return;
    let lastRefreshAt = 0;
    const MIN_INTERVAL_MS = 60_000;
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastRefreshAt < MIN_INTERVAL_MS) return;
      lastRefreshAt = now;
      void refetchUserKeyResults();
      refetchObjectives();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [mockEnabled, userId, refetchUserKeyResults, refetchObjectives]);

  const handleRefreshMilestoneStatus = useCallback(() => {
    void refetchUserKeyResults();
    refetchObjectives();
  }, [refetchUserKeyResults, refetchObjectives]);

  // Hide + until user-KR + objective milestone sources have settled once.
  // Background refetches (isFetching) after that must not blank the control.
  const planningPickReady = mockEnabled
    ? true
    : !userKeyResultsLoading &&
      !userObjectivesLoading &&
      !planningTargetsLoading &&
      !(userKeyResultsFetching && !userKeyResultsRaw) &&
      !(userObjectivesFetching && !userObjectives) &&
      !(planningTargetsFetching && planningTargets.length === 0);

  const [selectedPlanningTargetId, setSelectedPlanningTargetId] = useState<
    string | null
  >(null);
  /** Composer for tasks with no key result (from KR panel +). */
  const [unlinkedPlanComposer, setUnlinkedPlanComposer] = useState(false);

  const activePlanningTarget = useMemo(
    () =>
      planningTargets.find((t) => t.id === selectedPlanningTargetId) ?? null,
    [planningTargets, selectedPlanningTargetId],
  );

  const showPlanComposer =
    inlinePlanningMode &&
    (!!inlineEditPlanId ||
      !!selectedPlanningTargetId ||
      unlinkedPlanComposer);

  const inlinePlanningPeriodLabel = useMemo(() => {
    if (mockEnabled) return 'Plan';
    const item = processedPlanningPeriods[activePlanPeriod - 1] as
      | PlanningPeriod
      | undefined;
    return item?.planningPeriod?.name?.trim() || 'Plan';
  }, [mockEnabled, processedPlanningPeriods, activePlanPeriod]);

  useEffect(() => {
    if (!inlinePlanningMode) {
      setSelectedPlanningTargetId(null);
      setUnlinkedPlanComposer(false);
    }
  }, [inlinePlanningMode]);

  useEffect(() => {
    if (!planningPickReady && selectedPlanningTargetId) {
      setSelectedPlanningTargetId(null);
    }
  }, [planningPickReady, selectedPlanningTargetId]);

  useEffect(() => {
    if (
      planningPickReady &&
      activePlanningTarget &&
      isPlanningTargetBlocked(activePlanningTarget, userKeyResultItems)
    ) {
      setSelectedPlanningTargetId(null);
    }
  }, [activePlanningTarget, userKeyResultItems, planningPickReady]);

  useEffect(() => {
    if (inlineEditPlanId) setSelectedPlanningTargetId(null);
  }, [inlineEditPlanId]);

  useEffect(() => {
    if (activeTab !== 1 && !(mockEnabled && activeTab === 2)) {
      setInlinePlanningMode(false);
      setMobilePlanComposerOpen(false);
    }
  }, [
    activeTab,
    mockEnabled,
    setInlinePlanningMode,
    setMobilePlanComposerOpen,
  ]);

  const [highlightedKRId, setHighlightedKRId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<{
    id: string;
    kind: CommentThreadKind;
  } | null>(null);

  const handleOpenThread = useCallback(
    (entityId: string, kind: CommentThreadKind) => {
      setActiveThread((prev) =>
        prev?.id === entityId && prev?.kind === kind
          ? null
          : { id: entityId, kind },
      );
    },
    [],
  );

  const handleCloseThread = useCallback(() => {
    setActiveThread(null);
  }, []);

  useEffect(() => {
    setActiveThread(null);
  }, [activeTab]);

  const isDesktop = !isMobile && !isTablet;

  useEffect(() => {
    if (isDesktop) setMobilePlanComposerOpen(false);
  }, [isDesktop, setMobilePlanComposerOpen]);

  useEffect(() => {
    if (!isDesktop && !inlinePlanningMode) {
      setMobilePlanComposerOpen(false);
    }
  }, [isDesktop, inlinePlanningMode, setMobilePlanComposerOpen]);

  const closeMobilePlanComposer = useCallback(() => {
    setMobilePlanComposerOpen(false);
    setInlinePlanningMode(false);
    setSelectedPlanningTargetId(null);
    setUnlinkedPlanComposer(false);
    setInlineEditPlanId(null);
  }, [setMobilePlanComposerOpen, setInlinePlanningMode, setInlineEditPlanId]);

  const handleMobileInlineExit = useCallback(() => {
    setSelectedPlanningTargetId(null);
    setUnlinkedPlanComposer(false);
    setMobilePlanComposerOpen(false);
    setInlineEditPlanId(null);
  }, [setMobilePlanComposerOpen, setInlineEditPlanId]);

  const handleInlineWorkspaceExit = useCallback(() => {
    setSelectedPlanningTargetId(null);
    setUnlinkedPlanComposer(false);
    setInlineEditPlanId(null);
  }, [setInlineEditPlanId]);

  const handleStartAddPlan = useCallback(() => {
    setSelectedPlanningTargetId(null);
    setUnlinkedPlanComposer(false);
    setInlineEditPlanId(null);
  }, [setInlineEditPlanId]);

  const handlePickPlanningTarget = useCallback((t: { id: string }) => {
    setUnlinkedPlanComposer(false);
    setSelectedPlanningTargetId(t.id);
  }, []);

  const handlePickUnlinkedPlan = useCallback(() => {
    setSelectedPlanningTargetId(null);
    setUnlinkedPlanComposer(true);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const mobileComposerWorkspaceRef =
    useRef<InlinePlanningWorkspaceHandle>(null);
  const [panelHeight, setPanelHeight] = useState<string>('80vh');

  /** Viewport space below the dual-panel row. Do not remeasure on outer scroll — growing height while
   *  scrolling fights the scroll container and leaves the breadcrumb partially visible. */
  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const bottomInset = 8;
    const heightBoostPx = 16;
    const available =
      window.innerHeight - rect.top - bottomInset + heightBoostPx;
    setPanelHeight(`${Math.max(available, 400)}px`);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    let scrollRaf = 0;
    const scheduleMeasure = () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        measure();
      });
    };

    scheduleMeasure();
    window.addEventListener('resize', scheduleMeasure);

    const delayed = window.setTimeout(scheduleMeasure, 200);

    return () => {
      window.removeEventListener('resize', scheduleMeasure);
      window.clearTimeout(delayed);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  }, [measure, isDesktop, planSummaries.length, activeTab, inlinePlanningMode]);

  const threadEntities = useMemo(() => {
    return [...planSummaries, ...reportSummaries];
  }, [planSummaries, reportSummaries]);

  return (
    <div
      data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-130"
      className="h-auto min-w-0 w-full max-w-full bg-white  rounded-md"
    >
      <div data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-132">
        <CustomBreadcrumb
          title="Plan & Report"
          subtitle="Manage your plans and reports in one place."
          isRecognition
        />
        <div
          data-cy="planning-reporting-main-card"
          className="flex min-w-0 max-w-full w-full flex-col gap-3 p-0 sm:gap-4 sm:rounded-xl sm:p-4"
        >
          <div
            data-cy="planning-reporting-toolbar-row"
            className={classNames(
              'sticky top-0 z-20 flex w-full min-w-0 max-w-full flex-col items-stretch gap-2 bg-white py-2',
              'sm:flex-row sm:items-center sm:gap-3 lg:gap-x-8',
            )}
          >
            <div
              data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-359"
              className="flex w-full shrink-0 items-center sm:w-auto sm:justify-center"
            >
              <ConfigProvider
                theme={{
                  components: {
                    Segmented: {
                      trackBg: '#f1f5f9',
                      itemSelectedBg: '#ffffff',
                      itemSelectedColor: '#0f172a',
                    },
                  },
                }}
              >
                <Segmented
                  size={isMobile ? 'middle' : 'large'}
                  value={activeTab}
                  onChange={(value) => setActiveTab(Number(value))}
                  options={[
                    { label: 'Active Plans', value: 1 },
                    { label: 'Reports', value: 2 },
                  ]}
                  className={classNames(
                    'planning-reporting-toolbar-segmented !inline-flex !w-max max-w-full !shrink-0 !rounded-xl !border !border-slate-100 !bg-slate-50/70 !p-1.5',
                    '!h-[50px] sm:!h-[50px] sm:!self-center',
                    '[&_.ant-segmented-group]:!w-max [&_.ant-segmented-group]:!min-h-0 [&_.ant-segmented-group]:!items-stretch [&_.ant-segmented-group]:!justify-start',
                    '[&_.ant-segmented-thumb]:!h-full [&_.ant-segmented-thumb]:!bg-white [&_.ant-segmented-thumb]:!py-0 [&_.ant-segmented-thumb]:!shadow-sm',
                    '[&_.ant-segmented-item]:!flex [&_.ant-segmented-item]:!flex-none [&_.ant-segmented-item]:!items-center [&_.ant-segmented-item]:!justify-center [&_.ant-segmented-item]:!self-stretch [&_.ant-segmented-item]:!bg-transparent',
                    '[&_.ant-segmented-item-selected]:!z-[1] [&_.ant-segmented-item-selected]:!rounded-md [&_.ant-segmented-item-selected]:!shadow-sm',
                    '[&_.ant-segmented-item-label]:!flex [&_.ant-segmented-item-label]:!h-9 [&_.ant-segmented-item-label]:!min-h-9 [&_.ant-segmented-item-label]:!items-center [&_.ant-segmented-item-label]:!justify-center [&_.ant-segmented-item-label]:!whitespace-nowrap [&_.ant-segmented-item-label]:!font-medium [&_.ant-segmented-item-label]:!text-slate-600 [&_.ant-segmented-item-label]:!px-3.5 [&_.ant-segmented-item-label]:!py-0 [&_.ant-segmented-item-label]:!text-[14px] sm:[&_.ant-segmented-item-label]:!h-9 sm:[&_.ant-segmented-item-label]:!min-h-9 sm:[&_.ant-segmented-item-label]:!px-4.5 sm:[&_.ant-segmented-item-label]:!py-0 sm:[&_.ant-segmented-item-label]:!text-[14px]',
                    '[&_.ant-segmented-item-selected_.ant-segmented-item-label]:!text-slate-900',
                  )}
                />
              </ConfigProvider>
            </div>
            <div
              data-cy="planning-period-pills"
              className="flex min-w-0 w-full flex-1 flex-wrap items-center justify-end gap-2 overflow-visible sm:min-h-10 sm:flex-nowrap sm:gap-3"
            >
              <div
                data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-435"
                className="shrink-0 self-center"
              >
                <PlanningToolbarFilters />
              </div>
            </div>
          </div>

          {/* ── KR + plans/reports: stacked on mobile/tablet, grid on lg+; same inline create flow everywhere ── */}
          <div
            data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-450"
            ref={containerRef}
            className={classNames(
              'grid min-h-0 w-full min-w-0 max-w-full grid-cols-1 gap-4',
              activeTab === 1 &&
                'lg:grid-cols-[clamp(220px,28%,22rem)_minmax(0,1fr)] xl:grid-cols-[clamp(240px,26%,24rem)_minmax(0,1fr)]',
            )}
            style={{ height: isDesktop ? panelHeight : undefined }}
          >
            {activeTab === 1 ? (
            <div
              className="hidden min-h-0 min-w-0 w-full max-w-full flex-col overflow-hidden rounded-xl border border-[#F1F2F6] bg-[#FAFBFC] lg:flex lg:h-full"
              data-cy="planning-kr-panel"
            >
              {krPanelBlockingLoading ? (
                <KRPanelSkeleton />
              ) : (
                <KRLeftPanel
                  plans={krPanelPlans}
                  transformedData={krPanelTransformedData}
                  userId={userId}
                  highlightedKRId={highlightedKRId}
                  activeThread={activeThread}
                  onCloseThread={handleCloseThread}
                  threadEntities={threadEntities}
                  inlinePlanningMode={inlinePlanningMode}
                  activeTab={activeTab}
                  planningTargets={planningTargets}
                  planningTargetsLoading={planningTargetsLoading}
                  selectedPlanningTargetId={selectedPlanningTargetId}
                  onPickPlanningTarget={handlePickPlanningTarget}
                  unlinkedPlanSelected={unlinkedPlanComposer}
                  onPickUnlinkedPlan={handlePickUnlinkedPlan}
                  userKeyResultItems={userKeyResultItems}
                  objectiveMilestonesByKrId={objectiveMilestonesByKrId}
                  onRefreshMilestoneStatus={handleRefreshMilestoneStatus}
                  parentPlanContext={parentPlanContext}
                  planningPickReady={planningPickReady}
                />
              )}
            </div>
            ) : null}

            <div
              className={classNames(
                'min-h-0 min-w-0 w-full max-w-full overflow-x-hidden scrollbar-hide',
                activeTab === 1
                  ? 'mx-auto max-w-2xl md:max-w-3xl lg:mx-0 lg:max-w-none'
                  : 'mx-auto max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl',
                isDesktop ? 'h-full overflow-y-auto' : 'overflow-y-visible',
              )}
              data-cy="planning-main-panel"
            >
              <div
                data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-495"
                className={classNames(
                  'min-w-0 max-w-full',
                  activeTab === 1 ? 'flex flex-col' : 'hidden',
                  isDesktop && activeTab === 1 && 'min-h-full',
                  inlinePlanningMode && !isDeadlinePlanningMockEnabled()
                    ? 'space-y-0'
                    : 'space-y-4',
                )}
              >
                {showPlanComposer &&
                isDesktop &&
                !isDeadlinePlanningMockEnabled() ? (
                  <section
                    data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-section-504"
                    className="mb-8 shrink-0 border-b border-[#F1F2F6] pb-8 sm:mb-10 sm:pb-10"
                    aria-label="New plan draft"
                  >
                    <InlinePlanningWorkspace
                      planningPeriodLabel={inlinePlanningPeriodLabel}
                      activeTarget={activePlanningTarget}
                      planningTargets={planningTargets}
                      userKeyResultItems={userKeyResultItems}
                      onClearTarget={() => {
                        setSelectedPlanningTargetId(null);
                        setUnlinkedPlanComposer(true);
                      }}
                      onSelectTarget={(t) => {
                        if (t) {
                          setUnlinkedPlanComposer(false);
                          setSelectedPlanningTargetId(t.id);
                        } else {
                          setSelectedPlanningTargetId(null);
                          setUnlinkedPlanComposer(true);
                        }
                      }}
                      onExit={handleInlineWorkspaceExit}
                      editPlanId={inlineEditPlanId}
                    />
                  </section>
                ) : null}
                <Planning
                  onHoverKR={setHighlightedKRId}
                  onOpenThread={handleOpenThread}
                  planSummaries={planSummaries}
                  transformedData={transformedData}
                  isLoading={planningLoading}
                  totalItems={planSummaries.length}
                  onStartAddPlan={handleStartAddPlan}
                  addPlanComposer={
                    isDeadlinePlanningMockEnabled() &&
                    showPlanComposer &&
                    isDesktop ? (
                      <InlinePlanningWorkspace
                        planningPeriodLabel={inlinePlanningPeriodLabel}
                        activeTarget={activePlanningTarget}
                        planningTargets={planningTargets}
                        userKeyResultItems={userKeyResultItems}
                        onClearTarget={() => {
                          setSelectedPlanningTargetId(null);
                          setUnlinkedPlanComposer(true);
                        }}
                        onSelectTarget={(t) => {
                          if (t) {
                            setUnlinkedPlanComposer(false);
                            setSelectedPlanningTargetId(t.id);
                          } else {
                            setSelectedPlanningTargetId(null);
                            setUnlinkedPlanComposer(true);
                          }
                        }}
                        onExit={handleInlineWorkspaceExit}
                        editPlanId={inlineEditPlanId}
                        embedded
                      />
                    ) : null
                  }
                />
              </div>
              <div
                data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-522"
                className="min-w-0 max-w-full"
                style={{ display: activeTab === 2 ? 'block' : 'none' }}
              >
                <Reporting
                  onHoverKR={setHighlightedKRId}
                  onOpenThread={handleOpenThread}
                  onStartAddPlan={handleStartAddPlan}
                  addPlanComposer={
                    isDeadlinePlanningMockEnabled() &&
                    showPlanComposer &&
                    isDesktop ? (
                      <InlinePlanningWorkspace
                        planningPeriodLabel={inlinePlanningPeriodLabel}
                        activeTarget={activePlanningTarget}
                        planningTargets={planningTargets}
                        userKeyResultItems={userKeyResultItems}
                        onClearTarget={() => {
                          setSelectedPlanningTargetId(null);
                          setUnlinkedPlanComposer(true);
                        }}
                        onSelectTarget={(t) => {
                          if (t) {
                            setUnlinkedPlanComposer(false);
                            setSelectedPlanningTargetId(t.id);
                          } else {
                            setSelectedPlanningTargetId(null);
                            setUnlinkedPlanComposer(true);
                          }
                        }}
                        onExit={handleInlineWorkspaceExit}
                        editPlanId={inlineEditPlanId}
                        embedded
                      />
                    ) : null
                  }
                />
              </div>
            </div>
          </div>

          {!isDeadlinePlanningMockEnabled() ? <CreatePlan /> : null}
          {!isDeadlinePlanningMockEnabled() ? <CreateReport /> : null}

          {planningPeriodForUserId?.length === 0 && (
            <div
              data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-167"
              className="flex w-full justify-center font-semibold"
            >
              There is no Assigned Plan, please assign a Plan for a User first
            </div>
          )}
        </div>
      </div>

      <Drawer
        data-cy="planning-mobile-composer-drawer"
        title={
          <span
            data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-span-545"
            className="truncate text-sm font-semibold leading-tight text-[#161A2C] sm:text-base"
          >
            New {isDeadlinePlanningMockEnabled() ? 'tasks' : inlinePlanningPeriodLabel}
          </span>
        }
        extra={
          <button
            type="button"
            onClick={() => mobileComposerWorkspaceRef.current?.requestExit()}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-white hover:text-[#574CFF] hover:shadow-sm sm:h-10 sm:w-10"
            aria-label="Exit plan creation"
            data-cy="planning-mobile-composer-close"
          >
            <CloseOutlined className="text-[16px] sm:text-[17px]" />
          </button>
        }
        placement="bottom"
        height="100%"
        zIndex={1100}
        open={
          mobilePlanComposerOpen &&
          !isDesktop &&
          (activeTab === 1 || (mockEnabled && activeTab === 2))
        }
        onClose={closeMobilePlanComposer}
        destroyOnClose
        closable={false}
        maskClosable={false}
        keyboard={false}
        styles={{
          header: {
            paddingTop: 12,
            paddingBottom: 12,
            paddingLeft: 16,
            paddingRight: 16,
            minHeight: 52,
            alignItems: 'center',
          },
          body: {
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          },
        }}
        rootClassName="planning-mobile-composer-drawer [&_.ant-drawer-content-wrapper]:!max-h-[100dvh]"
      >
        <div
          data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-589"
          className="flex h-full min-h-0 flex-col bg-[#FAFBFC]"
        >
          <div
            data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-590"
            className="min-h-0 max-h-[42vh] shrink-0 overflow-hidden border-b border-[#F1F2F6]"
          >
            {krPanelBlockingLoading ? (
              <KRPanelSkeleton />
            ) : (
              <KRLeftPanel
                plans={krPanelPlans}
                transformedData={krPanelTransformedData}
                userId={userId}
                highlightedKRId={highlightedKRId}
                activeThread={activeThread}
                onCloseThread={handleCloseThread}
                threadEntities={threadEntities}
                inlinePlanningMode
                activeTab={activeTab}
                planningTargets={planningTargets}
                planningTargetsLoading={planningTargetsLoading}
                selectedPlanningTargetId={selectedPlanningTargetId}
                onPickPlanningTarget={handlePickPlanningTarget}
                unlinkedPlanSelected={unlinkedPlanComposer}
                onPickUnlinkedPlan={handlePickUnlinkedPlan}
                userKeyResultItems={userKeyResultItems}
                objectiveMilestonesByKrId={objectiveMilestonesByKrId}
                onRefreshMilestoneStatus={handleRefreshMilestoneStatus}
                parentPlanContext={parentPlanContext}
                planningPickReady={planningPickReady}
              />
            )}
          </div>
          <div
            data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-613"
            className="min-h-0 flex-1 overflow-y-auto bg-white p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-3"
          >
            {showPlanComposer ? (
              <InlinePlanningWorkspace
                ref={mobileComposerWorkspaceRef}
                hideHeaderCloseButton
                planningPeriodLabel={inlinePlanningPeriodLabel}
                activeTarget={activePlanningTarget}
                planningTargets={planningTargets}
                userKeyResultItems={userKeyResultItems}
                onClearTarget={() => {
                  setSelectedPlanningTargetId(null);
                  setUnlinkedPlanComposer(true);
                }}
                onSelectTarget={(t) => {
                  if (t) {
                    setUnlinkedPlanComposer(false);
                    setSelectedPlanningTargetId(t.id);
                  } else {
                    setSelectedPlanningTargetId(null);
                    setUnlinkedPlanComposer(true);
                  }
                }}
                onExit={handleMobileInlineExit}
                editPlanId={inlineEditPlanId}
                embedded
              />
            ) : (
              <p
                data-cy="mobile-plan-pick-hint"
                className="px-3 py-8 text-center text-[13px] text-[#8F94A3]"
              >
                Select a key result above, or tap + to plan without a key
                result.
              </p>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default Page;
