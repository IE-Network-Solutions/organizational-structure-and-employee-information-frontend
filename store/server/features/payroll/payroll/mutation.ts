import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PAYROLL_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const createPayroll = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${PAYROLL_DEV_URL}/payroll`,
      method: 'POST',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Created',
      description: 'PayRoll successfully Created.',
    });
  } catch (error) {
    throw error;
  }
};

export const useCreatePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation(createPayroll, {
    onSuccess: () => {
      queryClient.invalidateQueries('payroll');
    },
    onError: (error) => {
      NotificationMessage.error({
        message: error + '',
        description: 'PayRoll Creation Failed.',
      });
    },
  });
};
