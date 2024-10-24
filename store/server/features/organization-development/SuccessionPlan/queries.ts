import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';

/**
 * Function to fetch all critical positions
 * @returns The response data from the API
 */
const fetchCriticalPositions = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  return crudRequest({
    url: `http://localhost:5000/api/v1/critical-positions/${userId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  });
};

/**
 * Hook to fetch all critical positions with tenant ID
 * @returns useQuery response for the critical positions
 */
export const useFetchCriticalPositions = () => {
  return useQuery('criticalPosition', fetchCriticalPositions, {});
};
