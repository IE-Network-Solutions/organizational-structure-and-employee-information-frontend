import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { WorkScheduleData } from '@/store/uistate/features/employees/employeeManagment';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;
/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getWorkSchedules = async (): Promise<WorkScheduleData> => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/work-schedules`,
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

const getWorkSchedule = async (id: string) => {
  const token = await getCurrentToken();
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };

    const response = await axios.get(
      `${ORG_AND_EMP_URL}/work-schedules/${id}`,
      { headers },
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
export const useGetWorkSchedules = () =>
  useQuery<WorkScheduleData, Error>('workSchedules', getWorkSchedules);

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
export const useGetWorkSchedule = (workScheduleId: string) =>
  useQuery<any>(
    ['workSchedule', workScheduleId],
    () => getWorkSchedule(workScheduleId),
    {
      keepPreviousData: true,
    },
  );
