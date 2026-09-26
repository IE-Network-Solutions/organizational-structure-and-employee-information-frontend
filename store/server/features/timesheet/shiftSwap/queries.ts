import { crudRequest } from '@/utils/crudRequest';
import apiClient from '@/utils/apiClient';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { requestHeader } from '@/helpers/requestHeader';
import { RequestCommonQueryData } from '@/types/commons/requesTypes';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  MyScheduleDay,
  ShiftSwapRequestBody,
} from '@/store/server/features/timesheet/shiftSwap/interface';

export interface MyScheduleResponse {
  userId?: string;
  from?: string;
  to?: string;
  days?: MyScheduleDay[];
}

const getMySchedule = async (
  userId: string,
  from: string,
  to: string,
): Promise<MyScheduleResponse | MyScheduleDay[]> => {
  const requestHeaders = await requestHeader();
  const params = new URLSearchParams({
    userId,
    from,
    to,
  });
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/my-schedule?${params.toString()}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetMySchedule = (
  userId: string,
  from: string,
  to: string,
  isEnabled: boolean = true,
) => {
  const token = useAuthenticationStore.getState().token;
  return useQuery<MyScheduleResponse | MyScheduleDay[]>(
    ['my-schedule', userId, from, to],
    () => getMySchedule(userId, from, to),
    {
      keepPreviousData: true,
      enabled: isEnabled && !!token && !!userId && !!from && !!to,
    },
  );
};

const getShiftSwapRequests = async (
  queryData: RequestCommonQueryData,
  data: ShiftSwapRequestBody,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/shift-swap-requests`,
    method: 'GET',
    headers: requestHeaders,
    params: {
      ...queryData,
      userId: data.filter?.userIds?.[0],
      status: data.filter?.status,
    },
  });
};

export const useGetShiftSwapRequests = (
  queryData: RequestCommonQueryData,
  data: ShiftSwapRequestBody,
  isEnabled: boolean = true,
) => {
  const token = useAuthenticationStore.getState().token;
  return useQuery<any>(
    ['shift-swap-requests', queryData, data],
    () => getShiftSwapRequests(queryData, data),
    {
      keepPreviousData: true,
      enabled: isEnabled && !!token,
    },
  );
};

const getShiftSwapPeerPending = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const requestHeaders = await requestHeader();
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/shift-swap-requests/peer-pending/${userId}?${params.toString()}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetShiftSwapPeerPending = (
  userId: string,
  page: number,
  limit: number,
  isEnabled: boolean = true,
) => {
  const token = useAuthenticationStore.getState().token;
  return useQuery<any>(
    ['shift-swap-peer-pending', userId, page, limit],
    () => getShiftSwapPeerPending(userId, page, limit),
    {
      keepPreviousData: true,
      enabled: isEnabled && !!token && !!userId,
    },
  );
};

const getShiftSwapApprovalAllStatus = async (
  requesterId: string,
  page: number,
  limit: number,
  requestUserId?: string,
  status?: string,
) => {
  const requestHeaders = await requestHeader();
  const { userId, tenantId } = useAuthenticationStore.getState();
  const headers = {
    ...requestHeaders,
    requestedBy: userId,
    createdBy: userId,
    tenantId,
  };
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (requestUserId) params.set('requestUserId', requestUserId);
  if (status) params.set('status', status);
  const response = await apiClient({
    url: `${TIME_AND_ATTENDANCE_URL}/shift-swap-requests/approval/current-approver/all-status/${requesterId}?${params.toString()}`,
    method: 'GET',
    headers,
  });
  const data = response.data ?? {};
  const totalHeader =
    response.headers?.['x-total-count'] ?? response.headers?.['X-Total-Count'];
  const totalFromHeader =
    totalHeader != null && totalHeader !== ''
      ? parseInt(String(totalHeader), 10)
      : undefined;
  if (totalFromHeader != null && !Number.isNaN(totalFromHeader)) {
    return { ...data, totalFromHeader };
  }
  return data;
};

export const useGetShiftSwapApprovalAllStatus = (
  requesterId: string,
  page: number,
  limit: number,
  requestUserId?: string,
  status?: string,
  isEnabled: boolean = true,
) => {
  const token = useAuthenticationStore.getState().token;
  return useQuery<any>(
    [
      'shift-swap-approval-all-status',
      requesterId,
      page,
      limit,
      requestUserId ?? '',
      status ?? '',
    ],
    () =>
      getShiftSwapApprovalAllStatus(
        requesterId,
        page,
        limit,
        requestUserId,
        status,
      ),
    {
      keepPreviousData: true,
      enabled: isEnabled && !!token && !!requesterId,
    },
  );
};
