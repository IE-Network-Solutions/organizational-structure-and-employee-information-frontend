import { useMutation, useQueryClient } from 'react-query';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { getCurrentToken } from '@/utils/getCurrentToken';
import {
  invalidatePlanningCaches,
  invalidateReportingCaches,
  markMilestonesCompletedInOkrCaches,
  markMilestonesReopenedInOkrCaches,
  patchReportTaskStatusesInCaches,
  scheduleDashboardAndVpRefetch,
  scheduleOkrMilestoneStatusRefetch,
} from '@/utils/invalidateOkrPlanningCaches';
import { useRecentlyAchievedMilestones } from '@/utils/recentlyAchievedMilestones';
import { appendApplyToOkrQuery } from '@/utils/okrCountingPlanningPeriod';

const approveOrRejectPlanningPeriods = async (planningData: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${OKR_URL}/plan/validate/${planningData?.id}?value=${String(planningData?.value)}`,
    method: 'post',
    headers,
  });
};

const approveOrRejectReporting = async (reportingData: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  const applyToOkr = reportingData?.applyToOkr !== false;
  const url = appendApplyToOkrQuery(
    `${OKR_URL}/okr-report/validate/${reportingData?.id}?value=${String(reportingData?.value)}`,
    applyToOkr,
  );

  return await crudRequest({
    url,
    method: 'post',
    headers,
  });
};

const deletePlanById = async (id: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${OKR_URL}/plan/${id}`,
    method: 'delete',
    headers,
  });
};
const deleteReportById = async (id: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${OKR_URL}/okr-report/${id}`,
    method: 'delete',
    headers,
  });
};
const createReportForUnReportedtasks = async (
  values: any,
  planningPeriodId: string,
  planId?: string,
  applyToOkr = true,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  const baseUrl = planId
    ? `${OKR_URL}/okr-report-task/create-report/${userId}/${planningPeriodId}?planningId=${planId}`
    : `${OKR_URL}/okr-report-task/create-report/${userId}/${planningPeriodId}`;

  return await crudRequest({
    url: appendApplyToOkrQuery(baseUrl, applyToOkr),
    method: 'POST',
    data: values,
    headers,
  });
};
const editReport = async (
  values: any,
  selectedReportId: string,
  applyToOkr = true,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: appendApplyToOkrQuery(
      `${OKR_URL}/okr-report-task/update-report-tasks/${selectedReportId}`,
      applyToOkr,
    ),
    method: 'patch',
    data: values,
    headers,
  });
};

const updateStatus = async (id: string, status: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  const body = {
    status: status,
  };
  return await crudRequest({
    url: `${OKR_URL}/plan-tasks/update-status/${id}`,
    method: 'patch',
    data: body,
    headers,
  });
};

/** Apply session + cache disable before invalidate so UI never waits on refetch. */
function applyAchievedMilestoneIds(
  queryClient: ReturnType<typeof useQueryClient>,
  achievedMilestoneIds?: Array<string | number | null | undefined> | null,
): void {
  if (!achievedMilestoneIds || achievedMilestoneIds.length === 0) return;
  markMilestonesCompletedInOkrCaches(queryClient, achievedMilestoneIds);
}

/**
 * When a report is approved, Done+achieveMK tasks on that report should disable
 * their milestones immediately (backend may finalize Completed only on approve).
 * Also used on reject/cancel to reopen the same milestones for re-planning.
 *
 * `mode: 'cancel'` reopens every linked milestone on the report (report gone /
 * cancelled). `mode: 'done'` only includes Done/achieved rows (approve/reject).
 */
function collectMilestoneIdsFromApprovedReport(
  queryClient: ReturnType<typeof useQueryClient>,
  reportId: string,
  mode: 'done' | 'cancel' = 'done',
): { milestoneIds: string[]; keyResultIds: string[] } {
  const milestoneIds = new Set<string>();
  const keyResultIds = new Set<string>();
  const entries = [
    ...queryClient.getQueriesData(['okrReports']),
    ...queryClient.getQueriesData(['okrReport']),
  ];
  const remembered = useRecentlyAchievedMilestones.getState().ids;

  const addMilestone = (mid: unknown, krId: unknown) => {
    if (mid == null || mid === '') return;
    milestoneIds.add(String(mid));
    if (krId != null && krId !== '') keyResultIds.add(String(krId));
  };

  const extractIds = (task: any) => {
    const planTask = task?.planTask ?? task;
    const mid =
      planTask?.milestoneId ??
      planTask?.milestone?.id ??
      task?.milestoneId ??
      task?.milestone?.id ??
      task?.outcomeMilestoneId ??
      planTask?.outcomeMilestoneId ??
      null;
    const krId =
      planTask?.keyResultId ??
      planTask?.keyResult?.id ??
      task?.keyResultId ??
      task?.keyResult?.id ??
      null;
    const achieveMK = !!(
      planTask?.achieveMK ||
      task?.achieveMK ||
      planTask?.mkAsATask ||
      task?.mkAsATask
    );
    return { mid, krId, achieveMK, planTask };
  };

  const visitTask = (task: any) => {
    if (!task) return;
    const { mid, krId, achieveMK } = extractIds(task);
    if (mid == null) return;

    const status = String(task.status ?? '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');
    const isDone =
      status === 'done' ||
      status === 'completed' ||
      status === 'complete' ||
      status === 'achieved' ||
      task?.isAchieved === true;

    // Cancel/delete: reopen every milestone linked on this report.
    if (mode === 'cancel' && (achieveMK || mid != null)) {
      addMilestone(mid, krId);
      return;
    }

    // Approve/reject: Done+achieveMK (or sticky-remembered mid on this report).
    if (isDone && (achieveMK || remembered.has(String(mid)))) {
      addMilestone(mid, krId);
    }
  };

  const forEachMatchingReport = (visit: (report: any) => void) => {
    for (const [, data] of entries) {
      const reports = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.items)
          ? (data as any).items
          : data
            ? [data]
            : [];
      for (const report of reports) {
        if (!report || String(report.id) !== String(reportId)) continue;
        visit(report);
      }
    }
  };

  forEachMatchingReport((report) => {
    const reportTasks =
      report.reportTask ?? report.reportTasks ?? report.tasks ?? [];
    if (Array.isArray(reportTasks)) reportTasks.forEach(visitTask);

    const nestedTasks = report?.plan?.tasks ?? report?.planTask ?? [];
    if (Array.isArray(nestedTasks)) nestedTasks.forEach(visitTask);

    const keyResults = report?.keyResults ?? report?.plan?.keyResults ?? [];
    if (Array.isArray(keyResults)) {
      keyResults.forEach((kr: any) => {
        (kr?.tasks ?? []).forEach(visitTask);
        (kr?.milestones ?? []).forEach((ms: any) => {
          if (ms?.id != null && mode === 'cancel') {
            addMilestone(ms.id, kr?.id ?? kr?.keyResultId);
          }
          (ms?.tasks ?? []).forEach(visitTask);
        });
      });
    }
  });

  // Safety net: sticky-disabled mids that appear on this report's tasks.
  if (remembered.size > 0) {
    forEachMatchingReport((report) => {
      const reportTasks =
        report.reportTask ?? report.reportTasks ?? report.tasks ?? [];
      if (!Array.isArray(reportTasks)) return;
      reportTasks.forEach((task: any) => {
        const { mid, krId } = extractIds(task);
        if (mid != null && remembered.has(String(mid))) {
          addMilestone(mid, krId);
        }
      });
    });
  }

  return {
    milestoneIds: Array.from(milestoneIds),
    keyResultIds: Array.from(keyResultIds),
  };
}

export const useApprovalPlanningPeriods = () => {
  const queryClient = useQueryClient();
  return useMutation(approveOrRejectPlanningPeriods, {
    onSuccess: () => {
      void invalidatePlanningCaches(queryClient);
      NotificationMessage.success({
        message: 'Successfully updated',
        description: 'okr plan status successfully updated',
      });
    },
  });
};

export const useCreateReportForUnReportedtasks = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({
      values,
      planningPeriodId,
      planId,
      applyToOkr = true,
    }: {
      values: any;
      planningPeriodId: string;
      planId?: string;
      /** When false, this cadence is tracking-only and must not write OKR. */
      applyToOkr?: boolean;
      /** Milestone IDs completed by this report (Done + achieveMK). */
      achievedMilestoneIds?: Array<string | number | null | undefined>;
    }) =>
      createReportForUnReportedtasks(
        values,
        planningPeriodId,
        planId,
        applyToOkr,
      ),
    {
      onSuccess: (data, variables) => {
        void data;
        const applyToOkr = variables.applyToOkr !== false;
        if (applyToOkr) {
          applyAchievedMilestoneIds(queryClient, variables.achievedMilestoneIds);
        }
        void invalidateReportingCaches(queryClient, { applyToOkr });
        void invalidatePlanningCaches(queryClient);
        if (applyToOkr) {
          scheduleOkrMilestoneStatusRefetch(
            queryClient,
            750,
            variables.achievedMilestoneIds,
          );
          scheduleDashboardAndVpRefetch(queryClient, 1000);
        }
        NotificationMessage.success({
          message: 'Successfully updated',
          description: applyToOkr
            ? 'OKR plan status successfully updated'
            : 'Report submitted for tracking',
        });
      },
    },
  );
};

export const useEditReportByReportId = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({
      values,
      selectedReportId,
      applyToOkr = true,
    }: {
      values: any;
      selectedReportId: string;
      applyToOkr?: boolean;
      achievedMilestoneIds?: Array<string | number | null | undefined>;
      reportTaskStatuses?: Record<
        string,
        {
          status?: string;
          actualValue?: number;
          customReason?: string;
        }
      >;
    }) => editReport(values, selectedReportId, applyToOkr),
    {
      onSuccess: async (data, variables) => {
        void data;
        const applyToOkr = variables.applyToOkr !== false;
        if (applyToOkr) {
          applyAchievedMilestoneIds(queryClient, variables.achievedMilestoneIds);
        }
        if (variables.selectedReportId && variables.reportTaskStatuses) {
          patchReportTaskStatusesInCaches(
            queryClient,
            variables.selectedReportId,
            variables.reportTaskStatuses,
          );
        }
        await invalidateReportingCaches(queryClient, { applyToOkr });
        // Stale refetch often lands with old Done — re-apply sticky overrides.
        if (variables.selectedReportId && variables.reportTaskStatuses) {
          patchReportTaskStatusesInCaches(
            queryClient,
            variables.selectedReportId,
            variables.reportTaskStatuses,
          );
        }
        if (applyToOkr) {
          scheduleOkrMilestoneStatusRefetch(
            queryClient,
            750,
            variables.achievedMilestoneIds,
          );
          scheduleDashboardAndVpRefetch(queryClient, 1000);
        }
        NotificationMessage.success({
          message: 'Successfully updated',
          description: applyToOkr
            ? 'OKR plan status successfully updated'
            : 'Report submitted for tracking',
        });
      },
    },
  );
};

export const useDeletePlanById = () => {
  const queryClient = useQueryClient();

  return useMutation(deletePlanById, {
    onSuccess: () => {
      void invalidatePlanningCaches(queryClient);
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'OKR plan Deleted successfully',
      });
    },
  });
};
export const useDeleteReportById = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteReportById, {
    onSuccess: (data, reportId) => {
      void data;
      const { milestoneIds, keyResultIds } =
        collectMilestoneIdsFromApprovedReport(
          queryClient,
          String(reportId),
          'cancel',
        );
      if (milestoneIds.length > 0 || keyResultIds.length > 0) {
        markMilestonesReopenedInOkrCaches(queryClient, {
          milestoneIds,
          keyResultIds,
        });
      }
      void invalidateReportingCaches(queryClient);
      void invalidatePlanningCaches(queryClient);
      scheduleOkrMilestoneStatusRefetch(queryClient);
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'OKR report cancelled; plan restored',
      });
    },
  });
};

export const useApprovalReporting = () => {
  const queryClient = useQueryClient();
  return useMutation(approveOrRejectReporting, {
    onSuccess: (data, variables) => {
      void data;
      const applyToOkr = variables?.applyToOkr !== false;
      let achievedIds: string[] = [];
      if (variables?.id && applyToOkr) {
        const { milestoneIds, keyResultIds } =
          collectMilestoneIdsFromApprovedReport(
            queryClient,
            String(variables.id),
          );
        if (variables?.value === true) {
          achievedIds = milestoneIds;
          applyAchievedMilestoneIds(queryClient, achievedIds);
        } else {
          // Reject / Open approved report → re-enable those milestones for planning.
          markMilestonesReopenedInOkrCaches(queryClient, {
            milestoneIds,
            keyResultIds,
          });
        }
      }
      void invalidateReportingCaches(queryClient, { applyToOkr });
      if (applyToOkr) {
        scheduleOkrMilestoneStatusRefetch(queryClient, 750, achievedIds);
        scheduleDashboardAndVpRefetch(queryClient, 1000);
      }
      NotificationMessage.success({
        message: 'Successfully updated',
        description: applyToOkr
          ? 'okr plan status successfully updated'
          : 'Report status updated',
      });
    },
  });
};

export const useUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({
      id,
      status,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      planningPeriodId,
      // eslint-enable-next-line @typescript-eslint/no-unused-vars
    }: {
      id: string;
      status: string;
      planningPeriodId?: string;
    }) => updateStatus(id, status),
    {
      onSuccess: (
        /* eslint-disable-next-line @typescript-eslint/naming-convention */
        _data /* eslint-enable-next-line @typescript-eslint/naming-convention */,
        variables,
      ) => {
        const { planningPeriodId } = variables;
        queryClient.invalidateQueries('defaultPlanningPeriods');
        void invalidatePlanningCaches(queryClient);
        scheduleOkrMilestoneStatusRefetch(queryClient);
        if (planningPeriodId) {
          queryClient.invalidateQueries(['okrPlannedData', planningPeriodId]);
        }
      },
    },
  );
};
