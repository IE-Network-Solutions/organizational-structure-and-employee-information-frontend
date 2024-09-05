import { crudRequest } from '@/utils/crudRequest';
import { LOBSTER_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { CarryOverRule } from '@/types/timesheet/settings';

const getCarryOverRules = async () => {
  return await crudRequest({
    url: `${LOBSTER_URL}/carry-over-rule`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getCarryOverRule = async (id: string) => {
  return await crudRequest({
    url: `${LOBSTER_URL}/carry-over-rule`,
    method: 'GET',
    headers: requestHeader(),
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
