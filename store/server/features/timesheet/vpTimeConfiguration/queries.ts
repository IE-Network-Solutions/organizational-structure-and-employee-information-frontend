import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import {
  VpTimeConfiguration,
  VpTimeConfigurationListQuery,
  VpTimeConfigType,
} from '@/store/server/features/timesheet/vpTimeConfiguration/interface';



const getVpTimeConfigurations = async (
  query?: VpTimeConfigurationListQuery,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/vp-time-configuration`,
    method: 'GET',
    headers: requestHeaders,
    ...(query?.configType && {
      params: { configType: query.configType },
    }),
  });
};

const getVpTimeConfiguration = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/vp-time-configuration/${id}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetVpTimeConfigurations = (configType?: VpTimeConfigType) => {
  return useQuery<ApiResponse<VpTimeConfiguration>>(
    ['vp-time-configurations', configType ?? 'all'],
    () => getVpTimeConfigurations(configType ? { configType } : undefined),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 1,
    },
  );
};

export const useGetVpTimeConfiguration = (id?: string | null) => {
  return useQuery<ApiResponse<VpTimeConfiguration>>(
    ['vp-time-configuration', id],
    () => getVpTimeConfiguration(id as string),
    {
      enabled: false,
    },
  );
};
