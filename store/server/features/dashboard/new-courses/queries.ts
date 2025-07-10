import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TNA_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

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
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  if (!token || !tenantId) {
    throw new Error('Missing authentication information.');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  const response = await crudRequest({
    url: `${TNA_URL}/learning/course/user-courses/${userId}`,
    method: 'GET',
    headers,
  });
  return response;
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
