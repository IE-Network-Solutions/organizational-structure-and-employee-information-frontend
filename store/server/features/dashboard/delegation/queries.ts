import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import axios from 'axios';
import { useQuery } from 'react-query';

// Define the OKRDashboard interface
interface DelegationData {
  id: string;
  stage?: string;
  fullName?: string;
  actionToBeTaken: string;
  createdAt: string;
}

// Define the ResponseData type as an array of OKRDashboard
type ResponseData = DelegationData[];

/**
 * Function to fetch applicant summary by sending a GET request to the API
 * @returns The response data from the API
 */
const getDelegation = async (
  start: string,
  end: string,
): Promise<ResponseData> => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  if (!token || !tenantId) {
    throw new Error('Missing authentication information.');
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.get<ResponseData>(
      `${ORG_DEV_URL}/action-plans/user/plan?userId=${userId}&start=${start}&end=${end}`,
      { headers },
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching applicant summary: ${error}`);
  }
};

/**
 * Custom hook to get the applicant summary
 * @returns useQuery hook for fetching applicant summary
 */
export const useGetDelegation = (start: string, end: string) =>
  useQuery<ResponseData>(
    ['delegation', start, end], // Use id as part of the query key
    () => getDelegation(start, end), // Pass function reference to useQuery
    {
      keepPreviousData: true,
    },
  );
