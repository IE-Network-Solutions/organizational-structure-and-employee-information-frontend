import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useQuery } from 'react-query';
import { Permission, PermissionDataType } from './interface';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;

/**
 * Function to fetch a paginated list of permissions by sending a GET request to the API.
 *
 * @param permissonCurrentPage - The current page number for pagination.
 * @param pageSize - The number of permissions to fetch per page.
 * @returns The response data from the API, containing the list of permissions.
 */
const getPermisssions = async (
  permissonCurrentPage: number,
  pageSize: number,
) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/permissions?page=${permissonCurrentPage}&limit=${pageSize}`,
    method: 'GET',

    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};

/**
 * Function to fetch a list of permissions without pagination by sending a GET request to the API.
 *
 * @returns The response data from the API, containing the list of all permissions.
 */
const getPermisssionsWithOutPagination = async () => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/permissions`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};

/**
 * Function to search for permissions based on a search term by sending a GET request to the API.
 *
 * @param searchTerm - An object containing:
 *   - `termKey`: The key of the column to search in (e.g., permission name).
 *   - `searchTerm`: The term to search for.
 * @returns The response data from the API, containing the list of permissions matching the search criteria.
 */
const getSearchPermissions = async (searchTerm: {
  termKey: string | null;
  searchTerm: string | null;
}) => {
  const token = await getCurrentToken();

  // const {searchTerm}=useSettingStore();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/permissions?columnName=${searchTerm?.termKey}&query=${searchTerm?.searchTerm}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};

/**
 * Function to fetch a single permission by its ID by sending a GET request to the API.
 *
 * @param id - The ID of the permission to fetch.
 * @returns The response data from the API, containing the details of the requested permission.
 *
 * @throws Error if the request fails.
 */
const getPermission = async (id: string) => {
  const token = await getCurrentToken();
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.get(`${ORG_AND_EMP_URL}/permissions/${id}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to fetch a list of permissions without pagination using `useQuery` from `react-query`.
 *
 * @returns The query object for fetching the list of permissions, which includes the permissions data
 *          and any loading or error states.
 */

export const useGetPermissionsWithOutPagination = () =>
  useQuery<PermissionDataType>('permissions', getPermisssionsWithOutPagination);

/**
 * Custom hook to search for permissions based on a search term using `useQuery` from `react-query`.
 *
 * @param searchTerm - An object containing:
 *   - `termKey`: The key of the column to search in (e.g., permission name).
 *   - `searchTerm`: The term to search for.
 * @returns The query object for searching permissions, which includes the search results and
 *          any loading or error states.
 *
 * @description
 * This hook uses `useQuery` to fetch permissions based on a search term. It maintains the previous
 * data while fetching new data to avoid unnecessary re-renders.
 */

export const useSearchPermissions = (searchTerm: {
  termKey: string | null;
  searchTerm: string | null;
}) =>
  useQuery<PermissionDataType>(
    ['permissions', searchTerm],
    () => getSearchPermissions(searchTerm),
    {
      keepPreviousData: true, // Optional: keep previous data while fetching new data
    },
  );

/**
 * Custom hook to fetch a paginated list of permissions using `useQuery` from `react-query`.
 *
 * @param permissonCurrentPage - The current page number for pagination.
 * @param pageSize - The number of permissions to fetch per page.
 * @returns The query object for fetching a paginated list of permissions, including the data and
 *          any loading or error states.
 *
 * @description
 * This hook uses `useQuery` to fetch a paginated list of permissions. It maintains the previous
 * data while fetching new data to enhance the user experience.
 */
export const useGetPermissions = (
  permissonCurrentPage: number,
  pageSize: number,
) =>
  useQuery<PermissionDataType>(
    ['permissions', permissonCurrentPage, pageSize],
    () => getPermisssions(permissonCurrentPage, pageSize),
    {
      keepPreviousData: true, // Optional: keep previous data while fetching new data
    },
  );

/**
 * Custom hook to fetch a single permission by its ID using `useQuery` from `react-query`.
 *
 * @param postId - The ID of the permission to fetch.
 * @returns The query object for fetching the permission, including the data and any loading or error states.
 *
 * @description
 * This hook uses `useQuery` to fetch a single permission by its ID. It keeps the previous data while
 * fetching new data to avoid unnecessary re-renders and provide a smooth user experience.
 */

export const useGetPermission = (postId: string) =>
  useQuery<Permission>(['permission', postId], () => getPermission(postId), {
    keepPreviousData: true,
  });
