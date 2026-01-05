import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { LeaveType } from '@/types/timesheet/settings';
import { requestHeader } from '@/helpers/requestHeader';

const getLeaveTypes = async () => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-type`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getLeaveType = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-type`,
    method: 'GET',
    headers: requestHeaders,
    params: { id },
  });
};

export const useGetLeaveTypes = () => {
  return useQuery<ApiResponse<LeaveType>>(
    'leave-types',
    () => getLeaveTypes(),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetLeaveTypeById = (id: string) => {
  return useQuery<ApiResponse<LeaveType>>(
    ['leave-type', id],
    () => getLeaveType(id),
    {
      keepPreviousData: true,
      enabled: !!id,
    },
  );
};
