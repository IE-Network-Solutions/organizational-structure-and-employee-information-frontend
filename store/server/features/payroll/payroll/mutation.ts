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
const createPensionRule = async (values: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${PAYROLL_URL}/pension-rule`,
      method: 'POST',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Created',
      description: 'Pension Rule successfully Created.',
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
export const useCreatePensionRule = () => {
  const queryClient = useQueryClient();

  return useMutation(createPensionRule, {
    onSuccess: () => {
      queryClient.invalidateQueries('pension-rule');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      NotificationMessage.error({
        message: 'Pension Rule Creation Failed',
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
  const requestHeaders = await requestHeader();
  await crudRequest({
    url: `${PAYROLL_URL}/variable-pay`,
    method: 'POST',
    headers: requestHeaders,
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
const updateBasicSalary = async (values: any, changeMakerUserId?: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (changeMakerUserId) {
    queryParams.append('changeMakerUserId', changeMakerUserId);
  }

  const url = `${ORG_AND_EMP_URL}/basic-salary/${values?.id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  try {
    await crudRequest({
      url,
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
  return useMutation(
    ({
      values,
      changeMakerUserId,
    }: {
      values: any;
      changeMakerUserId?: string;
    }) => updateBasicSalary(values, changeMakerUserId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('basicSalary');
      },
    },
  );
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
      queryClient.invalidateQueries('pay-peroid');
    },
    onError: (error) => {
      NotificationMessage.error({
        message: error + '',
        description: 'Failed to delete Payroll.',
      });
    },
  });
};

const publishPayslips = async (payPeriodId: string) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${PAYROLL_URL}/pay-period/publish-payslips/${payPeriodId}`,
    method: 'PUT',
    headers: requestHeaders,
  });
};

export const usePublishPayslips = () => {
  const queryClient = useQueryClient();

  return useMutation(publishPayslips, {
    onSuccess: () => {
      queryClient.invalidateQueries('pay-peroid');
      queryClient.invalidateQueries('payroll');
      queryClient.invalidateQueries('payrollForExport');
      queryClient.invalidateQueries('payroll-history');
      NotificationMessage.success({
        message: 'Payslips released',
        description: 'Employees can now view payslips for this pay period.',
      });
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: 'Release failed',
        description:
          error?.response?.data?.message ||
          'Failed to release payslips for this pay period.',
      });
    },
  });
};

const unpublishPayslips = async (payPeriodId: string) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${PAYROLL_URL}/pay-period/unpublish-payslips/${payPeriodId}`,
    method: 'PUT',
    headers: requestHeaders,
  });
};

export const useUnpublishPayslips = () => {
  const queryClient = useQueryClient();

  return useMutation(unpublishPayslips, {
    onSuccess: () => {
      queryClient.invalidateQueries('pay-peroid');
      queryClient.invalidateQueries('payroll');
      queryClient.invalidateQueries('payrollForExport');
      queryClient.invalidateQueries('payroll-history');
      NotificationMessage.success({
        message: 'Payslip access revoked',
        description: 'Employees can no longer view payslips for this pay period.',
      });
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: 'Revoke failed',
        description:
          error?.response?.data?.message ||
          'Failed to revoke payslip access for this pay period.',
      });
    },
  });
};
