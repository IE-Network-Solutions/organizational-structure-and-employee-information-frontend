import { crudRequest } from '@/utils/crudRequest';
import {
  APPROVER_URL,
  TIME_AND_ATTENDANCE_URL,
  TNA_URL,
} from '@/utils/constants';
import { useQuery } from 'react-query';
import {
  ApiResponse,
  SingleApiResponse,
  SingleLogResponse,
} from '@/types/commons/responseTypes';
import {
  LeaveRequest,
  SingleLeaveRequest,
  SingleLogRequest,
} from '@/types/timesheet/settings';
import { LeaveRequestBody } from '@/store/server/features/timesheet/leaveRequest/interface';
import { requestHeader } from '@/helpers/requestHeader';
import { RequestCommonQueryData } from '@/types/commons/requesTypes';

const getLeaveRequest = async (
  queryData: RequestCommonQueryData,
  data: LeaveRequestBody,
) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-request`,
    method: 'POST',
    headers: requestHeader(),
    data,
    params: queryData,
  });
};
const getEmployeeLeave = async (
  pageSize: number,
  currentPage: number,
  userId: string,
) => {
  const response = await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-balance/all?page=${currentPage}&limit=${pageSize}&userId=${userId}`,
    method: 'GET',
    headers: requestHeader(),
  });
  return response;
};

const getApprovalLeaveRequest = async (
  requesterId: string,
  page: number,
  limit: number,
) => {
  const response = await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-request/approval/current-approver/${requesterId}?page=${page}&limit=${limit}`,
    method: 'GET',
    headers: requestHeader(),
  });
  return response;
};
const getSingleLeaveRequest = async (requestId: string) => {
  const response = await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-request/${requestId}`,
    method: 'GET',
    headers: requestHeader(),
  });
  return response;
};
const getSingleApprovalLog = async (requestId: string, workflowId: string) => {
  const response = await crudRequest({
    url: `${APPROVER_URL}/approver/status/${requestId}/${workflowId}`,
    method: 'GET',
    headers: requestHeader(),
  });
  return response;
};
const getSingleApproval = async (requestId: string) => {
  const response = await crudRequest({
    url: `${APPROVER_URL}/approval-logs/${requestId}`,
    method: 'GET',
    headers: requestHeader(),
  });
  return response;
};
const getApprovalTNARequest = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const response = await crudRequest({
    url: `${TNA_URL}/tna/tna-currentApprover/${userId}?page=${page}&limit=${limit}`,
    method: 'GET',
    headers: requestHeader(),
  });
  return response;
};
export const useGetEmployeeLeave = (
  pageSize: number,
  currentPage: number,
  userId: string,
) => {
  return useQuery<any>(
    ['approvals', pageSize, currentPage, userId],
    () => getEmployeeLeave(pageSize, currentPage, userId),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetLeaveRequest = (
  queryData: RequestCommonQueryData,
  data: LeaveRequestBody,
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<LeaveRequest>>(
    ['leave-request', queryData, data],
    () => getLeaveRequest(queryData, data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
    },
  );
};

export const useGetApprovalLeaveRequest = (
  requesterId: string,
  page: number,
  limit: number,
) => {
  return useQuery<any>(
    ['current_approval', requesterId, limit, page],
    () => getApprovalLeaveRequest(requesterId, page, limit),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetSingleLeaveRequest = (requestId: string) => {
  return useQuery<SingleApiResponse<SingleLeaveRequest>>(
    ['single-leave-request', requestId],
    () => getSingleLeaveRequest(requestId),
    {
      keepPreviousData: true,
    },
  );
};
export const useGetSingleApprovalLog = (
  requestId: string,
  workflowId: string,
) => {
  return useQuery<SingleLogResponse<SingleLogRequest>>(
    ['single-leave-log', requestId, workflowId],
    () => getSingleApprovalLog(requestId, workflowId),
    {
      enabled: Boolean(requestId) && Boolean(workflowId), // Ensures both are non-empty, non-null, and non-undefined
    },
  );
};
export const useGetSingleApproval = (requestId: string) => {
  return useQuery<SingleLogResponse<SingleLogRequest>>(
    ['single-leave', requestId],
    () => getSingleApproval(requestId),
    {
      enabled: !!requestId,
    },
  );
};
export const useGetApprovalTNARequest = (
  userId: string,
  page: number,
  limit: number,
) => {
  return useQuery<any>(
    'tnaCurrentApproval',
    () => getApprovalTNARequest(userId, page, limit),
    {
      keepPreviousData: true,
    },
  );
};
