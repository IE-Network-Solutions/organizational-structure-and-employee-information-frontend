import React, { useCallback, useEffect, useMemo } from 'react';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetPlannedTaskForReport,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useApprovalPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useUserPlanRepositoryMock } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import { isDeadlinePlanningMockEnabled } from '@/utils/deadlinePlanningMocks';
import { userIdFromMockPlanId } from '../prototype/mockPlanAdapter';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { BsClipboard2Check } from 'react-icons/bs';
import { useIsMobile } from '@/hooks/useIsMobile';
import PlanCard from '../cards/PlanCard';
import PlanCardSkeleton from '../cards/PlanCardSkeleton';
import PlanningPanelView from './PlanningPanelView';
import { isOwnPlanSummary } from './planOwnership';
import { resolvePlanCardDisplayMode } from './planCardDisplay';
import { buildPlanningEmptyStateCopy } from './planningEmptyState';
import { useAssigneeChipRoster } from './useAssigneeChipRoster';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { Cadence, PlanSummary } from '../types';
import { formatPlanningReportDate } from '../utils';
import InfiniteLoadSentinel from './InfiniteLoadSentinel';
import { useInfiniteLoadMore } from './useInfiniteLoadMore';

export interface PlanningExposedData {
  planSummaries: PlanSummary[];
  transformedData: any[];
  isLoading: boolean;
}

function Planning({
  onHoverKR,
  onOpenThread,
  planSummaries: planSummariesFromParent,
  transformedData: transformedDataFromParent,
  isLoading: planningLoadingFromParent,
  addPlanComposer,
  myTasksOnly = false,
  scrollRootRef,
}: {
  onHoverKR?: (krId: string | null) => void;
  onOpenThread?: (entityId: string, threadKind: 'plan' | 'report') => void;
  /** Canonical list from page `usePlanningData` — avoids a second plan fetch. */
  planSummaries?: PlanSummary[];
  transformedData?: any[];
  isLoading?: boolean;
  totalItems?: number;
  /** Inline composer nested in My Plan (append to existing plan). */
  addPlanComposer?: React.ReactNode;
  /** My Tasks tab — only the current user's plan card(s). */
  myTasksOnly?: boolean;
  /** Scroll container for grouped-view infinite loading. */
  scrollRootRef?: React.RefObject<HTMLElement | null>;
}) {
  const {
    activePlanPeriod,
    setSelectedPlanId,
    setInlinePlanningMode,
    setMobilePlanComposerOpen,
    setInlineEditPlanId,
    setPage,
    pageSize,
    setPageSize,
    activeTab,
    activePlanPeriodId,
    inlineReportPlanId,
    setInlineReportPlanId,
    resetStatuses,
    resetWeights,
    planningFilterDepartment,
    planningTaskStatusFilter,
  } = PlanningAndReportingStore();
  const { selectedIds, hasTeam } = useAssigneeChipRoster();
  const cardDisplayMode = resolvePlanCardDisplayMode(selectedIds.length);
  const { data: employeeData } = useGetAllUsers();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { isMobile, isTablet } = useIsMobile();
  const { userId } = useAuthenticationStore();
  const { mutate: approvalPlanningPeriod, isLoading: isApprovalLoading } =
    useApprovalPlanningPeriods();
  const approvePending = useUserPlanRepositoryMock((s) => s.approvePending);
  const openPlanDirect = useUserPlanRepositoryMock((s) => s.openPlanDirect);
  const mockEnabled = isDeadlinePlanningMockEnabled();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods, isLoading: userPlanningPeriodsLoading } =
    AllPlanningPeriods();

  const getPlanningPeriodDetail = (id: string) => {
    const planningPeriodDetail = planningPeriods?.items?.find(
      (period: any) => period?.id === id,
    );
    return planningPeriodDetail || {};
  };

  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;

  const planSummaries = planSummariesFromParent ?? [];
  const transformedData = transformedDataFromParent ?? [];
  const getPlanningLoading = planningLoadingFromParent ?? false;

  const isPlanningListLoading =
    userPlanningPeriodsLoading ||
    (Boolean(planningPeriodId) && getPlanningLoading && activeTab === 1);

  useEffect(() => {
    setPage(1);
    setPageSize(10);
  }, [activeTab, activePlanPeriod, setPage, setPageSize]);

  useEffect(() => {
    if (activeTab !== 1) {
      resetStatuses();
      resetWeights();
      setInlineReportPlanId(null);
    }
  }, [activeTab, resetStatuses, resetWeights, setInlineReportPlanId]);

  const activeTabName = getPlanningPeriodDetail(planningPeriodId ?? '')?.name;

  const { data: plannedTasksForReport, isLoading: plannedForReportLoading } =
    useGetPlannedTaskForReport(planningPeriodId, {
      enabled: activeTab === 1 && !!planningPeriodId && !mockEnabled,
    });
  const ownerCanOpenSubmitReport = mockEnabled
    ? false // Mock: tick checkbox = done & reported (no Report button)
    : !plannedForReportLoading &&
      Array.isArray(plannedTasksForReport) &&
      plannedTasksForReport.length > 0;
  const closeInlineReport = useCallback(() => {
    resetStatuses();
    resetWeights();
    setInlineReportPlanId(null);
  }, [resetStatuses, resetWeights, setInlineReportPlanId]);

  const handleApproveHandler = (id: string, value: boolean) => {
    if (mockEnabled) {
      const ownerId = userIdFromMockPlanId(id) ?? id;
      if (value) approvePending(ownerId);
      else openPlanDirect(ownerId);
      return;
    }
    approvalPlanningPeriod({ id, value });
  };

  const getEmployeeData = (id: string) => {
    return employeeData?.items?.find((emp: any) => emp?.id === id) || {};
  };

  /** Active plans remain editable based on plan state; filtering now happens at fetch level. */
  const isDataFromActiveSession = (createdAt: string) => {
    void createdAt;
    return true;
  };

  const getDateLabel = (createdAt: string): string => {
    return formatPlanningReportDate(createdAt);
  };

  const currentCadence = (activeTabName?.toLowerCase() as Cadence) || 'weekly';

  const handleEdit = (id: string) => {
    setSelectedPlanId(id);
    setInlineEditPlanId(id);
    setInlinePlanningMode(true);
    if (isMobile || isTablet) {
      setMobilePlanComposerOpen(true);
    }
  };

  const currentUserId = String(userId ?? '');

  const { myPlans, otherPlans } = useMemo(() => {
    const mine: typeof planSummaries = [];
    const others: typeof planSummaries = [];
    for (const plan of planSummaries) {
      if (isOwnPlanSummary(plan, currentUserId)) mine.push(plan);
      else others.push(plan);
    }
    return { myPlans: mine, otherPlans: others };
  }, [planSummaries, currentUserId]);

  const departmentName = useMemo(() => {
    if (!planningFilterDepartment) return undefined;
    return departmentData?.find((d: any) => d.id === planningFilterDepartment)
      ?.name;
  }, [planningFilterDepartment, departmentData]);

  const emptyStateCopy = buildPlanningEmptyStateCopy({
    selectedAssigneeCount: selectedIds.length,
    onlySelfSelected:
      selectedIds.length === 1 && selectedIds[0] === currentUserId,
    periodLabel: activeTabName,
    departmentName,
    hasTeam,
  });

  const {
    visibleItems: visibleOtherPlans,
    hasMore: hasMorePlans,
    loadMore: loadMorePlans,
  } = useInfiniteLoadMore(otherPlans, pageSize, [
    activeTab,
    activePlanPeriod,
    planningFilterDepartment,
    planningTaskStatusFilter,
    selectedIds.join(','),
    myTasksOnly,
  ]);

  const visiblePlanSummaries = useMemo(() => {
    if (myTasksOnly) return myPlans;
    return [...myPlans, ...visibleOtherPlans];
  }, [myPlans, visibleOtherPlans, myTasksOnly]);

  const isDesktop = !isMobile && !isTablet;

  useEffect(() => {
    if (myTasksOnly || !hasMorePlans) return;
    if (isDesktop) {
      const root = scrollRootRef?.current;
      if (!root) return;
      if (root.scrollHeight <= root.clientHeight + 1) {
        loadMorePlans();
      }
      return;
    }
    if (document.documentElement.scrollHeight <= window.innerHeight + 1) {
      loadMorePlans();
    }
  }, [
    hasMorePlans,
    isDesktop,
    loadMorePlans,
    myTasksOnly,
    scrollRootRef,
    visiblePlanSummaries.length,
  ]);

  return (
    <div
      data-cy="planning-and-reporting-components-planning-index-tsx-index-div-388"
      className="flex w-full min-h-0 min-w-0 max-w-full flex-col lg:min-h-0 lg:flex-1"
    >
      <section
        data-cy="planning-and-reporting-components-planning-index-tsx-index-section-484"
        className="mt-0 flex min-h-0 flex-1 flex-col"
      >
        {isPlanningListLoading ? (
          <div
            data-cy="planning-and-reporting-components-planning-index-tsx-index-div-312"
            className="space-y-4"
          >
            {[0, 1, 2].map((i) => (
              <PlanCardSkeleton key={i} />
            ))}
          </div>
        ) : planSummaries.length > 0 ? (
          isMobile || isTablet ? (
            (() => {
              const renderMobileCard = (plan: PlanSummary) => {
                const originalDataItem = transformedData?.find(
                  (item: any) => item.id === plan.id,
                );
                if (!originalDataItem) return null;
                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    viewMode="planning"
                    displayMode={cardDisplayMode}
                    activeCadence={currentCadence}
                    onApprove={() =>
                      handleApproveHandler(originalDataItem.id, true)
                    }
                    onOpen={() =>
                      handleApproveHandler(originalDataItem.id, false)
                    }
                    onEdit={() => handleEdit(originalDataItem.id)}
                    canApprove={
                      mockEnabled
                        ? String(userId ?? '') !==
                          String(originalDataItem?.userId ?? '')
                        : String(userId ?? '') ===
                          String(
                            getEmployeeData(originalDataItem?.userId)
                              ?.delegatedTo?.id ||
                              getEmployeeData(originalDataItem?.userId)
                                ?.reportingTo?.id ||
                              '',
                          )
                    }
                    canEdit={
                      mockEnabled
                        ? false
                        : String(userId ?? '') ===
                            String(originalDataItem?.userId ?? '') &&
                          originalDataItem?.isValidated == false &&
                          originalDataItem?.isReported == false &&
                          isDataFromActiveSession(originalDataItem?.createdAt)
                    }
                    isApprovalLoading={isApprovalLoading}
                    dateLabel={getDateLabel(originalDataItem?.createdAt ?? '')}
                    planningPeriodId={planningPeriodId}
                    onSubmitReport={
                      originalDataItem?.userId === userId &&
                      originalDataItem?.isReported == false
                        ? () => {
                            resetStatuses();
                            resetWeights();
                            setInlineReportPlanId(originalDataItem.id);
                          }
                        : undefined
                    }
                    showSubmitReport={
                      originalDataItem?.userId === userId &&
                      originalDataItem?.isReported == false &&
                      ownerCanOpenSubmitReport
                    }
                    addPlanComposer={
                      originalDataItem?.userId === userId
                        ? addPlanComposer
                        : undefined
                    }
                    inlineReportActive={inlineReportPlanId === plan.id}
                    onCloseInlineReport={closeInlineReport}
                    planningPeriodLabel={activeTabName}
                  />
                );
              };

              return (
                <div
                  data-cy="planning-and-reporting-components-planning-index-tsx-index-div-319"
                  className="space-y-6"
                >
                  {visiblePlanSummaries.map((plan) => (
                    <div key={plan.id} data-cy={`plan-card-wrap-${plan.id}`}>
                      {renderMobileCard(plan)}
                    </div>
                  ))}
                  {!myTasksOnly ? (
                    <InfiniteLoadSentinel
                      hasMore={hasMorePlans}
                      onLoadMore={loadMorePlans}
                      data-cy="planning-grouped-infinite-sentinel-mobile"
                    />
                  ) : null}
                </div>
              );
            })()
          ) : (
            <PlanningPanelView
              plans={visiblePlanSummaries}
              hasMorePlans={!myTasksOnly && hasMorePlans}
              onLoadMorePlans={loadMorePlans}
              scrollRootRef={scrollRootRef}
              cardDisplayMode={cardDisplayMode}
              transformedData={transformedData}
              cadence={currentCadence}
              userId={userId}
              getEmployeeData={getEmployeeData}
              isDataFromActiveSession={isDataFromActiveSession}
              onApprove={handleApproveHandler}
              onEdit={handleEdit}
              isApprovalLoading={isApprovalLoading}
              getDateLabel={getDateLabel}
              planningPeriodId={planningPeriodId}
              onHoverKR={onHoverKR}
              onOpenThread={onOpenThread}
              onStartInlineReport={(planId) => {
                resetStatuses();
                resetWeights();
                setInlineReportPlanId(planId);
              }}
              addPlanComposer={addPlanComposer}
              ownerCanOpenSubmitReport={ownerCanOpenSubmitReport}
              inlineReportPlanId={inlineReportPlanId}
              onCloseInlineReport={closeInlineReport}
              planningPeriodLabel={activeTabName}
            />
          )
        ) : (
          <div
            data-cy="planning-and-reporting-components-planning-index-tsx-index-div-584"
            className="flex min-h-[min(42vh,26rem)] flex-1 flex-col items-center justify-center px-4 py-8 text-center lg:min-h-0"
            role="status"
            aria-live="polite"
          >
            <div
              data-cy="planning-empty-state"
              className="flex w-full max-w-md flex-col items-center justify-center px-6 py-14"
            >
              <div
                data-cy="planning-and-reporting-components-planning-index-tsx-index-div-414"
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F2F6]"
              >
                <BsClipboard2Check
                  size={26}
                  className="text-[#D1D5DB]"
                  aria-hidden
                />
              </div>
              <p
                data-cy="planning-and-reporting-components-planning-index-tsx-index-p-594"
                className="text-sm font-medium text-[#161A2C]"
              >
                {emptyStateCopy.title}
              </p>
              <p
                data-cy="planning-and-reporting-components-planning-index-tsx-index-p-427"
                className="mt-2 text-xs leading-relaxed text-[#8F94A3]"
              >
                {emptyStateCopy.description}
              </p>
              {emptyStateCopy.hint ? (
                <p
                  data-cy="planning-and-reporting-components-planning-index-tsx-index-p-432"
                  className="mt-2 text-xs leading-relaxed text-[#C4C7CE]"
                >
                  {emptyStateCopy.hint}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
export default Planning;
