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
import { ORG_DEV_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';

/**
 * Sends a request to add a new category to the system.
 *
 * @function
 * @async
 * @param {CategoryData} data - The category data to be added.
 * @returns {Promise<any>} A promise that resolves to the API response indicating the result of the operation.
 */
const addActionPlan = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const createdBy = useAuthenticationStore.getState().userId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
    createdByUserId: createdBy || '',
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/conversation-action-plans`,
    method: 'POST',
    data,
    headers,
  });
};
const editActionPlan = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const createdBy = useAuthenticationStore.getState().userId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
    createdByUserId: createdBy || '',
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/conversation-action-plans/${data?.id}`,
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
const deleteActionPlanByid = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/conversation-action-plans/${id}`,
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
export const useAddActionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation(addActionPlan, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('conversationActionPlan');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
export const useEditActionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation(editActionPlan, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('conversationActionPlan');
      queryClient.invalidateQueries('conversationActionPlanId');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

// eslint-enable-next-line @typescript-eslint/naming-convention

/**
 * Custom hook to delete a category using React Query.
 * Automatically invalidates the 'categories' query cache on success.
 *
 * @function
 * @returns {UseMutationResult} The mutation result object with methods to execute the mutation and handle its status.
 */
export const useDeleteActionPlanByid = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteActionPlanByid, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('conversationActionPlan');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
// eslint-enable-next-line @typescript-eslint/naming-convention
