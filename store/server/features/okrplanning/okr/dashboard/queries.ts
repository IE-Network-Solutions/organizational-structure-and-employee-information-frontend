import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import axios from 'axios';
import { useQuery } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
type Dashboard = {
  daysLeft: number;
  okrCompleted: number;
  userOkr: number;
  supervisorOkr?: number; // Add supervisorOkr if it's included in the API response
};

type ResponseData = Dashboard;

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getObjectiveDashboardByUser = async (id: number | string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.get(
      `${OKR_AND_PLANNING_URL}/objective/user/${id}`,
      {
        headers,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const useGetUserObjectiveDashboard = (postId: number | string) =>
  useQuery<ResponseData>(
    ['ObjectiveDashboard', postId],
    () => getObjectiveDashboardByUser(postId),
    {
      keepPreviousData: true,
    },
  );
