import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetReporting,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetFiscalYearById } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { BsFileEarmarkText } from 'react-icons/bs';
import { useApprovalReporting } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import PlanCard from '../cards/PlanCard';
import PlanCardSkeleton from '../cards/PlanCardSkeleton';
import PlanningPanelView from '../planning/PlanningPanelView';
import { transformReportToPlanSummary } from '../dataTransformer/vamp';
import { Cadence } from '../types';
import { formatPlanningReportDate } from '../utils';
import { PlanCardInlineReportForm } from '../createReport/PlanCardInlineReportForm';
import { useRecentReportTaskStatuses } from '@/utils/recentReportTaskStatuses';

function Reporting({
  onHoverKR,
  onOpenThread,
}: {
  onHoverKR?: (krId: string | null) => void;
  onOpenThread?: (entityId: string, threadKind: 'plan' | 'report') => void;
}) {
  const {
    selectedUser,
    activePlanPeriod,
    activeTab,
    pageReporting,
    setPageReporting,
    pageSizeReporting,
    activePlanPeriodId,
    setPageSizeReporting,
    selectedSessionIds,
    selectedFiscalYearId,
    allSessionsOfYear,
  } = PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { userId } = useAuthenticationStore();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();
  const { isMobile, isTablet } = useIsMobile();
  const { data: selectedFiscalYear } = useGetFiscalYearById(
    selectedFiscalYearId || '',
  );

  const { mutate: ReportApproval, isLoading: isApprovalLoading } =
    useApprovalReporting();
  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;

  const { data: allReporting, isLoading: getReportLoading } = useGetReporting(
    {
      userId: selectedUser,
      planPeriodId: planningPeriodId ?? '',
      pageReporting,
      pageSizeReporting,
      sessionId:
        selectedSessionIds.length > 0
          ? selectedSessionIds
          : allSessionsOfYear.length > 0
            ? allSessionsOfYear
            : [],
    },
    { enabled: activeTab === 2 && !!planningPeriodId },
  );

  const getPlanningPeriodDetail = (id: string) => {
    return planningPeriods?.items?.find((p: any) => p?.id === id) || {};
  };

  const activeTabName = getPlanningPeriodDetail(planningPeriodId ?? '')?.name;

  useEffect(() => {
    setPageReporting(1);
    setPageSizeReporting(10);
  }, [activeTab, setPageReporting, setPageSizeReporting]);

  const getEmployeeData = (id: string) => {
    return employeeData?.items?.find((emp: any) => emp?.id === id) || {};
  };

  const handleApproveHandler = (id: string, value: boolean) => {
    ReportApproval({ id, value });
  };

  const isDataFromActiveSession = (createdAt: string): boolean => {
    if (!selectedFiscalYearId || !selectedFiscalYear?.sessions) return true;
    const dataDate = dayjs(createdAt);
    return !!selectedFiscalYear.sessions.find((session) => {
      const start = dayjs(session.startDate);
      const end = dayjs(session.endDate);
      return (
        session.active &&
        (dataDate.isAfter(start) || dataDate.isSame(start)) &&
        (dataDate.isBefore(end) || dataDate.isSame(end))
      );
    });
  };

  const getDateLabel = (createdAt: string): string => {
    return formatPlanningReportDate(createdAt);
  };

  const cadence = (activeTabName?.toLowerCase() as Cadence) || 'weekly';
  const isDesktop = !isMobile && !isTablet;
  const [inlineEditingReport, setInlineEditingReport] = useState<{
    reportId: string;
    planId: string;
  } | null>(null);

  const closeInlineEditReport = useCallback(() => {
    setInlineEditingReport(null);
  }, []);

  const startInlineEditReport = useCallback(
    (reportId: string) => {
      const row = allReporting?.items?.find(
        (item: any) => item.id === reportId,
      );
      const resolvedPlanId =
        row?.planId || row?.plan?.id || row?.plan?.planId || '';
      if (!resolvedPlanId) return;
      setInlineEditingReport({ reportId, planId: resolvedPlanId });
    },
    [allReporting?.items],
  );

  const reportTaskOverrides = useRecentReportTaskStatuses((s) => s.byReport);

  const reportSummaries = useMemo(() => {
    if (!allReporting?.items) return [];
    return allReporting.items.map((dataItem: any) =>
      transformReportToPlanSummary(dataItem, cadence, employeeData),
    );
  }, [allReporting?.items, cadence, employeeData, reportTaskOverrides]);

  const totalReportingItems = allReporting?.meta?.totalItems ?? 0;
  const showReportingPagination = totalReportingItems > pageSizeReporting;

  const paginationNode = !showReportingPagination ? null : isMobile ||
    isTablet ? (
    <CustomMobilePagination
      totalResults={totalReportingItems}
      pageSize={pageSizeReporting}
      onChange={(page, pageSize) => {
        setPageReporting(page);
        setPageSizeReporting(pageSize);
      }}
      onShowSizeChange={(size) => {
        setPageSizeReporting(size);
        setPageReporting(1);
      }}
    />
  ) : (
    <CustomPagination
      total={totalReportingItems}
      current={pageReporting}
      pageSize={pageSizeReporting}
      onShowSizeChange={(size) => {
        setPageSizeReporting(size);
        setPageReporting(1);
      }}
      onChange={(page, pageSize) => {
        setPageReporting(page);
        setPageSizeReporting(pageSize);
      }}
      data-cy="reporting-list-pagination"
    />
  );

  return (
    <div
      data-cy="planning-and-reporting-components-reporting-index-tsx-index-div-358"
      className="flex w-full min-h-0 min-w-0 max-w-full flex-col lg:min-h-0 lg:flex-1"
    >
      <section
        data-cy="planning-and-reporting-components-reporting-index-tsx-index-section-449"
        className="mt-0 flex min-h-0 flex-1 flex-col"
      >
        {getReportLoading ? (
          <div
            data-cy="planning-and-reporting-components-reporting-index-tsx-index-div-184"
            className="space-y-4"
          >
            {[0, 1, 2].map((i) => (
              <PlanCardSkeleton key={i} reporting />
            ))}
          </div>
        ) : reportSummaries.length > 0 ? (
          isMobile || isTablet ? (
            <div
              data-cy="planning-and-reporting-components-reporting-index-tsx-index-div-191"
              className="space-y-4"
            >
              {allReporting?.items?.map((dataItem: any, index: number) => {
                const plan = reportSummaries[index];
                if (!plan) return null;

                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    viewMode="reporting"
                    activeCadence={cadence}
                    onApprove={() => handleApproveHandler(dataItem.id, true)}
                    onOpen={() => handleApproveHandler(dataItem.id, false)}
                    onEdit={() => startInlineEditReport(dataItem.id)}
                    canApprove={
                      userId ===
                      (getEmployeeData(dataItem?.userId ?? dataItem?.createdBy)
                        ?.reportingTo?.id ||
                        getEmployeeData(dataItem?.userId ?? dataItem?.createdBy)
                          ?.delegatedTo?.id)
                    }
                    canEdit={
                      userId === (dataItem?.userId ?? dataItem?.createdBy) &&
                      dataItem?.plan?.isReportValidated == false &&
                      isDataFromActiveSession(dataItem?.createdAt)
                    }
                    isApprovalLoading={isApprovalLoading}
                    dateLabel={getDateLabel(dataItem?.createdAt ?? '')}
                    inlineReportActive={
                      inlineEditingReport?.reportId === dataItem.id
                    }
                    onCloseInlineReport={closeInlineEditReport}
                    inlineReportContent={
                      inlineEditingReport?.reportId === dataItem.id ? (
                        <PlanCardInlineReportForm
                          reportId={dataItem.id}
                          planId={dataItem.planId || dataItem?.plan?.id}
                          planningPeriodId={planningPeriodId}
                          planningPeriodName={activeTabName}
                          onClose={closeInlineEditReport}
                        />
                      ) : undefined
                    }
                  />
                );
              })}
              {paginationNode}
            </div>
          ) : (
            <PlanningPanelView
              plans={reportSummaries}
              transformedData={allReporting?.items ?? []}
              cadence={cadence}
              userId={userId}
              getEmployeeData={getEmployeeData}
              isDataFromActiveSession={isDataFromActiveSession}
              onApprove={handleApproveHandler}
              onEdit={startInlineEditReport}
              isApprovalLoading={isApprovalLoading}
              getDateLabel={getDateLabel}
              paginationNode={paginationNode}
              viewMode="reporting"
              onHoverKR={onHoverKR}
              onOpenThread={onOpenThread}
              inlineReportPlanId={inlineEditingReport?.reportId}
              onCloseInlineReport={closeInlineEditReport}
              planningPeriodLabel={activeTabName}
            />
          )
        ) : (
          <div
            data-cy="planning-and-reporting-components-reporting-index-tsx-index-div-526"
            className="flex min-h-[min(42vh,26rem)] w-full flex-1 flex-col items-center justify-center px-4 py-8 text-center"
            role="status"
            aria-live="polite"
          >
            <div
              data-cy="reporting-empty-state"
              className="flex w-full max-w-md flex-col items-center justify-center px-6 py-14"
            >
              <div
                data-cy="planning-and-reporting-components-reporting-index-tsx-index-div-271"
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F2F6]"
              >
                <BsFileEarmarkText
                  size={26}
                  className="text-[#D1D5DB]"
                  aria-hidden
                />
              </div>
              <p
                data-cy="planning-and-reporting-components-reporting-index-tsx-index-p-536"
                className="text-sm font-medium text-[#161A2C]"
              >
                No reports yet
              </p>
              <p
                data-cy="planning-and-reporting-components-reporting-index-tsx-index-p-284"
                className="mt-2 text-xs leading-relaxed text-[#8F94A3]"
              >
                {activeTabName
                  ? `There are no submitted reports for ${activeTabName} with the current filters and session.`
                  : 'There are no submitted reports for this period with the current filters and session.'}
              </p>
              <p
                data-cy="planning-and-reporting-components-reporting-index-tsx-index-p-289"
                className="mt-2 text-xs leading-relaxed text-[#C4C7CE]"
              >
                {isDesktop
                  ? 'Submit a report from your plans using the actions on each plan card in the list.'
                  : 'Submit a report from each plan when you open it from your plan list.'}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
export default Reporting;
