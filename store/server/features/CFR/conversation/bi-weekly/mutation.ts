/**
 * This module provides mutation hooks for managing form categories using React Query.
 * It includes functions for adding, updating, and deleting categories in a form management system.
 *
 * The hooks make use of React Query's `useMutation` to handle API requests and automatically
 * update the query cache for 'categories' after each successful mutation.
 *
 * @module CategoryMutation
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { CategoryData } from './interface';
import { ORG_DEV_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { getCurrentToken } from '@/utils/getCurrentToken';
/**
 * Sends a request to add a new category to the system.
 *
 * @function
 * @async
 * @param {CategoryData} data - The category data to be added.
 * @returns {Promise<any>} A promise that resolves to the API response indicating the result of the operation.
 */
const addCategory = async (data: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const createdBy = useAuthenticationStore.getState().userId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
    createdByUserId: createdBy || '',
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/form-categories`,
    method: 'POST',
    data,
    headers,
  });
};

/**
 * Sends a request to update an existing category in the system.
 *
 * @function
 * @async
 * @param {CategoryData} data - The updated category data.
 * @param {string} id - The ID of the category to be updated.
 * @returns {Promise<any>} A promise that resolves to the API response indicating the result of the operation.
 */
const updateFormCategory = async (data: CategoryData, id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/form-categories/${id}`,
    method: 'PUT',
    data,
    headers,
  });
};

/**
 * Sends a request to delete a category from the system.
 *
 * @function
 * @async
 * @returns {Promise<any>} A promise that resolves to the API response indicating the result of the operation.
 */
const deleteFormCategory = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  const deletedItem = CategoriesManagementStore.getState().deletedItem;
  const pageSize = CategoriesManagementStore.getState().pageSize;
  const current = CategoriesManagementStore.getState().current;
  return await crudRequest({
    url: `${ORG_DEV_URL}/form-categories/${deletedItem}?limit=${pageSize}&&page=${current}`,
    method: 'DELETE',
    headers,
  });
};

/**
 * Custom hook to add a new category using React Query.
 * Automatically invalidates the 'categories' query cache on success.
 *
 * @function
 * @returns {UseMutationResult} The mutation result object with methods to execute the mutation and handle its status.
 */
export const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(addCategory, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('categories');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
// eslint-enable-next-line @typescript-eslint/naming-convention

/**
 * Custom hook to update an existing category using React Query.
 * Automatically invalidates the 'categories' query cache on success.
 *
 * @function
 * @returns {UseMutationResult} The mutation result object with methods to execute the mutation and handle its status.
 */
export const useUpdateFormCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ data, id }: { data: CategoryData; id: string }) =>
      updateFormCategory(data, id),
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('categories');
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method);
      },
    },
  );
};
// eslint-enable-next-line @typescript-eslint/naming-convention

/**
 * Custom hook to delete a category using React Query.
 * Automatically invalidates the 'categories' query cache on success.
 *
 * @function
 * @returns {UseMutationResult} The mutation result object with methods to execute the mutation and handle its status.
 */
export const useDeleteFormCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteFormCategory, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('categories');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
// eslint-enable-next-line @typescript-eslint/naming-convention
