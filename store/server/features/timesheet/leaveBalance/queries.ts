import { crudRequest } from '@/utils/crudRequest';
import { NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { requestHeader } from '@/helpers/requestHeader';
import { LeaveBalance } from '@/types/timesheet/myTimesheet';

const getLeaveBalance = async (userId: string) => {
  return await crudRequest({
    url: `${NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL}/leave-balance`,
    method: 'GET',
    headers: requestHeader(),
    params: { userId },
  });
};

export const useGetLeaveBalance = (userId: string) => {
  return useQuery<ApiResponse<LeaveBalance>>(
    'leave-balance',
    () => getLeaveBalance(userId),
    {
      keepPreviousData: true,
    },
  );
};
