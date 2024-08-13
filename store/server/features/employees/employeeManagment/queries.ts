import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useQuery } from 'react-query';

const header = {
  tenantId: '8f2e3691-423f-4f21-b676-ba3a932b7c7f',
};

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getEmployees = async () => {
  return crudRequest({ url: `${ORG_AND_EMP_URL}/employee`, method: 'GET' });
};

/**
 * Function to fetch a single post by sending a GET request to the API
 * @param id The ID of the post to fetch
 * @returns The response data from the API
 */

const getEmployee = async (id: string) => {
  try {
    const response = await axios.get(`${ORG_AND_EMP_URL}/users/${id}`, {
      headers: header,
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
export const useGetEmployees = () => useQuery<any[]>('employee', getEmployees);

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
