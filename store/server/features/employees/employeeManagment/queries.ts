import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useQuery } from 'react-query';

/**
 * Function to fetch a list of employee branches by sending a GET request to the API.
 *
 * @returns The response data from the API.
 */
const getEmployeeBranches = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/branchs`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

/* Function to fetch a list of employee departments by sending a GET request to the API.
 *
 * @returns The response data from the API.
 */
const getEmployeeDepartments = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/departments/tenant/departments`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getAllUsersWithOutPagination = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

/**
 * Function to fetch a filtered list of employees.
 *
 * @param pageSize - The number of items per page.
 * @param currentPage - The current page number.
 * @param branchId - The branch ID for filtering.
 * @param departmentId - The department ID for filtering.
 * @param searchString - The search string for filtering.
 * @param isDeleted - The deletion status for filtering.
 * @returns The response data from the API.
 */
export const employeeAllFilter = async (
  pageSize: number,
  currentPage: number,
  departmentId: string,
  isDeleted: string,
  branchId: string,
  searchString: string,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const response = await crudRequest({
    url: `${ORG_AND_EMP_URL}/users?branchId=${branchId}&departmentId=${departmentId}&searchString=${searchString}&deletedAt=${isDeleted ? isDeleted : null}&page=${currentPage}&limit=${pageSize}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
  return response;
};

/**
 * Custom hook to fetch a list of employee branches using useQuery from react-query.
 *
 * @returns The query object for fetching branches.
 */
export const useEmployeeBranches = () => {
  return useQuery<any>('branch', getEmployeeBranches);
};

/**
 * Custom hook to fetch a list of employee departments using useQuery from react-query.
 *
 * @returns The query object for fetching departments.
 */
export const useEmployeeDepartments = () => {
  return useQuery<any>('department', getEmployeeDepartments);
};

/**
 * Custom hook to fetch a filtered list of employees using useQuery from react-query.
 *
 * @param pageSize - The number of items to display per page.
 * @param currentPage - The current page number.
 * @param searchString - The search string for filtering employees.
 * @param branch - The branch ID to filter employees by.
 * @param isDeleted - The deletion status to filter employees.
 * @param department - The department ID to filter employees by.
 * @returns The query object containing the fetched data, loading status, and error information.
 */
export const useEmployeeAllFilter = (
  pageSize: number,
  currentPage: number,
  searchString: string,
  branch: string,
  isDeleted: string,
  department: string,
) => {
  return useQuery<any>(
    [
      'employees',
      pageSize,
      currentPage,
      searchString,
      branch,
      isDeleted,
      department,
    ],
    () =>
      employeeAllFilter(
        pageSize,
        currentPage,
        branch,
        department,
        searchString,
        isDeleted,
      ),
    {
      keepPreviousData: true,
    },
  );
};

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getEmployees = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users?deletedAt=null`,
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

const getActiveEmployee = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };
    const response = await axios.get(
      `${ORG_AND_EMP_URL}/users/all-users/all/payroll-data`,
      {
        headers,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useGetActiveEmployee = () =>
  useQuery<any>('ActiveEmployees', getActiveEmployee);

const getEmployee = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

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

export const useGetAllUsers = () =>
  useQuery<any>('employeesWithOutPagination', getAllUsersWithOutPagination);

const getAllUsersDataWithOutPagination = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/all-users/all`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetAllUsersData = () =>
  useQuery<any>('allEmployeesData', getAllUsersDataWithOutPagination);

/**
 * Custom hook to fetch a list of posts using useQuery from react-query.
 *
 * @returns The query object for fetching posts.
 *
 * @description
 * This hook uses `useQuery` to fetch a list of posts from the API. It returns
 * the query object containing the posts data and any loading or error states.
 */
export const useGetEmployees = () => {
  const token = useAuthenticationStore.getState().token;
  return useQuery<any>('employees', getEmployees, {
    enabled: !!token,
  });
};

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
    enabled: !!empId, // Ensures id is truthy and not null or empty
  
  });
