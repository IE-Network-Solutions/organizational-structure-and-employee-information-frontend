import { useMutation, useQueryClient } from 'react-query';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const approveOrRejectPlanningPeriods = async (planningData: any) => {
  const token = useAuthenticationStore.getState().token;
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
  const token = useAuthenticationStore.getState().token;
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
  const token = useAuthenticationStore.getState().token;
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
  const token = useAuthenticationStore.getState().token;
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
  const token = useAuthenticationStore.getState().token; // Assuming you have a way to get the token
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
const editReport = async (values: any, selectedReportId: string) => {
  const token = useAuthenticationStore.getState().token; // Assuming you have a way to get the token
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
  const token = useAuthenticationStore.getState().token;
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
        queryClient.invalidateQueries('okrPlannedData');
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
        queryClient.invalidateQueries('okrPlan');
        queryClient.invalidateQueries(['okrPlannedData', planningPeriodId]);
      },
    },
  );
};
