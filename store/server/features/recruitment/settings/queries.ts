import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const createCustomFieldsTemplate = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'POST',
    url: '/api/jobs',
    data,
    headers,
  });
};

const updateCustomFieldsTemplate = async (data: any, id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'PUT',
    url: `/api/jobs/${id}`,
    data,
    headers,
  });
};

export const useCreateCustomFieldsTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(createCustomFieldsTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries('customFields');
      NotificationMessage.success({
        message: 'Custom fields created successfully!',
        description: 'Recruitment custom fields has been successfully created',
      });
    },
  });
};

export const useUpdateCustomFieldsTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ data, id }: { data: any; id: string }) =>
      updateCustomFieldsTemplate(data, id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customFields');
        NotificationMessage.success({
          message: 'Custom fields updated successfully!',
          description:
            'Recruitment custom fields has been successfully updated',
        });
      },
    },
  );
};
