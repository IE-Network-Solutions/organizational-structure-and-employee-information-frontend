import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { DataItem } from './interface';

/**
 * Function to add a new post by sending a POST request to the API
 * @param newPost The data for the new post
 * @returns The response data from the API
 */
const createActionPlan = async ({ formId, values }: { formId: string, values: DataItem[] }) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/action-plans/many/${formId}`,
    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId,
    },
  });
};
const deleteActionPlan = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_DEV_URL}/action-plans/${id}`,
    method: 'delete',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};
export const useCreateActionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation(createActionPlan, {
    onSuccess: () => {
      queryClient.invalidateQueries('actionPlans');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Action plan successfully created',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Creation Failed',
        description: 'Action plan creation failed',
      });
    },
  });
};

export const useDeleteActionPlanById = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteActionPlan, {
    onSuccess: () => {
      queryClient.invalidateQueries('actionPlans');
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'action plan successfully Deleted',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Deleted Failed',
        description: 'action plan Delete Failed',
      });
    },
  });
};
