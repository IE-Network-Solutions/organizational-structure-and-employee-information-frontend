import { crudRequest } from '@/utils/crudRequest';
import apiClient from '@/utils/apiClient';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { requestHeader } from '@/helpers/requestHeader';
import { RequestCommonQueryData } from '@/types/commons/requesTypes';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { WorkFromHomeRequestBody } from '@/store/server/features/timesheet/workFromHome/interface';

const getWorkFromHomeRequest = async (
  queryData: RequestCommonQueryData,
  data: WorkFromHomeRequestBody,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/work-from-home-request`,
    method: 'POST',
    headers: requestHeaders,
    data,
    params: queryData,
  });
};

export const useGetWorkFromHomeRequest = (
  queryData: RequestCommonQueryData,
  data: WorkFromHomeRequestBody,
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  const token = useAuthenticationStore.getState().token;
  return useQuery<any>(
    ['work-from-home-request', queryData, data],
    () => getWorkFromHomeRequest(queryData, data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled && !!token,
    },
  );
};

const getWorkFromHomeApprovalAllStatus = async (
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
    url: `${TIME_AND_ATTENDANCE_URL}/work-from-home-request/approval/current-approver/all-status/${requesterId}?${params.toString()}`,
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

export const useGetWorkFromHomeApprovalAllStatus = (
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
      'work-from-home-approval-all-status',
      requesterId,
      page,
      limit,
      requestUserId ?? '',
      status ?? '',
    ],
    () =>
      getWorkFromHomeApprovalAllStatus(
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
