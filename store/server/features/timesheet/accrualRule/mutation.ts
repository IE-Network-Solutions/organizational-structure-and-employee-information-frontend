import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { AccrualRule } from '@/types/timesheet/settings';

const setAccrualRule = async (item: Partial<AccrualRule>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/accrual-rules`,
    method: 'POST',
    headers: requestHeaders,
    data: { item },
  });
};

const deleteAccrualRule = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/accrual-rules`,
    method: 'DELETE',
    headers: requestHeaders,
    params: { id },
  });
};

export const useSetAccrualRule = () => {
  const queryClient = useQueryClient();
  return useMutation(setAccrualRule, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('accrual-rules');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteAccrualRule = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAccrualRule, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('accrual-rules');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
