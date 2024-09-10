/**
 * @module questionTemplateMutation
 * This module provides functions and custom hooks for managing question templates (create, update, and delete) using CRUD operations via API requests.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCustomQuestionTemplateStore } from '@/store/uistate/features/feedback/settings';
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
 * @property {string} tenantId - The tenant ID for API requests.
 * @property {string} Authorization - Authorization header with Bearer token.
 */
const headers = {
  tenantId,
  Authorization: `Bearer ${token}`,
};

/**
 * Creates a new custom question template by sending a POST request to the API.
 *
 * @async
 * @function createQuestionTemplate
 * @param {Object} data - The data object representing the new question template.
 * @returns {Promise<any>} The response from the API.
 */
const createQuestionTemplate = async (data: any) => {
  return await crudRequest({
    url: `${ORG_DEV_URL}/custom-fields`,
    method: 'POST',
    data,
    headers,
  });
};

/**
 * Updates an existing custom question template by sending a PUT request to the API.
 *
 * @async
 * @function updateQuestionTemplate
 * @param {Object} data - The updated data for the question template.
 * @param {string} id - The ID of the question template to be updated.
 * @returns {Promise<any>} The response from the API.
 */
const updateQuestionTemplate = async (data: any, id: string) => {
  return await crudRequest({
    url: `${ORG_DEV_URL}/custom-fields/${id}`,
    method: 'PUT',
    data,
    headers,
  });
};

/**
 * Deletes a custom question template by sending a DELETE request to the API.
 * The request includes pagination details such as the current page and page size for managing the UI state.
 *
 * @async
 * @function deleteQuestionTemplate
 * @returns {Promise<any>} The response from the API.
 */
const deleteQuestionTemplate = async () => {
  const deletingQuestionId =
    useCustomQuestionTemplateStore.getState().deletingQuestionId;
  const pageSize = useCustomQuestionTemplateStore.getState().templatePageSize;
  const current = useCustomQuestionTemplateStore.getState().templateCurrentPage;

  return await crudRequest({
    url: `${ORG_DEV_URL}/custom-fields/${deletingQuestionId}?limit=${pageSize}&&page=${current}`,
    method: 'DELETE',
    headers,
  });
};

/**
 * Custom hook to create a question template using React Query's useMutation hook.
 * On success, the cache for `questionTemplate` is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for creating a question template.
 */
export const useCreateQuestionTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(createQuestionTemplate, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('questionTemplate');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
// eslint-enable-next-line @typescript-eslint/naming-convention

/**
 * Custom hook to update a question template using React Query's useMutation hook.
 * On success, the cache for `questionTemplate` is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for updating a question template.
 */
export const useUpdateQuestionTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ data, id }: { data: any; id: string }) =>
      updateQuestionTemplate(data, id),
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('questionTemplate');
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method);
      },
    },
  );
};
// eslint-enable-next-line @typescript-eslint/naming-convention

/**
 * Custom hook to delete a question template using React Query's useMutation hook.
 * On success, the cache for `questionTemplate` is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for deleting a question template.
 */
export const useDeleteQuestionTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteQuestionTemplate, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('questionTemplate');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
// eslint-enable-next-line @typescript-eslint/naming-convention
