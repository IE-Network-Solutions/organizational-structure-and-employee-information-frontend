import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useQuery } from 'react-query';
import { Permission, PermissionDataType } from './interface';

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getPermisssions = async (
  permissonCurrentPage: number,
  pageSize: number,
) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/permissions?page=${permissonCurrentPage}&limit=${pageSize}`,
    method: 'GET',
  });
};

const getPermisssionsWithOutPagination = async () => {
  return crudRequest({ url: `${ORG_AND_EMP_URL}/permissions`, method: 'GET' });
};
const getSearchPermissions = async (searchTerm: {
  termKey: string | null;
  searchTerm: string | null;
}) => {
  // const {searchTerm}=useSettingStore();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/permissions?columnName=${searchTerm?.termKey}&query=${searchTerm?.searchTerm}`,
    method: 'GET',
  });
};
/**
 * Function to fetch a single post by sending a GET request to the API
 * @param id The ID of the post to fetch
 * @returns The response data from the API
 */

const getPermission = async (id: number) => {
  try {
    const response = await axios.get(`${ORG_AND_EMP_URL}/permissions/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to fetch a list of posts using useQuery from react-query.
 *
 * @returns The query object for fetching posts.
 *
 * @description
 * This hook uses `useQuery` to fetch a list of posts from the API. It returns
 * the query object containing the posts data and any loading or error states.
 */
// export const useGetPermissions = ()=> useQuery<PermissionDataType>("posts" , getPermisssions)
export const useGetPermissionsWithOutPagination = () =>
  useQuery<PermissionDataType>('permissions', getPermisssionsWithOutPagination);
// export const useSearchPermissions = ()=> useQuery<PermissionDataType>("permissions" , getSearchPermissions)

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
 * Custom hook to fetch a single post by ID using useQuery from react-query.
 *
 * @param postId The ID of the post to fetch
 * @returns The query object for fetching the post.
 *
 * @description
 * This hook uses `useQuery` to fetch a single post by its ID. It returns the
 * query object containing the post data, and it keeps the previous data
 * while the new data is being fetched.
 */
export const useGetPermission = (postId: number) =>
  useQuery<Permission>(['permission', postId], () => getPermission(postId), {
    keepPreviousData: true,
  });
