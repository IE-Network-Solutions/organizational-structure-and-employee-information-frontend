import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { RequestCommonQueryData } from '@/types/commons/requesTypes';
import { UserTrainingCommitment } from '@/types/tna/externalTna';
import { UserTrainingCommitmentBody } from '@/store/server/features/tna/externalTraining/interface';

const getUserTrainingCommitments = async (
  query: Partial<RequestCommonQueryData>,
  data: Partial<UserTrainingCommitmentBody>,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/user-training-commitment`,
    method: 'POST',
    headers: requestHeaders,
    data,
    params: query,
  });
};

const getActiveCommitmentsByUser = async (userId: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/user-training-commitment/active/by-user/${userId}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getUserTrainingCommitmentById = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/user-training-commitment/${id}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetUserTrainingCommitments = (
  query: Partial<RequestCommonQueryData> = {},
  data: Partial<UserTrainingCommitmentBody> = {},
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<UserTrainingCommitment>>(
    ['user-training-commitment', query, data],
    () => getUserTrainingCommitments(query, data),
    { keepPreviousData: true, enabled: isEnabled },
  );
};

export const useGetActiveCommitmentsByUser = (
  userId: string,
  isEnabled: boolean = true,
) => {
  return useQuery<UserTrainingCommitment[]>(
    ['user-training-commitment-active', userId],
    () => getActiveCommitmentsByUser(userId),
    { keepPreviousData: true, enabled: isEnabled && !!userId },
  );
};

export const useGetUserTrainingCommitmentById = (
  id: string,
  isEnabled: boolean = true,
) => {
  return useQuery<UserTrainingCommitment>(
    ['user-training-commitment-detail', id],
    () => getUserTrainingCommitmentById(id),
    { enabled: isEnabled && !!id },
  );
};
