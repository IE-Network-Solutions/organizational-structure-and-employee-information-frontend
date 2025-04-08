import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { Plan } from '@/types/tenant-management';

const setPlans = async (items: Partial<Plan>[]) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/plans`,
    method: 'PUT',
    headers: requestHeader(),
    data: { items },
  });
};

const deletePlans = async (id: string[]) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/plans`,
    method: 'DELETE',
    headers: requestHeader(),
    data: { id },
  });
};

export const useSetPlans = () => {
  const queryClient = useQueryClient();
  return useMutation(setPlans, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('plans');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeletePlans = () => {
  const queryClient = useQueryClient();
  return useMutation(deletePlans, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('plans');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
