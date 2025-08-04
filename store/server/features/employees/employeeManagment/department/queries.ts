import { requestHeader } from '@/helpers/requestHeader';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

/**
 * Function to fetch level-1 departments (divisions) by sending a GET request to the API
 * @returns The response data from the API
 */
const getLevel1Departments = async () => {
  const requestHeaders = await requestHeader();

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/departments/level-1`,
    method: 'GET',
    headers: requestHeaders,
  });
};

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getDepartments = async () => {
  const requestHeaders = await requestHeader();

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/departments/tenant/departments`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getDepartmentsWithUsers = async () => {
  const requestHeaders = await requestHeader();

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/all/departments`,
    method: 'GET',
    headers: requestHeaders,
  });
};

/**
 * Function to fetch a single post by sending a GET request to the API
 * @param id The ID of the post to fetch
 * @returns The response data from the API
 */

const getDepartment = async (id: string) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/departments/tenant/departments/${id}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getDepartmentLead = async (id: string | null) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.get(
      `${ORG_AND_EMP_URL}/users/get-department-lead/${id}`,
      { headers },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
/**
 * Custom hook to fetch level-1 departments (divisions) using useQuery from react-query.
 *
 * @returns The query object for fetching level-1 departments.
 *
 * @description
 * This hook uses `useQuery` to fetch level-1 departments from the API. It returns
 * the query object containing the departments data and any loading or error states.
 */
export const useGetLevel1Departments = () =>
  useQuery<any>('level1Departments', getLevel1Departments);

/**
 * Custom hook to fetch a list of posts using useQuery from react-query.
 *
 * @returns The query object for fetching posts.
 *
 * @description
 * This hook uses `useQuery` to fetch a list of posts from the API. It returns
 * the query object containing the posts data and any loading or error states.
 */
export const useGetDepartments = () =>
  useQuery<any>('departments', getDepartments);

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
export const useGetDepartment = (departmentID: string) =>
  useQuery<any>(
    ['department', departmentID],
    () => getDepartment(departmentID),
    {
      keepPreviousData: true,
    },
  );

export const useGetDepartmentsWithUsers = () =>
  useQuery<any>('departmentsWithUsers', getDepartmentsWithUsers);

export const useGetDepartmentLead = (id: string | null) =>
  useQuery<any>(['departmentLead', id], () => getDepartmentLead(id), {
    keepPreviousData: true,
    enabled: !!id,
  });
