import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { JobSummaryDashboard } from '@/store/uistate/features/dashboard/job-summary/interface';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

type ResponseData = JobSummaryDashboard[];

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getJobSummary = async (status: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };

    return await crudRequest({
      url: `${RECRUITMENT_URL}/job-information/job/status?type=${status}`,
      method: 'GET',
      headers,
    });
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
