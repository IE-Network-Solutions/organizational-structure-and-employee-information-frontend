import { crudRequest } from '@/utils/crudRequest';
import { LOBSTER_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AccrualRule } from '@/types/timesheet/settings';

const getAccrualRules = async () => {
  return await crudRequest({
    url: `${LOBSTER_URL}/accrual-rules`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getAccrualRule = async (id: string) => {
  return await crudRequest({
    url: `${LOBSTER_URL}/accrual-rules`,
    method: 'GET',
    headers: requestHeader(),
    params: { id },
  });
};

export const useGetAccrualRules = () => {
  return useQuery<ApiResponse<AccrualRule>>(
    'accrual-rules',
    () => getAccrualRules(),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetAccrualRule = (id: string) => {
  return useQuery<ApiResponse<AccrualRule>>(
    ['accrual-rule', id],
    () => getAccrualRule(id),
    {
      keepPreviousData: true,
    },
  );
};
