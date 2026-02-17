'use client';
import React, { useMemo } from 'react';
import { Tooltip, Empty } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  useGetReporting,
  useDefaultPlanningPeriods,
  AllPlanningPeriods,
  useGetUserPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { transformReportToPlanSummary } from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/dataTransformer/vamp';
import BasicPlanCard from '../planning/BasicPlanCard';
import PlanCardSkeleton from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/cards/PlanCardSkeleton';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);
import CustomButton from '@/components/common/buttons/customButton';
import CustomPagination from '@/components/customPagination';
import { Cadence } from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/types';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import dayjs from 'dayjs';

export default function BasicReporting() {
  const { userId } = useAuthenticationStore();
  const {
    setOpenReportModal,
    activePlanPeriod,
    pageReporting,
    setPageReporting,
    pageSizeReporting,
    setPageSizeReporting,
    activePlanPeriodId,
  } = PlanningAndReportingStore();

  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();
  const { data: employeeData } = useGetAllUsers();

  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;

  const { data: allUserPlanning } = useGetUserPlanning(
    planningPeriodId ?? '',
    activePlanPeriod.toString(),
  );

  const { data: reportingData, isLoading } = useGetReporting({
    userId: [userId],
    planPeriodId: planningPeriodId ?? '',
    pageReporting,
    pageSizeReporting,
    sessionId: [],
  });

  const activeTabName =
    planningPeriods?.items?.find((p: any) => p.id === planningPeriodId)?.name ||
    'Report';

  const reportSummaries = useMemo(() => {
    return (
      reportingData?.items?.map((dataItem: any) => {
        const cadence = (activeTabName?.toLowerCase() as Cadence) || 'weekly';
        return transformReportToPlanSummary(dataItem, cadence, employeeData);
      }) || []
    );
  }, [reportingData, activeTabName, employeeData]);

  return (
    <div className="space-y-6" data-cy="reporting-container">
      <div
        className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100"
        data-cy="reporting-header"
      >
        <h2
          className="text-lg font-bold text-gray-800"
          data-cy="reporting-title"
        >
          {activeTabName} Reporting
        </h2>
        <Tooltip
          title={
            !allUserPlanning || allUserPlanning.length === 0
              ? 'Please create plan first'
              : ''
          }
          data-cy="create-report-tooltip"
        >
          <CustomButton
            title={`Create ${activeTabName} Report`}
            icon={<FaPlus data-cy="create-report-icon" />}
            onClick={() => setOpenReportModal(true)}
            disabled={!allUserPlanning || allUserPlanning.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
            data-cy="create-report-button"
          />
        </Tooltip>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars -- map uses index only
            (skeletonKey, i) => <PlanCardSkeleton key={i} />,
          )
        ) : reportSummaries.length > 0 ? (
          reportSummaries.map((plan: any) => (
            <BasicPlanCard
              key={plan.id}
              id={plan.id}
              title={`${plan.cadence.charAt(0).toUpperCase() + plan.cadence.slice(1)} Report`}
              date={
                plan.createdAt
                  ? dayjs(plan.createdAt).format('MMMM Do YYYY, h:mm:ss A')
                  : 'N/A'
              }
              reportedDate={
                plan.reportedDate
                  ? dayjs(plan.reportedDate).format('MMMM Do YYYY, h:mm:ss A')
                  : undefined
              }
              isReported={plan.isReported}
              tasks={plan.tasks || []}
              isExpanded={true}
              showReportButton={false}
              owner={{
                name: plan.owner?.name || 'Unknown',
                team: plan.owner?.role || 'N/A',
                avatar: plan.owner?.avatar,
                initials: plan.owner?.avatarInitials,
              }}
              planStatus={{
                label: plan.isReported ? 'Closed Plan' : 'Pending Report',
                date: plan.reportedDate
                  ? dayjs(plan.reportedDate).format('MMMM Do YYYY, h:mm:ss A')
                  : plan.createdAt
                    ? dayjs(plan.createdAt).format('MMMM Do YYYY, h:mm:ss A')
                    : 'N/A',
                status: plan.isReported ? ('success' as any) : 'pending',
              }}
              commentCount={plan.commentCount}
              commentAvatars={plan.commentAvatars}
              comments={plan.comments}
            />
          ))
        ) : (
          <div
            className="bg-white p-12 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500"
            data-cy="no-reports-empty-state"
          >
            <Empty description="No reports found for this period" />
          </div>
        )}
      </div>

      <div
        className="flex justify-center mt-6"
        data-cy="reports-pagination-container"
      >
        <CustomPagination
          current={pageReporting}
          total={reportingData?.meta?.totalItems || 0}
          pageSize={pageSizeReporting}
          onShowSizeChange={(size) => {
            setPageSizeReporting(size);
            setPageReporting(1);
          }}
          onChange={(p, s) => {
            setPageReporting(p);
            setPageSizeReporting(s);
          }}
        />
      </div>
    </div>
  );
}
