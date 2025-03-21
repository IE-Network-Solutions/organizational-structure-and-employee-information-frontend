import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const createWeeklyPriority = async (values: any) => {
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/weekly-priorities/create`,
      method: 'POST',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        tenantId: tenantId, // Pass tenantId in the headers
      },
    });
  } catch (error) {
    // Handle error (optional)
    throw error; // Re-throw error if needed for further handling
  }
};
export const UpdateWeeklyPriority = async (values: any) => {
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/weekly-priorities/${values?.id}`,
      method: 'PATCH',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        tenantId: tenantId, // Pass tenantId in the headers
      },
    });
  } catch (error) {
    // Handle error (optional)
    throw error; // Re-throw error if needed for further handling
  }
};

const deleteWeeklyPriority = async (deletedId: string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.delete(
      `${OKR_AND_PLANNING_URL}/weekly-priorities/${deletedId}`,
      { headers },
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useDeleteWeeklyPriority = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteWeeklyPriority, {
    onSuccess: () => {
      queryClient.invalidateQueries('weeklyPriorities'); // Adjust the query key as necessary
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'Task removed successfully deleted.',
      });
    },
  });
};

export const useCreateWeeklyPriority = () => {
  const queryClient = useQueryClient();
  return useMutation(createWeeklyPriority, {
    onSuccess: () => {
      queryClient.invalidateQueries('weeklyPriorities'); // Adjust the query key as necessary
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Task removed successfully deleted.',
      });
    },
  });
};
export const useUpdateWeeklyPriority = () => {
  const queryClient = useQueryClient();
  return useMutation(UpdateWeeklyPriority, {
    onSuccess: () => {
      queryClient.invalidateQueries('weeklyPriorities'); // Adjust the query key as necessary
      NotificationMessage.success({
        message: 'Successfully Updated',
        description: 'Task removed successfully deleted.',
      });
    },
  });
};
