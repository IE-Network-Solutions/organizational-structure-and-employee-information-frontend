import { InvoiceRequestBody } from './interface';
import { Invoice } from '@/types/tenant-management';
import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';

const getInvoices = async (data: Partial<InvoiceRequestBody>) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/invoices`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

export const useGetInvoices = (
  data: Partial<InvoiceRequestBody> = {},
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<Invoice>>(
    Object.keys(data).length ? ['invoices', data] : 'invoices',
    () => getInvoices(data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
    },
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
    },
  );
};
