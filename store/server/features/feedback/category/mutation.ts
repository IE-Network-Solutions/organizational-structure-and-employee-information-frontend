/**
 * This module contains mutation hooks for managing form categories using react-query.
 * It includes functions for adding, updating, and deleting categories.
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

/**
 * Authentication headers for API requests
 */
const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

/**
 * Adds a new category to the system.
 * @param {CategoryData} data - The category data to be added.
 * @returns {Promise<any>} The response from the API indicating success or failure.
 */
const addCategory = async (data: any) => {
  return await crudRequest({
    url: `${ORG_DEV_URL}/form-categories`,
    method: 'POST',
    data,
    headers,
  });
};

/**
 * Updates an existing category in the system.
 * @param {CategoryData} data - The updated category data.
 * @param {string} id - The ID of the category to update.
 * @returns {Promise<any>} The response from the API indicating success or failure.
 */
const updateFormCategory = async (data: CategoryData, id: string) => {
  return await crudRequest({
    url: `${ORG_DEV_URL}/form-categories/${id}`,
    method: 'PUT',
    data,
    headers,
  });
};

/**
 * Deletes a category from the system.
 * @returns {Promise<any>} The response from the API indicating success or failure.
 */
const deleteFormCategory = async () => {
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
 * Hook for adding a new category.
 * @returns {UseMutationResult} Mutation result object containing the status and methods for the mutation.
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
 * Hook for updating an existing category.
 * @returns {UseMutationResult} Mutation result object containing the status and methods for the mutation.
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
 * Hook for deleting a category.
 * @returns {UseMutationResult} Mutation result object containing the status and methods for the mutation.
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
