/**
 * This module contains query hooks for fetching categories and users using react-query.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL, ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

/**
 * Fetch all categories from the API.
 * @param {number} pageSize - The number of categories to fetch per page.
 * @param {number} currentPage - The current page number.
 * @param {string} name - The name filter for categories.
 * @param {string} description - The description filter for categories.
 * @param {string} createdBy - The ID of the user who created the categories.
 * @returns {Promise<ResponseData>} Promise with the list of categories.
 */
const fetchCategories = async (
  pageSize: number,
  currentPage: number,
  name: string,
  description: string,
  createdBy: string,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId || '';

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
    createdById: userId,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/form-categories?name=${name}&description=${description}&createdBy=${createdBy || ''}&limit=${pageSize}&page=${currentPage}`,
    method: 'GET',
    headers,
  });
};

/**
 * Fetch all users from the API.
 * @returns {Promise<any>} Promise with the list of users.
 */
const fetchUsers = async (searchString: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/users?searchString=${searchString}&&deletedAt=null`,
    method: 'GET',
    headers,
  });
};

/**
 * Fetch a specific category by its ID.
 * @param {string} formCatsId - The ID of the category to fetch.
 * @returns {Promise<any>} Promise with the category data.
 */
const getFormCategoriesById = async (formCatsId: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return crudRequest({
    url: `${ORG_DEV_URL}/form-categories/${formCatsId}`,
    method: 'GET',
    headers,
  });
};

/**
 * Fetch a specific user by their ID.
 * @param {string} createdById - The ID of the user to fetch.
 * @returns {Promise<any>} Promise with the user data.
 */
const fetchCatUsersById = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId || '';

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
    createdById: userId,
  };

  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/users/${userId}?deletedAt=null`,
    method: 'GET',
    headers,
  });
};

const getEmployeeDepartments = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/all/departments`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

/**
 * Custom hook to fetch categories.
 * @param {number} pageSize - The number of categories to fetch per page.
 * @param {number} currentPage - The current page number.
 * @param {string} name - The name filter for categories.
 * @param {string} description - The description filter for categories.
 * @param {string} createdBy - The ID of the user who created the categories.
 * @returns {UseQueryResult<ResponseData>} The Query object for fetching categories.
 */
export const useFetchCategories = (
  pageSize: number,
  currentPage: number,
  name: string,
  description: string,
  createdBy: string,
) => {
  return useQuery(
    ['categories', pageSize, currentPage, name, description, createdBy],
    () => fetchCategories(pageSize, currentPage, name, description, createdBy),
    {
      keepPreviousData: true,
    },
  );
};

/**
 * Custom hook to fetch users.
 * @returns {UseQueryResult<any>} The Query object for fetching users.
 */
export const useFetchUsers = (searchString: string) => {
  return useQuery<any>(['users', searchString], () => fetchUsers(searchString));
};

/**
 * Custom hook to fetch a specific category by its ID.
 * @param {string} formCatsId - The ID of the category to fetch.
 * @returns {UseQueryResult<any>} The Query object for fetching the category.
 */
export const useGetFormCategories = (formCatsId: string) => {
  return useQuery<any>(
    ['categories', formCatsId],
    () => getFormCategoriesById(formCatsId),
    {
      keepPreviousData: true,
    },
  );
};

/**
 * Custom hook to fetch a specific user by their ID.
 * @param {string} createdById - The ID of the user to fetch.
 * @returns {UseQueryResult<any>} The Query object for fetching the user.
 */
export const useGetUsersById = async () => {
  const token = await getCurrentToken();
  return useQuery<any>('categories', fetchCatUsersById, {
    keepPreviousData: true,
    enabled: !!token,
  });
};

export const useEmployeeDepartments = () => {
  return useQuery<any>('department', getEmployeeDepartments);
};
