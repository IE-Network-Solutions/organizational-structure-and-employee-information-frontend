/**
 * @module dynamicFormMutation
 * This module provides functions and custom hooks for managing dynamic forms using CRUD operations.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';

/**
 * Creates a new dynamic form by sending a POST request to the API.
 *
 * @async
 * @function createDynamicForm
 * @param {Object} data - The data object representing the new dynamic form.
 * @returns {Promise<any>} The response from the API.
 */
const createQuestions = async (data: any) => {
  const token = await getCurrentToken();

  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/questions`,
    method: 'POST',
    data,
    headers,
  });
};

/**
 * Updates an existing dynamic form by sending a PUT request to the API.
 *
 * @async
 * @function updateDynamicForm
 * @param {Object} data - The updated data for the dynamic form.
 * @param {string} id - The ID of the dynamic form to be updated.
 * @returns {Promise<any>} The response from the API.
 */
const updateQuestions = async (data: any, id: string) => {
  const token = await getCurrentToken();

  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/questions/${id}`,
    method: 'PUT',
    data,
    headers,
  });
};

/**
 * Deletes a dynamic form by sending a DELETE request to the API.
 * The request includes pagination details such as the current page and page size.
 *
 * @async
 * @function deleteDynamicForm
 * @returns {Promise<any>} The response from the API.
 */
const deleteQuestion = async () => {
  const token = await getCurrentToken();

  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  const { pageSize, current } = useDynamicFormStore.getState();
  const { deleteItemId } = useOrganizationalDevelopment.getState();
  return await crudRequest({
    url: `${ORG_DEV_URL}/questions/${deleteItemId}?limit=${pageSize}&&page=${current}`,
    method: 'DELETE',
    headers,
  });
};

/**
 * Custom hook to handle the creation of dynamic forms using React Query's useMutation hook.
 * On success, the dynamic forms cache is invalidated and a success message is shown.
 *
 * @returns {MutationObject} The mutation object for creating a dynamic form.
 */
export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation(createQuestions, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (data, variables: any) => {
      queryClient.invalidateQueries(['questions', data?.formId]);
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
// eslint-enable-next-line @typescript-eslint/naming-convention

/**
 * Custom hook to handle the updating of dynamic forms using React Query's useMutation hook.
 * On success, the dynamic forms cache is invalidated and a success message is shown.
 *
 * @returns {MutationObject} The mutation object for updating dynamic forms.
 */
export const useUpdateQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ data, id }: { data: any; id: string }) => updateQuestions(data, id),
    {
      onSuccess: (data, variables: any) => {
        queryClient.invalidateQueries(['questions', data?.formId]);
        queryClient.invalidateQueries(['questions']);
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method);
      },
    },
  );
};
// eslint-enable-next-line @typescript-eslint/naming-convention

/**
 * Custom hook to handle the deletion of dynamic forms using React Query's useMutation hook.
 * On success, the dynamic forms cache is invalidated and a success message is shown.
 *
 * @returns {MutationObject} The mutation object for deleting a dynamic form.
 */
export const useDeleteQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteQuestion, {
    onSuccess: (data, variables: any) => {
      queryClient.invalidateQueries(['questions', data?.formId]);
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
