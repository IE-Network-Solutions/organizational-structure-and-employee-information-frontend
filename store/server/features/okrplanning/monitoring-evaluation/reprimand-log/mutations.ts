import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const createRepLog = async (values: any) => {
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/reprimand-log`,
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
      description: 'Reprimand Given successfully.',
    });
  } catch (error) {
    // Handle error (optional)
    throw error; // Re-throw error if needed for further handling
  }
};
export const UpdateRepLog = async (values: Record<string, string>) => {
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/reprimand-log/${values?.id}`,
      method: 'PUT',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        tenantId: tenantId, // Pass tenantId in the headers
      },
    });
    NotificationMessage.success({
      message: 'Successfully Updated',
      description: 'Reprimand Given successfully Updated.',
    });
  } catch (error) {
    // Handle error (optional)
    throw error; // Re-throw error if needed for further handling
  }
};

const deleteRepLog = async (deletedId: string) => {
  await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/reprimand-log/${deletedId}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
  NotificationMessage.success({
    message: 'Successfully Deleted',
    description: 'Reprimand successfully deleted.',
  });
};

export const useDeleteRepLog = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteRepLog, {
    onSuccess: () => {
      queryClient.invalidateQueries('ReprimandLog');
    },
  });
};
export const useCreateRepLog = () => {
  const queryClient = useQueryClient();
  return useMutation(createRepLog, {
    onSuccess: () => {
      queryClient.invalidateQueries('ReprimandLog');
    },
  });
};
export const useUpdateRepLog = () => {
  const queryClient = useQueryClient();
  return useMutation(UpdateRepLog, {
    onSuccess: () => {
      queryClient.invalidateQueries('ReprimandLog');
    },
  });
};
