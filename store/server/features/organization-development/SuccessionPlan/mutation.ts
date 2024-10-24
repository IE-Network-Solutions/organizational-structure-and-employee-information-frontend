import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

/**
 * Function to add a new post by sending a POST request to the API
 * @param newPost The data for the new post
 * @returns The response data from the API
 */
const createCriticalPosition = async ({ values }: { values: any }) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  return crudRequest({
    url: `http://localhost:5000/api/v1/critical-positions/${userId}`,
    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  });
};

const createSuccessionPlan = async ({
  successor,
  criticalPositionId,
}: {
  successor: string[];
  criticalPositionId: string;
}) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  return crudRequest({
    url: `http://localhost:5000/api/v1/succession-plans/${userId}`,
    method: 'POST',
    data: { ...successor, criticalPositionId }, // Send the data correctly
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
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
        description: 'Critical position successfully created',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Creation Failed',
        description: 'Critical position creation failed',
      });
    },
  });
};

export const useCreateSuccessionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation(createSuccessionPlan, {
    onSuccess: () => {
      queryClient.invalidateQueries('criticalPosition');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Succession plan successfully created',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Creation Failed',
        description: 'Succession plan creation failed',
      });
    },
  });
};
