import { crudRequest } from '@/utils/crudRequest';
import { RECRUITMENT_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { getCurrentToken } from '@/utils/getCurrentToken';

// Fetch token and tenantId from the authentication store

const tenantId = useAuthenticationStore.getState().tenantId;


const createIntern = async (data: any) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/intern`,
    method: 'POST',
    data,
    headers,
  });
};

const updateIntern = async (id: string, data: any) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/intern/${id}`,
    method: 'PUT',
    data,
    headers,
  });
};

const deleteIntern = async (id: string) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/intern/${id}`,
    method: 'DELETE',
    headers,
  });
};

export const useCreateIntern = () => {
  const queryClient = useQueryClient();
  return useMutation(createIntern, {
    onSuccess: () => {
      queryClient.invalidateQueries('intern');
      handleSuccessMessage('POST');
    },
  });
};

export const useUpdateIntern = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (params: { id: string; data: any }) => updateIntern(params.id, params.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('intern');
        handleSuccessMessage('PUT');
      },
    },
  );
};

export const useDeleteIntern = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteIntern, {
    onSuccess: () => {
      queryClient.invalidateQueries('intern');
      handleSuccessMessage('DELETE');
    },
  });
};
