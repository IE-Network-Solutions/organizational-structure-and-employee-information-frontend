import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { requestHeader } from '@/helpers/requestHeader';
import { LeaveBalance } from '@/types/timesheet/myTimesheet';



const getLeaveBalanceTableData = async (userId: string, leaveTypeId: string) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-balance/all-leaves`,
    method: 'GET',
    headers: requestHeader(),
    params: { userId, leaveTypeId },
  });
};
const getLeaveBalance = async (userId: string, leaveTypeId: string) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-balance`,
    method: 'GET',
    headers: requestHeader(),
    params: { userId, leaveTypeId },
  });
};
const getAllLeaveBalance = async () => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-balance/all`,
    method: 'GET',
    headers: requestHeader(),
    // params: { userId },
  });
};
const getAllLeaveBalanceWithFilter = async (
  userId: string,
  leaveTypeId: string,
) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-balance/all/with-filter?userId=${userId}&leaveTypeId=${leaveTypeId}`,
    method: 'GET',
    headers: requestHeader(),
  });
};
export const useGetLeaveBalance = (userId: string, leaveTypeId: string) =>
  useQuery<ApiResponse<LeaveBalance>>(
    ['leave-balance', userId, leaveTypeId],
    () => getLeaveBalance(userId, leaveTypeId),
    {
      enabled: !!userId,
    },
  );
export const useGetAllLeaveBalance = () =>
  useQuery<ApiResponse<LeaveBalance>>(
    ['leave-balance'],
    () => getAllLeaveBalance(),
    {
      // enabled: !!userId,
    },
  );

export const useGetAllLeaveBalanceWithFilter = (
  userId: string,
  leaveTypeId: string,
) =>
  useQuery<ApiResponse<LeaveBalance>>(
    ['leave-balance-data-with-filter', userId, leaveTypeId],
    () => getAllLeaveBalanceWithFilter(userId, leaveTypeId),
  );


  export const useGetLeaveBalanceTableData = (userId: string, leaveTypeId: string) =>
  useQuery<ApiResponse<LeaveBalance>>(
    ['leave-balance', userId, leaveTypeId],
    () => getLeaveBalanceTableData(userId, leaveTypeId),
  );
  
  