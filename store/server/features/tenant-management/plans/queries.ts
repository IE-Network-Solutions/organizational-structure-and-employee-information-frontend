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
  currencyId?: string,
) => {
  const requestHeaders = await requestHeader();
  const url = new URL(`${TENANT_MGMT_URL}/subscription/rest/plans`);
  url.searchParams.append('orderDirection', orderDirection);
  if (currencyId) url.searchParams.append('currencyId', currencyId);

  return await crudRequest({
    url: url.toString(),
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
  currencyId?: string,
) => {
  return useQuery<ApiResponse<Plan>>(
    Object.keys(data).length
      ? ['plans', data, currencyId]
      : ['plans', currencyId],
    () => getPlans(data, orderDirection, currencyId),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );
};
