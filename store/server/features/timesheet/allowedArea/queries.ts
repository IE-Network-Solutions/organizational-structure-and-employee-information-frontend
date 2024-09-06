import { AllowedAreaQueryData } from '@/store/server/features/timesheet/allowedArea/interface';
import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_MODE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AllowedArea } from '@/types/timesheet/settings';

const getAllowedAreas = async (lat?: number, lng?: number) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_MODE_URL}/geofencing/allowed-area`,
    method: 'GET',
    headers: requestHeader(),
    ...(lat && lng && { params: { latitude: lat, longitude: lng } }),
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

export const useGetAllowedAreas = (lat?: number, lng?: number) => {
  return useQuery<ApiResponse<AllowedArea>>(
    'allowed-areas',
    () => getAllowedAreas(lat, lng),
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
      keepPreviousData: true,
    },
  );
};
