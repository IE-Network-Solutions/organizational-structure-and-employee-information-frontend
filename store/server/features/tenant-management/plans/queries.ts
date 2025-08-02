import { PlanRequestBody } from './interface';
import { Plan } from '@/types/tenant-management';
import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';

const getPlans = async (
  data: Partial<PlanRequestBody>,
  orderDirection: 'ASC' | 'DESC' = 'ASC',
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/plans?orderDirection=${orderDirection}`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

export const useGetPlans = (
  data: Partial<PlanRequestBody> = {},
  isKeepData: boolean = true,
  isEnabled: boolean = true,
  orderDirection: 'ASC' | 'DESC' = 'ASC',
) => {
  return useQuery<ApiResponse<Plan>>(
    Object.keys(data).length ? ['plans', data] : 'plans',
    () => getPlans(data, orderDirection),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );
};
