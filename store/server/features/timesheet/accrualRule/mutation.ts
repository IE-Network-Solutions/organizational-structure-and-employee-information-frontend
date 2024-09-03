import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { AccrualRule } from '@/types/timesheet/settings';

const setAccrualRule = async (data: Partial<AccrualRule>) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/accrual-rules`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

const deleteAccrualRule = async (id: string) => {
  return await crudRequest({
    url: `/${ORG_AND_EMP_URL}/accrual-rules`,
    method: 'DELETE',
    headers: requestHeader(),
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
