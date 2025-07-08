import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { Invoice } from '@/types/tenant-management';

const setInvoices = async (items: Partial<Invoice>[]) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/invoices`,
    method: 'PUT',
    headers: requestHeader(),
    data: { items },
  });
};

const deleteInvoices = async (id: string[]) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/invoices`,
    method: 'DELETE',
    headers: requestHeader(),
    data: { id },
  });
};

export const useSetInvoices = () => {
  const queryClient = useQueryClient();
  return useMutation(setInvoices, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('invoices');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteInvoices = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteInvoices, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('invoices');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
