import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { CarryOverRule } from '@/types/timesheet/settings';

const getCarryOverRules = async () => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/carry-over-rule`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getCarryOverRule = async (id: string) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/carry-over-rule`,
    method: 'GET',
    headers: requestHeader(),
    params: { id },
  });
};

export const useCarryOverRules = () => {
  return useQuery<ApiResponse<CarryOverRule>>(
    'carry-over-rule',
    () => getCarryOverRules(),
    {
      keepPreviousData: true,
    },
  );
};

export const useCarryOverRuleById = (id: string) => {
  return useQuery<ApiResponse<CarryOverRule>>(
    ['carry-over-rule', id],
    () => getCarryOverRule(id),
    {
      keepPreviousData: true,
    },
  );
};
