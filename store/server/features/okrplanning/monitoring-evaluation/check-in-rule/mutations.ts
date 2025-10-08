import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;

const createCheckInRule = async (values: any) => {
  const token = await getCurrentToken();
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/check-in-rules`,
      method: 'POST',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Created',
      description: 'Check-in Rule successfully Created.',
    });
  } catch (error) {
    throw error;
  }
};

export const updateCheckInRule = async (values: Record<string, any>) => {
  const token = await getCurrentToken();
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/check-in-rules/${values?.id}`,
      method: 'PATCH',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
    NotificationMessage.success({
      message: 'Successfully Updated',
      description: 'Check-in Rule successfully Updated.',
    });
  } catch (error) {
    throw error;
  }
};

const deleteCheckInRule = async (deletedId: string) => {
  const token = await getCurrentToken();
  try {
    await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/check-in-rules/${deletedId}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Check-in Rule successfully Deleted.',
    });
  } catch (error) {
    throw error;
  }
};

export const useDeleteCheckInRule = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCheckInRule, {
    onSuccess: () => {
      queryClient.invalidateQueries('checkInRule');
    },
  });
};

export const useCreateCheckInRule = () => {
  const queryClient = useQueryClient();
  return useMutation(createCheckInRule, {
    onSuccess: () => {
      queryClient.invalidateQueries('checkInRule');
    },
  });
};

export const useUpdateCheckInRule = () => {
  const queryClient = useQueryClient();
  return useMutation(updateCheckInRule, {
    onSuccess: () => {
      queryClient.invalidateQueries('checkInRule');
    },
  });
};
