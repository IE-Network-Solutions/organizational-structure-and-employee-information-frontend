import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import axios from 'axios';
import { useQuery } from 'react-query';

// Define the OKRDashboard interface

interface User {
  firstName: string;
  middleName: string;
  lastName: string | null;
  profileImage: string | null;
}

export interface BirthDayData {
  joinedDate: string;
  user: User;
}
// Define the ResponseData type as an array of OKRDashboard
type ResponseData = BirthDayData[];

/**
 * Function to fetch applicant summary by sending a GET request to the API
 * @returns The response data from the API
 */
const getBirthDay = async (): Promise<ResponseData> => {
  const token = await getCurrentToken();
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
      `${ORG_AND_EMP_URL}/employee-information/users/birth-day`,
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
export const useGetBirthDay = () =>
  useQuery<ResponseData>(
    'birthDay', // Query key
    getBirthDay, // Function reference for fetching data
  );
