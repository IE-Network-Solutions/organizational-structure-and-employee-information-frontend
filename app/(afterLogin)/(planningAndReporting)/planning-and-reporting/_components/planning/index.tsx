import CustomButton from '@/components/common/buttons/customButton';
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus } from 'react-icons/fa';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetPlanning,
  useGetPlanningPeriodsHierarchy,
  useGetUserPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetFiscalYearById } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useApprovalPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import dayjs from 'dayjs';
import { groupPlanTasksByKeyResultAndMilestone } from '../dataTransformer/plan';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import Image from 'next/image';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import PlanCard from '../cards/PlanCard';
import PlanCardSkeleton from '../cards/PlanCardSkeleton';
import { transformToPlanSummary } from '../dataTransformer/vamp';
import { ViewMode, Cadence } from '../types';
import { formatPlanningReportDate } from '../utils';
import { Tooltip } from 'antd';

function Planning() {
  const {
    setOpen,
    selectedUser,
    setSelectedPlanId,
    setEditing,
    page,
    setPage,
    pageSize,
    setPageSize,
    activeTab,
    activePlanPeriod,
    activePlanPeriodId,
    selectedSessionIds,
    selectedFiscalYearId,
    allSessionsOfYear,
  } = PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const { isMobile, isTablet } = useIsMobile();
  const { userId } = useAuthenticationStore();
  const [primarySlotReady, setPrimarySlotReady] = useState(false);

  useEffect(() => {
    setPrimarySlotReady(true);
  }, []);

  const { data: selectedFiscalYear } = useGetFiscalYearById(
    selectedFiscalYearId || '',
  );
  const { mutate: approvalPlanningPeriod, isLoading: isApprovalLoading } =
    useApprovalPlanningPeriods();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();

  const getPlanningPeriodDetail = (id: string) => {
    const planningPeriodDetail = planningPeriods?.items?.find(
      (period: any) => period?.id === id,
    );
    return planningPeriodDetail || {};
  };

  const { data: objective } = useFetchObjectives(userId);
  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;

  const userPlanningPeriodId = userPlanningPeriods?.find(
    (item) => item?.planningPeriodId === planningPeriodId,
  )?.planningPeriodId;

  const planningForPlan = useMemo(() => {
    if (!planningPeriodId || !userPlanningPeriods?.length) {
      return activePlanPeriod.toString();
    }
    const idx = userPlanningPeriods.findIndex(
      (item: { planningPeriodId?: string }) =>
        item?.planningPeriodId === planningPeriodId,
    );
    return idx >= 0 ? String(idx + 1) : activePlanPeriod.toString();
  }, [planningPeriodId, userPlanningPeriods, activePlanPeriod]);

  const { data: allPlanning, isLoading: getPlanningLoading } = useGetPlanning({
    userId: selectedUser,
    planPeriodId: planningPeriodId ?? '',
    page,
    pageSize,
    sessionId:
      selectedSessionIds.length > 0
        ? selectedSessionIds
        : allSessionsOfYear.length > 0
          ? allSessionsOfYear
          : [],
  });
  const { data: allUserPlanning } = useGetUserPlanning(
    planningPeriodId ?? '',
    planningForPlan,
  );

  useEffect(() => {
    setPage(1);
    setPageSize(10);
  }, [activeTab, setPage, setPageSize]);

  const transformedData = groupPlanTasksByKeyResultAndMilestone(
    allPlanning?.items ?? [],
  );

  const activeTabName = getPlanningPeriodDetail(planningPeriodId ?? '')?.name;

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
    const data = {
      id: id,
      value: value,
    };
    approvalPlanningPeriod(data);
  };

  const getEmployeeData = (id: string) => {
    const employeeDataDetail = employeeData?.items?.find(
      (emp: any) => emp?.id === id,
    );

    return employeeDataDetail || {};
  };
  const { data: planningPeriodHierarchy, isLoading } =
    useGetPlanningPeriodsHierarchy(userId, planningPeriodId || '');

  const isActive = planningPeriodHierarchy?.parentPlan
    ? (planningPeriodHierarchy?.parentPlan?.plans?.length ?? 0) === 0 ||
      (planningPeriodHierarchy?.parentPlan?.plans?.filter(
        (i: any) => !i.isReported,
      ).length ?? 0) === 0
    : false;

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
              allUserPlanning?.length != 0
                ? `Report planned tasks before you create ${activeTabName} plan`
                : objective?.items?.length === 0
                  ? 'Create Objective before you Plan'
                  : planningPeriodHierarchy?.parentPlan?.plans?.length == 0 ||
                      planningPeriodHierarchy?.parentPlan?.plans?.filter(
                        (i: any) => i.isReported === false,
                      )?.length == 0
                    ? `Please create ${planningPeriodHierarchy?.parentPlan?.name} Plan before creating ${activeTabName} Plan`
                    : ''
            }
          >
            <div
              data-cy="planning-and-reporting-components-planning-index-tsx-index-div-460"
              className="inline-flex w-full justify-stretch md:w-auto md:justify-end"
            >
              {userPlanningPeriodId && (
                <CustomButton
                  disabled={
                    (allUserPlanning && allUserPlanning.length > 0) ||
                    isActive ||
                    (objective?.items?.length ?? 0) === 0
                  }
                  loading={isLoading}
                  title="+ Create Plan"
                  id="createActiveTabName"
                  icon={<FaPlus className="text-sm" />}
                  onClick={() => setOpen(true)}
                  className={`${!userPlanningPeriodId ? 'hidden' : ''} !h-11 !min-h-[44px] w-full border-0 !bg-[#1D4ED8] !text-white hover:!bg-[#1E3A8A] md:w-auto md:min-w-[160px]`}
                />
              )}
            </div>
          </Tooltip>,
          primarySlotEl,
        )
      : null;

  return (
    <div
      data-cy="planning-and-reporting-components-planning-index-tsx-index-div-388"
      className="pb-2"
    >
      {primaryActionPortal}

      <section
        data-cy="planning-and-reporting-components-planning-index-tsx-index-section-484"
        className="mt-2"
      >
        <div
          data-cy="planning-and-reporting-components-planning-index-tsx-index-div-485"
          className="space-y-6"
        >
          {getPlanningLoading
            ? Array.from({ length: 3 }).map((unusedItem, i) => (
                <PlanCardSkeleton key={i} />
              ))
            : planSummaries.map((plan: any) => {
                const originalDataItem = transformedData?.find(
                  (item: any) => item.id === plan.id,
                );
                if (!originalDataItem) return null;

                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    viewMode="planning"
                    activeCadence={
                      (activeTabName?.toLowerCase() as Cadence) || 'weekly'
                    }
                    onApprove={() =>
                      handleApproveHandler(originalDataItem.id, true)
                    }
                    onOpen={() =>
                      handleApproveHandler(originalDataItem.id, false)
                    }
                    onEdit={() => {
                      setEditing(true);
                      setSelectedPlanId(originalDataItem.id);
                      setOpen(true);
                    }}
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
                  />
                );
              })}
        </div>
      </section>
      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={allPlanning?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={(page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          }}
          onShowSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      ) : (
        <CustomPagination
          current={page}
          total={allPlanning?.meta?.totalItems || 1}
          pageSize={pageSize}
          onChange={(page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          }}
          onShowSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          grayBackground={true}
        />
      )}

      {!getPlanningLoading && transformedData?.length <= 0 && (
        <div
          data-cy="planning-and-reporting-components-planning-index-tsx-index-div-584"
          className="flex justify-center"
        >
          <div data-cy="planning-and-reporting-components-planning-index-tsx-index-div-585">
            <p
              data-cy="planning-and-reporting-components-planning-index-tsx-index-p-586"
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
              data-cy="planning-and-reporting-components-planning-index-tsx-index-p-594"
              className="flex justify-center items-center mt-4 text-xl text-gray-950 font-extrabold"
            >
              There is no Planned data !!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
export default Planning;
