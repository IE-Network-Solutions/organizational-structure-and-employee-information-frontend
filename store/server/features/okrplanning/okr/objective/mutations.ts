import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
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
const updateKeyResults = async (updatedKeyResults: any[]) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };

    await axios.put(
      `${OKR_AND_PLANNING_URL}/key-results/bulk-update`,
      updatedKeyResults,
      {
        headers,
      },
    );

    NotificationMessage.success({
      message: 'Successfully Updated',
      description: 'Key results successfully updated after deletion.',
    });
  } catch (error) {
    NotificationMessage.error({
      message: 'Update Failed',
      description: 'Failed to update key result weights.',
    });
  }
};

export const useDeleteKeyResultAndUpdateWeight = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      deletedId,
      updatedKeyResults,
    }: {
      deletedId: string;
      updatedKeyResults: any[];
    }) => {
      // Step 1: Delete the key result
      await deleteKeyResult(deletedId);

      // Step 2: If there are remaining key results, update them
      if (updatedKeyResults.length > 0) {
        await updateKeyResults(updatedKeyResults);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('ObjectiveInformation');
      },
    },
  );
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
