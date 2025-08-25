import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';

// Define the OKRDashboard interface
export interface Applicant {
  applicantStatusStageId: string;
  count: number;
  stage: string;
}
interface Candidates {
  candidateInformationId: string;
  fullName: string;
  stage: string;
}
interface ApplicantData {
  applicant?: Applicant[];
  candidates: Candidates[];
  totalCount?: string;
}

// Define the ResponseData type as an array of OKRDashboard
type ResponseData = ApplicantData;

/**
 * Function to fetch applicant summary by sending a GET request to the API
 * @returns The response data from the API
 */
const getApplicantSummary = async (status: string): Promise<ResponseData> => {
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
    const response = await crudRequest({
      url: `${RECRUITMENT_URL}/applicant-status-stages/status/applicant?status=${status}`,
      method: 'GET',
      headers,
    });
    return response;
  } catch (error) {
    throw new Error(`Error fetching applicant summary: ${error}`);
  }
};

/**
 * Custom hook to get the applicant summary
 * @returns useQuery hook for fetching applicant summary
 */

export const useGetApplicantSummary = (status: string) =>
  useQuery<ResponseData>(
    ['applicantSummary', status], // Use id as part of the query key
    () => getApplicantSummary(status), // Pass function reference to useQuery
    {
      keepPreviousData: true,
    },
  );
