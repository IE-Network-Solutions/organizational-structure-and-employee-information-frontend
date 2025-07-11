import { RequestCommonQueryData } from '@/types/commons/requesTypes';
import { TnaRequestBody } from '@/store/server/features/tna/review/interface';
import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { TrainingNeedAssessment } from '@/types/tna/tna';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const getTna = async (
  query: Partial<RequestCommonQueryData>,
  data: Partial<TnaRequestBody>,
  searchQuery: string,
) => {
  return await crudRequest({
    url: `${TNA_URL}/tna${searchQuery}`,
    method: 'POST',
    headers: requestHeader(),
    data,
    params: query,
  });
};
const getTnaByUser = async (
  query: Partial<RequestCommonQueryData>,
  data: Partial<TnaRequestBody>,
) => {
  const userId = useAuthenticationStore.getState().userId;
  return await crudRequest({
    url: `${TNA_URL}/tna/by-user/${userId}`,
    method: 'POST',
    headers: requestHeader(),
    data,
    params: query,
  });
};
const singleTna = async (id: string) => {
  return await crudRequest({
    url: `${TNA_URL}/tna/${id}`,
    method: 'GET',
    headers: requestHeader(),
  });
};
export const currency = async () => {
  const response = await crudRequest({
    url: `${TNA_URL}/currency`,
    method: 'GET',
    headers: requestHeader(),
  });
  return response;
};
export const singleCurrency = async (id: string) => {
  const response = await crudRequest({
    url: `${TNA_URL}/currency/${id}`,
    method: 'GET',
    headers: requestHeader(),
  });
  return response;
};
export const allCurrency = async () => {
  const response = await crudRequest({
    url: `${TNA_URL}/currency`,
    method: 'GET',
    headers: requestHeader(),
  });
  return response;
};
export const useGetTna = (
  query: Partial<RequestCommonQueryData>,
  data: Partial<TnaRequestBody>,
  searchQuery: string,
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<TrainingNeedAssessment>>(
    ['tna', query, data, searchQuery],
    () => getTna(query, data, searchQuery),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
    },
  );
};

export const useGetTnaById = (id: string) => {
  return useQuery<any>(['singleTna'], () => singleTna(id), {
    keepPreviousData: true,
    enabled: !!id,
  });
};

export const useGetTnaByUser = (
  query: Partial<RequestCommonQueryData>,
  data: Partial<TnaRequestBody>,
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<TrainingNeedAssessment>>(
    ['tna', query, data],
    () => getTnaByUser(query, data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
    },
  );
};

export const useCurrency = () => {
  return useQuery<any>(['currency'], () => currency(), {
    keepPreviousData: true,
  });
};

export const useSingleCurrency = (id: string) => {
  return useQuery<any>(['singleCurrency'], () => singleCurrency(id), {
    keepPreviousData: true,
  });
};

export const useAllCurrencies = () => {
  return useQuery<any>(['allCurrency'], () => allCurrency(), {
    keepPreviousData: true,
  });
};
