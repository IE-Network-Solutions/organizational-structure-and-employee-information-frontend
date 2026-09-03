'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useApprovalReporting } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { isDeadlinePlanningMockEnabled } from '@/utils/deadlinePlanningMocks';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import { BsFileEarmarkText } from 'react-icons/bs';
import PlanCard from '../cards/PlanCard';
import PlanCardSkeleton from '../cards/PlanCardSkeleton';
import { PlanCardInlineReportForm } from '../createReport/PlanCardInlineReportForm';
import { useReportingData } from '../planning/useReportingData';
import { formatPlanningReportDate } from '../utils';
import { Cadence, PlanSummary } from '../types';
import dayjs from 'dayjs';
import { useGetFiscalYearById } from '@/store/server/features/organizationStructure/fiscalYear/queries';

function Reporting({
  onHoverKR,
  onOpenThread,
  onStartAddPlan,
  addPlanComposer,
}: {
  onHoverKR?: (krId: string | null) => void;
  onOpenThread?: (entityId: string, threadKind: 'plan' | 'report') => void;
  onStartAddPlan?: () => void;
  addPlanComposer?: React.ReactNode;
}) {
  void onHoverKR;
  void onOpenThread;

  const mockEnabled = isDeadlinePlanningMockEnabled();
  const {
    activePlanPeriod,
    activeTab,
    activePlanPeriodId,
    pageReporting,
    setPageReporting,
    pageSizeReporting,
    setPageSizeReporting,
    selectedFiscalYearId,
  } = PlanningAndReportingStore();

  const { userId } = useAuthenticationStore();
  const { data: employeeData } = useGetAllUsers();
  const { isMobile, isTablet } = useIsMobile();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();
  const { data: selectedFiscalYear } = useGetFiscalYearById(
    selectedFiscalYearId || '',
  );

  const { mutate: ReportApproval, isLoading: isApprovalLoading } =
    useApprovalReporting();

  const { reportSummaries, reportingItems } = useReportingData(
    activeTab === 2,
  );

  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;

  const getPlanningPeriodDetail = (id: string) =>
    planningPeriods?.items?.find((p: any) => p?.id === id) || {};

  const activeTabName = getPlanningPeriodDetail(planningPeriodId ?? '')?.name;
  const cadence = (activeTabName?.toLowerCase() as Cadence) || 'weekly';

  useEffect(() => {
    setPageReporting(1);
    setPageSizeReporting(10);
  }, [activeTab, setPageReporting, setPageSizeReporting]);

  const getEmployeeData = (id: string) =>
    employeeData?.items?.find((emp: any) => emp?.id === id) || {};

  const handleApproveHandler = (id: string, value: boolean) => {
    ReportApproval({ id, value });
  };

  const isDataFromActiveSession = (createdAt: string): boolean => {
    if (!selectedFiscalYearId || !selectedFiscalYear?.sessions) return true;
    const dataDate = dayjs(createdAt);
    return !!selectedFiscalYear.sessions.find((session: any) => {
      const start = dayjs(session.startDate);
      const end = dayjs(session.endDate);
      return (
        session.active &&
        (dataDate.isAfter(start) || dataDate.isSame(start)) &&
        (dataDate.isBefore(end) || dataDate.isSame(end))
      );
    });
  };

  const getDateLabel = (createdAt: string) =>
    formatPlanningReportDate(createdAt);

  const [inlineEditingReport, setInlineEditingReport] = useState<{
    reportId: string;
    planId: string;
  } | null>(null);

  const closeInlineEditReport = useCallback(() => {
    setInlineEditingReport(null);
  }, []);

  const handleAddPlan = useCallback(() => {
    onStartAddPlan?.();
  }, [onStartAddPlan]);

  const startInlineEditReport = useCallback(
    (reportId: string) => {
      const row = reportingItems?.find((item: any) => item.id === reportId);
      const resolvedPlanId =
        row?.planId || row?.plan?.id || row?.plan?.planId || '';
      if (!resolvedPlanId) return;
      setInlineEditingReport({ reportId, planId: resolvedPlanId });
    },
    [reportingItems],
  );

  // Sort: My report first, then others
  const currentUserId = String(userId ?? '');
  const { myReports, otherReports } = useMemo(() => {
    const mine: PlanSummary[] = [];
    const others: PlanSummary[] = [];
    for (const plan of reportSummaries) {
      const isMine =
        String(plan.ownerUserId ?? '') === currentUserId ||
        plan.summary === 'My Plan' ||
        plan.owner?.name === 'My Plan';
      if (isMine) mine.push(plan);
      else others.push(plan);
    }
    return { myReports: mine, otherReports: others };
  }, [reportSummaries, currentUserId]);

  const totalOthers = otherReports.length;
  const showPagination = totalOthers > pageSizeReporting;

  const visibleReports = useMemo(() => {
    const start = (pageReporting - 1) * pageSizeReporting;
    return [...myReports, ...otherReports.slice(start, start + pageSizeReporting)];
  }, [myReports, otherReports, pageReporting, pageSizeReporting]);

  const paginationNode = showPagination ? (
    isMobile || isTablet ? (
      <CustomMobilePagination
        totalResults={totalOthers}
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
        total={totalOthers}
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
    )
  ) : null;

  const renderCard = (plan: PlanSummary) => {
    // Find matching raw item (mock: plan.id may directly match; live: via reportSummaries index)
    const dataItem = reportingItems?.find(
      (item: any) => item.id === plan.id || item?.plan?.id === plan.id,
    ) ?? { id: plan.id, userId: plan.ownerUserId };

    return (
      <PlanCard
        key={plan.id}
        plan={plan}
        viewMode={mockEnabled ? 'planning' : 'reporting'}
        activeCadence={cadence}
        onApprove={() => handleApproveHandler(String(dataItem.id), true)}
        onOpen={() => handleApproveHandler(String(dataItem.id), false)}
        onEdit={() => startInlineEditReport(String(dataItem.id))}
        canApprove={
          mockEnabled
            ? currentUserId !==
              String(dataItem?.userId ?? dataItem?.createdBy ?? '')
            : userId ===
              (getEmployeeData(dataItem?.userId ?? dataItem?.createdBy)
                ?.reportingTo?.id ||
                getEmployeeData(dataItem?.userId ?? dataItem?.createdBy)
                  ?.delegatedTo?.id)
        }
        canEdit={
          mockEnabled
            ? false
            : userId === (dataItem?.userId ?? dataItem?.createdBy) &&
              dataItem?.plan?.isReportValidated == false &&
              isDataFromActiveSession(dataItem?.createdAt)
        }
        isApprovalLoading={isApprovalLoading}
        dateLabel={getDateLabel(dataItem?.createdAt ?? '')}
        inlineReportActive={
          !mockEnabled &&
          inlineEditingReport?.reportId === String(dataItem.id)
        }
        onCloseInlineReport={closeInlineEditReport}
        inlineReportContent={
          !mockEnabled && inlineEditingReport?.reportId === String(dataItem.id) ? (
            <PlanCardInlineReportForm
              reportId={String(dataItem.id)}
              planId={dataItem.planId || dataItem?.plan?.id}
              planningPeriodId={planningPeriodId}
              planningPeriodName={activeTabName}
              onClose={closeInlineEditReport}
            />
          ) : undefined
        }
      />
    );
  };

  const isLoading = !mockEnabled && !reportSummaries.length && activeTab === 2;

  return (
    <div
      data-cy="planning-and-reporting-components-reporting-index-tsx-index-div-358"
      className="flex w-full min-h-0 min-w-0 max-w-full flex-col lg:min-h-0 lg:flex-1"
    >
      <section
        data-cy="planning-and-reporting-components-reporting-index-tsx-index-section-449"
        className="mt-0 flex min-h-0 flex-1 flex-col"
      >
        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <PlanCardSkeleton key={i} reporting />
            ))}
          </div>
        ) : visibleReports.length > 0 ? (
          <div
            data-cy="reporting-card-list"
            className="min-w-0 max-w-full space-y-4 pr-1"
          >
            {visibleReports.map(renderCard)}
            {paginationNode}
          </div>
        ) : (
          <div
            data-cy="planning-and-reporting-components-reporting-index-tsx-index-div-526"
            className="flex min-h-[min(42vh,26rem)] w-full flex-1 flex-col items-center justify-center px-4 py-8 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="flex w-full max-w-md flex-col items-center justify-center px-6 py-14">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F2F6]">
                <BsFileEarmarkText size={26} className="text-[#D1D5DB]" aria-hidden />
              </div>
              <p className="text-sm font-medium text-[#161A2C]">No reports yet</p>
              <p className="mt-2 text-xs leading-relaxed text-[#8F94A3]">
                {activeTabName
                  ? `No submitted reports for ${activeTabName} with the current filters.`
                  : 'No submitted reports for this period.'}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Reporting;
