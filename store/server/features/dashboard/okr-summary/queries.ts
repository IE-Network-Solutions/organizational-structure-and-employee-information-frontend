import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import axios from 'axios';
import { useQuery } from 'react-query';
interface OKRDashboard {
  id?: string;
  name?: string;
}

type ResponseData = OKRDashboard[];

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getJobSummary = async (status: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.get(
      `${RECRUITMENT_URL}/job-information/status/job?status=${status}`,
      {
        headers,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useGetJobSummary = (status: string) =>
  useQuery<ResponseData>(
    ['jobSummary', status], // Use id as part of the query key
    () => getJobSummary(status), // Pass function reference to useQuery
    {
      keepPreviousData: true,
    },
  );
