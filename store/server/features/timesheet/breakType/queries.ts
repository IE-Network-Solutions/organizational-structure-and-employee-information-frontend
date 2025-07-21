import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { BreakType } from '@/types/timesheet/breakType';

const getBreakTypes = async () => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/break-type/all`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getBreakType = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/break-type/all`,
    method: 'GET',
    headers: requestHeaders,
    params: { id },
  });
};

export const useGetBreakTypes = () => {
  return useQuery<ApiResponse<BreakType>>('breakTypes', () => getBreakTypes(), {
    // keepPreviousData: true,
  });
};

export const useGetBreakType = (id: string) => {
  return useQuery<ApiResponse<BreakType>>(
    ['break-type', id],
    () => getBreakType(id),
    {
      keepPreviousData: true,
    },
  );
};
