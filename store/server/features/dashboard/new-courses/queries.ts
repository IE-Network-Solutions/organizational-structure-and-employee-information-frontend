import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TNA_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';

// Define the OKRDashboard interface
interface Coursers {
  email?: string;
  course: {
    courseCategory: { title: string };
    title: string;
    overview: string;
    createdAt: string;
  };
}

// Define the ResponseData type as an array of OKRDashboard
type ResponseData = Coursers[];

/**
 * Function to fetch applicant summary by sending a GET request to the API
 * @returns The response data from the API
 */
const getCourse = async (): Promise<ResponseData> => {
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
    const response = await crudRequest({
      url: `${TNA_URL}/learning/course/user-courses/${userId}`,
      method: 'GET',
      headers,
    });
    return response;
  } catch (error) {
    throw new Error(`Error fetching applicant summary: ${error}`);
  }
};

/**
 * Function to fetch new courses by sending a GET request to the API
 * @returns The response data from the API
 */
const getNewCourses = async (id: string) => {
  try {
    const response = await crudRequest({
      url: `${ORG_AND_EMP_URL}/new-courses/${id}`,
      method: 'GET',
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to get the applicant summary
 * @returns useQuery hook for fetching applicant summary
 */
export const useGetCourse = () =>
  useQuery<ResponseData>(
    'newCourse', // Query key
    getCourse, // Function reference for fetching data
  );
