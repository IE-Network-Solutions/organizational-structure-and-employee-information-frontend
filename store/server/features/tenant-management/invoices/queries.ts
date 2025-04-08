import { InvoiceRequestBody } from './interface';
import { Invoice } from '@/types/tenant-management';
import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';

const getInvoices = async (data: Partial<InvoiceRequestBody>, orderDirection?: string) => {
  let url = `${TENANT_MGMT_URL}/subscription/rest/invoices`;
  if (orderDirection) {
    url += `?orderDirection=${orderDirection}`;
  }
  return await crudRequest({
    url,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

export const useGetInvoices = (
  data: Partial<InvoiceRequestBody> = {},
  orderDirection?: string,
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<Invoice>>(
    Object.keys(data).length ? ['invoices', data] : 'invoices',
    () => getInvoices(data, orderDirection),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
      retry: 1, 
      refetchOnWindowFocus: false
    }
  );
};

export const useGetInvoiceDetail = (
  invoiceId: string,
  exportType: string = 'pdf',
) => {
  return useQuery<ApiResponse<any>>(
    ['invoice-detail', invoiceId, exportType],
    () =>
      crudRequest({
        url: `${TENANT_MGMT_URL}/subscription/rest/invoices/${invoiceId}/detail`,
        method: 'GET',
        headers: requestHeader(),
        params: { exportType },
      }),
    {
      enabled: !!invoiceId,
      retry: 1,
      refetchOnWindowFocus: false
    },
  );
};
