import { AllowedAreaQueryData } from '@/store/server/features/timesheet/allowedArea/interface';
import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_MODE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AllowedArea } from '@/types/timesheet/settings';

const getAllowedAreas = async (data?: {
  lat: number | null;
  lng: number | null;
}) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_MODE_URL}/geofencing/allowed-area`,
    method: 'GET',
    headers: requestHeader(),
    ...(data?.lat &&
      data?.lng && { params: { latitude: data.lat, longitude: data.lng } }),
  });
};

const getAllowedArea = async (queryData: Partial<AllowedAreaQueryData>) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_MODE_URL}/geofencing/allowed-area`,
    method: 'GET',
    headers: requestHeader(),
    params: queryData,
  });
};

export const useGetAllowedAreas = (data?: {
  lat: number | null;
  lng: number | null;
}) => {
  return useQuery<ApiResponse<AllowedArea>>(
    ['allowed-areas', data],
    () => getAllowedAreas(data),
    {
      keepPreviousData: true,
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
