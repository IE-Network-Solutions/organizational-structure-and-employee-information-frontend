import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL, ORG_AND_EMP_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { DataItem } from '@/store/uistate/features/weeklyPriority/useStore';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
// const logUserId = useAuthenticationStore.getState().userId;

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
  failureReason?: string;
}[];

type ResponseData = {
  items?: DataItem[];
  meta?: {
    totalItems: number;
    currentPage: number;
    limit: number;
  };
};

const getDepartmentChild = async (departmentId: string) => {
  if (departmentId) {
    return crudRequest({
      url: `${ORG_AND_EMP_URL}/departments/child-departments/departments/all-levels/${departmentId}`,
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
  pageSize: number,
  currentPage: number,
) => {
  return crudRequest({
    url: `${OKR_AND_PLANNING_URL}/weekly-priorities?page=${currentPage}&limit=${pageSize}`,
    method: 'POST',
    headers: requestHeader(),
    data: {
      departmentId: departmentIds,
      weeklyPriorityWeekId: weeklyId,
      taskId: [],
      planId: [],
    },
  });
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
  departmentIds: string[],
  weeklyId: string[],
  pageSize: number,
  currentPage: number,
) =>
  useQuery<ResponseData>(
    ['weeklyPriorities', departmentIds, weeklyId, pageSize, currentPage],
    () => getWeeklyPriority(departmentIds, weeklyId, pageSize, currentPage),
  );
export const useGetDepartmentChild = (departmentId: string) =>
  useQuery<DepartmentData>(['departmentChild', departmentId], () =>
    getDepartmentChild(departmentId),
  );

export const useGetWeeks = () => useQuery<WeekData>('weeks', () => getWeeks());
