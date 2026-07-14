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
  normalizeUserKeyResultItems,
  buildKrMetricLookupMap,
  collectPlanKeyResultIds,
} from './_components/planning/mergeKRPanelGroups';
import { usePanelKeyResultItems } from './_components/planning/usePanelKeyResultItems';
import { useGetUserKeyResult } from '@/store/server/features/okrplanning/okr/keyresult/queries';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import {
  hasKrMetricMetadata,
  hydrateKeyResultsFromMetricCatalog,
} from '@/utils/okrKeyResultProgressDisplay';
import { usePlanningData } from './_components/planning/usePlanningData';
import { usePlanningTargets } from './_components/planning/usePlanningTargets';
import { isPlanningTargetBlocked } from './_components/planning/buildPlanningTargets';
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
import { PlanningReportingHeaderActions } from './_components/PlanningReportingHeaderActions';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  const {
    setActiveTab,
    activeTab,
    activePlanPeriod,
    setActivePlanPeriod,
    setActivePlanPeriodId,
    inlinePlanningMode,
    setInlinePlanningMode,
    mobilePlanComposerOpen,
    setMobilePlanComposerOpen,
    inlineEditPlanId,
    setInlineEditPlanId,
  } = PlanningAndReportingStore();

  const { fiscalYearId: keyResultFiscalYearId, sessionId: keyResultSessionId } =
    useOkrPlanningScope();

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
  } = usePlanningData();

  const {
    data: userKeyResultsRaw,
    isLoading: userKeyResultsLoading,
    isFetching: userKeyResultsFetching,
  } = useGetUserKeyResult(userId, keyResultFiscalYearId, keyResultSessionId, {
    refetchOnMount: 'always',
    staleTime: 0,
    keepPreviousData: false,
  });

  const { data: planningPeriodHierarchy } = useGetPlanningPeriodsHierarchy(
    userId,
    selectedTab?.id ?? '',
  );

  const userKeyResultItems = useMemo(
    () => normalizeUserKeyResultItems(userKeyResultsRaw),
    [userKeyResultsRaw],
  );

  const { reportSummaries, reportingItems } = useReportingData();

  const panelSourcePlans = useMemo(
    () => [...planSummaries, ...reportSummaries],
    [planSummaries, reportSummaries],
  );

  const { items: panelKeyResultItemsRaw, isLoading: panelKeyResultsLoading } =
    usePanelKeyResultItems(panelSourcePlans, keyResultFiscalYearId, userId);

  const { data: metricsData } = useGetMetrics();

  const metricsById = useMemo(() => {
    const map = new Map<string, string>();
    for (const metric of metricsData?.items ?? []) {
      if (metric?.id != null && metric?.name) {
        map.set(String(metric.id), String(metric.name));
      }
    }
    return map;
  }, [metricsData]);

  const panelKeyResultItems = useMemo(
    () =>
      hydrateKeyResultsFromMetricCatalog(panelKeyResultItemsRaw, metricsById),
    [panelKeyResultItemsRaw, metricsById],
  );

  // Display enrichment prefers no-session panel KRs. Session-scoped list is
  // only merged when it adds real metric metadata (avoids wiping own KRs).
  const combinedApiItems = useMemo(() => {
    const sessionHydrated = hydrateKeyResultsFromMetricCatalog(
      userKeyResultItems,
      metricsById,
    );
    return [
      ...buildKrMetricLookupMap(
        [...panelKeyResultItems, ...sessionHydrated],
        [],
      ).values(),
    ];
  }, [panelKeyResultItems, userKeyResultItems, metricsById]);

  const planningPickReady = !userKeyResultsLoading && !userKeyResultsFetching;

  const parentPlanContext = useMemo(
    () => getActiveUnreportedParentPlanContext(planningPeriodHierarchy),
    [planningPeriodHierarchy],
  );

  const enrichedPlanSummaries = useMemo(
    () =>
      enrichPlanSummariesWithUserKeyResults(planSummaries, combinedApiItems),
    [planSummaries, combinedApiItems],
  );
  const enrichedReportSummaries = useMemo(
    () =>
      enrichPlanSummariesWithUserKeyResults(reportSummaries, combinedApiItems),
    [reportSummaries, combinedApiItems],
  );

  const krPanelPlans =
    activeTab === 2 ? enrichedReportSummaries : enrichedPlanSummaries;
  const krPanelTransformedData =
    activeTab === 2 ? reportingItems : transformedData;

  const panelApiForDisplay = useMemo(
    () => [...buildKrMetricLookupMap(combinedApiItems, krPanelPlans).values()],
    [combinedApiItems, krPanelPlans],
  );

  const planKrIdsNeedingMetrics = useMemo(() => {
    const ids = collectPlanKeyResultIds(
      activeTab === 2 ? reportSummaries : planSummaries,
    );
    if (ids.length === 0) return [];
    const byId = new Map(
      combinedApiItems.map((kr) => [String(kr.id), kr] as const),
    );
    return ids.filter((id) => !hasKrMetricMetadata(byId.get(id)));
  }, [activeTab, reportSummaries, planSummaries, combinedApiItems]);

  const krPanelBlockingLoading =
    activeTab === 2
      ? panelKeyResultsLoading &&
        reportSummaries.length === 0 &&
        planSummaries.length === 0
      : planningLoading ||
        (panelKeyResultsLoading &&
          (planSummaries.length === 0 || planKrIdsNeedingMetrics.length > 0));

  const { targets: planningTargets, isLoading: planningTargetsLoading } =
    usePlanningTargets(userId, selectedTab?.id, userKeyResultItems);

  const [selectedPlanningTargetId, setSelectedPlanningTargetId] = useState<
    string | null
  >(null);

  const activePlanningTarget = useMemo(
    () =>
      planningTargets.find((t) => t.id === selectedPlanningTargetId) ?? null,
    [planningTargets, selectedPlanningTargetId],
  );

  const inlinePlanningPeriodLabel = useMemo(() => {
    const item = processedPlanningPeriods[activePlanPeriod - 1] as
      | PlanningPeriod
      | undefined;
    return item?.planningPeriod?.name?.trim() || 'Plan';
  }, [processedPlanningPeriods, activePlanPeriod]);

  useEffect(() => {
    if (!inlinePlanningMode) setSelectedPlanningTargetId(null);
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
    if (activeTab !== 1) {
      setInlinePlanningMode(false);
      setMobilePlanComposerOpen(false);
    }
  }, [activeTab, setInlinePlanningMode, setMobilePlanComposerOpen]);

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
    setInlineEditPlanId(null);
  }, [setMobilePlanComposerOpen, setInlinePlanningMode, setInlineEditPlanId]);

  const handleMobileInlineExit = useCallback(() => {
    setSelectedPlanningTargetId(null);
    setMobilePlanComposerOpen(false);
    setInlineEditPlanId(null);
  }, [setMobilePlanComposerOpen, setInlineEditPlanId]);

  const handleInlineWorkspaceExit = useCallback(() => {
    setSelectedPlanningTargetId(null);
    setInlineEditPlanId(null);
  }, [setInlineEditPlanId]);

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
          titleExtra={<PlanningReportingHeaderActions />}
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
            {(processedPlanningPeriods.length > 0 || activeTab === 1) && (
              <div
                data-cy="planning-period-pills"
                className="flex min-w-0 w-full flex-1 flex-wrap items-center justify-end gap-2 overflow-visible sm:min-h-10 sm:flex-nowrap sm:gap-3"
              >
                <div
                  data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-406"
                  role="tablist"
                  aria-label="Planning period"
                  className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-1.5 sm:shrink-0 sm:flex-nowrap"
                >
                  {processedPlanningPeriods.map(
                    (item: PlanningPeriod, index: number) => {
                      const n = index + 1;
                      const isActive = activePlanPeriod === n;
                      return (
                        <button
                          key={item.planningPeriod.id}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          data-cy={`planning-period-pill-${n}`}
                          onClick={() => setActivePlanPeriod(n)}
                          className={classNames(
                            'inline-flex h-9 shrink-0 items-center rounded-md border font-medium transition-colors',
                            'text-xs sm:text-sm',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/45 focus-visible:ring-offset-2',
                            isActive
                              ? 'border-slate-200 bg-white px-2.5 text-slate-800 shadow-sm hover:bg-slate-100 sm:px-3'
                              : 'border-transparent bg-transparent px-2 text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-800 sm:px-2.5',
                          )}
                        >
                          {item.planningPeriod.name || 'No name available'}
                        </button>
                      );
                    },
                  )}
                </div>
                <div
                  data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-435"
                  className="shrink-0 self-center"
                >
                  <PlanningToolbarFilters />
                </div>
              </div>
            )}
          </div>

          {/* ── KR + plans/reports: stacked on mobile/tablet, grid on lg+; same inline create flow everywhere ── */}
          <div
            data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-450"
            ref={containerRef}
            className={classNames(
              'grid min-h-0 w-full min-w-0 max-w-full grid-cols-1 gap-4',
              'lg:grid-cols-[clamp(260px,38%,28rem)_minmax(0,1fr)] xl:grid-cols-[clamp(280px,36%,30rem)_minmax(0,1fr)]',
            )}
            style={{ height: isDesktop ? panelHeight : undefined }}
          >
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
                  onPickPlanningTarget={(t) =>
                    setSelectedPlanningTargetId(t.id)
                  }
                  apiKeyResultItems={panelApiForDisplay}
                  orphanKeyResultItems={userKeyResultItems}
                  parentPlanContext={parentPlanContext}
                  planningPickReady={planningPickReady}
                />
              )}
            </div>

            <div
              className={classNames(
                'min-h-0 min-w-0 w-full max-w-full overflow-x-hidden scrollbar-hide',
                'mx-auto max-w-2xl md:max-w-3xl lg:mx-0 lg:max-w-none',
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
                  inlinePlanningMode ? 'space-y-0' : 'space-y-4',
                )}
              >
                {inlinePlanningMode && isDesktop ? (
                  <section
                    data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-section-504"
                    className="mb-8 shrink-0 border-b border-[#F1F2F6] pb-8 sm:mb-10 sm:pb-10"
                    aria-label="New plan draft"
                  >
                    <InlinePlanningWorkspace
                      planningPeriodLabel={inlinePlanningPeriodLabel}
                      activeTarget={activePlanningTarget}
                      userKeyResultItems={userKeyResultItems}
                      onClearTarget={() => setSelectedPlanningTargetId(null)}
                      onExit={handleInlineWorkspaceExit}
                      editPlanId={inlineEditPlanId}
                    />
                  </section>
                ) : null}
                <Planning
                  onHoverKR={setHighlightedKRId}
                  onOpenThread={handleOpenThread}
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
                />
              </div>
            </div>
          </div>

          <CreatePlan />
          <CreateReport />

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
            New {inlinePlanningPeriodLabel}
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
        open={mobilePlanComposerOpen && !isDesktop && activeTab === 1}
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
                onPickPlanningTarget={(t) => setSelectedPlanningTargetId(t.id)}
                apiKeyResultItems={panelApiForDisplay}
                orphanKeyResultItems={userKeyResultItems}
                parentPlanContext={parentPlanContext}
                planningPickReady={planningPickReady}
              />
            )}
          </div>
          <div
            data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-613"
            className="min-h-0 flex-1 overflow-y-auto bg-white p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-3"
          >
            <InlinePlanningWorkspace
              ref={mobileComposerWorkspaceRef}
              hideHeaderCloseButton
              planningPeriodLabel={inlinePlanningPeriodLabel}
              activeTarget={activePlanningTarget}
              userKeyResultItems={userKeyResultItems}
              onClearTarget={() => setSelectedPlanningTargetId(null)}
              onExit={handleMobileInlineExit}
              editPlanId={inlineEditPlanId}
            />
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default Page;
