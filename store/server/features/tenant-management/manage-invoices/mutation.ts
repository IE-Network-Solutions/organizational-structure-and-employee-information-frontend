import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { CancelInvoiceRequest, CreateAdvanceInvoiceRequest } from './interface';

const createAdvanceInvoice = async (data: CreateAdvanceInvoiceRequest) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/manage/invoices/advance`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

// const payInvoice = async ({
//   invoiceId,
//   ...data
// }: PayInvoiceRequest & { invoiceId: string }) => {
//   return await crudRequest({
//     url: `${TENANT_MGMT_URL}/subscription/manage/invoices/${invoiceId}/pay`,
//     method: 'POST',
//     headers: requestHeader(),
//     data,
//   });
// };

const cancelInvoice = async ({
  invoiceId,
  ...data
}: CancelInvoiceRequest & { invoiceId: string }) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/manage/invoices/${invoiceId}/cancel`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

export const useCreateAdvanceInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation(createAdvanceInvoice, {
    onSuccess: () => {
      queryClient.invalidateQueries('invoices');
      handleSuccessMessage('PUT');
    },
  });
};

// export const usePayInvoice = () => {
//   const queryClient = useQueryClient();
//   return useMutation(payInvoice, {
//     onSuccess: () => {
//       queryClient.invalidateQueries('invoices');
//       queryClient.invalidateQueries('payments');
//       handleSuccessMessage('PAY');
//     },
//   });
// };

export const useCancelInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation(cancelInvoice, {
    onSuccess: () => {
      queryClient.invalidateQueries('invoices');
      handleSuccessMessage('DELETE');
    },
  });
};
