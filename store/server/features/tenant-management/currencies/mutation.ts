import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { Currency } from '@/types/tenant-management';

const setCurrencies = async (items: Partial<Currency>[]) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/currencies`,
    method: 'PUT',
    headers: requestHeaders,
    data: { items },
  });
};

const deleteCurrencies = async (id: string[]) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/currencies`,
    method: 'DELETE',
    headers: requestHeaders,
    data: { id },
  });
};

export const useSetCurrencies = () => {
  const queryClient = useQueryClient();
  return useMutation(setCurrencies, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('currencies');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteCurrencies = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCurrencies, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('currencies');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
