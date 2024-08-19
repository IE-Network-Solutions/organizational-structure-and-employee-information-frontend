import { ORG_AND_EMP_URL, tenantId } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

/**
 * Function to fetch a list of employee branches by sending a GET request to the API.
 *
 * @returns The response data from the API.
 */
const getEmployeeBranches = async () => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/branchs`,
    method: 'GET',
    headers: {
      tenantId: tenantId,
    },
  });
};

/**
 * Function to fetch a list of employee departments by sending a GET request to the API.
 *
 * @returns The response data from the API.
 */
const getEmployeeDepartments = async () => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/departments/tenant/departments`,
    method: 'GET',
    headers: {
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
const employeeAllFilter = async (
  pageSize: number,
  currentPage: number,
  branchId: string,
  departmentId: string,
  searchString: string,
  isDeleted: string,
) => {
  const response = await crudRequest({
    url: `${ORG_AND_EMP_URL}/users?branchId=${branchId}&departmentId=${departmentId}&searchString=${searchString}&deletedAt=${isDeleted ? isDeleted : null}&page=${currentPage}&limit=${pageSize}`,
    method: 'GET',
    headers: {
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
    ['all', pageSize, currentPage, searchString, branch, isDeleted, department],
    () =>
      employeeAllFilter(
        pageSize,
        currentPage,
        searchString,
        branch,
        isDeleted,
        department,
      ),
    {
      keepPreviousData: true,
    },
  );
};
