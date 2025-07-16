import { crudRequest } from '@/utils/crudRequest';
import { RECRUITMENT_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { getCurrentToken } from '@/utils/getCurrentToken';

// Fetch token and tenantId from the authentication store
const token = await getCurrentToken();
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

const createIntern = async (data: any) => {
  return await crudRequest({
    url: `${RECRUITMENT_URL}/intern`,
    method: 'POST',
    data,
    headers,
  });
};

const updateIntern = async (id: string, data: any) => {
  return await crudRequest({
    url: `${RECRUITMENT_URL}/intern/${id}`,
    method: 'PUT',
    data,
    headers,
  });
};

const deleteIntern = async (id: string) => {
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
