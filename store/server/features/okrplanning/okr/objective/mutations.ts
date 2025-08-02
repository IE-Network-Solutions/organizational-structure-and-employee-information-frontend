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
  const requestHeaders = await requestHeader();
  await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/objective/${deletedId}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
  NotificationMessage.success({
    message: 'Successfully Deleted',
    description: 'Objective successfully deleted.',
  });
};

export const updateKeyResult = async (values: any) => {
  const token = await getCurrentToken();
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/key-results/${values?.id}`,
      method: 'PUT',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        tenantId: tenantId, // Pass tenantId in the headers
      },
    });
    NotificationMessage.success({
      message: 'Successfully Updated',
      description: 'Key result successfully Updated.',
    });
  } catch (error) {
    // Handle error (optional)
    throw error; // Re-throw error if needed for further handling
  }
};
const deleteKeyResult = async (deletedId: string) => {
  const requestHeaders = await requestHeader();
  await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/key-results/${deletedId}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
  NotificationMessage.success({
    message: 'Successfully Deleted',
    description: 'Key result successfully deleted.',
  });
};
const deleteMilestone = async (deletedId: string) => {
  const requestHeaders = await requestHeader();
  await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/milestones/${deletedId}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
  NotificationMessage.success({
    message: 'Successfully Deleted',
    description: 'Milestone deleted successfully.',
  });
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
    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/objective/export-okr-progress/all-employees/export`,
      method: 'POST',
      headers: requestHeaders,
      data,
      skipEncryption: true, // For file download
    });
    const blob = new Blob([response], {
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
    },
  });
};

export const useDeleteObjective = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteObjective, {
    onSuccess: () => {
      queryClient.invalidateQueries('ObjectiveInformation');
    },
  });
};
export const useCreateObjective = () => {
  const queryClient = useQueryClient();
  return useMutation(createObjective, {
    onSuccess: () => {
      queryClient.invalidateQueries('ObjectiveInformation');
    },
  });
};
export const useUpdateObjective = () => {
  const queryClient = useQueryClient();
  return useMutation(UpdateObjective, {
    onSuccess: () => {
      queryClient.invalidateQueries('ObjectiveInformation');
    },
  });
};

export const useUpdateKeyResult = () => {
  const queryClient = useQueryClient();
  return useMutation(updateKeyResult, {
    onSuccess: () => {
      queryClient.invalidateQueries('ObjectiveInformation');
    },
  });
};
export const useDeleteKeyResult = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteKeyResult, {
    onSuccess: () => {
      queryClient.invalidateQueries('ObjectiveInformation');
    },
  });
};
export const useDeleteMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteMilestone, {
    onSuccess: () => {
      queryClient.invalidateQueries('ObjectiveInformation');
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
