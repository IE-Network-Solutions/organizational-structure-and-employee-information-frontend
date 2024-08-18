import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useQuery } from 'react-query';
const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getEmployees = async () => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee`,
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
    method: 'GET',
  });
};

/**
 * Function to fetch a single post by sending a GET request to the API
 * @param id The ID of the post to fetch
 * @returns The response data from the API
 */

const getEmployee = async (id: string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };
    const response = await axios.get(`${ORG_AND_EMP_URL}/users/${id}`, {
      headers,
    });
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
export const useGetEmployees = () => useQuery<any[]>('employees', getEmployees);

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
export const useGetEmployee = (empId: string) =>
  useQuery<any>(['employee', empId], () => getEmployee(empId), {
    keepPreviousData: true,
  });
