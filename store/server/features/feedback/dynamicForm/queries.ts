import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

const createQuestions = async (data: any) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/`,
    method: 'POST',
    data,
    headers,
  });
};

export const useCreateQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation(createQuestions, {
    onSuccess: (variables: any) => {
      queryClient.invalidateQueries('questions');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
