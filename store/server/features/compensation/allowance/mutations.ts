/**
 * @module allowanceEntitlementMutation
 * This module provides functions and custom hooks for managing question templates (create, update, and delete) using CRUD operations via API requests.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';


/**
 * Deletes a custom question template by sending a DELETE request to the API.
 * The request includes pagination details such as the current page and page size for managing the UI state.
 *
 * @async
 * @function deleteQuestionTemplate
 * @returns {Promise<any>} The response from the API.
 */
const createAllowanceEntitlement = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${PAYROLL_URL}/compensation-item-entitlement`,
    method: 'POST',
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
const deleteAllowanceEntitlement = async (id: string) => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
    const headers = {
      tenantId,
      Authorization: `Bearer ${token}`,
    };
  
    return await crudRequest({
      url: `${PAYROLL_URL}/compensation-item-entitlement/${id}`,
      method: 'DELETE',
      headers,
    });
  };


/**
 * Custom hook to delete a question template using React Query's useMutation hook.
 * On success, the cache for `questionTemplate` is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for deleting a question template.
 */
export const useCreateAllowanceEntitlement = () => {
  const queryClient = useQueryClient();
  return useMutation(createAllowanceEntitlement, {
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('allowanceEntitlement');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

/**
 * Custom hook to delete a question template using React Query's useMutation hook.
 * On success, the cache for `questionTemplate` is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for deleting a question template.
 */
export const useDeleteAllowanceEntitlement = () => {
    const queryClient = useQueryClient();
    return useMutation(deleteAllowanceEntitlement, {
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('allowanceEntitlement');
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method);
      },
    });
  };