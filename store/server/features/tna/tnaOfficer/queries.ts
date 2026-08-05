import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { TnaOfficer } from '@/types/tna/externalTna';

const getTnaOfficers = async () => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/tna-officer`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getActiveTnaOfficers = async () => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/tna-officer/active`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getIsTnaOfficer = async (userId: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/tna-officer/is-officer/${userId}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetTnaOfficers = (isEnabled: boolean = true) => {
  return useQuery<ApiResponse<TnaOfficer>>('tna-officer', getTnaOfficers, {
    keepPreviousData: true,
    enabled: isEnabled,
  });
};

export const useGetActiveTnaOfficers = (isEnabled: boolean = true) => {
  return useQuery<ApiResponse<TnaOfficer>>(
    'tna-officer-active',
    getActiveTnaOfficers,
    { keepPreviousData: true, enabled: isEnabled },
  );
};

export const useGetIsTnaOfficer = (
  userId: string,
  isEnabled: boolean = true,
) => {
  return useQuery<{ userId: string; isOfficer: boolean }>(
    ['tna-officer-is-officer', userId],
    () => getIsTnaOfficer(userId),
    { enabled: isEnabled && !!userId },
  );
};
