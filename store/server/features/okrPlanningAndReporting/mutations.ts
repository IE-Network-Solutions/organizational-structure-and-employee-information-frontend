import { useMutation, useQueryClient } from 'react-query';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { getCurrentToken } from '@/utils/getCurrentToken';
import {
  invalidateOkrPlanningCaches,
  markMilestonesCompletedInOkrCaches,
  scheduleOkrMilestoneStatusRefetch,
} from '@/utils/invalidateOkrPlanningCaches';

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

  return await crudRequest({
    url: `${OKR_URL}/okr-report/validate/${reportingData?.id}?value=${String(reportingData?.value)}`,
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
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  const url = planId
    ? `${OKR_URL}/okr-report-task/create-report/${userId}/${planningPeriodId}?planningId=${planId}`
    : `${OKR_URL}/okr-report-task/create-report/${userId}/${planningPeriodId}`;

  return await crudRequest({
    url,
    method: 'POST',
    data: values,
    headers,
  });
};
const editReport = async (values: any, selectedReportId: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${OKR_URL}/okr-report-task/update-report-tasks/${selectedReportId}`,
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
 */
function collectMilestoneIdsFromApprovedReport(
  queryClient: ReturnType<typeof useQueryClient>,
  reportId: string,
): string[] {
  const ids = new Set<string>();
  const entries = [
    ...queryClient.getQueriesData(['okrReports']),
    ...queryClient.getQueriesData(['okrReport']),
  ];

  const visitTask = (task: any) => {
    if (!task) return;
    const status = String(task.status ?? '').toLowerCase();
    if (status !== 'done' && status !== 'completed') return;
    const planTask = task.planTask ?? task;
    const achieveMK = !!(planTask?.achieveMK || task?.achieveMK);
    const mid =
      planTask?.milestoneId ??
      planTask?.milestone?.id ??
      task?.milestoneId ??
      task?.milestone?.id ??
      null;
    if (achieveMK && mid != null) ids.add(String(mid));
  };

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
      const reportTasks =
        report.reportTask ?? report.reportTasks ?? report.tasks ?? [];
      if (Array.isArray(reportTasks)) {
        reportTasks.forEach(visitTask);
      }
    }
  }

  return Array.from(ids);
}

export const useApprovalPlanningPeriods = () => {
  const queryClient = useQueryClient();
  return useMutation(approveOrRejectPlanningPeriods, {
    onSuccess: async () => {
      await invalidateOkrPlanningCaches(queryClient);
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
    }: {
      values: any;
      planningPeriodId: string;
      planId?: string;
      /** Milestone IDs completed by this report (Done + achieveMK). */
      achievedMilestoneIds?: Array<string | number | null | undefined>;
    }) => createReportForUnReportedtasks(values, planningPeriodId, planId),
    {
      onSuccess: async (data, variables) => {
        void data;
        applyAchievedMilestoneIds(queryClient, variables.achievedMilestoneIds);
        await invalidateOkrPlanningCaches(queryClient);
        scheduleOkrMilestoneStatusRefetch(queryClient);
        NotificationMessage.success({
          message: 'Successfully updated',
          description: 'OKR plan status successfully updated',
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
    }: {
      values: any;
      selectedReportId: string;
      achievedMilestoneIds?: Array<string | number | null | undefined>;
    }) => editReport(values, selectedReportId),
    {
      onSuccess: async (data, variables) => {
        void data;
        applyAchievedMilestoneIds(queryClient, variables.achievedMilestoneIds);
        await invalidateOkrPlanningCaches(queryClient);
        scheduleOkrMilestoneStatusRefetch(queryClient);
        NotificationMessage.success({
          message: 'Successfully updated',
          description: 'OKR plan status successfully updated',
        });
      },
    },
  );
};

export const useDeletePlanById = () => {
  const queryClient = useQueryClient();

  return useMutation(deletePlanById, {
    onSuccess: async () => {
      await invalidateOkrPlanningCaches(queryClient);
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
    onSuccess: async () => {
      await invalidateOkrPlanningCaches(queryClient);
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
    onSuccess: async (data, variables) => {
      void data;
      if (variables?.value === true && variables?.id) {
        const achievedIds = collectMilestoneIdsFromApprovedReport(
          queryClient,
          String(variables.id),
        );
        applyAchievedMilestoneIds(queryClient, achievedIds);
      }
      await invalidateOkrPlanningCaches(queryClient);
      scheduleOkrMilestoneStatusRefetch(queryClient);
      NotificationMessage.success({
        message: 'Successfully updated',
        description: 'okr plan status successfully updated',
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
      onSuccess: async (
        /* eslint-disable-next-line @typescript-eslint/naming-convention */
        _data /* eslint-enable-next-line @typescript-eslint/naming-convention */,
        variables,
      ) => {
        const { planningPeriodId } = variables;
        queryClient.invalidateQueries('defaultPlanningPeriods');
        await invalidateOkrPlanningCaches(queryClient);
        scheduleOkrMilestoneStatusRefetch(queryClient);
        if (planningPeriodId) {
          queryClient.invalidateQueries(['okrPlannedData', planningPeriodId]);
        }
      },
    },
  );
};
