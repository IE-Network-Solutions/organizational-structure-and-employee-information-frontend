import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCustomQuestionTemplateStore } from '@/store/uistate/features/feedback/settings';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId ? tenantId : '179055e7-a27c-4d9d-9538-2b2a115661bd',
  Authorization: `Bearer ${token}`,
};

const createQuestionTemplate = async (data: any) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/custom-fields`,
    method: 'POST',
    data: data,
    headers,
  });
};

const updateQuestionTemplate = async (data: any, id: string) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/custom-fields/${id}`,
    method: 'PUT',
    data: data,
    headers,
  });
};

const deleteQuestionTemplate = async () => {
  const deletingQuestionId =
    useCustomQuestionTemplateStore.getState().deletingQuestionId;
  const pageSize = useCustomQuestionTemplateStore.getState().templatePageSize;
  const current = useCustomQuestionTemplateStore.getState().templateCurrentPage;

  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/custom-fields/${deletingQuestionId}?limit=${pageSize}&&page=${current}`,
    method: 'DELETE',
    headers,
  });
};

export const useCreateQuestionTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(createQuestionTemplate, {
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('questionTemplate');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useUpdateQuestionTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ data, id }: { data: any; id: string }) =>
      updateQuestionTemplate(data, id),
    {
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('questionTemplate');
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method);
      },
    },
  );
};

export const useDeleteQuestionTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteQuestionTemplate, {
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('questionTemplate');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
