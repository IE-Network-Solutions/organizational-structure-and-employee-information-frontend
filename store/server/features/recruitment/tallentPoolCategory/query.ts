import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TalentPoolCategoryResponse } from '@/types/dashboard/recruitment/talentPool';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';

// Fetch token and tenantId from the authentication store
const tenantId = useAuthenticationStore.getState().tenantId;


// Fetch all talent pool categories from the API
const getAllTalentPoolCategory = async (
  pageSize: number,
  currentPage: number,
) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/talent-pool-category?limit=${pageSize}&&page=${currentPage}`,
    method: 'GET',
    headers,
  });
};

// Fetch a specific talent pool category by ID from the API
const getTalentPoolCategoryById = async (id: string) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/talent-pool-category/${id}`,
    method: 'GET',
    headers,
  });
};

/**
 * Custom hook to fetch all talent pool categories.
 * Uses React Query's useQuery to manage the query state.
 * @returns Query object containing the list of talent pool categories.
 */
export const useGetTalentPoolCategory = (
  pageSize: number,
  currentPage: number,
) =>
  useQuery<TalentPoolCategoryResponse>(
    ['talentPoolCategory', pageSize, currentPage],
    () => getAllTalentPoolCategory(pageSize, currentPage),
  );

/**
 * Custom hook to fetch a specific talent pool category by ID.
 * Uses React Query's useQuery to manage the query state.
 * @param id - ID of the talent pool category to fetch.
 * @returns Query object containing the category's data.
 */
export const useGetTalentPoolCategoryById = (id: string) =>
  useQuery<TalentPoolCategoryResponse>(
    ['talentPoolCategory', id],
    () => getTalentPoolCategoryById(id),
    {
      keepPreviousData: true,
    },
  );
