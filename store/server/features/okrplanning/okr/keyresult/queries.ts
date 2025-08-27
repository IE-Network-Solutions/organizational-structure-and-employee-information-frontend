import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { KeyResult } from '@/store/uistate/features/okrplanning/okr/interface';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { crudRequest } from '@/utils/crudRequest';
import { OKR_URL } from '@/utils/constants';

const tenantId = useAuthenticationStore.getState().tenantId;
type ResponseData = {
  items: KeyResult[];
};
const getKeyResultByUser = async (id: number | string): Promise<any> => {
  const token = await getCurrentToken();

  if (id) {
    try {
      const headers = {
        Authorization: `Bearer ${token}`, // Ensure token is available
        tenantId: tenantId, // Ensure tenantId is available
      };
      
      // First try with normal encryption handling
      try {
        const response = await crudRequest({
          url: `${OKR_AND_PLANNING_URL}/key-results/user/${id}`,
          method: 'GET',
          headers,
        });
        
        // If we get a proper response with items, return it
        if (response && (response.items || Array.isArray(response))) {
          return response;
        }
      } catch (encryptionError) {
    
      }
      
      // Fallback: try with skipEncryption if the above fails
      try {
        const response = await crudRequest({
          url: `${OKR_AND_PLANNING_URL}/key-results/user/${id}`,
          method: 'GET',
          headers,
          skipEncryption: true,
        });
        
        // Handle encrypted response manually if needed
        if (response && response.data && typeof response.data === 'string') {
       
          return { items: [] };
        }
        
        return response;
      } catch (fallbackError) {
       
        throw fallbackError;
      }
    } catch (error) {
      throw error;
    }
  }

  return { items: [] }; // Return empty array if no ID is provided
};

export const useGetUserKeyResult = (postId: number | string) =>
  useQuery<ResponseData>(
    ['ObjectiveInformation', postId],
    () => getKeyResultByUser(postId),
    {
      keepPreviousData: true,
    },
  );

const getKeyResult = async (id: string) => {
  try {
    // First try with normal encryption handling
    try {
      const response = await crudRequest({
        url: `${OKR_URL}/key-results/${id}`,
        method: 'GET',
      });
      
      // If we get a proper response, return it
      if (response && typeof response === 'object') {
        return response;
      }
    } catch (encryptionError) {
    }
    
    // Fallback: try with skipEncryption if the above fails
    try {
      const response = await crudRequest({
        url: `${OKR_URL}/key-results/${id}`,
        method: 'GET',
        skipEncryption: true,
      });
      
      // Handle encrypted response manually if needed
      if (response && response.data && typeof response.data === 'string') {

        return {};
      }
      
      return response;
    } catch (fallbackError) {
      throw fallbackError;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to get key result by ID
 * @param id The ID to fetch key result for
 * @returns useQuery hook for fetching key result
 */
export const useGetKeyResult = (id: string) =>
  useQuery<KeyResult>(['keyResult', id], () => getKeyResult(id), {
    keepPreviousData: true,
    enabled: !!id, // Only run query when ID is provided
  });
