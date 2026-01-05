import { PeriodTypeRequestBody } from './interface';
import { PeriodType } from '@/types/tenant-management';
import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';

const getPeriodTypes = async (data: Partial<PeriodTypeRequestBody>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/period-types`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

export const useGetPeriodTypes = (
  data: Partial<PeriodTypeRequestBody> = {},
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<PeriodType>>(
    Object.keys(data).length ? ['period-types', data] : 'period-types',
    () => getPeriodTypes(data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
    },
  );
};
