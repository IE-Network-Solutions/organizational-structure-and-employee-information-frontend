import { requestHeader } from '@/helpers/requestHeader';
import { ApiResponse } from '@/types/commons/responseTypes';
import { Currency } from '@/types/tenant-management';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { CurrencyRequestBody } from './interface';

const getCurrencies = async (data: Partial<CurrencyRequestBody>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/currencies`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

export const useGetCurrencies = (
  data: Partial<CurrencyRequestBody> = {},
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<Currency>>(
    Object.keys(data).length ? ['currencies', data] : 'currencies',
    () => getCurrencies(data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );
};

const allCurrencies = async (data: Partial<CurrencyRequestBody>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/currencies/all`,
    method: 'GET',
    headers: requestHeaders,
    data,
  });
};

export const useGetAllCurrencies = (
  data: Partial<CurrencyRequestBody> = {},
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<Currency>>(
    Object.keys(data).length ? ['currencies', data] : 'currencies',
    () => allCurrencies(data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );
};
