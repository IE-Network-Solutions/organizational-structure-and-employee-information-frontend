import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { Branch } from './interface';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';

const token = await getCurrentToken();
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};
/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Create a new branch.
 * @param data - Branch data to be created.
 * @returns Promise with the created branch data.
 */

const createBranch = async (data: Branch) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/branchs`,
    method: 'POST',
    data,
    headers,
  });
};

/**
 * Update an existing branch.
 * @param id - ID of the branch to update.
 * @param data - Updated branch data.
 * @returns Promise with the updated branch data.
 */
const updateBranch = async (id: string, data: Branch) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/branchs/${id}`,
    method: 'PATCH',
    data,
    headers,
  });
};

/**
 * Delete a branch.
 * @param id - ID of the branch to delete.
 * @returns Promise confirming the deletion.
 */
const deleteBranch = async (id: string) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/branchs/${id}`,
    method: 'DELETE',
    headers,
  });
};

/**
 * Custom hook to create a new branch using react-query.
 * Invalidate the "branches" query on success to refresh the data.
 * @returns Mutation object for creating a branch.
 */
export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation(createBranch, {
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('branches');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

/**
 * Custom hook to update an existing branch using react-query.
 * Invalidate the "branches" query on success to refresh the data.
 * @returns Mutation object for updating a branch.
 */
export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { id: string; branch: Branch }) =>
      updateBranch(data.id, data.branch),
    {
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('branches');
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method);
      },
    },
  );
};

/**
 * Custom hook to delete a branch using react-query.
 * Invalidate the "branches" query on success to refresh the data.
 * @returns Mutation object for deleting a branch.
 */
export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteBranch, {
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('branches');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

/* eslint-enable @typescript-eslint/naming-convention */
