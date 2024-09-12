import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

const createQuestions = async () => {
  return await crudRequest({
    url: `${ORG_DEV_URL}/questions`,
    method: 'GET',
    headers,
  });
};

const fetchPublicForms = async (id: string) => {
  return await crudRequest({
    url: `${ORG_DEV_URL}/forms/public/${id}`,
    method: 'GET',
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

export const useFetchPublicForms = (empId: string) =>
  useQuery<any>('publicForms', () => fetchPublicForms(empId));
