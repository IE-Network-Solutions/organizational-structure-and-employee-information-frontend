import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { Form } from './interface';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';
import { getCurrentToken } from '@/utils/getCurrentToken';

/**
 * Adds a new form.
 * @param data - The form data to be added.
 * @returns The response from the server.
 */
const addForm = async (data: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/forms`,
    method: 'POST',
    data,
    headers,
  });
};

/**
 * Updates an existing form.
 * @param data - The form data to be updated.
 * @param id - The ID of the form to be updated.
 * @returns The response from the server.
 */
const updateForm = async (data: Form, id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/forms/${id}`,
    method: 'PUT',
    data,
    headers,
  });
};

/**
 * Deletes a form.
 * @returns The response from the server.
 */
const deleteForm = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  const deletedItem = useDynamicFormStore.getState().deletedItem;
  const pageSize = useDynamicFormStore.getState().pageSize;
  const current = useDynamicFormStore.getState().current;
  return await crudRequest({
    url: `${ORG_DEV_URL}/forms/${deletedItem}?limit=${pageSize}&&page=${current}`,
    method: 'DELETE',
    headers,
  });
};

/**
 * Custom hook to add a form using react-query's useMutation.
 * @returns The mutation object for adding a form.
 */
export const useAddForm = () => {
  const queryClient = useQueryClient();
  return useMutation(addForm, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('forms');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
// eslint-enable-next-line @typescript-eslint/naming-convention

/**
 * Custom hook to update a form using react-query's useMutation.
 * @returns The mutation object for updating a form.
 */
export const useUpdateForm = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ data, id }: { data: Form; id: string }) => updateForm(data, id),
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('forms');
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method);
      },
    },
  );
};
// eslint-enable-next-line @typescript-eslint/naming-convention

/**
 * Custom hook to delete a form using react-query's useMutation.
 * @returns The mutation object for deleting a form.
 */
export const useDeleteForm = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteForm, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('forms');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
