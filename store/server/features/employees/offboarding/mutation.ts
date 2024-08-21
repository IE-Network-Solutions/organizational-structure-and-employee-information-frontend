import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;

const addOffboardingItem = async (values: any) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/items`,
    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const updateOffboardingItem = async (values: any) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/items/${values?.itemId}`,
    method: 'PATCH',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const deleteOffboardingItem = async (values: any) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/items/${values?.itemId}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useAddOffboardingItem = () => {
  const queryClient = useQueryClient();
  return useMutation(addOffboardingItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('offboardItems');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Item successfully Created',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Creating Failed',
        description: 'Item creation Failed',
      });
    },
  });
};

export const useUpdateOffboardingItem = () => {
  const queryClient = useQueryClient();
  return useMutation(updateOffboardingItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('offboardItems');
      NotificationMessage.success({
        message: 'Successfully Updated',
        description: 'Item successfully updated',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Updating Failed',
        description: 'Item update Failed',
      });
    },
  });
};

export const useDeleteOffboardingItem = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteOffboardingItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('offboardItems');
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'Item successfully deleted',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Deleting Failed',
        description: 'Item deletion Failed',
      });
    },
  });
};
