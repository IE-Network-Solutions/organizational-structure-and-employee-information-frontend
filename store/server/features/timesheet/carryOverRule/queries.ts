import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { CarryOverRule } from '@/types/timesheet/settings';

const getCarryOverRules = async () => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/carry-over-rule`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getCarryOverRule = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/carry-over-rule`,
    method: 'GET',
    headers: requestHeaders,
    params: { id },
  });
};

export const useGetCarryOverRules = () => {
  return useQuery<ApiResponse<CarryOverRule>>(
    'carry-over-rule',
    () => getCarryOverRules(),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetCarryOverRuleById = (id: string) => {
  return useQuery<ApiResponse<CarryOverRule>>(
    ['carry-over-rule', id],
    () => getCarryOverRule(id),
    {
      keepPreviousData: true,
    },
  );
};
