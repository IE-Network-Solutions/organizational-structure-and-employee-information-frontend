import { AllowedAreaQueryData } from '@/store/server/features/timesheet/allowedArea/interface';
import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AllowedArea } from '@/types/timesheet/settings';

const getAllowedAreas = async (data?: {
  lat: number | null;
  lng: number | null;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/geofencing/allowed-area`,
    method: 'GET',
    headers: requestHeaders,
    ...(data?.lat &&
      data?.lng && { params: { latitude: data.lat, longitude: data.lng } }),
  });
};

const getAllowedArea = async (queryData: Partial<AllowedAreaQueryData>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/geofencing/allowed-area`,
    method: 'GET',
    headers: requestHeaders,
    params: queryData,
  });
};

export const useGetAllowedAreas = (data?: {
  lat: number | null;
  lng: number | null;
}) => {
  return useQuery<ApiResponse<AllowedArea>>(
    ['allowed-areas'],
    () => getAllowedAreas(data),
    {
      keepPreviousData: true,
      enabled: true,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    },
  );
};

export const useGetAllowedArea = (queryData: Partial<AllowedAreaQueryData>) => {
  return useQuery<ApiResponse<AllowedArea>>(
    ['allowed-area', queryData],
    () => getAllowedArea(queryData),
    {
      keepPreviousData: false,
      enabled: false,
    },
  );
};
