import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { DataItem } from '../categories/interface';

/**
 * Function to add a new post by sending a POST request to the API
 * @param newPost The data for the new post
 * @returns The response data from the API
 */
const createCriticalPosition = async ({ values }: { values: DataItem[] }) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/action-plans/many/${tenantId}`,
    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const useCreateCriticalPosition = () => {
  const queryClient = useQueryClient();

  return useMutation(createCriticalPosition, {
    onSuccess: () => {
      queryClient.invalidateQueries('criticalPosition');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Critical action successfully created',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Creation Failed',
        description: 'Critical action creation failed',
      });
    },
  });
};
