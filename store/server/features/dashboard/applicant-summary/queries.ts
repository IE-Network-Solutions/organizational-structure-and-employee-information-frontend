import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import axios from 'axios';
import { useQuery } from 'react-query';

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
      `${RECRUITMENT_URL}/applicant-status-stages/status/applicant?status=${status}`,
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

export const useGetApplicantSummary = (status: string) =>
  useQuery<ResponseData>(
    ['applicantSummary', status], // Use id as part of the query key
    () => getApplicantSummary(status), // Pass function reference to useQuery
    {
      keepPreviousData: true,
    },
  );
