
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { requestHeader } from '@/helpers/requestHeader';
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
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${RECRUITMENT_URL}/applicant-status-stages/status/applicant?status=${status}`,
    method: 'GET',
    headers: requestHeaders,
  });
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
