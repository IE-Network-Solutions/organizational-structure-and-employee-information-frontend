/**
 * @module dynamicFormMutation
 * This module provides functions and custom hooks for managing dynamic forms using CRUD operations.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';

/**
 * @constant {string} token - The authentication token retrieved from the authentication store.
 */
const token = useAuthenticationStore.getState().token;

/**
 * @constant {string} tenantId - The tenant ID retrieved from the authentication store.
 */
const tenantId = useAuthenticationStore.getState().tenantId;

/**
 * @constant {Object} headers - Headers for API requests, including tenant ID and Bearer token for authorization.
 * @property {string} tenantId - Tenant ID for API requests.
 * @property {string} Authorization - Authorization header with Bearer token.
 */
const headers = {
  tenantId,
  Authorization: `Bearer ${token}`,
};

/**
 * Creates a new dynamic form by sending a POST request to the API.
 *
 * @async
 * @function createDynamicForm
 * @param {Object} data - The data object representing the new dynamic form.
 * @returns {Promise<any>} The response from the API.
 */
const createQuestions = async (data: any) => {
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
  const { deletedItem, pageSize, current } = useDynamicFormStore.getState();
  return await crudRequest({
    url: `${ORG_DEV_URL}/forms/${deletedItem}?limit=${pageSize}&&page=${current}`,
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
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('questions');
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
      // eslint-disable-next-line @typescript-eslint/naming-convention
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('questions');
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('questions');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
