import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { RequestCommonQueryData } from '@/types/commons/requesTypes';
import { TrainingRequest } from '@/types/tna/externalTna';
import { TrainingRequestBody } from './interface';

const getTrainingRequests = async (
  query: Partial<RequestCommonQueryData>,
  data: Partial<TrainingRequestBody>,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-request`,
    method: 'POST',
    headers: requestHeaders,
    data,
    params: query,
  });
};

const getTrainingRequestsByUser = async (userId: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-request/by-user/${userId}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getTrainingRequestById = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-request/${id}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetTrainingRequests = (
  query: Partial<RequestCommonQueryData> = {},
  data: Partial<TrainingRequestBody> = {},
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<TrainingRequest>>(
    ['training-request', query, data],
    () => getTrainingRequests(query, data),
    { keepPreviousData: true, enabled: isEnabled },
  );
};

export const useGetTrainingRequestsByUser = (
  userId: string,
  isEnabled: boolean = true,
) => {
  return useQuery<TrainingRequest[]>(
    ['training-request-by-user', userId],
    () => getTrainingRequestsByUser(userId),
    { keepPreviousData: true, enabled: isEnabled && !!userId },
  );
};

export const useGetTrainingRequestById = (
  id: string,
  isEnabled: boolean = true,
) => {
  return useQuery<TrainingRequest>(
    ['training-request-detail', id],
    () => getTrainingRequestById(id),
    { enabled: isEnabled && !!id },
  );
};
