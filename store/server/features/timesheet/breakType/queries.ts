import { crudRequest } from '@/utils/crudRequest';
import { NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { BreakType } from '@/types/timesheet/breakType';

const getBreakTypes = async () => {
  return await crudRequest({
    url: `${NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL}/attendance/break-type`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getBreakType = async (id: string) => {
  return await crudRequest({
    url: `${NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL}/attendance/break-type`,
    method: 'GET',
    headers: requestHeader(),
    params: { id },
  });
};

export const useGetBreakTypes = () => {
  return useQuery<ApiResponse<BreakType>>(
    'break-types',
    () => getBreakTypes(),
    {
      keepPreviousData: true,
    },
  );
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
