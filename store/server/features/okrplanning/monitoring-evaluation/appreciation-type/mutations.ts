import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;
const createAppType = async (values: any) => {
  const token = await getCurrentToken();
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/recognition-type`,
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
      description: 'AppType successfully Created.',
    });
  } catch (error) {
    // Handle error (optional)
    throw error; // Re-throw error if needed for further handling
  }
};
export const UpdateAppType = async (values: Record<string, string>) => {
  const token = await getCurrentToken();
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/recognition-type/${values?.id}`,
      method: 'PUT',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        tenantId: tenantId, // Pass tenantId in the headers
      },
    });
    NotificationMessage.success({
      message: 'Successfully Updated',
      description: 'AppType successfully Updated.',
    });
  } catch (error) {
    // Handle error (optional)
    throw error; // Re-throw error if needed for further handling
  }
};

const deleteAppType = async (deletedId: string) => {
  const token = await getCurrentToken();
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.delete(
      `${OKR_AND_PLANNING_URL}/recognition-type/${deletedId}`,
      { headers },
    );
    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'AppType successfully deleted.',
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useDeleteAppType = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAppType, {
    onSuccess: () => {
      queryClient.invalidateQueries('appType');
    },
  });
};
export const useCreateAppType = () => {
  const queryClient = useQueryClient();
  return useMutation(createAppType, {
    onSuccess: () => {
      queryClient.invalidateQueries('appType');
    },
  });
};
export const useUpdateAppType = () => {
  const queryClient = useQueryClient();
  return useMutation(UpdateAppType, {
    onSuccess: () => {
      queryClient.invalidateQueries('appType');
    },
  });
};
