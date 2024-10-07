import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { RECRUITMENT_URL } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { TalentPoolCategoryResponse } from '@/types/dashboard/recruitment/talentPool';

/* eslint-disable @typescript-eslint/naming-convention */

// Fetch token and tenantId from the authentication store
const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

/**
 * Create a new talent pool category.
 * @param data - Talent pool category data to be created.
 * @returns Promise with the created category data.
 */
const createTalentPoolCategory = async (data: any) => {
  return await crudRequest({
    url: `${RECRUITMENT_URL}/talent-pool-category`,
    method: 'POST',
    data,
    headers,
  });
};

/**
 * Update an existing talent pool category.
 * @param id - ID of the category to update.
 * @param data - Updated category data.
 * @returns Promise with the updated category data.
 */
const updateTalentPoolCategory = async (id: string, data: TalentPoolCategoryResponse) => {
  return await crudRequest({
    url: `${RECRUITMENT_URL}/talent-pool-category/${id}`,
    method: 'PATCH',
    data,
    headers,
  });
};

/**
 * Delete a talent pool category.
 * @param id - ID of the category to delete.
 * @returns Promise confirming the deletion.
 */
const deleteTalentPoolCategory = async (id: string) => {
  return await crudRequest({
    url: `${RECRUITMENT_URL}/talent-pool-category/${id}`,
    method: 'DELETE',
    headers,
  });
};

/**
 * Custom hook to create a new talent pool category using react-query.
 * Invalidate the "talentPoolCategory" query on success to refresh the data.
 * @returns Mutation object for creating a talent pool category.
 */
export const useCreateTalentPoolCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(createTalentPoolCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries('talentPoolCategory');
      handleSuccessMessage('POST');
    },
  });
};

/**
 * Custom hook to update an existing talent pool category using react-query.
 * Invalidate the "talentPoolCategory" query on success to refresh the data.
 * @returns Mutation object for updating a talent pool category.
 */
export const useUpdateTalentPoolCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { id: string; category: TalentPoolCategoryResponse }) =>
      updateTalentPoolCategory(data.id, data.category),
    {
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('talentPoolCategory');
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method || 'PATCH');
      },
    }
  );
};

/**
 * Custom hook to delete a talent pool category using react-query.
 * Invalidate the "talentPoolCategory" query on success to refresh the data.
 * @returns Mutation object for deleting a talent pool category.
 */
export const useDeleteTalentPoolCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteTalentPoolCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries('talentPoolCategory');
      handleSuccessMessage('DELETE');
    },
  });
};
