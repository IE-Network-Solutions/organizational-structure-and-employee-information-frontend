import { requestHeader } from '@/helpers/requestHeader';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

// Define the OKRDashboard interface
interface SelfAttendanceData {
  stage?: string;
  fullName?: string;
  count?: number;
}

// Define the ResponseData type as an array of OKRDashboard
type ResponseData = SelfAttendanceData[];

/**
 * Function to fetch applicant summary by sending a GET request to the API
 * @returns The response data from the API
 */
const getSelfAttendance = async (
  start: string,
  end: string,
): Promise<ResponseData> => {
  const requestHeaders = await requestHeader();
  const userId = useAuthenticationStore.getState().userId;

  const response = await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/user/attendance-record?userId=${userId}&start=${start}&end=${end}`,
    method: 'GET',
    headers: requestHeaders,
  });
  return response;
};

const getAnnualAttendance = async () => {
  const userId = useAuthenticationStore.getState().userId;
  const requestHeaders = await requestHeader();
  const response = await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/${userId}`,
    method: 'GET',
    headers: requestHeaders,
  });
  return response;
};

/**
 * Custom hook to get the applicant summary
 * @returns useQuery hook for fetching applicant summary
 */
export const useGetSelfAttendance = (start: string, end: string) =>
  useQuery<ResponseData>(
    ['jobSummary', start, end], // Use id as part of the query key
    () => getSelfAttendance(start, end), // Pass function reference to useQuery
    {
      keepPreviousData: true,
    },
  );

export const useGetAnnualAttendance = () => {
  return useQuery<any>(['annualAttendance'], () => getAnnualAttendance(), {
    keepPreviousData: true,
  });
};
