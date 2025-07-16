import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { BranchResponse } from './interface';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';

const token = await getCurrentToken();
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};
/**
 * Fetch all branches from the API.
 * @returns Promise with the list of branches.
 */

const getAllBranches = async () => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/branchs`,
    method: 'GET',
    headers,
  });
};

/**
 * Fetch a specific branch by ID from the API.
 * @param id - ID of the branch to fetch.
 * @returns Promise with the branch data.
 */
const getBranch = async (id: string) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/branches/${id}`,
    method: 'GET',
    headers,
  });
};

/**
 * Custom hook to fetch all branches.
 * Uses React Query's useQuery to manage the query state.
 * @returns Query object containing the list of branches.
 */
export const useGetBranches = () =>
  useQuery<BranchResponse>('branches', getAllBranches);

export const useGetAllBranches = () =>
  useQuery<BranchResponse>('branches', getAllBranches);

/**
 * Custom hook to fetch a specific branch by ID.
 * Uses React Query's useQuery to manage the query state.
 * @param id - ID of the branch to fetch.
 * @returns Query object containing the branch data.
 */
export const useGetBranch = (id: string) =>
  useQuery<BranchResponse>(['branch', id], () => getBranch(id), {
    keepPreviousData: true,
  });
