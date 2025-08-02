import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AccrualRule } from '@/types/timesheet/settings';
import { RequestCommonQueryData } from '@/types/commons/requesTypes';

const getAccrualRules = async (params?: Partial<RequestCommonQueryData>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/accrual-rules`,
    method: 'GET',
    headers: requestHeaders,
    params,
  });
};

const getAccrualRule = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/accrual-rules`,
    method: 'GET',
    headers: requestHeaders,
    params: { id },
  });
};

export const useGetAccrualRules = (
  params?: Partial<RequestCommonQueryData>,
) => {
  return useQuery<ApiResponse<AccrualRule>>(
    ['accrual-rules', params],
    () => getAccrualRules(params),
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
