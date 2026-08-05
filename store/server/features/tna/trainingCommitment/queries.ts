import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { RequestCommonQueryData } from '@/types/commons/requesTypes';
import {
  TrainingCommitment,
  TrainingCommitmentStatus,
} from '@/types/tna/externalTna';
import { TrainingCommitmentRequestBody } from '@/store/server/features/tna/externalTraining/interface';

const getTrainingCommitments = async (
  query: Partial<RequestCommonQueryData>,
  data: Partial<TrainingCommitmentRequestBody>,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-commitment`,
    method: 'POST',
    headers: requestHeaders,
    data,
    params: query,
  });
};

const getTrainingCommitmentsByUser = async (
  userId: string,
  status?: TrainingCommitmentStatus,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-commitment/by-user/${userId}`,
    method: 'GET',
    headers: requestHeaders,
    ...(status ? { params: { status } } : {}),
  });
};

const getActiveTrainingCommitmentsByUser = async (userId: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-commitment/active/by-user/${userId}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getTrainingCommitmentById = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-commitment/${id}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getTrainingCommitmentByRequest = async (requestId: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-commitment/by-request/${requestId}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetTrainingCommitments = (
  query: Partial<RequestCommonQueryData> = {},
  data: Partial<TrainingCommitmentRequestBody> = {},
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<TrainingCommitment>>(
    ['training-commitment', query, data],
    () => getTrainingCommitments(query, data),
    { keepPreviousData: true, enabled: isEnabled },
  );
};

export const useGetTrainingCommitmentsByUser = (
  userId: string,
  status?: TrainingCommitmentStatus,
  isEnabled: boolean = true,
) => {
  return useQuery<TrainingCommitment[]>(
    ['training-commitment-by-user', userId, status],
    () => getTrainingCommitmentsByUser(userId, status),
    { enabled: isEnabled && !!userId, keepPreviousData: true },
  );
};

export const useGetActiveTrainingCommitmentsByUser = (
  userId: string,
  isEnabled: boolean = true,
) => {
  return useQuery<TrainingCommitment[]>(
    ['training-commitment-by-user', userId, 'active'],
    () => getActiveTrainingCommitmentsByUser(userId),
    { enabled: isEnabled && !!userId, keepPreviousData: true },
  );
};

export const useGetTrainingCommitmentById = (
  id: string,
  isEnabled: boolean = true,
) => {
  return useQuery<TrainingCommitment>(
    ['training-commitment-detail', id],
    () => getTrainingCommitmentById(id),
    { enabled: isEnabled && !!id },
  );
};

export const useGetTrainingCommitmentByRequest = (
  requestId: string,
  isEnabled: boolean = true,
) => {
  return useQuery<TrainingCommitment | null>(
    ['training-commitment-detail', 'by-request', requestId],
    () => getTrainingCommitmentByRequest(requestId),
    { enabled: isEnabled && !!requestId },
  );
};
