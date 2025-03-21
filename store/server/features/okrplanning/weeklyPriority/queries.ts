import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL, ORG_AND_EMP_URL } from '@/utils/constants';
import axios from 'axios';
import { DataItem } from '@/store/uistate/features/weeklyPriority/useStore';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;

type DepartmentData = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
}[];
type WeekData = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  title: string;
}[];

type ResponseData = {
  items?: DataItem[];
};

const getDepartmentChild = async (departmentId: string) => {
  if (departmentId) {
    return crudRequest({
      url: `${ORG_AND_EMP_URL}/departments/child-departments/departments/${departmentId}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        tenantId: tenantId, // Pass tenantId in the headers
      },
    });
  }
};
const getWeeks = async () => {
  return crudRequest({
    url: `${OKR_AND_PLANNING_URL}/weekly-priorities-week`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};

const getWeeklyPriority = async (
  departmentIds: string[],
  weeklyId: string[],
) => {
  try {
    const response = await axios.post(
      `${OKR_AND_PLANNING_URL}/weekly-priorities`,
      { departmentId: departmentIds, weeklyPriorityWeekId: weeklyId }, // This is the request body
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
export const useGetWeeklyPriorities = (
  // pageSize: number,
  // currentPage: number,
  departmentIds: string[],
  weeklyId: string[],
) =>
  useQuery<ResponseData>(['weeklyPriorities', departmentIds, weeklyId], () =>
    getWeeklyPriority(departmentIds, weeklyId),
  );
export const useGetDepartmentChild = (departmentId: string) =>
  useQuery<DepartmentData>(['departmentChild', departmentId], () =>
    getDepartmentChild(departmentId),
  );

export const useGetWeeks = () => useQuery<WeekData>('weeks', () => getWeeks());

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
