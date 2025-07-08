/**
 * @module questionTemplateMutation
 * This module provides functions and custom hooks for managing question templates (create, update, and delete) using CRUD operations via API requests.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';

/**
 * Creates a new custom question template by sending a POST request to the API.
 *
 * @async
 * @function createQuestionTemplate
 * @param {Object} data - The data object representing the new question template.
 * @returns {Promise<any>} The response from the API.
 */
const createFeedback = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${ORG_DEV_URL}/feedback`,
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
const updateFeedback = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${ORG_DEV_URL}/feedback/${data?.id}`,
    method: 'patch',
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
const deleteFeedback = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/feedback/${id}`,
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
export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation(createFeedback, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('feedback');
      queryClient.invalidateQueries('feedbackTypes');
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
export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation(updateFeedback, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('feedback');
      queryClient.invalidateQueries('feedbackTypes');

      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
// eslint-enable-next-line @typescript-eslint/naming-convention

/**
 * Custom hook to delete a question template using React Query's useMutation hook.
 * On success, the cache for `questionTemplate` is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for deleting a question template.
 */
export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteFeedback, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('feedback');
      queryClient.invalidateQueries('feedbackTypes');

      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
// eslint-enable-next-line @typescript-eslint/naming-convention
