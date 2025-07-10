import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { GroupPermissionType } from './interface';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
/**
 * Function to fetch Permission Groups by sending a GET request to the API
 * @returns The response data from the API
 */
const getPermissionGroups = async (
  permissonGroupCurrentPage: number,
  pageSize: number,
) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/permission-group?page=${permissonGroupCurrentPage}&limit=${pageSize}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};

const getPermissionGroupswithOutPagination = async () => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/permission-group`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};
/**
 * Function to fetch a single Permission Group by sending a GET request to the API
 * @param id The ID of the post to fetch
 * @returns The response data from the API
 */

const getPermissionGroup = async (id: string) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/permission-group/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

/**
 * Custom hook to fetch a list of Permission Groups using useQuery from react-query.
 *
 * @returns The query object for fetching posts.
 *
 * @description
 * This hook uses `useQuery` to fetch a list of posts from the API. It returns
 * the query object containing the Permission Groups data and any loading or error states.
 */
// export const useGetPermissionGroups = (permissonGroupCurrentPage:number,pageSize:number)=> useQuery<groupPermissionType>('groupPermissions' , getPermissionGroups(permissonGroupCurrentPage,pageSize))

export const useGetPermissionGroups = (
  permissonGroupCurrentPage: number,
  pageSize: number,
) =>
  useQuery<GroupPermissionType>(
    ['groupPermissions', permissonGroupCurrentPage, pageSize],
    () => getPermissionGroups(permissonGroupCurrentPage, pageSize),
    {
      keepPreviousData: true, // Optional: keep previous data while fetching new data
    },
  );
export const useGetPermissionGroupsWithOutPagination = () =>
  useQuery<GroupPermissionType>(
    'groupPermissions',
    getPermissionGroupswithOutPagination,
  );

/**
 * Custom hook to fetch a single Permission Group by ID using useQuery from react-query.
 *
 * @param postId The ID of the post to fetch
 * @returns The query object for fetching the Permission Group.
 *
 * @description
 * This hook uses `useQuery` to fetch a single Permission Group by its ID. It returns the
 * query object containing the post data, and it keeps the previous data
 * while the new data is being fetched.
 */
export const useGetPermissionGroup = (postId: string) =>
  useQuery<any>(['groupPermission', postId], () => getPermissionGroup(postId), {
    keepPreviousData: true,
  });
