/**
 * This module contains query hooks for fetching categories and users using react-query.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { ResponseData } from './interface';

/**
 * Authentication headers for API requests
 */
const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId ? tenantId : '9fdb9540-607e-4cc5-aebf-0879400d1f69',
  Authorization: `Bearer ${token}`,
};

/**
 * Fetch all categories from the API.
 * @returns {Promise<ResponseData>} Promise with the list of categories.
 */
const fetchCategories = async (pageSize: number, currentPage: number) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/form-categories?limit=${pageSize}&page=${currentPage}`,
    method: 'GET',
    headers,
  });
};

/**
 * Fetch all users from the API.
 * @returns {Promise<any>} Promise with the list of users.
 */
const fetchUsers = async () => {
  return await crudRequest({
    url: 'https://mocki.io/v1/23b636da-7246-412a-baf8-e3f6abdea634',
    method: 'GET',
    headers,
  });
};

/**
 * Custom hook to fetch categories
 * @returns {UseQueryResult<ResponseData>} The Query object for fetching categories
 */
export const useFetchCategories = (pageSize: number, currentPage: number) => {
  return useQuery(
    ['categories', pageSize, currentPage],
    () => fetchCategories(pageSize, currentPage),
    {
      keepPreviousData: true,
    },
  );
};

/**
 * Custom hook to fetch users
 * @returns {UseQueryResult<any>} The Query object for fetching users
 */
export const useFetchUsers = () => {
  return useQuery<any>('users', fetchUsers);
};
