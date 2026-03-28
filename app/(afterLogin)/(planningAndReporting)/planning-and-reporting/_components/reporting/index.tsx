import CustomButton from '@/components/common/buttons/customButton';
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus } from 'react-icons/fa';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetReporting,
  useGetUserPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetFiscalYearById } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import Image from 'next/image';
import { useApprovalReporting } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import PlanCard from '../cards/PlanCard';
import PlanCardSkeleton from '../cards/PlanCardSkeleton';
import { transformReportToPlanSummary } from '../dataTransformer/vamp';
import { Cadence } from '../types';
import { formatPlanningReportDate } from '../utils';
import { Tooltip } from 'antd';

function Reporting() {
  const {
    setOpenReportModal,
    selectedUser,
    setSelectedReportId,
    setSelectedPlanId,
    activeTab,
    pageReporting,
    setPageReporting,
    pageSizeReporting,
    activePlanPeriod,
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
  const [primarySlotReady, setPrimarySlotReady] = useState(false);

  useEffect(() => {
    setPrimarySlotReady(true);
  }, []);

  const { data: selectedFiscalYear } = useGetFiscalYearById(
    selectedFiscalYearId || '',
  );

  const { mutate: ReportApproval, isLoading: isApprovalLoading } =
    useApprovalReporting();
  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;

  const userPlanningPeriodId = userPlanningPeriods?.find(
    (item) => item?.planningPeriodId === planningPeriodId,
  )?.planningPeriodId;

  const reportingForPlan = useMemo(() => {
    if (!planningPeriodId || !userPlanningPeriods?.length) {
      return activePlanPeriod.toString();
    }
    const idx = userPlanningPeriods.findIndex(
      (item: { planningPeriodId?: string }) =>
        item?.planningPeriodId === planningPeriodId,
    );
    return idx >= 0 ? String(idx + 1) : activePlanPeriod.toString();
  }, [planningPeriodId, userPlanningPeriods, activePlanPeriod]);

  const { data: allUserPlanning, isLoading: getUserPlanningLoading } =
    useGetUserPlanning(planningPeriodId ?? '', reportingForPlan);
  const { data: allReporting, isLoading: getReportLoading } = useGetReporting({
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
  });
  const getPlanningPeriodDetail = (id: string) => {
    const planningPeriodDetail = planningPeriods?.items?.find(
      (period: any) => period?.id === id,
    );
    return planningPeriodDetail || {};
  };

  const activeTabName = getPlanningPeriodDetail(planningPeriodId ?? '')?.name;

  useEffect(() => {
    setPageReporting(1);
    setPageSizeReporting(10);
  }, [activeTab, setPageReporting, setPageSizeReporting]);

  const getEmployeeData = (id: string) => {
    const employeeDataDetail = employeeData?.items?.find(
      (emp: any) => emp?.id === id,
    );

    return employeeDataDetail || {};
  };
  const handleApproveHandler = (id: string, value: boolean) => {
    const data = {
      id: id,
      value: value,
    };
    ReportApproval(data);
  };

  const isDataFromActiveSession = (createdAt: string): boolean => {
    if (!selectedFiscalYearId || !selectedFiscalYear?.sessions) {
      return true;
    }

    const dataDate = dayjs(createdAt);

    const activeSession = selectedFiscalYear.sessions.find((session) => {
      const sessionStart = dayjs(session.startDate);
      const sessionEnd = dayjs(session.endDate);
      return (
        session.active &&
        (dataDate.isAfter(sessionStart) || dataDate.isSame(sessionStart)) &&
        (dataDate.isBefore(sessionEnd) || dataDate.isSame(sessionEnd))
      );
    });

    return !!activeSession;
  };

  const getDateLabel = (createdAt: string): string => {
    return formatPlanningReportDate(createdAt);
  };

  const primarySlotEl =
    typeof document !== 'undefined'
      ? document.getElementById('pr-primary-action-slot')
      : null;

  const primaryActionPortal =
    primarySlotReady && primarySlotEl
      ? createPortal(
          <Tooltip
            title={
              !allUserPlanning || allUserPlanning.length === 0
                ? 'Please Create Plan First'
                : ''
            }
          >
            <div
              data-cy="planning-and-reporting-components-reporting-index-tsx-index-div-431"
              className="inline-flex w-full justify-stretch md:w-auto md:justify-end"
            >
              <CustomButton
                disabled={!allUserPlanning || allUserPlanning.length === 0}
                title="+ Report Tasks"
                id="createActiveTabName"
                icon={<FaPlus className="text-sm" />}
                onClick={() => setOpenReportModal(true)}
                className={`${!userPlanningPeriodId ? 'hidden' : ''} !h-11 !min-h-[44px] w-full border-0 !bg-[#2D5BFF] !text-white hover:!bg-[#2447D4] md:w-auto md:min-w-[180px]`}
                loading={getUserPlanningLoading}
              />
            </div>
          </Tooltip>,
          primarySlotEl,
        )
      : null;

  return (
    <div
      data-cy="planning-and-reporting-components-reporting-index-tsx-index-div-358"
      className="pb-2"
    >
      {primaryActionPortal}

      <section
        data-cy="planning-and-reporting-components-reporting-index-tsx-index-section-449"
        className="mt-2"
      >
        <div
          data-cy="planning-and-reporting-components-reporting-index-tsx-index-div-450"
          className="space-y-6"
        >
          {getReportLoading
            ? Array.from({ length: 3 }).map((unusedItem, i) => (
                <PlanCardSkeleton key={i} />
              ))
            : allReporting?.items?.map((dataItem: any) => {
                const cadence =
                  (activeTabName?.toLowerCase() as Cadence) || 'weekly';
                const plan = transformReportToPlanSummary(
                  dataItem,
                  cadence,
                  employeeData,
                );

                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    viewMode="reporting"
                    activeCadence={cadence}
                    onApprove={() => handleApproveHandler(dataItem.id, true)}
                    onOpen={() => handleApproveHandler(dataItem.id, false)}
                    onEdit={() => {
                      setSelectedReportId(dataItem.id);
                      setSelectedPlanId(dataItem.planId);
                    }}
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
                  />
                );
              })}
        </div>
      </section>

      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={allReporting?.meta?.totalItems ?? 0}
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
          total={allReporting?.meta?.totalItems}
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
          grayBackground={true}
        />
      )}
      {!getReportLoading && (allReporting?.items?.length ?? 0) <= 0 && (
        <div
          data-cy="planning-and-reporting-components-reporting-index-tsx-index-div-526"
          className="flex justify-center"
        >
          <div data-cy="planning-and-reporting-components-reporting-index-tsx-index-div-527">
            <p
              data-cy="planning-and-reporting-components-reporting-index-tsx-index-p-528"
              className="flex justify-center items-center h-[200px]"
            >
              <Image
                src="/image/undraw_empty_re_opql 1.svg"
                width={300}
                height={300}
                alt="Picture of the author"
              />
            </p>
            <p
              data-cy="planning-and-reporting-components-reporting-index-tsx-index-p-536"
              className="flex justify-center items-center mt-4 text-xl text-gray-950 font-extrabold"
            >
              There is no Reported data !!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
export default Reporting;
