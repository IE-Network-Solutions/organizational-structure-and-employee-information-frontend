import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { RequestCommonQueryData } from '@/types/commons/requesTypes';
import { CommitmentConfiguration } from '@/types/tna/externalTna';
import { CommitmentConfigurationBody } from '@/store/server/features/tna/externalTraining/interface';

const getCommitmentConfigurations = async (
  query: Partial<RequestCommonQueryData>,
  data: Partial<CommitmentConfigurationBody>,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/commitment-configuration`,
    method: 'POST',
    headers: requestHeaders,
    data,
    params: query,
  });
};

const getCommitmentConfigurationById = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/commitment-configuration/${id}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetCommitmentConfigurations = (
  query: Partial<RequestCommonQueryData> = { page: 1, limit: 100 },
  data: Partial<CommitmentConfigurationBody> = {},
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<CommitmentConfiguration>>(
    ['commitment-configuration', query, data],
    () => getCommitmentConfigurations(query, data),
    { keepPreviousData: true, enabled: isEnabled },
  );
};

export const useGetCommitmentConfigurationById = (
  id: string,
  isEnabled: boolean = true,
) => {
  return useQuery<CommitmentConfiguration>(
    ['commitment-configuration-detail', id],
    () => getCommitmentConfigurationById(id),
    { enabled: isEnabled && !!id },
  );
};
