import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT } from '@/utils/constants';
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
    // url: `http://172.16.33.228:8010/api/v1/application-questions-form-template`,
    url: `${RECRUITMENT}/application-questions-form-template`,
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
    url: `${RECRUITMENT}/application-questions-form-template/${id}`,
    // url: `http://172.16.33.228:8010/api/v1/application-questions-form-template/${id}`,
    data,
    headers,
  });
};

const deleteCustomFieldsTemplate = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'DELETE',
    url: `${RECRUITMENT}/application-questions-form-template/${id}`,
    // url: `http://172.16.33.228:8010/api/v1/application-questions-form-template/${id}`,
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
