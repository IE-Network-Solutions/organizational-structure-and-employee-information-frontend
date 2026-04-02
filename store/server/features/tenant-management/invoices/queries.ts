import { InvoiceRequestBody } from './interface';
import { Invoice } from '@/types/tenant-management';
import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';

const getInvoices = async (
  data: Partial<InvoiceRequestBody>,
  orderDirection?: string,
) => {
  const { page, limit, ...body } = (data ??
    {}) as Partial<InvoiceRequestBody> & {
    page?: number;
    limit?: number;
  };
  const query = new URLSearchParams();
  if (orderDirection) query.set('orderDirection', orderDirection);
  if (typeof page === 'number') query.set('page', String(page));
  if (typeof limit === 'number') query.set('limit', String(limit));
  const qs = query.toString();
  const url = `${TENANT_MGMT_URL}/subscription/rest/invoices${qs ? `?${qs}` : ''}`;
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url,
    method: 'POST',
    headers: requestHeaders,
    data: body,
  });
};

export const useGetInvoices = (
  data: Partial<InvoiceRequestBody> = {},
  orderDirection?: string,
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<Invoice>>(
    Object.keys(data).length
      ? ['invoices', data, orderDirection ?? null]
      : ['invoices', orderDirection ?? null],
    () => getInvoices(data, orderDirection),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );
};

export const useGetInvoiceDetail = (
  invoiceId: string,
  exportType: string = 'pdf',
) => {
  return useQuery<ApiResponse<any>>(
    ['invoice-detail', invoiceId, exportType],
    async () => {
      const requestHeaders = await requestHeader();
      return await crudRequest({
        url: `${TENANT_MGMT_URL}/subscription/rest/invoices/${invoiceId}/detail`,
        method: 'GET',
        headers: requestHeaders,
        params: { exportType },
      });
    },
    {
      enabled: !!invoiceId,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );
};
