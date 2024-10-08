import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AccrualRule } from '@/types/timesheet/settings';
import { RequestCommonQueryData } from '@/types/commons/requesTypes';

const getAccrualRules = async (params?: Partial<RequestCommonQueryData>) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/accrual-rules`,
    method: 'GET',
    headers: requestHeader(),
    params,
  });
};

const getAccrualRule = async (id: string) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/accrual-rules`,
    method: 'GET',
    headers: requestHeader(),
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
