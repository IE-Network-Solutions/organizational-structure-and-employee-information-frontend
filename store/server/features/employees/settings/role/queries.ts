import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useQuery } from 'react-query';
import { Role, RoleType } from './interface';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';

const token = await getCurrentToken();
const tenantId = useAuthenticationStore.getState().tenantId;
/**
 * Function to fetch a paginated list of roles by sending a GET request to the API.
 *
 *
 * @param permissonCurrentPage - The current page number for pagination.
 * @param pageSize - The number of roles to fetch per page.
 * @returns The response data from the API containing the list of roles.
 */

const getRoles = async (permissonCurrentPage: number, pageSize: number) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/roles?page=${permissonCurrentPage}&limit=${pageSize}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};

/**
 * Function to fetch all roles without pagination by sending a GET request to the API.
 *
 *
 * @returns The response data from the API containing all roles.
 */
const getRolesWithOutPagination = async () => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/roles`,
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
    method: 'GET',
  });
};

/**
 * Function to fetch all roles without pagination by sending a GET request to the API.
 *
 * @returns The response data from the API containing all roles.
 */
const getRolesWithPermisison = async () => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/roles/find-all-role-with-permissions/role-permissions`,
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },

    method: 'GET',
  });
};

/**
 * Function to fetch a single role by its ID by sending a GET request to the API.
 *
 * @param id - The ID of the role to fetch. It can be a string or null.
 * @returns The response data from the API containing the role details.
 * @throws Error if the request fails.
 */
const getRole = async (id: string | null) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.get(
      `${ORG_AND_EMP_URL}/roles/find-one-role-with-permissions/role-permissions/${id}`,
      { headers },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to fetch a paginated list of roles using `useQuery` from `react-query`.
 *
 * @param permissonCurrentPage - The current page number for pagination.
 * @param pageSize - The number of roles to fetch per page.
 * @returns The query object containing the list of roles, along with loading and error states.
 *
 * @description
 * This hook uses `useQuery` to fetch a paginated list of roles from the API. It returns
 * the query object containing roles data and handles loading and error states. It keeps
 * the previous data while fetching new data.
 */
export const useGetRoles = (permissonCurrentPage: number, pageSize: number) =>
  useQuery<RoleType>(
    ['roles', permissonCurrentPage, pageSize],
    () => getRoles(permissonCurrentPage, pageSize),
    {
      keepPreviousData: true, // Optional: keep previous data while fetching new data
    },
  );

/**
 * Custom hook to fetch all roles without pagination using `useQuery` from `react-query`.
 *
 * @returns The query object containing all roles, along with loading and error states.
 *
 * @description
 * This hook uses `useQuery` to fetch all roles from the API without pagination. It returns
 * the query object containing all roles data and handles loading and error states.
 */
export const useGetRolesWithOutPagination = () =>
  useQuery<RoleType>('roles', getRolesWithOutPagination);

/**
 * Custom hook to fetch a single role by its ID using `useQuery` from `react-query`.
 *
 * @param roleId - The ID of the role to fetch. It can be a string or null.
 * @returns The query object containing the role details, along with loading and error states.
 *
 * @description
 * This hook uses `useQuery` to fetch a single role by its ID from the API. It returns
 * the query object containing role details and keeps previous data while fetching new data.
 * This hook is disabled by default and can be enabled conditionally.
 */
export const useGetRole = (roleId: string | null) =>
  useQuery<any>(['role', roleId], () => getRole(roleId), {
    keepPreviousData: true,
    enabled: false,
  });

export const useGetRolesWithPermission = () =>
  useQuery<Role[]>('rolesWithPermisison', getRolesWithPermisison);
