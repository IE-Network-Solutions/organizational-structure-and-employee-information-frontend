import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;
// const logUserId = useAuthenticationStore.getState().userId;
const createObjective = async (values: any) => {
  const token = await getCurrentToken();
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/objective`,
      method: 'POST',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        tenantId: tenantId, // Pass tenantId in the headers
      },
    });

    // Assuming success if no error is thrown
    NotificationMessage.success({
      message: 'Successfully Created',
      description: 'Objective successfully Created.',
    });
  } catch (error) {
    // Handle error (optional)
    throw error; // Re-throw error if needed for further handling
  }
};
export const UpdateObjective = async (values: any) => {
  const token = await getCurrentToken();
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/objective/${values?.id}`,
      method: 'PUT',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        tenantId: tenantId, // Pass tenantId in the headers
      },
    });
    NotificationMessage.success({
      message: 'Successfully Updated',
      description: 'Objective successfully Updated.',
    });
  } catch (error) {
    // Handle error (optional)
    throw error; // Re-throw error if needed for further handling
  }
};

const deleteObjective = async (deletedId: string) => {
  const token = await getCurrentToken();
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/objective/${deletedId}`,
      method: 'DELETE',
      headers,
    });
    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Objective successfully deleted.',
    });

    return response.data;
  } catch (error: any) {
    // Extract error message from backend response
    let errorMessage = 'Failed to delete objective';
    let errorDescription = 'An unexpected error occurred';

    if (error?.response?.data) {
      const errorData = error.response.data;

      // Handle different error response formats
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.message) {
        errorMessage = errorData.message;
        errorDescription = errorData.details || errorData.error || '';
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // Show error notification
    NotificationMessage.error({
      message: errorMessage,
      description: errorDescription,
    });

    throw error;
  }
};

const getAuthHeaders = async () => {
  const token = await getCurrentToken();
  return {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
};

export const updateKeyResultRequest = async (
  values: any,
  options?: { notify?: boolean },
) => {
  const headers = await getAuthHeaders();
  const response = await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/key-results/${values?.id}`,
    method: 'PUT',
    data: values,
    headers,
  });
  if (options?.notify !== false) {
    NotificationMessage.success({
      message: 'Successfully Updated',
      description: 'Key result successfully Updated.',
    });
  }
  return response;
};

export const updateKeyResult = async (values: any) => {
  try {
    return await updateKeyResultRequest(values, { notify: true });
  } catch (error) {
    throw error;
  }
};
const deleteKeyResult = async (deletedId: string) => {
  const token = await getCurrentToken();
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/key-results/${deletedId}`,
      method: 'DELETE',
      headers,
    });
    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Key result successfully deleted.',
    });

    return response.data;
  } catch (error: any) {
    // Extract error message from backend response
    let errorMessage = 'Failed to delete key result';
    let errorDescription = 'An unexpected error occurred';

    if (error?.response?.data) {
      const errorData = error.response.data;

      // Handle different error response formats
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.message) {
        errorMessage = errorData.message;
        errorDescription = errorData.details || errorData.error || '';
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // Show error notification
    NotificationMessage.error({
      message: errorMessage,
      description: errorDescription,
    });

    throw error;
  }
};
export const deleteMilestoneRequest = async (
  deletedId: string,
  options?: { notify?: boolean },
) => {
  const headers = await getAuthHeaders();
  const response = await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/milestones/${deletedId}`,
    method: 'DELETE',
    headers,
  });
  if (options?.notify !== false) {
    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Milestone deleted successfully.',
    });
  }
  return response;
};

const deleteMilestone = async (deletedId: string) => {
  try {
    return await deleteMilestoneRequest(deletedId, { notify: true });
  } catch (error) {
    throw error;
  }
};

// Function to update the remaining key results
const updateKeyResults = async (data: any) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/key-results/bulk-update/objectives/${data?.objectiveId}`,
    method: 'PUT',
    data,
    headers: requestHeaders,
  });
};
const downloadEmployeeOkrScore = async (data: any) => {
  const requestHeaders = await requestHeader();
  try {
    // const payload = {
    //   ...data,
    //   updatedBy: logUserId,
    //   createdBy: logUserId,
    // };
    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/objective/export-okr-progress/all-employees/export`,
      method: 'POST',
      data,
      headers: requestHeaders,
      skipEncryption: true, // Skip encryption for file downloads
      responseType: 'blob', // Tell axios to handle binary data
    });

    // Response is already a blob from the API when responseType is 'blob'
    const blob =
      response instanceof Blob
        ? response
        : new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = 'Employee okr score export.xlsx';

    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};

export const useUpdateObjectiveNestedDelete = () => {
  const queryClient = useQueryClient();
  return useMutation(updateKeyResults, {
    onSuccess: () => {
      queryClient.invalidateQueries('ObjectiveInformation');
      queryClient.invalidateQueries(['okrPlans']);
      queryClient.invalidateQueries(['okrPlansKrPanel']);
      queryClient.invalidateQueries(['okrUserPlans']);
      queryClient.invalidateQueries(['okrReports']);
      queryClient.invalidateQueries(['okrReportsKrPanel']);
      queryClient.invalidateQueries(['okrReport']);
      // Refetch all ObjectiveDashboard queries
      queryClient.refetchQueries('ObjectiveDashboard');
    },
  });
};

export const useDeleteObjective = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteObjective, {
    onSuccess: () => {
      queryClient.invalidateQueries('ObjectiveInformation');
      queryClient.invalidateQueries(['okrPlans']);
      queryClient.invalidateQueries(['okrPlansKrPanel']);
      queryClient.invalidateQueries(['okrUserPlans']);
      queryClient.invalidateQueries(['okrReports']);
      queryClient.invalidateQueries(['okrReportsKrPanel']);
      queryClient.invalidateQueries(['okrReport']);
      // Refetch all ObjectiveDashboard queries
      queryClient.refetchQueries('ObjectiveDashboard');
    },
    onError: () => {
      // Error handling is done in deleteObjective function
      // This prevents double error notifications
    },
  });
};
export const useCreateObjective = () => {
  const queryClient = useQueryClient();
  return useMutation(createObjective, {
    onSuccess: () => {
      queryClient.invalidateQueries('ObjectiveInformation');
      queryClient.invalidateQueries(['okrPlans']);
      queryClient.invalidateQueries(['okrPlansKrPanel']);
      queryClient.invalidateQueries(['okrUserPlans']);
      queryClient.invalidateQueries(['okrReports']);
      queryClient.invalidateQueries(['okrReportsKrPanel']);
      queryClient.invalidateQueries(['okrReport']);
      // Refetch all ObjectiveDashboard queries
      queryClient.refetchQueries('ObjectiveDashboard');
    },
  });
};
export const useUpdateObjective = () => {
  const queryClient = useQueryClient();
  return useMutation(UpdateObjective, {
    onSuccess: () => {
      queryClient.invalidateQueries('ObjectiveInformation');
      queryClient.invalidateQueries(['okrPlans']);
      queryClient.invalidateQueries(['okrPlansKrPanel']);
      queryClient.invalidateQueries(['okrUserPlans']);
      queryClient.invalidateQueries(['okrReports']);
      queryClient.invalidateQueries(['okrReportsKrPanel']);
      queryClient.invalidateQueries(['okrReport']);
      // Refetch all ObjectiveDashboard queries
      queryClient.refetchQueries('ObjectiveDashboard');
    },
  });
};

export const useUpdateKeyResult = () => {
  const queryClient = useQueryClient();
  return useMutation(updateKeyResult, {
    onSuccess: (data, variables) => {
      void data;
      queryClient.invalidateQueries('ObjectiveInformation');
      queryClient.invalidateQueries(['okrPlans']);
      queryClient.invalidateQueries(['okrPlansKrPanel']);
      queryClient.invalidateQueries(['okrUserPlans']);
      queryClient.invalidateQueries(['okrReports']);
      queryClient.invalidateQueries(['okrReportsKrPanel']);
      queryClient.invalidateQueries(['okrReport']);
      if (variables?.id) {
        queryClient.invalidateQueries([
          'keyResultForEdit',
          String(variables.id),
        ]);
        queryClient.invalidateQueries(['keyResult', String(variables.id)]);
      }
      // Refetch all ObjectiveDashboard queries
      queryClient.refetchQueries('ObjectiveDashboard');
    },
  });
};
export const useDeleteKeyResult = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteKeyResult, {
    onSuccess: () => {
      queryClient.invalidateQueries('ObjectiveInformation');
      queryClient.invalidateQueries(['okrPlans']);
      queryClient.invalidateQueries(['okrPlansKrPanel']);
      queryClient.invalidateQueries(['okrUserPlans']);
      queryClient.invalidateQueries(['okrReports']);
      queryClient.invalidateQueries(['okrReportsKrPanel']);
      queryClient.invalidateQueries(['okrReport']);
      // Refetch all ObjectiveDashboard queries
      queryClient.refetchQueries('ObjectiveDashboard');
    },
    onError: () => {
      // Error handling is done in deleteKeyResult function
      // This prevents double error notifications
    },
  });
};
export const useDeleteMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteMilestone, {
    onSuccess: () => {
      queryClient.invalidateQueries('ObjectiveInformation');
      queryClient.invalidateQueries(['okrPlans']);
      queryClient.invalidateQueries(['okrPlansKrPanel']);
      queryClient.invalidateQueries(['okrUserPlans']);
      queryClient.invalidateQueries(['okrReports']);
      queryClient.invalidateQueries(['okrReportsKrPanel']);
      queryClient.invalidateQueries(['okrReport']);
      queryClient.invalidateQueries('keyResultForEdit');
      queryClient.invalidateQueries('keyResult');
      // Refetch all ObjectiveDashboard queries
      queryClient.refetchQueries('ObjectiveDashboard');
    },
  });
};
export const useDownloadEmployeeOkrScore = () => {
  const queryClient = useQueryClient();
  return useMutation(downloadEmployeeOkrScore, {
    onSuccess: () => {
      queryClient.invalidateQueries('ObjectiveInformation');
    },
  });
};
