import { requestHeader } from '@/helpers/requestHeader';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
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
  const requestHeaders = await requestHeader();
  const userId = useAuthenticationStore.getState().userId;

  const response = await crudRequest({
    url: `${ORG_DEV_URL}/action-plans/user/plan?userId=${userId}&start=${start}&end=${end}`,
    method: 'GET',
    headers: requestHeaders,
  });
  return response;
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
