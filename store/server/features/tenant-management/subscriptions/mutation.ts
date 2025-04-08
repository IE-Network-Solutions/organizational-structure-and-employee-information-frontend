import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { Subscription } from '@/types/tenant-management';

const setSubscriptions = async (items: Partial<Subscription>[]) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/subscriptions`,
    method: 'PUT',
    headers: requestHeader(),
    data: { items },
  });
};

export const useSetSubscriptions = () => {
  const queryClient = useQueryClient();
  return useMutation(setSubscriptions, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('subscriptions');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
