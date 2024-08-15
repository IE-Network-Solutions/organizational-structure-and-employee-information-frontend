import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import axios from 'axios';
import { useQuery } from 'react-query';

/**
 * Function to fetch a tenant id by sending a GET request to the API
 * @param id The ID of the localId which fetch from firebase to fetch
 * @returns The response data from the API
 */
const getTenantId = async (id: string) => {
  const token = useAuthenticationStore.getState().token; // Access the latest token
  try {
    const headers = {
      Authorization: `Bearer 0987654567890-09876567890-098765434567890987656789098765567${token}`,
    };
    const response = await axios.get(`${ORG_AND_EMP_URL}/users/firebase/${id}`, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to fetch a tenant ID by local ID which fetch from firebase using useQuery from react-query.
 *
 * @param localId The ID of the localId to fetch
 * @returns The query object for fetching the post.
 *
 * @description
 * This hook uses `useQuery` to fetch a single post by its ID. It returns the
 * query object containing the post data, and it keeps the previous data
 * while the new data is being fetched.
 */
export const useGetTenantId = (localId: string) =>
  useQuery<any>(['tenantId', localId], () => getTenantId(localId), {
    keepPreviousData: true,
    enabled: false, // Disabled by default, will be triggered manually
  });
