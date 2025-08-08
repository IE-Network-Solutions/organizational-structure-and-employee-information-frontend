import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TNA_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import axios from 'axios';
import { useQuery } from 'react-query';

// Define the OKRDashboard interface
interface CoursePermittedrs {
  categoryName: string;
  courseCount: number;
}

// Define the ResponseData type as an array of OKRDashboard
type ResponseData = CoursePermittedrs[];

/**
 * Function to fetch applicant summary by sending a GET request to the API
 * @returns The response data from the API
 */
const getCoursePermitted = async (): Promise<ResponseData> => {
  const token = await getCurrentToken();
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
      `${TNA_URL}/learning/course/user-courses/category/${userId}`,
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
export const useGetCoursePermitted = () =>
  useQuery<ResponseData>(
    'newCoursePermitted', // Query key
    getCoursePermitted, // Function reference for fetching data
  );
