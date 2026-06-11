import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AllowedAreaConfiguration } from '@/types/timesheet/settings';
import {
  AllowedAreaConfigurationListQuery,
  AllowedAreaConfigurationQueryData,
} from '@/store/server/features/timesheet/allowedAreaConfiguration/interface';

const getAllowedAreaConfigurations = async (
  query?: AllowedAreaConfigurationListQuery,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/geofencing/allowed-area-configuration`,
    method: 'GET',
    headers: requestHeaders,
    ...(query?.departmentId && {
      params: { departmentId: query.departmentId },
    }),
  });
};

const getAllowedAreaConfiguration = async (
  queryData: AllowedAreaConfigurationQueryData,
) => {
  const response = await getAllowedAreaConfigurations(
    queryData.departmentId
      ? { departmentId: queryData.departmentId }
      : undefined,
  );

  if (!queryData.id) {
    return response;
  }

  const items = Array.isArray(response?.items) ? response.items : [];
  const item = items.find(
    (config: AllowedAreaConfiguration) => config.id === queryData.id,
  );

  return { ...response, item };
};

export const useGetAllowedAreaConfigurations = (
  departmentId?: string | null,
) => {
  return useQuery<ApiResponse<AllowedAreaConfiguration>>(
    ['allowed-area-configurations', departmentId ?? 'all'],
    () =>
      getAllowedAreaConfigurations(
        departmentId ? { departmentId } : undefined,
      ),
    {
      keepPreviousData: true,
      enabled: true,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 1,
    },
  );
};

export const useGetAllowedAreaConfiguration = (
  queryData: Partial<AllowedAreaConfigurationQueryData>,
) => {
  return useQuery<ApiResponse<AllowedAreaConfiguration>>(
    ['allowed-area-configuration', queryData],
    () => getAllowedAreaConfiguration(queryData),
    {
      keepPreviousData: false,
      enabled: false,
    },
  );
};
