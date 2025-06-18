import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import axios from 'axios';
import { Objective } from '@/store/uistate/features/okrplanning/okr/interface';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const logUserId = useAuthenticationStore.getState().userId;

type ResponseData = {
  items: Objective[];
  meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
};

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getObjectiveByUser = async (
  id: number | string,
  pageSize: number,
  currentPage: number,
  metricTypeId: string,
) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.get(
      `${OKR_AND_PLANNING_URL}/objective/${id}?page=${currentPage}&limit=${pageSize}&metricTypeId=${metricTypeId}`,

      {
        headers,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
const getObjectiveByTeam = async (
  pageSize: number,
  currentPage: number,
  users: string[],
  userId: string,
  metricTypeId: string,
) => {
  try {
    const response = await axios.post(
      `${OKR_AND_PLANNING_URL}/objective/team?page=${currentPage}&limit=${pageSize}`,
      {
        users: users,
        userId: userId,
        metricTypeId: metricTypeId,
        updatedBy: logUserId,
        createdBy: logUserId,
      }, // This is the request body
      {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
          tenantId: tenantId, // Pass tenantId in the headers
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getObjectiveByCompany = async (
  id: number | string,
  pageSize: number,
  currentPage: number,
  users: number[],
  userId: string,
  metricTypeId: string,
) => {
  try {
    const response = await axios.post(
      `${OKR_AND_PLANNING_URL}/objective/company/okr/${id}?page=${currentPage}&limit=${pageSize}`,
      {
        users: users,
        userId: userId,
        metricTypeId: metricTypeId,
        updatedBy: logUserId,
        createdBy: logUserId,
      }, // This is the request body
      {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
          tenantId: tenantId, // Pass tenantId in the headers
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
const getEmployeeOkr = async (
  sessions: string[],
  searchObjParams: {
    userId: string;
    metricTypeId: string;
    departmentId: string;
  },
  page: number,
  currentPage: number,
) => {
  try {
    const response = await axios.post(
      `${OKR_AND_PLANNING_URL}/objective/get-okr-progress/all-employees?page=${currentPage}&limit=${page}`,
      {
        sessions,
        userId: searchObjParams?.userId,
        departmentId: searchObjParams?.departmentId,
        metricTypeId: searchObjParams?.metricTypeId,
        updatedBy: logUserId,
        createdBy: logUserId,
      }, // merged into one object
      {
        headers: {
          Authorization: `Bearer ${token}`,
          tenantId: tenantId,
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Function to fetch a single post by sending a GET request to the API
 * @param id The ID of the post to fetch
 * @returns The response data from the API
 */

/**
 * Custom hook to fetch a list of posts using useQuery from react-query.
 *
 * @returns The query object for fetching posts.
 *
 * @description
 * This hook uses `useQuery` to fetch a list of posts from the API. It returns
 * the query object containing the posts data and any loading or error states.
 */

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
export const useGetUserObjective = (
  postId: number | string,
  pageSize: number,
  currentPage: number,
  metricTypeId: string,
) =>
  useQuery<ResponseData>(
    ['ObjectiveInformation', postId, pageSize, currentPage, metricTypeId],
    () => getObjectiveByUser(postId, pageSize, currentPage, metricTypeId),
    {
      keepPreviousData: true,
    },
  );
export const useGetTeamObjective = (
  pageSize: number,
  currentPage: number,
  users: string[],
  userId: string,
  metricTypeId: string,
) =>
  useQuery<ResponseData>(
    [
      'teamObjectiveInformation',
      users,
      pageSize,
      currentPage,
      userId,
      metricTypeId,
    ],
    () =>
      getObjectiveByTeam(pageSize, currentPage, users, userId, metricTypeId),
    {
      keepPreviousData: true,
    },
  );
export const useGetCompanyObjective = (
  postId: number | string,
  pageSize: number,
  currentPage: number,
  users: number[],
  userId: string,
  metricTypeId: string,
) =>
  useQuery<ResponseData>(
    [
      'companyObjectiveInformation',
      users,
      postId,
      pageSize,
      currentPage,
      userId,
      metricTypeId,
    ],
    () =>
      getObjectiveByCompany(
        postId,
        pageSize,
        currentPage,
        users,
        userId,
        metricTypeId,
      ),
    {
      keepPreviousData: true,
    },
  );
export const useGetEmployeeOkr = (
  sessions: string[],
  searchObjParams: {
    userId: string;
    metricTypeId: string;
    departmentId: string;
  },
  page: number,
  currentPage: number,
) =>
  useQuery<ResponseData>(
    ['employeeOkrInformation', sessions, searchObjParams, page, currentPage],
    () => getEmployeeOkr(sessions, searchObjParams, page, currentPage),
  );
