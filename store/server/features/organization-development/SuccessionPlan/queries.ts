import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { useSuccessionPlanStore } from '@/store/uistate/features/organizationalDevelopment/SuccessionPlan';

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

/**
 * Function to fetch a specific succession plan
 * @returns The response data from the API
 */
const fetchSuccessionPlans = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const successionPlanId = useSuccessionPlanStore.getState().successionPlanId;

  // Ensure successionPlanId exists before making the request
  if (!successionPlanId) {
    throw new Error('No succession plan ID found');
  }

  return crudRequest({
    url: `http://localhost:5000/api/v1/succession-plans/${successionPlanId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  });
};

/**
 * Hook to fetch a specific succession plan
 * @returns useQuery response for the succession plan
 */
export const useFetchSuccessionPlans = () => {
  const query = useQuery('successionPlans', fetchSuccessionPlans, {
    enabled: false, // keep it disabled initially
  });

  const fetchData = () => {
    if (query.isRefetching || query.isFetching) {
      return; // prevent refetch if already fetching
    }
    query.refetch(); // explicitly call refetch when needed
  };

  return {
    ...query,
    fetchData, // return fetchData to call when needed
  };
};
