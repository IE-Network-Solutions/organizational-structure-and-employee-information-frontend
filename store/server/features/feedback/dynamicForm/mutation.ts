import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';
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

const createDynamicForm = async (data: any) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/questions`,
    method: 'POST',
    data,
    headers,
  });
};

const updateDynamicForm = async (data: Form, id: string) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/forms/${id}`,
    method: 'PUT',
    data,
    headers,
  });
};

const deleteDynamicForm = async () => {
  const deletedItem = useDynamicFormStore.getState().deletedItem;
  const pageSize = useDynamicFormStore.getState().pageSize;
  const current = useDynamicFormStore.getState().current;
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/forms/${deletedItem}?limit=${pageSize}&&page=${current}`,
    method: 'DELETE',
    headers,
  });
};

export const useCreateDynamicForm = () => {
  const queryClient = useQueryClient();
  return useMutation(createDynamicForm, {
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('dynamicForms');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useUpdateDynamicForms = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ data, id }: { data: Form; id: string }) => updateDynamicForm(data, id),
    {
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('dynamicForms');
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method);
      },
    },
  );
};

export const useDeleteDynamicForm = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteDynamicForm, {
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('dynamicForms');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
