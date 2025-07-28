import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const updateAllowance = async (data: { employeeId: string; data: any }) => {
  const requestHeaders = await requestHeader();
  await crudRequest({
    url: `${PAYROLL_URL}/compensation-item-entitlement/update/employee-allowance-entitlement/${data?.employeeId}`,
    method: 'PUT',
    data: data?.data,
    headers: requestHeaders,
  });
};

export const useUpdateAllowance = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { employeeId: string; data: any }) => updateAllowance(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('EmployeeInfo');
        NotificationMessage.success({
          message: 'Successfully updated',
          description: 'Allowance successfully updated.',
        });
      },
    },
  );
};
