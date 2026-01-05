import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { PeriodType } from '@/types/tenant-management';

const setPeriodTypes = async (items: Partial<PeriodType>[]) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/period-types`,
    method: 'PUT',
    headers: requestHeaders,
    data: { items },
  });
};

const deletePeriodTypes = async (id: string[]) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/period-types`,
    method: 'DELETE',
    headers: requestHeaders,
    data: { id },
  });
};

export const useSetPeriodTypes = () => {
  const queryClient = useQueryClient();
  return useMutation(setPeriodTypes, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('period-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeletePeriodTypes = () => {
  const queryClient = useQueryClient();
  return useMutation(deletePeriodTypes, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('period-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
