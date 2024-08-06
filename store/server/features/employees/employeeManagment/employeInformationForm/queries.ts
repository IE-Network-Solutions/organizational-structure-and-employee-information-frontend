import { ORG_AND_EMP_URL, tenantId } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useQuery } from 'react-query';

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getEmpoyeInformationForms = async () => {
  const headers: Record<string, string> = {
    // 'Authorization': `Bearer ${localStorage.getItem('token')}`, // Example header
    'Content-Type': 'application/json', // Example header
    tenantid: tenantId,
    // Add other headers here as needed
  };
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-information-form`,
    method: 'GET',
    headers: headers,
  });
};

/**
 * Function to fetch a single post by sending a GET request to the API
 * @param id The ID of the post to fetch
 * @returns The response data from the API
 */

const getEmpoyeInformationForm = async (id: string) => {
  try {
    const headers: Record<string, string> = {
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`, // Example header
      'Content-Type': 'application/json', // Example header
      tenantid: tenantId,
      // Add other headers here as needed
    };
    const response = await axios.get(
      `${ORG_AND_EMP_URL}/employee-information-form/${id}`,
      { headers },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
/**
 * Function to fetch a single post by sending a GET request to the API
 * @param id The ID of the post to fetch
 * @returns The response data from the API
 */

const getEmpoyeInformationFormForTenant = async () => {
  try {
    // const tenantId = localStorage.getItem('tenantId');
    // const headers: Record<string, string> | undefined = tenantId ? { 'tenantId': tenantId } : undefined;
    const headers: Record<string, string> | undefined = { tenantId: tenantId };

    return crudRequest({
      url: `${ORG_AND_EMP_URL}/employee-information-form/tenant/find-form-fields-by-tenant-id`,
      headers,
      method: 'GET',
    });
  } catch (error) {
    throw error;
  }
};

// const response = await axios.get(`${ORG_AND_EMP_URL}/employee-information-form/tenant/${id}`);
//   const response = await axios.get(`${ORG_AND_EMP_URL}/employee-information-form`);
//   return response.data;
// } catch (error) {
//   throw error;
// }
// };

/**
 * Custom hook to fetch a list of posts using useQuery from react-query.
 *
 * @returns The query object for fetching posts.
 *
 * @description
 * This hook uses `useQuery` to fetch a list of posts from the API. It returns
 * the query object containing the posts data and any loading or error states.
 */
export const useGetEmployeInformationForms = () =>
  useQuery<any[]>('empoyeInformationForms', getEmpoyeInformationForms);

/**
 * Custom hook to fetch a single post by ID using useQuery from react-query.
 *
 * @param postId The ID of the post to fetch
 * @returns The query object for fetching the post.
 *
 * @description
 * This hook uses `useQuery` to fetch a single post by its ID. It returns the
 * query object containing the post data, and it keeps the previous data
 * while the new data is being fetched.
 */
export const useGetEmployeInformationForm = (empoyeInformationFormId: string) =>
  useQuery<any>(
    ['empoyeInformationForm', empoyeInformationFormId],
    () => getEmpoyeInformationForm(empoyeInformationFormId),
    {
      keepPreviousData: true,
    },
  );

export const useGetEmployeInformationFormForTenant = () =>
  useQuery<any>(
    ['empoyeInformationFormForTenant'],
    () => getEmpoyeInformationFormForTenant(),
    {
      keepPreviousData: true,
    },
  );
