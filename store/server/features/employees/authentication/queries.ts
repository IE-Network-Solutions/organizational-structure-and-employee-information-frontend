import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import axios from 'axios';
import { useQuery } from 'react-query';

/**
 * Function to fetch a tenant id by sending a GET request to the API
 * @param id The ID of the localId which fetch from firebase to fetch
 * @returns The response data from the API
 */
const getTenantId = async () => {
  const token = useAuthenticationStore.getState().token; // Access the latest token
  const localId = useAuthenticationStore.getState().localId;
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.get(
      `http://172.16.34.164:8008/api/v1/users/firebase/${localId}`,
      { headers },
    );
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
export const useGetTenantId = () =>
  useQuery<any>(['tenantId'], () => getTenantId(), {
    keepPreviousData: true,
    enabled: false, // Disabled by default, will be triggered manually
  });
