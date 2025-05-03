import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_DEV_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';

const createEmployeeSurvey = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/survey-target-score`,
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
const updateEmployeeSurvey = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/survey-target-score/${data?.id}`,
    method: 'PATCH',
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
const deleteEmployeeSurvey = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${ORG_DEV_URL}/survey-target-score/${id}`,
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
export const useCreateEmployeeSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation(createEmployeeSurvey, {
    onSuccess: () => {
      queryClient.invalidateQueries('survey-target-score');
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
export const useUpdateEmployeeSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation(updateEmployeeSurvey, {
    onSuccess: () => {
      queryClient.invalidateQueries('survey-target-score');
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
export const useDeleteEmployeeSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteEmployeeSurvey, {
    onSuccess: () => {
      queryClient.invalidateQueries('survey-target-score');
    },
  });
};
// eslint-enable-next-line @typescript-eslint/naming-convention
