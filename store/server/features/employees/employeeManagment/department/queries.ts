import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { CORE_API_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

/**
 * Function to fetch level-1 departments (divisions) by sending a GET request to the API
 * @returns The response data from the API
 */
const getLevel1Departments = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${CORE_API_URL}/departments/level-1`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getDepartments = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${CORE_API_URL}/departments/tenant/departments`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};

const getDepartmentsWithUsers = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${CORE_API_URL}/users/all/departments`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};

const DEPARTMENT_USERS_PAGE_SIZE = 1000;

const getDepartmentUsersAllLevels = async (departmentId: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };

  const fetchPage = (page: number) =>
    crudRequest({
      url: `${CORE_API_URL}/departments/child-departments/departments/all-levels/users/${departmentId}?page=${page}&limit=${DEPARTMENT_USERS_PAGE_SIZE}`,
      method: 'GET',
      headers,
    });

  const firstPage = await fetchPage(1);
  const firstUsers = extractUsersFromDepartmentPayload(firstPage);
  const totalItems = getTotalFromDepartmentPayload(
    firstPage,
    firstUsers.length,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / DEPARTMENT_USERS_PAGE_SIZE),
  );

  if (totalPages <= 1 || firstUsers.length >= totalItems) {
    return firstUsers;
  }

  const remainingPages = [];
  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
    remainingPages.push(fetchPage(pageNumber));
  }
  const remainingResults = await Promise.all(remainingPages);

  return [
    ...firstUsers,
    ...remainingResults.flatMap((page) =>
      extractUsersFromDepartmentPayload(page),
    ),
  ];
};

function extractUsersFromDepartmentPayload(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.users)) return payload.users;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.users)) return payload.data.users;
  if (Array.isArray(payload.data?.items)) return payload.data.items;
  return [];
}

function getTotalFromDepartmentPayload(payload: any, fallback: number) {
  const meta = payload?.meta ?? payload?.data?.meta ?? {};
  return (
    Number(meta.totalItems ?? meta.total ?? payload?.totalItems ?? fallback) ||
    fallback
  );
}

/**
 * Function to fetch a single post by sending a GET request to the API
 * @param id The ID of the post to fetch
 * @returns The response data from the API
 */

const getDepartment = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await crudRequest({
      url: `${CORE_API_URL}/departments/tenant/departments/${id}`,
      method: 'GET',
      headers,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const getDepartmentLead = async (id: string | null) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await crudRequest({
      url: `${CORE_API_URL}/users/get-department-lead/${id}`,
      method: 'GET',
      headers,
    });
    return response;
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

export const useGetDepartmentUsersAllLevels = (departmentId: string | null) =>
  useQuery<any>(
    ['departmentUsersAllLevels', departmentId],
    () => getDepartmentUsersAllLevels(departmentId as string),
    {
      enabled: !!departmentId,
      keepPreviousData: false,
    },
  );

export const useGetDepartmentLead = (id: string | null) =>
  useQuery<any>(['departmentLead', id], () => getDepartmentLead(id), {
    keepPreviousData: true,
    enabled: !!id,
  });
