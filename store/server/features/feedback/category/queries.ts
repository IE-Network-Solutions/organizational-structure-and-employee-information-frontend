/**
 * This module contains query hooks for fetching categories and users using react-query.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

/**
 * Authentication headers for API requests
 */
const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId ? tenantId : '179055e7-a27c-4d9d-9538-2b2a115661bd',
  Authorization: `Bearer ${token}`,
  createdById: 'c9624522-40af-4f10-ba44-8697b36e7a1c',
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
const fetchCatUsers = async () => {
  return await crudRequest({
    url: 'http://172.16.34.161:8008/api/v1/users?deletedAt=null',
    method: 'GET',
    headers,
  });
};

const getFormCategoriesById = async (formCatsId: string) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/form-categories/${formCatsId}`,
    method: 'GET',
    headers,
  });
};

const fetchCatUsersById = async (createdById: string) => {
  return await crudRequest({
    url: `http://172.16.34.161:8008/api/v1/users/${createdById}?deletedAt=null`,
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
  return useQuery<any>('catUsers', fetchCatUsers);
};

export const useGetFormCategories = (formCatsId: string) => {
  return useQuery<any>(
    ['categories', formCatsId],
    () => getFormCategoriesById(formCatsId),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetUsersById = (createdById: string) => {
  return useQuery<any>(
    ['categories', createdById],
    () => fetchCatUsersById(createdById),
    {
      keepPreviousData: true,
    },
  );
};
