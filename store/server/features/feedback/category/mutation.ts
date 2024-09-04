/**
 * This module contains mutation hooks for managing form categories using react-query.
 * It includes functions for adding, updating, and deleting categories.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { CategoryData } from './interface';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';

/**
 * Authentication headers for API requests
 */
const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId ? tenantId : '179055e7-a27c-4d9d-9538-2b2a115661bd',
  Authorization: `Bearer ${token}`,
};

/**
 * Adds a new category
 * @param {CategoryData} data - The category data to be added
 * @returns {Promise<any>} The response from the API
 */
const addCategory = async (data: any) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/form-categories`,
    method: 'POST',
    data,
    headers,
  });
};

/**
 * Updates an existing category
 * @param {CategoryData} data - The updated category data
 * @param {string} id - The ID of the category to update
 * @returns {Promise<any>} The response from the API
 */
const updateFormCategory = async (data: CategoryData, id: string) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/form-categories/${id}`,
    method: 'PUT',
    data,
    headers,
  });
};

/**
 * Deletes a category
 * @returns {Promise<any>} The response from the API
 */
const deleteFormCategory = async () => {
  const deletedItem = CategoriesManagementStore.getState().deletedItem;
  const pageSize = CategoriesManagementStore.getState().pageSize;
  const current = CategoriesManagementStore.getState().current;
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/form-categories/${deletedItem}?limit=${pageSize}&&page=${current}`,
    method: 'DELETE',
    headers,
  });
};

/**
 * Hook for adding a new category
 * @returns {UseMutationResult} Mutation result object
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

/**
 * Hook for updating an existing category
 * @returns {UseMutationResult} Mutation result object
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

/**
 * Hook for deleting a category
 * @returns {UseMutationResult} Mutation result object
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
