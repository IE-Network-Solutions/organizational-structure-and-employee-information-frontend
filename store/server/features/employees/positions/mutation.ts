import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';

const createPositions = async (data: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    method: 'POST',
    url: `${ORG_AND_EMP_URL}/positions`,
    data,
    headers,
  });
};

const updatePositions = async (data: any, id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'PUT',
    url: `${ORG_AND_EMP_URL}/positions/${id}`,
    data,
    headers,
  });
};

const deletePosition = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'DELETE',
    url: `${ORG_AND_EMP_URL}/positions/${id}`,
    headers,
  });
};

export const useCreatePosition = () => {
  const queryClient = useQueryClient();
  return useMutation(createPositions, {
    onSuccess: () => {
      queryClient.invalidateQueries('positions');
      NotificationMessage.success({
        message: 'Position created successfully!',
        description: 'Position has been successfully created',
      });
    },
  });
};

export const useUpdatePosition = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ data, id }: { data: any; id: string }) => updatePositions(data, id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('positions');
        NotificationMessage.success({
          message: 'Position updated successfully!',
          description: 'Position has been successfully updated',
        });
      },
    },
  );
};

export const useDeletePosition = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deletePosition(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('positions');
      NotificationMessage.success({
        message: 'Position deleted successfully!',
        description: 'Position has been successfully deleted',
      });
    },
  });
};
