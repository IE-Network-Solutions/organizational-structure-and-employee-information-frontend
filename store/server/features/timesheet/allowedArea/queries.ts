import { AllowedAreaQueryData } from '@/store/server/features/timesheet/allowedArea/interface';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AllowedArea } from '@/types/timesheet/settings';

const getAllowedAreas = async () => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/geofencing/allowed-area`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getAllowedArea = async (queryData: Partial<AllowedAreaQueryData>) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/geofencing/allowed-area`,
    method: 'GET',
    headers: requestHeader(),
    params: queryData,
  });
};

export const useGetAllowedAreas = async () => {
  return useQuery<ApiResponse<AllowedArea>>(
    'allowed-areas',
    () => getAllowedAreas(),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetAllowedArea = async (
  queryData: Partial<AllowedAreaQueryData>,
) => {
  return useQuery<ApiResponse<AllowedArea>>(
    ['allowed-area', queryData],
    () => getAllowedArea(queryData),
    {
      keepPreviousData: true,
    },
  );
};
