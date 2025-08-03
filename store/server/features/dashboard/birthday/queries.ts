import { requestHeader } from '@/helpers/requestHeader';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
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
  const requestHeaders = await requestHeader();

  const response = await crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-information/users/birth-day`,
    method: 'GET',
    headers: requestHeaders,
  });
  return response;
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
