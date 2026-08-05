import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { RequestCommonQueryData } from '@/types/commons/requesTypes';
import {
  ExternalTrainingApproval,
  ExternalTrainingEmployeeSummary,
  ExternalTrainingReport,
  ExternalTrainingRequest,
} from '@/types/tna/externalTna';
import { ExternalTrainingRequestBody } from './interface';

const getExternalTrainings = async (
  query: Partial<RequestCommonQueryData>,
  data: Partial<ExternalTrainingRequestBody>,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/external-training`,
    method: 'POST',
    headers: requestHeaders,
    data,
    params: query,
  });
};

const getExternalTrainingsByUser = async (
  userId: string,
  query: Partial<RequestCommonQueryData>,
  data: Partial<ExternalTrainingRequestBody>,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/external-training/by-user/${userId}`,
    method: 'POST',
    headers: requestHeaders,
    data,
    params: query,
  });
};

const getExternalTrainingById = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/external-training/${id}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getExternalTrainingApprovals = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/external-training/${id}/approvals`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getPendingForManager = async (
  managerId: string,
  query: Partial<RequestCommonQueryData>,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/external-training/pending/manager/${managerId}`,
    method: 'GET',
    headers: requestHeaders,
    params: query,
  });
};

const getPendingForTnaOfficer = async (
  query: Partial<RequestCommonQueryData>,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/external-training/pending/tna-officer`,
    method: 'GET',
    headers: requestHeaders,
    params: query,
  });
};

const getEmployeeTnaSummary = async (userId: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/external-training/employee/${userId}/summary`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getExternalTrainingReport = async (
  data: Partial<ExternalTrainingRequestBody>,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/external-training/report`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

export const useGetExternalTrainings = (
  query: Partial<RequestCommonQueryData> = {},
  data: Partial<ExternalTrainingRequestBody> = {},
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<ExternalTrainingRequest>>(
    ['external-training', query, data],
    () => getExternalTrainings(query, data),
    { keepPreviousData: true, enabled: isEnabled },
  );
};

export const useGetExternalTrainingsByUser = (
  userId: string,
  query: Partial<RequestCommonQueryData> = {},
  data: Partial<ExternalTrainingRequestBody> = {},
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<ExternalTrainingRequest>>(
    ['external-training-by-user', userId, query, data],
    () => getExternalTrainingsByUser(userId, query, data),
    { keepPreviousData: true, enabled: isEnabled && !!userId },
  );
};

export const useGetExternalTrainingById = (
  id: string,
  isEnabled: boolean = true,
) => {
  return useQuery<ExternalTrainingRequest>(
    ['external-training-detail', id],
    () => getExternalTrainingById(id),
    { enabled: isEnabled && !!id },
  );
};

export const useGetExternalTrainingApprovals = (
  id: string,
  isEnabled: boolean = true,
) => {
  return useQuery<ExternalTrainingApproval[]>(
    ['external-training-approvals', id],
    () => getExternalTrainingApprovals(id),
    { enabled: isEnabled && !!id },
  );
};

export const useGetPendingForManager = (
  managerId: string,
  query: Partial<RequestCommonQueryData> = {},
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<ExternalTrainingRequest>>(
    ['external-training-pending-manager', managerId, query],
    () => getPendingForManager(managerId, query),
    { keepPreviousData: true, enabled: isEnabled && !!managerId },
  );
};

export const useGetPendingForTnaOfficer = (
  query: Partial<RequestCommonQueryData> = {},
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<ExternalTrainingRequest>>(
    ['external-training-pending-officer', query],
    () => getPendingForTnaOfficer(query),
    { keepPreviousData: true, enabled: isEnabled },
  );
};

export const useGetEmployeeTnaSummary = (
  userId: string,
  isEnabled: boolean = true,
) => {
  return useQuery<ExternalTrainingEmployeeSummary>(
    ['external-training-employee-summary', userId],
    () => getEmployeeTnaSummary(userId),
    { enabled: isEnabled && !!userId },
  );
};

export const useGetExternalTrainingReport = (
  data: Partial<ExternalTrainingRequestBody> = {},
  isEnabled: boolean = true,
) => {
  return useQuery<ExternalTrainingReport>(
    ['external-training-report', data],
    () => getExternalTrainingReport(data),
    { keepPreviousData: true, enabled: isEnabled },
  );
};
