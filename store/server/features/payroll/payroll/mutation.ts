import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const createPayroll = async (payperoid: string, values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${PAYROLL_URL}/payroll${payperoid}`,
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
const updatePensionRule = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${PAYROLL_URL}/pension-rule/${values?.id}`,
      method: 'put',
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

  return useMutation(
    ({ payperoid, values }: { payperoid: string; values: any }) =>
      createPayroll(payperoid, values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payroll');
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message;
        NotificationMessage.error({
          message: 'PayRoll Creation Failed',
          description: errorMessage,
        });
      },
    },
  );
};

const deletePayroll = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${PAYROLL_URL}/payroll/remove-payroll/by-pay-period-id/${id}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Payroll successfully deleted.',
    });
  } catch (error) {
    throw error;
  }
};

export const useDeletePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation(deletePayroll, {
    onSuccess: () => {
      queryClient.invalidateQueries('payroll');
    },
    onError: (error) => {
      NotificationMessage.error({
        message: error + '',
        description: 'Failed to delete Payroll.',
      });
    },
  });
};

export const useUpdatePensionRule = () => {
  const queryClient = useQueryClient();

  return useMutation(updatePensionRule, {
    onSuccess: () => {
      queryClient.invalidateQueries('pension-rule');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      NotificationMessage.error({
        message: 'PayRoll Creation Failed',
        description: errorMessage,
      });
    },
  });
};
