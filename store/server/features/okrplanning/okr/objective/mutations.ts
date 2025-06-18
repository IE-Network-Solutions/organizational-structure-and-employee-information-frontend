import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const logUserId = useAuthenticationStore.getState().userId;
const createObjective = async (values: any) => {
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
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.delete(
      `${OKR_AND_PLANNING_URL}/objective/${deletedId}`,
      { headers },
    );
    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Objective successfully deleted.',
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateKeyResult = async (values: any) => {
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
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.delete(
      `${OKR_AND_PLANNING_URL}/key-results/${deletedId}`,
      { headers },
    );
    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Key result successfully deleted.',
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
const deleteMilestone = async (deletedId: string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.delete(
      `${OKR_AND_PLANNING_URL}/milestones/${deletedId}`,
      { headers },
    );
    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Milestone deleted successfully.',
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to update the remaining key results
const updateKeyResults = async (data: any) => {
  return await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/key-results/bulk-update/objectives/${data?.objectiveId}`,
    method: 'PUT',
    data,
    headers: requestHeader(),
  });
};
const downloadEmployeeOkrScore = async (data: any) => {
  try {
    const payload = {
      ...data,
      updatedBy: logUserId,
      createdBy: logUserId,
    };
    const response = await axios.post(
      `${OKR_AND_PLANNING_URL}/objective/export-okr-progress/all-employees/export`,
      payload,
      {
        headers: {
          ...requestHeader(),
        },
        responseType: 'blob', // Important for file download!
      },
    );
    const blob = new Blob([response.data], {
      type: response.headers['content-type'],
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const disposition = response.headers['content-disposition'];
    let fileName = 'Employee okr score export.xlsx';
    if (disposition && disposition.includes('filename=')) {
      fileName = disposition.split('filename=')[1].replace(/"/g, '');
    }

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
