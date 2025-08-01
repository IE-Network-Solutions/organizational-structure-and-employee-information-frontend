import { useQuery } from 'react-query';

import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { DASHBOARD_API } from './api';

export const getAttendanceStats = async (userId: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/${DASHBOARD_API.GET_ATTENDANCE_STATS_API}/${userId}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetAttendanceStats = (userId: string) => {
  return useQuery(['attendanceStats', userId], () =>
    getAttendanceStats(userId),
  );
};

export const getAdminLeaveBalanceDashboard = async () => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/${DASHBOARD_API.GET_ADMIN_LEAVE_BALANCE_DASHBOARD_API}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetAdminLeaveBalanceDashboard = () => {
  return useQuery(['adminLeaveBalanceDashboard'], () =>
    getAdminLeaveBalanceDashboard(),
  );
};

export const getUserLeaveBalance = async (
  userId: string,
  leaveTypeId: string,
  startDate: string,
  endDate: string,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/${DASHBOARD_API.GET_USER_LEAVE_BALANCE_API}/${userId}?leaveTypeId=${leaveTypeId}&startDate=${startDate}&endDate=${endDate}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetUserLeaveBalance = (
  userId: string,
  leaveTypeId: string,
  startDate: string,
  endDate: string,
) => {
  return useQuery(
    ['userLeaveBalance', userId, leaveTypeId, startDate, endDate],
    () => getUserLeaveBalance(userId, leaveTypeId, startDate, endDate),
  );
};

export const getUserLeaveRequests = async (userId: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/${DASHBOARD_API.GET_USER_LEAVE_REQUESTS_API}/${userId}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetUserLeaveRequests = (userId: string) => {
  return useQuery(['userLeaveRequests', userId], () =>
    getUserLeaveRequests(userId),
  );
};

export const getAdminOnLeave = async (params: {
  startDate?: string;
  endDate?: string;
  userId?: string;
  leaveTypeId?: string;
  departmentId?: string;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/${DASHBOARD_API.GET_ADMIN_ON_LEAVE_API}`,
    method: 'GET',
    headers: requestHeaders,
    params,
  });
};

export const useGetAdminOnLeave = (params: {
  startDate?: string;
  endDate?: string;
  userId?: string;
  departmentId?: string;
  leaveTypeId?: string;
}) => {
  return useQuery(['adminOnLeave', params], () => getAdminOnLeave(params));
};

export const getAdminPendingLeaveRequests = async (params?: {
  startDate?: string;
  endDate?: string;
  userId?: string;
  departmentId?: string;
  leaveTypeId?: string;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/${DASHBOARD_API.GET_ADMIN_PENDING_LEAVE_REQUESTS_API}`,
    method: 'GET',
    headers: requestHeaders,
    params,
  });
};

export const useGetAdminPendingLeaveRequests = (params?: {
  startDate?: string;
  endDate?: string;
  userId?: string;
  departmentId?: string;
  leaveTypeId?: string;
}) => {
  return useQuery(['adminPendingLeaveRequests', params], () =>
    getAdminPendingLeaveRequests(params),
  );
};

export const getAdminAttendanceStats = async (params: {
  startDate: string;
  endDate: string;
  departmentId?: string;
  userId?: string;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/${DASHBOARD_API.GET_ADMIN_ATTENDANCE_STATS_API}`,
    method: 'GET',
    headers: requestHeaders,
    params,
  });
};

export const useGetAdminAttendanceStats = (params: {
  startDate: string;
  endDate: string;
  departmentId?: string;
  userId?: string;
}) => {
  return useQuery(['adminAttendanceStats', params], () =>
    getAdminAttendanceStats(params),
  );
};

export const getAdminAttendanceUsers = async (params: {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  userId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/${DASHBOARD_API.GET_ADMIN_ATTENDANCE_USERS_API}`,
    method: 'GET',
    headers: requestHeaders,
    params,
  });
};

export const useGetAdminAttendanceUsers = (params: {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  userId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  currentStatus?: string;
}) => {
  return useQuery(['adminAttendanceUsers', params], () =>
    getAdminAttendanceUsers(params),
  );
};

export const getUserAttendanceHistory = async (
  userId: string,
  params: {
    startDate?: string;
    endDate?: string;
    status?: string;
  },
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/${DASHBOARD_API.GET_USER_ATTENDANCE_HISTORY_API}/${userId}/history`,
    method: 'GET',
    headers: requestHeaders,
    params,
  });
};

export const useGetUserAttendanceHistory = (
  userId: string,
  params: {
    startDate?: string;
    endDate?: string;
    status?: string;
  },
) => {
  return useQuery(['userAttendanceHistory', userId, params], () =>
    getUserAttendanceHistory(userId, params),
  );
};
