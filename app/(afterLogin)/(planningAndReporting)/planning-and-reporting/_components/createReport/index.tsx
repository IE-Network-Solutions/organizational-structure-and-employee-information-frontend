'use client';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { Button, Form, Spin } from 'antd';

import { CustomizeRenderEmpty } from '@/components/emptyIndicator';
import { useCreateReportForUnReportedtasks } from '@/store/server/features/okrPlanningAndReporting/mutations';
import {
  useDefaultPlanningPeriods,
  useGetPlannedTaskForReport,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useEffect, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { markMilestonesCompletedInOkrCaches } from '@/utils/invalidateOkrPlanningCaches';
import {
  buildMilestoneKeyResultMap,
  clearReopenedPlanningTargets,
  collectAchievedMilestoneIdsFromReport,
  rememberAchievedMilestones,
} from '@/utils/recentlyAchievedMilestones';
import { groupUnReportedTasksByKeyResultAndMilestone } from '../dataTransformer/report';
import { CreateReportFormCollapse } from './CreateReportFormCollapse';
import { computeReportTotalWeight } from './reportFormUtils';
import { useCreateReportFormEffects } from './useCreateReportFormEffects';

function CreateReport() {
  const {
    openReportModal,
    setOpenReportModal,
    activePlanPeriod,
    isEditing,
    resetWeights,
    resetStatuses,
    activePlanPeriodId,
    selectedStatuses,
    setInlineReportPlanId,
  } = PlanningAndReportingStore();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const onClose = () => {
    setOpenReportModal(false);
    form.resetFields();
    resetStatuses();
    resetWeights();
  };

  const { data: planningPeriods } = useDefaultPlanningPeriods();

  const { mutate: createReport, isLoading: createReportLoading } =
    useCreateReportForUnReportedtasks();

  const getPlanningPeriodDetail = (id: string) => {
    const planningPeriodDetail = planningPeriods?.items?.find(
      (period: any) => period?.id === id,
    );
    return planningPeriodDetail || {};
  };
  const planningPeriodId =
    activePlanPeriodId ?? planningPeriods?.[activePlanPeriod - 1]?.id;
  const {
    data: allPlannedTaskForReport,
    isLoading: plannedTaskForReportLoading,
    refetch: refetchPlannedTasks,
  } = useGetPlannedTaskForReport(planningPeriodId);

  const planningPeriodName = getPlanningPeriodDetail(
    planningPeriodId ?? '',
  )?.name;

  useEffect(() => {
    if (openReportModal) {
      setInlineReportPlanId(null);
    }
  }, [openReportModal, setInlineReportPlanId]);

  const formattedData = useMemo(
    () =>
      allPlannedTaskForReport
        ? groupUnReportedTasksByKeyResultAndMilestone(allPlannedTaskForReport)
        : null,
    [allPlannedTaskForReport],
  );

  const handleOnFinish = (values: Record<string, any>) => {
    if (Object.entries(values).length === 0 || !planningPeriodId) return;

    const achievedIds = collectAchievedMilestoneIdsFromReport(
      Array.isArray(formattedData) ? formattedData : null,
      selectedStatuses,
      values,
    );
    const milestoneToKrId = buildMilestoneKeyResultMap(
      Array.isArray(formattedData) ? formattedData : null,
    );
    clearReopenedPlanningTargets({
      milestoneIds: achievedIds,
      keyResultIds: Array.from(
        new Set(
          achievedIds
            .map((id) => milestoneToKrId[id])
            .filter((id): id is string => Boolean(id)),
        ),
      ),
    });
    // Session remember before mutate so + disable does not wait on invalidate.
    rememberAchievedMilestones(achievedIds);

    createReport(
      {
        values: values,
        planningPeriodId: planningPeriodId,
        planId: allPlannedTaskForReport?.[0]?.plan?.id,
        achievedMilestoneIds: achievedIds,
      },
      {
        onSuccess: () => {
          markMilestonesCompletedInOkrCaches(queryClient, achievedIds);
          onClose();
        },
      },
    );
  };

  useCreateReportFormEffects(formattedData, form);

  useEffect(() => {
    if (openReportModal) {
      refetchPlannedTasks();
    }
  }, [openReportModal, refetchPlannedTasks]);

  const totalWeight = computeReportTotalWeight(formattedData, selectedStatuses);

  const modalHeader = (
    <div
      data-cy="planning-and-reporting-components-createreport-index-tsx-index-div-78"
      className="text-center text-xl font-bold text-[#161A2C]"
    >
      {planningPeriodName ? `Submit ${planningPeriodName}` : 'Submit'}
    </div>
  );

  const footer = (
    <div
      data-cy="planning-and-reporting-components-createreport-index-tsx-index-div-254"
      className="flex w-full items-center justify-between"
    >
      <div
        data-cy="planning-and-reporting-components-createreport-index-tsx-index-div-255"
        className="flex-1"
      ></div>
      <div
        data-cy="planning-and-reporting-components-createreport-index-tsx-index-div-256"
        className="flex flex-1 justify-center gap-4"
      >
        <Button
          id="submit-report-button-for-planning-and-reporting"
          data-cy="submit-report-button-for-planning-and-reporting"
          type="primary"
          className="rounded-xl bg-[#1E40AF] px-6 py-3 text-white hover:bg-[#1E3A8A] sm:px-10 sm:py-6"
          loading={createReportLoading}
          onClick={() => form.submit()}
        >
          {planningPeriodName ? `Submit ${planningPeriodName}` : 'Submit'}
        </Button>
        <Button
          id="cancel-report-button-for-planning-and-reporting"
          data-cy="cancel-report-button-for-planning-and-reporting"
          className="rounded-xl px-6 py-3 sm:px-10 sm:py-6"
          onClick={onClose}
          disabled={createReportLoading}
        >
          Cancel
        </Button>
      </div>

      <div
        data-cy="planning-and-reporting-components-createreport-index-tsx-index-div-279"
        className="flex flex-1 justify-end pr-5"
      >
        <div
          data-cy="planning-and-reporting-components-createreport-index-tsx-index-div-280"
          className="my-2 font-bold"
        >
          <span
            data-cy="planning-and-reporting-components-createreport-index-tsx-index-span-281"
            className="whitespace-nowrap text-sm font-medium text-[#161A2C]"
          >
            <span
              data-cy="planning-and-reporting-components-createreport-index-tsx-index-span-282"
              className="md:hidden"
            >
              WP:
            </span>{' '}
            <span
              data-cy="planning-and-reporting-components-createreport-index-tsx-index-span-283"
              className="hidden md:inline"
            >
              Weight Point:
            </span>{' '}
            <span
              className={`text-[20px] font-extrabold md:text-[22px] ${
                totalWeight > 84
                  ? 'text-[#52C41A]'
                  : totalWeight >= 64
                    ? 'text-orange-500'
                    : 'text-red-500'
              }`}
              data-cy="planningandreporting-planning-and-reporting-components-createreport-index-tsx-span-325"
            >
              {totalWeight}%
            </span>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    openReportModal && (
      <CustomDrawerLayout
        open={openReportModal === true && isEditing === false ? true : false}
        onClose={onClose}
        modalHeader={modalHeader}
        width="65%"
        footer={footer}
      >
        {Array.isArray(formattedData) && formattedData.length > 0 ? (
          <Spin spinning={plannedTaskForReportLoading} tip="Loading...">
            <Form
              layout="vertical"
              form={form}
              name="dynamic_form_item"
              onFinish={handleOnFinish}
              className="px-2"
            >
              <CreateReportFormCollapse
                formattedData={formattedData}
                planningPeriodName={planningPeriodName}
              />
            </Form>
          </Spin>
        ) : (
          <div
            data-cy="planning-and-reporting-components-createreport-index-tsx-index-div-558"
            className="flex h-64 items-center justify-center"
          >
            <CustomizeRenderEmpty />
          </div>
        )}
      </CustomDrawerLayout>
    )
  );
}

export default CreateReport;
