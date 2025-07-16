import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { EMAIL_URL, ORG_AND_EMP_URL, PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { PaySlipData } from './interface';
import { getCurrentToken } from '@/utils/getCurrentToken';

const createPayroll = async (values: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${PAYROLL_URL}/payroll`,
      method: 'POST',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
        withIncentives: values.includeIncentive,
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
const sendingPayrollPaySlip = async ({ values }: { values: any }) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  try {
    await crudRequest({
      url: `${PAYROLL_URL}/payroll/send-pay-slip`,
      method: 'POST',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
  } catch (error) {
    throw error;
  }
};
const updatePensionRule = async (values: any) => {
  const token = await getCurrentToken();
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
export const useSendingPayrollPayslip = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ values }: { values: PaySlipData[] }) =>
      sendingPayrollPaySlip({ values }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payroll');
        NotificationMessage.success({
          message: 'Payslip sent successfully',
          description: '',
        });
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
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${EMAIL_URL}/email`,
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
const createBasicSalary = async (values: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${ORG_AND_EMP_URL}/basic-salary`,
      method: 'POST',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Created',
      description: 'Basic Salary Created Successfully.',
    });
  } catch (error) {
    throw error;
  }
};
const updateBasicSalary = async (values: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${ORG_AND_EMP_URL}/basic-salary/${values?.id}`,
      method: 'PATCH',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Updated',
      description: 'Basic Salary Updated Successfully.',
    });
  } catch (error) {
    throw error;
  }
};

export const useCreateBasicSalary = () => {
  const queryClient = useQueryClient();
  return useMutation(createBasicSalary, {
    onSuccess: () => {
      queryClient.invalidateQueries('basicSalary');
    },
  });
};
export const useUpdateBasicSalary = () => {
  const queryClient = useQueryClient();
  return useMutation(updateBasicSalary, {
    onSuccess: () => {
      queryClient.invalidateQueries('basicSalary');
    },
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
  const token = await getCurrentToken();
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
