import { crudRequest } from '@/utils/crudRequest';
import { useQuery, QueryObserverOptions } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { FiscalYear, FiscalYearResponse } from './interface';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { requestHeader } from '@/helpers/requestHeader';
import { getCurrentToken } from '@/utils/getCurrentToken';

const getAllFiscalYears = async (pageSize?: number, currentPage?: number) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/calendars?limit=${pageSize ?? 10}&&page=${currentPage ?? 1}`,
    method: 'GET',
    headers,
  });
};

//fetching active calendars
const getActiveFiscalYear = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/calendars/active/calendar`,
    method: 'GET',
    headers,
  });
};

const getFiscalYear = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/calendars/${id}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetAllFiscalYears = (pageSize?: number, currentPage?: number) =>
  useQuery<FiscalYearResponse>(['fiscalYears', pageSize, currentPage], () =>
    getAllFiscalYears(pageSize, currentPage),
  );

export const useGetFiscalYearById = (id: string) =>
  useQuery<FiscalYear>(['fiscalYear', id], () => getFiscalYear(id), {
    keepPreviousData: true,
  });

export const useGetActiveFiscalYears =  (
  options?: QueryObserverOptions<FiscalYear>,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return useQuery<FiscalYear>('fiscalActiveYear', getActiveFiscalYear, {
    enabled: token.length > 0 && tenantId.length > 0,
    ...options,
  });
};

export const useGetActiveFiscalYearsData = () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return useQuery<FiscalYear>('fiscalActiveYear', getActiveFiscalYear, {
    enabled: token.length > 0 && tenantId.length > 0,
  });
};
