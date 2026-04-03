import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';

import { useMutation, useQueryClient } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;
const createOkrRule = async (values: any) => {
  const token = await getCurrentToken();
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/average-okr-rule`,
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
      description: 'Okr Rule successfully Created.',
    });
  } catch (error) {
    // Handle error (optional)
    throw error; // Re-throw error if needed for further handling
  }
};
export const UpdateOkrRule = async (values: Record<string, string>) => {
  const token = await getCurrentToken();
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/average-okr-rule/${values?.id}`,
      method: 'PUT',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        tenantId: tenantId, // Pass tenantId in the headers
      },
    });
    NotificationMessage.success({
      message: 'Successfully Updated',
      description: 'Okr Rule successfully Updated.',
    });
  } catch (error) {
    // Handle error (optional)
    throw error; // Re-throw error if needed for further handling
  }
};

const deleteOkrRule = async (deletedId: string) => {
  const token = await getCurrentToken();
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/average-okr-rule/${deletedId}`,
      method: 'DELETE',
      headers,
    });
    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Okr Rule successfully deleted.',
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useDeleteOkrRule = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteOkrRule, {
    onSuccess: () => {
      queryClient.invalidateQueries('okrRule');
    },
  });
};
export const useCreateOkrRule = () => {
  const queryClient = useQueryClient();
  return useMutation(createOkrRule, {
    onSuccess: () => {
      queryClient.invalidateQueries('okrRule');
    },
  });
};
export const useUpdateOkrRule = () => {
  const queryClient = useQueryClient();
  return useMutation(UpdateOkrRule, {
    onSuccess: () => {
      queryClient.invalidateQueries('okrRule');
    },
  });
};

const assignAverageOkrRuleToUser = async (values: {
  userIds: string[];
  averageOkrRuleId: string;
}) => {
  const token = await getCurrentToken();
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/average-okr-rule/assign/user`,
      method: 'POST',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
    NotificationMessage.success({
      message: 'Successfully assigned',
      description: 'Average OKR rule has been assigned to the user.',
    });
  } catch (error) {
    throw error;
  }
};

const removeAverageOkrRuleFromUser = async (userId: string) => {
  const token = await getCurrentToken();
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/average-okr-rule/assign/user/${userId}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
    NotificationMessage.success({
      message: 'Successfully removed',
      description: 'Average OKR rule assignment has been removed.',
    });
  } catch (error) {
    throw error;
  }
};

export const useAssignAverageOkrRuleToUser = () => {
  const queryClient = useQueryClient();
  return useMutation(assignAverageOkrRuleToUser, {
    onSuccess: (data, variables) => {
      variables.userIds?.forEach((userId) => {
        queryClient.invalidateQueries(['averageOkrRuleByUser', userId]);
      });
      queryClient.invalidateQueries('okrRule');
    },
  });
};

export const useRemoveAverageOkrRuleFromUser = () => {
  const queryClient = useQueryClient();
  return useMutation(removeAverageOkrRuleFromUser, {
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries(['averageOkrRuleByUser', userId]);
    },
  });
};
