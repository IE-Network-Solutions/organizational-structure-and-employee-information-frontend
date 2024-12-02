import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { FiscalYear, FiscalYearResponse } from './interface';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

const getAllFiscalYears = async () => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/calendars`,
    method: 'GET',
    headers,
  });
};

//fetching active calendars
const getActiveFiscalYear = async () => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/calendars/active/calendar`,
    method: 'GET',
    headers,
  });
};

const getFiscalYear = async (id: string) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/calendars/${id}`,
    method: 'GET',
    headers,
  });
};

export const useGetAllFiscalYears = () =>
  useQuery<FiscalYearResponse>('fiscalYears', getAllFiscalYears);

export const useGetFiscalYearById = (id: string) =>
  useQuery<FiscalYear>(['fiscalYear', id], () => getFiscalYear(id), {
    keepPreviousData: true,
  });

export const useGetActiveFiscalYears = () =>
  useQuery<FiscalYear>('fiscalActiveYear', getActiveFiscalYear);
