import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import axios from 'axios';
import { ReprimandLog } from '@/store/uistate/features/okrplanning/monitoring-evaluation/reprimand-log/interface';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;

type ResponseData = {
  items: ReprimandLog[];
  meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
};
type ResponseDataDetail = ReprimandLog;
/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getReprimandLog = async (userId: string, typeId: string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.get(
      `${OKR_AND_PLANNING_URL}/reprimand-log?userId=${userId}&typeId=${typeId}`,
      {
        headers,
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
const getReprimandLogById = async (id: number | string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.get(
      `${OKR_AND_PLANNING_URL}/reprimand-log/${id}`,
      {
        headers,
      },
    );
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

export const useGetReprimandLog = (userId: string, typeId: string) =>
  useQuery<ResponseData>(
    ['reprimandLog', userId, typeId],
    () => getReprimandLog(userId, typeId),
    {
      keepPreviousData: true,
    },
  );

export const useGetReprimandLogById = (id: string) =>
  useQuery<ResponseDataDetail>(
    ['reprimandLogById', id],
    () => getReprimandLogById(id),
    {
      keepPreviousData: true,
    },
  );
