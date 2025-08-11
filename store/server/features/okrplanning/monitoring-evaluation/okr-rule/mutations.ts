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
  await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/average-okr-rule/${deletedId}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
  NotificationMessage.success({
    message: 'Successfully Deleted',
    description: 'Okr Rule successfully deleted.',
  });
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
