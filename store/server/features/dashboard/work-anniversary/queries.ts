import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

// Define the OKRDashboard interface
interface User {
  firstName: string;
  middleName: string | null;
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

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  const response = await crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-information/users/anniversary`,
    method: 'GET',
    headers,
  });
  return response;
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
