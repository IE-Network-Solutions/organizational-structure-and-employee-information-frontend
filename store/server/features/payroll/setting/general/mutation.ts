import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { PayrollSettings } from './queries';

const updatePayrollSettings = async (data: PayrollSettings) => {
  const requestHeaders = await requestHeader();
  await crudRequest({
    url: `${PAYROLL_URL}/payroll-settings`,
    method: 'PUT',
    data,
    headers: requestHeaders,
  });
};

export const useUpdatePayrollSettings = () => {
  const queryClient = useQueryClient();

  return useMutation(updatePayrollSettings, {
    onSuccess: () => {
      queryClient.invalidateQueries('payroll-settings');
      NotificationMessage.success({
        message: 'Settings Updated',
        description: 'Payroll settings saved successfully.',
      });
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: 'Update Failed',
        description:
          error?.response?.data?.message || 'Failed to update payroll settings',
      });
    },
  });
};
