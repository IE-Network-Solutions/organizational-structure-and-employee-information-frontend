import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { CORE_API_URL, ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import {
  createUnknownEmployeePlaceholder,
  isUserNotFoundError,
} from '@/utils/unknownEmployee';

import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { normalizePaginatedListResponse } from '@/utils/employeeListResponse';
import {
  mergeEmployeeInformationRowPreservingBank,
  parseEmployeeInformationJsonFields,
} from '@/utils/employeeBankInformation';

/**
 * Function to fetch a list of employee branches by sending a GET request to the API.
 *
 * @returns The response data from the API.
 */
const getEmployeeBranches = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${CORE_API_URL}/branchs`,
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
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${CORE_API_URL}/departments/tenant/departments`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getAllUsersWithOutPagination = async () => {
  const token = await getCurrentToken();
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

const getEmployeeStatus = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/dashboard-stats/with-tenant`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetEmployeeStatus = () => {
  return useQuery<any>('employeeStatus', getEmployeeStatus);
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
 * @param gender - The gender for filtering.
 * @param joinedDate - The joined date for filtering.
 * @param joinedDateType - The type of joined date for filtering.
 * @returns The response data from the API.
 */
export const employeeAllFilter = async (
  pageSize: number,
  currentPage: number,
  branchId: string,
  departmentId: string,
  searchString: string,
  isDeleted: string,
  gender: string,
  employmentTypeId: string,
  joinedDate: string,
  joinedDateType: 'before' | 'after',
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  let joinedDateParam = '';
  if (joinedDate) {
    joinedDateParam =
      joinedDateType === 'before'
        ? `&joinedDateBefore=${joinedDate}`
        : `&joinedDateAfter=${joinedDate}`;
  }

  const response = await crudRequest({
    url: `${ORG_AND_EMP_URL}/users?branchId=${branchId}&departmentId=${departmentId}&searchString=${searchString}&deletedAt=${isDeleted ? isDeleted : null}&gender=${gender}&employmentTypeId=${employmentTypeId}${joinedDateParam}&page=${currentPage}&limit=${pageSize}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
  return normalizePaginatedListResponse(response);
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
 * @param branch - The branch ID to filter employees by.
 * @param department - The department ID to filter employees by.
 * @param searchString - The search string for filtering employees.
 * @param isDeleted - The deletion status to filter employees.
 * @param gender - The gender for filtering.
 * @param joinedDate - The joined date for filtering.
 * @param joinedDateType - The type of joined date for filtering.
 * @returns The query object containing the fetched data, loading status, and error information.
 */
export const useEmployeeAllFilter = (
  pageSize: number,
  currentPage: number,
  branch: string,
  department: string,
  searchString: string,
  isDeleted: string,
  gender: string,
  employmentTypeId: string,
  joinedDate: string,
  joinedDateType: 'before' | 'after',
) => {
  const tenantId = useAuthenticationStore((s) => s.tenantId);
  return useQuery(
    [
      'employees',
      pageSize,
      currentPage,
      branch,
      department,
      searchString,
      isDeleted,
      gender,
      employmentTypeId,
      joinedDate,
      joinedDateType,
      tenantId,
    ],
    () =>
      employeeAllFilter(
        pageSize,
        currentPage,
        branch,
        department,
        searchString,
        isDeleted,
        gender,
        employmentTypeId,
        joinedDate,
        joinedDateType,
      ),
    {
      keepPreviousData: true,
      enabled: !!tenantId,
      retry: 1,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  );
};

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getEmployees = async () => {
  const token = await getCurrentToken();
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
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };
    const response = await crudRequest({
      url: `${ORG_AND_EMP_URL}/users/all-users/all/payroll-data`,
      method: 'GET',
      headers,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const useGetActiveEmployee = () =>
  useQuery<any>('ActiveEmployees', getActiveEmployee);

export const getEmployeeInformationById = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-information/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getEmployee = async (id: string) => {
  // Prevent API call if id is not available
  if (!id || id === '' || id === 'undefined') {
    throw new Error(
      'Employee ID is not available. Please ensure a valid ID is provided.',
    );
  }

  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };
    const response = await crudRequest({
      url: `${ORG_AND_EMP_URL}/users/${id}`,
      method: 'GET',
      headers,
    });

    const employeeInformationId = response?.employeeInformation?.id as
      | string
      | undefined;

    // GET /users/:id can return Redis-stale nested employeeInformation; load the DB row directly.
    if (employeeInformationId) {
      try {
        const freshRow = await getEmployeeInformationById(
          employeeInformationId,
        );
        if (freshRow && typeof freshRow === 'object') {
          return {
            ...response,
            employeeInformation: mergeEmployeeInformationRowPreservingBank(
              response.employeeInformation
                ? parseEmployeeInformationJsonFields(
                    response.employeeInformation,
                  )
                : undefined,
              freshRow as Record<string, unknown>,
              null,
            ),
          };
        }
      } catch {
        // Fall back to nested user payload
      }
    }

    if (response?.employeeInformation) {
      return {
        ...response,
        employeeInformation: parseEmployeeInformationJsonFields(
          response.employeeInformation,
        ),
      };
    }
    return response;
  } catch (error) {
    if (isUserNotFoundError(error)) {
      return createUnknownEmployeePlaceholder(id);
    }
    throw error;
  }
};

export const getUser = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };
    const response = await crudRequest({
      url: `${ORG_AND_EMP_URL}/users/${id}`,
      method: 'GET',
      headers,
    });
    return response;
  } catch (error) {
    if (isUserNotFoundError(error)) {
      return createUnknownEmployeePlaceholder(id);
    }
    throw error;
  }
};

export const useGetAllUsers = () =>
  useQuery<any>('employeesWithOutPagination', getAllUsersWithOutPagination, {
    staleTime: 5 * 60_000,
  });

const getAllUsersDataWithOutPagination = async () => {
  const token = await getCurrentToken();
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

// Hook to get all users to get team leads
const getAllUsersToGetTeamLeads = async () => {
  const token = await getCurrentToken();
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

export const useGetAllUsersToGetTeamLeads = () =>
  useQuery<any>('allUsersToGetTeamLeads', getAllUsersToGetTeamLeads);

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
    enabled: !!empId && empId !== 'undefined' && empId.length > 0,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
