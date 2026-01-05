import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';

const createCustomFieldsTemplate = async (data: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'POST',
    url: `${RECRUITMENT_URL}/application-questions-form-template`,
    data,
    headers,
  });
};

const updateCustomFieldsTemplate = async (data: any, id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'PUT',
    url: `${RECRUITMENT_URL}/application-questions-form-template/${id}`,
    data,
    headers,
  });
};

const deleteCustomFieldsTemplate = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'DELETE',
    url: `${RECRUITMENT_URL}/application-questions-form-template/${id}`,
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

export const useDeleteCustomFieldsTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deleteCustomFieldsTemplate(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('customFields');
      NotificationMessage.success({
        message: 'Job deleted successfully!',
        description: 'Job has been successfully deleted',
      });
    },
  });
};
