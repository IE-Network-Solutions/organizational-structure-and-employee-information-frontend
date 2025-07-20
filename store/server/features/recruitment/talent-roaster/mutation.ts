import { crudRequest } from '@/utils/crudRequest';
import { RECRUITMENT_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { getCurrentToken } from '@/utils/getCurrentToken';

// Fetch token and tenantId from the authentication store
const tenantId = useAuthenticationStore.getState().tenantId;

const createTalentRoaster = async (data: any) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/talent-roaster`,
    method: 'POST',
    data,
    headers,
  });
};

const updateTalentRoaster = async (id: string, data: any) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/talent-roaster/${id}`,
    method: 'PUT',
    data,
    headers,
  });
};

const deleteTalentRoaster = async (id: string) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/talent-roaster/${id}`,
    method: 'DELETE',
    headers,
  });
};

export const useCreateTalentRoaster = () => {
  const queryClient = useQueryClient();
  return useMutation(createTalentRoaster, {
    onSuccess: () => {
      queryClient.invalidateQueries('talentRoaster');
      handleSuccessMessage('POST');
    },
  });
};

export const useUpdateTalentRoaster = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (params: { id: string; data: any }) =>
      updateTalentRoaster(params.id, params.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('talentRoaster');
        handleSuccessMessage('PUT');
      },
    },
  );
};

export const useDeleteTalentRoaster = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteTalentRoaster, {
    onSuccess: () => {
      queryClient.invalidateQueries('talentRoaster');
      handleSuccessMessage('DELETE');
    },
  });
};
