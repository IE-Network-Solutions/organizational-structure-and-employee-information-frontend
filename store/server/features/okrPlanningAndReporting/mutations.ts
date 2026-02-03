import { useMutation, useQueryClient } from 'react-query';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { getCurrentToken } from '@/utils/getCurrentToken';

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
  const token = await getCurrentToken(); // Assuming you have a way to get the token
  const tenantId = useAuthenticationStore.getState().tenantId; // Assuming you have a way to get the tenantId
  const userId = useAuthenticationStore.getState().userId; // Assuming you have a way to get the userId

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

// Create report without OKR calculations (for basic-okr)
const createBasicReport = async (
  reportData: any,
  sessionId?: string,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers: Record<string, string> = {
    tenantId: String(tenantId ?? ''),
    Authorization: `Bearer ${token}`,
  };

  // Add sessionId to headers if provided
  if (sessionId) {
    headers.sessionId = String(sessionId);
  }

  // Ensure body has required string fields for CreateReportDTO
  const body = {
    ...reportData,
    reportTitle: String(reportData.reportTitle ?? ''),
    userId: String(reportData.userId ?? ''),
    status: String(reportData.status ?? ''),
    reportScore: String(reportData.reportScore ?? '0'),
    tenantId: String(tenantId ?? ''),
  };

  return await crudRequest({
    url: `${OKR_URL}/okr-report/create-report`,
    method: 'POST',
    data: body,
    headers,
  });
};
const editReport = async (values: any, selectedReportId: string) => {
  const token = await getCurrentToken(); // Assuming you have a way to get the token
  const tenantId = useAuthenticationStore.getState().tenantId; // Assuming you have a way to get the tenantId

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
export const useApprovalPlanningPeriods = () => {
  const queryClient = useQueryClient();
  return useMutation(approveOrRejectPlanningPeriods, {
    onSuccess: () => {
      queryClient.invalidateQueries('okrPlans');
      queryClient.invalidateQueries('okrUserPlans');
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
    }) => createReportForUnReportedtasks(values, planningPeriodId, planId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('okrReports');
        queryClient.invalidateQueries('okrPlans');
        queryClient.invalidateQueries('okrUserPlans');
        queryClient.invalidateQueries('okrPlannedData');
        queryClient.invalidateQueries('planningPeriodsHierarchy');
        NotificationMessage.success({
          message: 'Successfully updated',
          description: 'OKR plan status successfully updated',
        });
      },
    },
  );
};

// Hook for creating basic reports without OKR calculations (for basic-okr)
export const useCreateBasicReport = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({
      reportData,
      sessionId,
    }: {
      reportData: any;
      sessionId?: string;
    }) => createBasicReport(reportData, sessionId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('okrReports');
        queryClient.invalidateQueries('okrPlans');
        queryClient.invalidateQueries('okrUserPlans');
        queryClient.invalidateQueries('okrPlannedData');
        queryClient.invalidateQueries('planningPeriodsHierarchy');
        NotificationMessage.success({
          message: 'Successfully created',
          description: 'Report created successfully',
        });
      },
      onError: () => {
        NotificationMessage.error({
          message: 'Creating Failed',
          description: 'Failed to create report',
        });
      },
    },
  );
};

export const useEditReportByReportId = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ values, selectedReportId }: { values: any; selectedReportId: string }) =>
      editReport(values, selectedReportId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('okrReports');
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
    onSuccess: () => {
      queryClient.invalidateQueries('okrPlans');
      queryClient.invalidateQueries('okrUserPlans');
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
    onSuccess: () => {
      queryClient.invalidateQueries('okrReports');
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'OKR plan Deleted successfully',
      });
    },
  });
};

export const useApprovalReporting = () => {
  const queryClient = useQueryClient();
  return useMutation(approveOrRejectReporting, {
    onSuccess: () => {
      queryClient.invalidateQueries('okrReports');
      NotificationMessage.success({
        message: 'Successfully updated',
        description: 'okr plan status successfully updated',
      });
    },
  });
};

// Backend PlanTaskStatus: pre_pending | pre_failed | pre_achieved | in-progress (deprecated) | completed (deprecated)
function backendStatusToFrontend(backendStatus: string): 'completed' | 'failed' | 'pending' {
  if (!backendStatus) return 'pending';
  const s = backendStatus.toLowerCase();
  if (s === 'pre_achieved' || s === 'completed') return 'completed';
  if (s === 'pre_failed') return 'failed';
  return 'pending'; // pre_pending, in-progress, or unknown
}

function updateOkrPlansTaskStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  taskId: string,
  backendStatus: string,
) {
  const frontendStatus = backendStatusToFrontend(backendStatus);
  const isAchieved = frontendStatus === 'completed';
  const isFailed = frontendStatus === 'failed';

  // react-query v3: getQueriesData(['okrPlans']) returns all queries whose key starts with ['okrPlans']
  const queries = queryClient.getQueriesData<{ items?: any[] }>(['okrPlans']);
  queries.forEach(([queryKey, data]) => {
    if (!data?.items || !Array.isArray(data.items)) return;
    const updatedItems = data.items.map((plan: any) => {
      if (!plan.tasks || !Array.isArray(plan.tasks)) return plan;
      // Update task status in plan.tasks array
      const updatedTasks = plan.tasks.map((task: any) =>
        String(task.id) === String(taskId)
          ? { 
              ...task, 
              status: frontendStatus, // Frontend status: 'completed' | 'failed' | 'pending'
              isAchieved, // Backend field for achieved status - MUST be set correctly
              isFailed: isFailed, // Also set isFailed for consistency
              // Ensure status field is set to frontend value so enrichment logic uses it
            }
          : task
      );
      return { ...plan, tasks: updatedTasks };
    });
    queryClient.setQueryData(queryKey, { ...data, items: updatedItems });
  });
}

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
      onMutate: async (variables) => {
        // Optimistically update cache immediately
        updateOkrPlansTaskStatus(queryClient, variables.id, variables.status);
      },
      onSuccess: (
        /* eslint-disable-next-line @typescript-eslint/naming-convention */
        apiResponse /* eslint-enable-next-line @typescript-eslint/naming-convention */,
        variables,
      ) => {
        const { planningPeriodId, status } = variables;
        // Use status from API response if available, otherwise use the one we sent
        const actualStatus = apiResponse?.status || status;
        // Update cache again with confirmed status from backend (optimistic update already done in onMutate)
        updateOkrPlansTaskStatus(queryClient, variables.id, actualStatus);
        
        // Only invalidate queries that don't affect the current plan list view
        // Don't invalidate okrPlans/okrUserPlans immediately to prevent race condition
        // where refetch returns stale data and overwrites our optimistic update
        queryClient.invalidateQueries('defaultPlanningPeriods');
        queryClient.invalidateQueries('okrPlan');
        queryClient.invalidateQueries(['okrPlannedData', planningPeriodId]);
        
        // Note: We intentionally don't invalidate 'okrPlans' and 'okrUserPlans' here
        // The optimistic update will persist, and the next natural refetch (user action, filter change, etc.)
        // will get the correct data from backend
        
        NotificationMessage.success({
          message: 'Successfully Updated',
          description: 'Task status updated successfully',
        });
      },
      onError: () => {
        // On error, revert optimistic update by invalidating
        queryClient.invalidateQueries('okrPlans');
        queryClient.invalidateQueries('okrUserPlans');
        NotificationMessage.error({
          message: 'Update Failed',
          description: 'Failed to update task status',
        });
      },
    },
  );
};
