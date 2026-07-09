'use client';

import classNames from 'classnames';
import { useEffect } from 'react';
import { Button, Form } from 'antd';
import {
  useCreateReportForUnReportedtasks,
  useEditReportByReportId,
} from '@/store/server/features/okrPlanningAndReporting/mutations';
import {
  useGetPlannedTaskForReport,
  useGetReportedPlanning,
  useGetReportingById,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { groupUnReportedTasksByKeyResultAndMilestone } from '../dataTransformer/report';
import { PlanCardInlineReportFields } from './PlanCardInlineReportFields';
import { computeReportTotalWeight } from './reportFormUtils';
import { PlanCardInlineReportFormSkeleton } from './PlanCardInlineReportFormSkeleton';
import { useCreateReportFormEffects } from './useCreateReportFormEffects';

type PlanCardInlineReportFormProps = {
  planId: string;
  planningPeriodId: string | undefined;
  planningPeriodName?: string;
  onClose: () => void;
  /** When provided, submit goes to edit-report endpoint (same inline UI). */
  reportId?: string;
};

export function PlanCardInlineReportForm({
  planId,
  planningPeriodId,
  planningPeriodName,
  onClose,
  reportId,
}: PlanCardInlineReportFormProps) {
  const [form] = Form.useForm();
  const selectedStatuses = PlanningAndReportingStore((s) => s.selectedStatuses);
  const resetStatuses = PlanningAndReportingStore((s) => s.resetStatuses);
  const resetWeights = PlanningAndReportingStore((s) => s.resetWeights);
  const setStatus = PlanningAndReportingStore((s) => s.setStatus);
  const isEditMode = Boolean(reportId);

  const {
    data: allPlannedTaskForReport,
    isLoading: plannedTaskForReportLoading,
    isFetching: plannedTaskForReportFetching,
    refetch: refetchPlannedTasks,
  } = useGetPlannedTaskForReport(planningPeriodId);
  const {
    data: allReportedPlanning,
    isLoading: reportedPlanningLoading,
    isFetching: reportedPlanningFetching,
  } = useGetReportedPlanning(isEditMode ? planId : '');

  useEffect(() => {
    refetchPlannedTasks();
  }, [refetchPlannedTasks]);

  const sourceTasks = isEditMode
    ? allReportedPlanning
    : allPlannedTaskForReport;
  const formattedData =
    sourceTasks != null
      ? groupUnReportedTasksByKeyResultAndMilestone(sourceTasks)
      : null;

  const hasReportTaskRows =
    Array.isArray(formattedData) && formattedData.length > 0;

  /** Same query as planning list: empty UI was flashing while refetching or before cache hydrated. */
  const showReportTasksLoading =
    !hasReportTaskRows &&
    (isEditMode
      ? allReportedPlanning === undefined ||
        reportedPlanningLoading ||
        reportedPlanningFetching
      : !!planningPeriodId &&
        (allPlannedTaskForReport === undefined ||
          plannedTaskForReportLoading ||
          plannedTaskForReportFetching));

  useCreateReportFormEffects(hasReportTaskRows ? formattedData : null, form);

  const { mutate: createReport, isLoading: createReportLoading } =
    useCreateReportForUnReportedtasks();
  const { mutate: editReport, isLoading: editReportLoading } =
    useEditReportByReportId();
  const { data: reportingById, isLoading: reportingByIdLoading } =
    useGetReportingById(reportId || '');

  useEffect(() => {
    if (!isEditMode || !reportingById?.reportTask?.length) return;
    const mappedValues = reportingById.reportTask.reduce(
      (acc: any, task: any) => {
        acc[task.planTaskId] = {
          status: task?.status ?? '',
          actualValue: Number(task?.actualValue ?? 0),
          customReason: task?.customReason ?? '',
        };
        return acc;
      },
      {},
    );
    form.setFieldsValue(mappedValues);
    reportingById.reportTask.forEach((task: any) => {
      setStatus(task.planTaskId, task?.status ?? '');
    });
  }, [isEditMode, reportingById, form, setStatus]);

  const totalWeight = computeReportTotalWeight(
    hasReportTaskRows ? formattedData : null,
    selectedStatuses,
  );
  const isSubmitting = createReportLoading || editReportLoading;

  const handleClose = () => {
    form.resetFields();
    resetStatuses();
    resetWeights();
    onClose();
  };

  const handleFinish = (values: Record<string, any>) => {
    if (Object.entries(values).length === 0) return;
    if (isEditMode && reportId) {
      editReport(
        { values, selectedReportId: reportId },
        {
          onSuccess: () => {
            handleClose();
          },
        },
      );
      return;
    }

    if (!planningPeriodId) return;
    createReport(
      { values, planningPeriodId, planId },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  return (
    <div
      data-cy="plan-card-inline-report-form"
      className="border-t border-[#F1F2F6] bg-white px-3 pb-2 pt-2 md:px-4"
    >
      {hasReportTaskRows ? (
        <Form
          form={form}
          layout="vertical"
          name={`inline-report-${planId}`}
          onFinish={handleFinish}
          className="px-0"
        >
          <PlanCardInlineReportFields formattedData={formattedData} />
          <div
            data-cy="planning-and-reporting-components-createreport-plancardinlinereportform-tsx-plancardinlinereportform-div-176"
            className="mt-3 flex flex-col gap-2 border-t border-[#F1F2F6] pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
          >
            <div
              data-cy="planning-and-reporting-components-createreport-plancardinlinereportform-tsx-plancardinlinereportform-div-177"
              className="flex items-center gap-2 px-0.5"
            >
              <span
                data-cy="planning-and-reporting-components-createreport-plancardinlinereportform-tsx-plancardinlinereportform-span-178"
                className="text-[10px] font-medium text-[#8F94A3]"
              >
                <span
                  data-cy="planning-and-reporting-components-createreport-plancardinlinereportform-tsx-plancardinlinereportform-span-179"
                  className="sm:hidden"
                >
                  WP{' '}
                </span>
                <span
                  data-cy="planning-and-reporting-components-createreport-plancardinlinereportform-tsx-plancardinlinereportform-span-180"
                  className="hidden sm:inline"
                >
                  Weight{' '}
                </span>
              </span>
              <span
                data-cy="planning-and-reporting-components-createreport-plancardinlinereportform-tsx-plancardinlinereportform-span-201"
                className={classNames(
                  'text-[11px] font-bold tabular-nums sm:text-xs',
                  totalWeight > 84
                    ? 'text-[#059669]'
                    : totalWeight >= 64
                      ? 'text-[#D97706]'
                      : 'text-[#DC2626]',
                )}
              >
                {totalWeight}%
              </span>
            </div>
            <div
              data-cy="planning-and-reporting-components-createreport-plancardinlinereportform-tsx-plancardinlinereportform-div-195"
              className="flex flex-wrap justify-end gap-2"
            >
              <Button
                type="default"
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-8 rounded-lg border-[#E5E7EB] px-3 text-xs font-semibold text-[#64748B] hover:border-[#CBD5E1] hover:text-[#334155]"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                loading={isSubmitting}
                onClick={() => form.submit()}
                className="h-8 rounded-lg border-0 bg-[#1E40AF] px-4 text-xs font-semibold hover:bg-[#1E3A8A]"
              >
                {isEditMode
                  ? 'Update report'
                  : planningPeriodName
                    ? `Submit ${planningPeriodName}`
                    : 'Submit'}
              </Button>
            </div>
          </div>
        </Form>
      ) : showReportTasksLoading || (isEditMode && reportingByIdLoading) ? (
        <PlanCardInlineReportFormSkeleton />
      ) : (
        <div
          data-cy="planning-and-reporting-components-createreport-plancardinlinereportform-tsx-plancardinlinereportform-div-222"
          className="flex justify-center py-3"
        >
          <Button
            type="default"
            onClick={handleClose}
            className="h-8 rounded-lg border-[#E5E7EB] px-4 text-xs font-semibold text-[#64748B]"
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
}
