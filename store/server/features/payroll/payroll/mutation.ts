import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const createPayroll = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${PAYROLL_URL}/payroll`,
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

  return useMutation(({ values }: { values: any }) => createPayroll(values), {
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

const sendEmail = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `https://test-email-service.ienetworks.co/api/v1/email`,
      method: 'POST',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully sent an email',
      description: 'successfully sent an email',
    });
  } catch (error) {
    throw error;
  }
};

export const useSendEmail = () => {
  const queryClient = useQueryClient();

  return useMutation(({ values }: { values: any }) => sendEmail(values), {
    onSuccess: () => {
      queryClient.invalidateQueries('email');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      NotificationMessage.error({
        message: 'Email Failed',
        description: errorMessage,
      });
    },
  });
};

const sendToPayroll = async (data: any) => {
  await crudRequest({
    url: `${PAYROLL_URL}/variable-pay`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

export const useSendToPayroll = () => {
  const queryClient = useQueryClient();
  return useMutation(sendToPayroll, {
    onSuccess: () => {
      queryClient.invalidateQueries('sendToPayroll');
      NotificationMessage.success({
        message: 'Payroll sent successfully',
        description: 'Payroll has been sent successfully.',
      });
    },
  });
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