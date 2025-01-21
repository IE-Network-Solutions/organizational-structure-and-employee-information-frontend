import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import axios from 'axios';
import { useQuery } from 'react-query';

// Define the OKRDashboard interface
interface User {
  firstName: string;
  lastName: string;
  profileImage: string | null;
}

export interface WorkAnniversaryData {
  joinedDate: string;
  user: User;
}

// Define the ResponseData type as an array of OKRDashboard
type ResponseData = WorkAnniversaryData[];

/**
 * Function to fetch applicant summary by sending a GET request to the API
 * @returns The response data from the API
 */
const getWorkAnniversary = async (): Promise<ResponseData> => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  if (!token || !tenantId) {
    throw new Error('Missing authentication information.');
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.get<ResponseData>(
      `${ORG_AND_EMP_URL}/employee-information/users/anniversary`,
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
export const useGetWorkAnniversary = () =>
  useQuery<ResponseData>(
    'workAnniversary', // Query key
    getWorkAnniversary, // Function reference for fetching data
  );
