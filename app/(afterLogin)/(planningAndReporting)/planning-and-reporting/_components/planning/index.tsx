import React, { useCallback, useEffect, useMemo } from 'react';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetPlanning,
  useGetPlannedTaskForReport,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useApprovalPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { groupPlanTasksByKeyResultAndMilestone } from '../dataTransformer/plan';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { BsClipboard2Check } from 'react-icons/bs';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import PlanCard from '../cards/PlanCard';
import PlanCardSkeleton from '../cards/PlanCardSkeleton';
import PlanningPanelView from './PlanningPanelView';
import { transformToPlanSummary } from '../dataTransformer/vamp';
import { ViewMode, Cadence, PlanSummary } from '../types';
import { formatPlanningReportDate } from '../utils';

export interface PlanningExposedData {
  planSummaries: PlanSummary[];
  transformedData: any[];
  isLoading: boolean;
}

function Planning({
  onHoverKR,
  onOpenThread,
}: {
  onHoverKR?: (krId: string | null) => void;
  onOpenThread?: (entityId: string, threadKind: 'plan' | 'report') => void;
}) {
  const {
    selectedUser,
    activePlanPeriod,
    setSelectedPlanId,
    setInlinePlanningMode,
    setMobilePlanComposerOpen,
    setInlineEditPlanId,
    page,
    setPage,
    pageSize,
    setPageSize,
    activeTab,
    activePlanPeriodId,
    inlineReportPlanId,
    setInlineReportPlanId,
    resetStatuses,
    resetWeights,
    planningFilterPlanType,
    planningFilterDepartment,
    setPlanningFilterDepartment,
    setSelectedUser,
  } = PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { isMobile, isTablet } = useIsMobile();
  const { userId } = useAuthenticationStore();
  const { mutate: approvalPlanningPeriod, isLoading: isApprovalLoading } =
    useApprovalPlanningPeriods();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods, isLoading: userPlanningPeriodsLoading } =
    AllPlanningPeriods();
  const effectiveSelectedUsers = useMemo(() => {
    const isDefaultMyPlanScope =
      selectedUser.length === 1 && selectedUser[0] === userId;
    const shouldUseTeamDefault =
      isDefaultMyPlanScope &&
      planningFilterPlanType === 'all' &&
      !planningFilterDepartment;

    if (!shouldUseTeamDefault) return selectedUser;

    const employees = employeeData?.items ?? [];
    const directReports = employees
      .filter(
        (employee: any) =>
          (employee?.delegatedTo?.id || employee?.reportingTo?.id) === userId,
      )
      .map((employee: any) => employee.id);

    if (directReports.length > 0) {
      return Array.from(new Set([userId, ...directReports]));
    }

    const currentUser = employees.find(
      (employee: any) => employee?.id === userId,
    );
    const myDepartmentId =
      currentUser?.employeeJobInformation?.[0]?.department?.id ||
      currentUser?.employeeJobInformation?.[0]?.departmentId ||
      currentUser?.department?.id ||
      currentUser?.departmentId;
    const myManagerId =
      currentUser?.delegatedTo?.id || currentUser?.reportingTo?.id || null;

    const teammates = employees
      .filter((employee: any) => {
        if (employee?.id === userId) return false;
        const employeeDepartmentId =
          employee?.employeeJobInformation?.[0]?.department?.id ||
          employee?.employeeJobInformation?.[0]?.departmentId ||
          employee?.department?.id ||
          employee?.departmentId;
        const employeeManagerId =
          employee?.delegatedTo?.id || employee?.reportingTo?.id || null;
        const sameDepartment =
          !!myDepartmentId &&
          !!employeeDepartmentId &&
          employeeDepartmentId === myDepartmentId;
        const sameManager =
          !!myManagerId &&
          !!employeeManagerId &&
          employeeManagerId === myManagerId;
        return sameDepartment || sameManager;
      })
      .map((employee: any) => employee.id);

    return Array.from(new Set([userId, ...teammates]));
  }, [
    selectedUser,
    userId,
    employeeData?.items,
    planningFilterPlanType,
    planningFilterDepartment,
  ]);

  const getPlanningPeriodDetail = (id: string) => {
    const planningPeriodDetail = planningPeriods?.items?.find(
      (period: any) => period?.id === id,
    );
    return planningPeriodDetail || {};
  };

  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;
  const { data: allPlanning, isLoading: getPlanningLoading } = useGetPlanning({
    userId: effectiveSelectedUsers,
    planPeriodId: planningPeriodId ?? '',
    page,
    pageSize,
    /** Active plans: not scoped by fiscal year / session (reports tab uses those filters). */
    sessionId: [],
  });

  const isPlanningListLoading =
    userPlanningPeriodsLoading ||
    (Boolean(planningPeriodId) && getPlanningLoading);

  useEffect(() => {
    setPage(1);
    setPageSize(10);
  }, [activeTab, setPage, setPageSize]);

  useEffect(() => {
    if (activeTab !== 1) {
      resetStatuses();
      resetWeights();
      setInlineReportPlanId(null);
    }
  }, [activeTab, resetStatuses, resetWeights, setInlineReportPlanId]);

  useEffect(() => {
    if (planningFilterDepartment || planningFilterPlanType !== 'all') return;
    const employees = employeeData?.items ?? [];
    if (employees.length === 0) return;

    const currentUser = employees.find(
      (employee: any) => employee?.id === userId,
    );
    const myDepartmentId =
      currentUser?.employeeJobInformation?.[0]?.department?.id ||
      currentUser?.employeeJobInformation?.[0]?.departmentId ||
      currentUser?.department?.id ||
      currentUser?.departmentId;
    if (!myDepartmentId) return;

    const departmentUserIds = employees
      .filter((employee: any) => {
        const employeeDepartmentId =
          employee?.employeeJobInformation?.[0]?.department?.id ||
          employee?.employeeJobInformation?.[0]?.departmentId ||
          employee?.department?.id ||
          employee?.departmentId;
        return employeeDepartmentId === myDepartmentId;
      })
      .map((employee: any) => employee.id);

    setPlanningFilterDepartment(myDepartmentId);
    if (departmentUserIds.length > 0) {
      setSelectedUser(departmentUserIds);
    }
  }, [
    planningFilterDepartment,
    planningFilterPlanType,
    employeeData?.items,
    userId,
    setPlanningFilterDepartment,
    setSelectedUser,
  ]);

  const activePlanningItems = useMemo(() => {
    const items = allPlanning?.items ?? [];
    const activeOnly = items.filter((item: any) => item?.isReported !== true);
    return [...activeOnly].sort((a: any, b: any) => {
      const aMine = a?.userId === userId ? 0 : 1;
      const bMine = b?.userId === userId ? 0 : 1;
      if (aMine !== bMine) return aMine - bMine;
      const ta = new Date(a?.createdAt || 0).getTime();
      const tb = new Date(b?.createdAt || 0).getTime();
      return tb - ta;
    });
  }, [allPlanning?.items, userId]);

  const transformedData =
    groupPlanTasksByKeyResultAndMilestone(activePlanningItems);

  const activeTabName = getPlanningPeriodDetail(planningPeriodId ?? '')?.name;

  const { data: plannedTasksForReport, isLoading: plannedForReportLoading } =
    useGetPlannedTaskForReport(planningPeriodId);
  const ownerCanOpenSubmitReport =
    !plannedForReportLoading &&
    Array.isArray(plannedTasksForReport) &&
    plannedTasksForReport.length > 0;
  const closeInlineReport = useCallback(() => {
    resetStatuses();
    resetWeights();
    setInlineReportPlanId(null);
  }, [resetStatuses, resetWeights, setInlineReportPlanId]);

  const planSummaries = useMemo(() => {
    return (
      transformedData?.map((dataItem: any) => {
        const cadence = (activeTabName?.toLowerCase() as Cadence) || 'weekly';
        return transformToPlanSummary(
          dataItem,
          'planning' as ViewMode,
          cadence,
          employeeData,
        );
      }) || []
    );
  }, [transformedData, employeeData, activeTabName]);

  const handleApproveHandler = (id: string, value: boolean) => {
    approvalPlanningPeriod({ id, value });
  };

  const getEmployeeData = (id: string) => {
    return employeeData?.items?.find((emp: any) => emp?.id === id) || {};
  };

  /** Active plans ignore fiscal year / session; editability is plan state only. */
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

  const isDesktop = !isMobile && !isTablet;
  const isDesktopPanelView =
    isDesktop && !isPlanningListLoading && planSummaries.length > 0;

  const totalPlanningItems = activePlanningItems.length;
  const showPlanningPagination = totalPlanningItems > pageSize;

  const paginationElement = showPlanningPagination ? (
    <CustomPagination
      current={page}
      total={totalPlanningItems}
      pageSize={pageSize}
      onChange={(pg, ps) => {
        setPage(pg);
        setPageSize(ps);
      }}
      onShowSizeChange={(size) => {
        setPageSize(size);
        setPage(1);
      }}
      data-cy="planning-list-pagination"
    />
  ) : null;

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
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <PlanCardSkeleton key={i} />
            ))}
          </div>
        ) : planSummaries.length > 0 ? (
          isMobile || isTablet ? (
            <div className="space-y-6">
              {planSummaries.map((plan: any) => {
                const originalDataItem = transformedData?.find(
                  (item: any) => item.id === plan.id,
                );
                if (!originalDataItem) return null;
                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    viewMode="planning"
                    activeCadence={currentCadence}
                    onApprove={() =>
                      handleApproveHandler(originalDataItem.id, true)
                    }
                    onOpen={() =>
                      handleApproveHandler(originalDataItem.id, false)
                    }
                    onEdit={() => handleEdit(originalDataItem.id)}
                    canApprove={
                      userId ===
                      (getEmployeeData(originalDataItem?.userId)?.delegatedTo
                        ?.id ||
                        getEmployeeData(originalDataItem?.userId)?.reportingTo
                          ?.id)
                    }
                    canEdit={
                      userId === originalDataItem?.userId &&
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
                    inlineReportActive={inlineReportPlanId === plan.id}
                    onCloseInlineReport={closeInlineReport}
                    planningPeriodLabel={activeTabName}
                  />
                );
              })}
            </div>
          ) : (
            <PlanningPanelView
              plans={planSummaries}
              transformedData={transformedData}
              cadence={currentCadence}
              userId={userId}
              getEmployeeData={getEmployeeData}
              isDataFromActiveSession={isDataFromActiveSession}
              onApprove={handleApproveHandler}
              onEdit={handleEdit}
              isApprovalLoading={isApprovalLoading}
              getDateLabel={getDateLabel}
              paginationNode={paginationElement}
              planningPeriodId={planningPeriodId}
              onHoverKR={onHoverKR}
              onOpenThread={onOpenThread}
              onStartInlineReport={(planId) => {
                resetStatuses();
                resetWeights();
                setInlineReportPlanId(planId);
              }}
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
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F2F6]">
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
                No plans yet
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#8F94A3]">
                {activeTabName
                  ? `There are no planned tasks for ${activeTabName} with the current filters.`
                  : 'There are no planned tasks for this period with the current filters.'}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#C4C7CE]">
                {isDesktop
                  ? 'Add tasks from a key result using the + in the left panel.'
                  : 'Add tasks from a key result using + next to a key result.'}
              </p>
            </div>
          </div>
        )}
      </section>

      {!isDesktopPanelView &&
        (isMobile || isTablet
          ? showPlanningPagination && (
              <CustomMobilePagination
                totalResults={totalPlanningItems}
                pageSize={pageSize}
                onChange={(pg, ps) => {
                  setPage(pg);
                  setPageSize(ps);
                }}
                onShowSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            )
          : paginationElement)}
    </div>
  );
}
export default Planning;
