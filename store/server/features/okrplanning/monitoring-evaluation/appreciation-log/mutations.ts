import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const createAppLog = async (values: any) => {
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/appreciation-log`,
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
      description: 'Appreciation Given successfully.',
    });
  } catch (error) {
    // Handle error (optional)
    throw error; // Re-throw error if needed for further handling
  }
};
export const UpdateAppLog = async (values: Record<string, string>) => {
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/appreciation-log/${values?.id}`,
      method: 'PUT',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        tenantId: tenantId, // Pass tenantId in the headers
      },
    });
    NotificationMessage.success({
      message: 'Successfully Updated',
      description: 'Appreciation Given successfully Updated.',
    });
  } catch (error) {
    // Handle error (optional)
    throw error; // Re-throw error if needed for further handling
  }
};

const deleteAppLog = async (deletedId: string) => {
  await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/appreciation-log/${deletedId}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
  NotificationMessage.success({
    message: 'Successfully Deleted',
    description: 'Appreciation successfully deleted.',
  });
};

export const useDeleteAppLog = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAppLog, {
    onSuccess: () => {
      queryClient.invalidateQueries('appreciationLog');
    },
  });
};
export const useCreateAppLog = () => {
  const queryClient = useQueryClient();
  return useMutation(createAppLog, {
    onSuccess: () => {
      queryClient.invalidateQueries('appreciationLog');
    },
  });
};
export const useUpdateAppLog = () => {
  const queryClient = useQueryClient();
  return useMutation(UpdateAppLog, {
    onSuccess: () => {
      queryClient.invalidateQueries('appreciationLog');
    },
  });
};
