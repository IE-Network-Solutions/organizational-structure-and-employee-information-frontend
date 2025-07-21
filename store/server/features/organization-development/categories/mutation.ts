import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { DataItem } from './interface';
import { getCurrentToken } from '@/utils/getCurrentToken';

/**
 * Function to add a new post by sending a POST request to the API
 * @param newPost The data for the new post
 * @returns The response data from the API
 */
const createActionPlan = async ({
  formId,
  values,
}: {
  formId: string;
  values: DataItem[];
}) => {
  const token = await getCurrentToken();
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

const updateActionPlan = async ({
  actionPlanId,
  values,
}: {
  actionPlanId: any;
  values: any;
}) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/action-plans/${actionPlanId}`,
    method: 'put',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId,
    },
  });
};
const deleteActionPlan = async (id: string) => {
  const token = await getCurrentToken();
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
const resolveActionPlan = async (params: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_DEV_URL}/action-plans/${params?.id}`,
    method: 'put',
    data: { status: params?.status },
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

export const useUpdateActionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation(updateActionPlan, {
    onSuccess: () => {
      queryClient.invalidateQueries('actionPlans');
      NotificationMessage.success({
        message: 'Successfully updated',
        description: 'Action plan updated successfully created',
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
export const useResolveActionPlanById = () => {
  const queryClient = useQueryClient();
  return useMutation(resolveActionPlan, {
    onSuccess: () => {
      queryClient.invalidateQueries(['actionPlans', 'delegation']);
      NotificationMessage.success({
        message: 'Successfully resolved',
        description: 'action plan status resolved successfully',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'resolved Failed',
        description: 'action plan resolved Failed',
      });
    },
  });
};
