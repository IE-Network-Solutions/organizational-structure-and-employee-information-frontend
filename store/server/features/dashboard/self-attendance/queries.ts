import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import axios from 'axios';
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
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  if (!token || !tenantId) {
    throw new Error('Missing authentication information.');
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.get<ResponseData>(
      `${TIME_AND_ATTENDANCE_URL}/attendance/user/attendance-record?userId=${userId}&start=${start}&end=${end}`,
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
export const useGetSelfAttendance = (start: string, end: string) =>
  useQuery<ResponseData>(
    ['jobSummary', start, end], // Use id as part of the query key
    () => getSelfAttendance(start, end), // Pass function reference to useQuery
    {
      keepPreviousData: true,
    },
  );
