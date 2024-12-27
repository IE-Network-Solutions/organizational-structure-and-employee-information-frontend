/**
 * @module compensationTypeMutation
 * This module provides functions and custom hooks for managing compensation types (create, update, and delete) using CRUD operations via API requests.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';

/**
 * Creates a new compensation type (allowance type) by sending a POST request to the API.
 *
 * @async
 * @function createAllowanceType
 * @param {Object} data - The data object representing the new compensation type.
 * @returns {Promise<any>} The response from the API.
 */
const createAllowanceType = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${PAYROLL_URL}/compensation-items`,
    method: 'POST',
    data,
    headers,
  });
};

/**
 * Deletes a compensation type (allowance type) by sending a DELETE request to the API.
 *
 * @async
 * @function deleteAllowanceType
 * @param {string} id - The ID of the compensation type to be deleted.
 * @returns {Promise<any>} The response from the API.
 */
const deleteAllowanceType = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${PAYROLL_URL}/compensation-items/${id}`,
    method: 'DELETE',
    headers,
  });
};

/**
 * Custom hook to create a compensation type using React Query's useMutation hook.
 * On success, the cache for `allowanceType` is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for creating a compensation type.
 */
export const useCreateAllowanceType = () => {
  const queryClient = useQueryClient();
  return useMutation(createAllowanceType, {
    onSuccess: (unused: any, variables: any) => {
      queryClient.invalidateQueries('allowanceType');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

/**
 * Custom hook to delete a compensation type using React Query's useMutation hook.
 * On success, the cache for `allowanceType` is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for deleting a compensation type.
 */
export const useDeleteAllowanceType = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAllowanceType, {
    onSuccess: (unused: any, variables: any) => {
      queryClient.invalidateQueries('allowanceType');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};