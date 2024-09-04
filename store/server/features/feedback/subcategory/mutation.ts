import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { Form } from './interface';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId ? tenantId : '179055e7-a27c-4d9d-9538-2b2a115661bd',
  Authorization: `Bearer ${token}`,
};

/**
 * Adds a new form.
 * @param data - The form data to be added.
 * @returns The response from the server.
 */
const addForm = async (data: any) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/forms`,
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
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/forms/${id}`,
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
  const deletedItem = CategoriesManagementStore.getState().deletedItem;
  const pageSize = CategoriesManagementStore.getState().pageSize;
  const current = CategoriesManagementStore.getState().current;
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/forms/${deletedItem}?limit=${pageSize}&&page=${current}`,
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
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('forms');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

/**
 * Custom hook to update a form using react-query's useMutation.
 * @returns The mutation object for updating a form.
 */
export const useUpdateForm = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ data, id }: { data: Form; id: string }) => updateForm(data, id),
    {
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('forms');
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method);
      },
    },
  );
};

/**
 * Custom hook to delete a form using react-query's useMutation.
 * @returns The mutation object for deleting a form.
 */
export const useDeleteForm = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteForm, {
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('forms');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
