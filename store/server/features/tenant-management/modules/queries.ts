import { ModuleRequestBody } from './interface';
import { Module } from '@/types/tenant-management';
import { crudRequest } from '@/utils/crudRequest';
import { MANAGE_SUBSCRIPTION_API_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';

const getModules = async (data: Partial<ModuleRequestBody>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${MANAGE_SUBSCRIPTION_API_URL}/subscription/rest/modules`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

export const useGetModules = (
  data: Partial<ModuleRequestBody> = {},
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<Module>>(
    Object.keys(data).length ? ['modules', data] : 'modules',
    () => getModules(data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
    },
  );
};
