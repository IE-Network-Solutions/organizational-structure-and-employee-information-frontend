import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { OKR_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;

const createPlanTasks = async (values: any) => {
  return crudRequest({
    url: `${OKR_URL}/plan-tasks`,
    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useCreatePlanTasks = () => {
  const queryClient = useQueryClient();
  return useMutation(createPlanTasks, {
    onSuccess: () => {
      queryClient.invalidateQueries('okrPlans');
      NotificationMessage.success({
        message: 'Successfully Created ',
        description: ' ',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Creating Failed',
        description: '',
      });
    },
  });
};

const updatePlanTasks = async (values: any) => {
  return crudRequest({
    url: `${OKR_URL}/plan-tasks`,
    method: 'PATCH',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useUpdatePlanTasks = () => {
  const queryClient = useQueryClient();
  return useMutation(updatePlanTasks, {
    onSuccess: () => {
      queryClient.invalidateQueries('okrPlans');
      NotificationMessage.success({
        message: 'Successfully Updated ',
        description: ' ',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Updating Failed',
        description: '',
      });
    },
  });
};
